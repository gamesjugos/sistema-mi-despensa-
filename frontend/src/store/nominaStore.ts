import { create } from 'zustand';
import api from '../api';
import { Employee } from './employeeStore';

export interface NominaConfig {
    id: string;
    tasaBCV1: number;
    tasaBCV2: number;
    montoCesta1: number;
    montoCesta2: number;
    porcentajeSSO: number;
    porcentajeFAOV: number;
    porcentajeParo: number;
    porcentajeISLR: number;
    aportePensiones: number;
}

export interface NominaRecord {
    id?: string;
    employeeId: string;
    employee?: Employee;
    mes: number;
    anio: number;
    diasTrabajados: number;
    horasNocturnas: number;
    domingosTrabajados: number;
    feriadosTrabajados: number;
    bonosAdicionales: number;
    adelantos: number;
    inasistencias: number;
    subsidios: number;
    cesta2ManualOverride: number | null;
    aplicaPensiones?: boolean;
}

interface NominaState {
    config: NominaConfig;
    records: NominaRecord[];
    loading: boolean;
    error: string | null;
    fetchConfig: () => Promise<void>;
    updateConfig: (data: Partial<NominaConfig>) => Promise<void>;
    fetchRecords: (mes: number, anio: number) => Promise<void>;
    saveRecord: (record: Partial<NominaRecord>) => Promise<void>;
}

export const useNominaStore = create<NominaState>((set) => ({
    config: {
        id: 'default',
        tasaBCV1: 437.36,
        tasaBCV2: 417.36,
        montoCesta1: 40.0,
        montoCesta2: 160.0,
        porcentajeSSO: 4.0,
        porcentajeFAOV: 1.0,
        porcentajeParo: 0.5,
        porcentajeISLR: 0.0,
        aportePensiones: 11.7, 
    },
    records: [],
    loading: false,
    error: null,

    fetchConfig: async () => {
        try {
            const { data } = await api.get('/nomina/config');
            if (data && data.tasaBCV1) set({ config: data });
        } catch (error: any) {
            console.error('Error fetching config');
        }
    },

    updateConfig: async (configData) => {
        try {
            const { data } = await api.post('/nomina/config', configData);
            set({ config: data });
        } catch (error: any) {
            console.error('Error updating config');
        }
    },

    fetchRecords: async (mes, anio) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get(`/nomina/records?mes=${mes}&anio=${anio}`);
            set({ records: data, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Error fetching records', loading: false });
        }
    },

    saveRecord: async (record) => {
        try {
            const { data } = await api.post('/nomina/records', record);
            set((state) => {
                const existingIndex = state.records.findIndex(r => r.employeeId === data.employeeId && r.mes === data.mes && r.anio === data.anio);
                if (existingIndex >= 0) {
                    const newRecords = [...state.records];
                    newRecords[existingIndex] = data;
                    return { records: newRecords };
                }
                return { records: [...state.records, data] };
            });
        } catch (error: any) {
            console.error('Error saving record', error);
            throw error;
        }
    }
}));

export const getMondaysInMonth = (year: number, month: number): number => {
    let d = new Date(year, month - 1, 1);
    let count = 0;
    while (d.getMonth() === month - 1) {
        if (d.getDay() === 1) count++;
        d.setDate(d.getDate() + 1);
    }
    return count;
};

export const calculatePayroll = (emp: Employee, record: NominaRecord | Partial<NominaRecord>, config: NominaConfig) => {
    const r = {
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        diasTrabajados: 30,
        horasNocturnas: 0,
        domingosTrabajados: 0,
        feriadosTrabajados: 0,
        bonosAdicionales: 0,
        adelantos: 0,
        inasistencias: 0,
        subsidios: 0,
        aplicaPensiones: true,
        ...record
    };

    const sueldoMensual = emp.sueldoMensual || 0;
    const sueldoDiario = sueldoMensual / 30;
    const sueldoHora = sueldoDiario / 8;
    const sueldoSemanal = (sueldoMensual * 12) / 52;

    const bonoNocturno = r.horasNocturnas;
    const domingosValor = r.domingosTrabajados;
    const feriadosValor = r.feriadosTrabajados;

    const sueldoReal = sueldoDiario * r.diasTrabajados;

    const subtotalIngresos = sueldoReal + bonoNocturno + domingosValor + feriadosValor;

    const cestaticket2 = (config.montoCesta2 * config.tasaBCV1 / 30) * r.diasTrabajados;
    const cestaticket1 = (config.montoCesta1 * config.tasaBCV1 / 30) * r.diasTrabajados;

    const ingresoTotalIndexado = subtotalIngresos + cestaticket2 + cestaticket1;

    const semanas_del_mes = getMondaysInMonth(r.anio, r.mes);
    
    // factorDeduccion uses actual mondays of the month
    const factorDeduccion = sueldoSemanal * semanas_del_mes;
    const sso = factorDeduccion * (config.porcentajeSSO / 100);
    const rpe = factorDeduccion * (config.porcentajeParo / 100);
    const faov = factorDeduccion * (config.porcentajeFAOV / 100);
    
    const islrPercent = config.porcentajeISLR || 0;
    const islrValue = subtotalIngresos * (islrPercent / 100);

    const totalDeducciones = sso + rpe + faov + islrValue + Number(r.adelantos) + Number(r.inasistencias);

    let aPagar = subtotalIngresos - totalDeducciones + Number(r.subsidios);
    if (aPagar < 0) aPagar = 0;

    const aportePensionesCalc = r.aplicaPensiones ? config.aportePensiones : 0;

    return {
        sueldoDiario,
        sueldoHora,
        sueldoSemanal,
        sueldoReal,
        bonoNocturno,
        domingosValor,
        feriadosValor,
        subtotalIngresos,
        cestaticket2,
        cestaticket1,
        ingresoTotalIndexado,
        semanas_del_mes,
        sso,
        rpe,
        faov,
        islrValue,
        totalDeducciones,
        aPagar,
        aportePensionesCalc
    };
};
