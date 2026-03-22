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
        aportePensiones: 160.0,
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

export const calculatePayroll = (emp: Employee, record: NominaRecord | Partial<NominaRecord>, config: NominaConfig) => {
    const r = {
        diasTrabajados: 30,
        horasNocturnas: 0,
        domingosTrabajados: 0,
        feriadosTrabajados: 0,
        bonosAdicionales: 0,
        adelantos: 0,
        inasistencias: 0,
        subsidios: 0,
        ...record
    };

    const sueldoMensual = emp.sueldoMensual || 0;
    const sueldoDiario = sueldoMensual / 30;
    const sueldoHora = sueldoDiario / 8;
    const sueldoSemanal = (sueldoMensual * 12) / 52;

    // BONOS: We treat r.bonosAdicionales as Bono Nocturno raw $ amount (as seen in excel).
    // And feriadosTrabajados as a numeric multiplier (or you can just type raw amount in UI). We'll assume feriadosTrabajados is just typed as $ for Domingo and Feriado
    const bonoNocturno = r.horasNocturnas; // Treated as fixed monetary in excel
    const domingosValor = r.domingosTrabajados; // Treated as monetary
    const feriadosValor = r.feriadosTrabajados; // Treated as monetary

    // SUELDO: Prorated by diasTrabajados
    const sueldoReal = sueldoDiario * r.diasTrabajados;

    const subtotalIngresos = sueldoReal + bonoNocturno + domingosValor + feriadosValor;

    // CESTATICKET
    const cestaticket2 = config.montoCesta2 * config.tasaBCV1;
    const cestaticket1 = (config.montoCesta1 * config.tasaBCV2 / 30) * r.diasTrabajados;

    // INGRESO INDEXADO
    const ingresoTotalIndexado = subtotalIngresos + cestaticket2 + cestaticket1;

    // DEDUCCIONES
    // The Excel takes Weekly Salary * 4 weeks * 4% for SSO if the person works full month.
    // Excel formula: = SALARIO_SEMANAL * 4 * (PORCENTAJE / 100)
    const factorDeduccion = sueldoSemanal * 4;
    const sso = factorDeduccion * (config.porcentajeSSO / 100);
    const rpe = factorDeduccion * (config.porcentajeParo / 100);
    const faov = factorDeduccion * (config.porcentajeFAOV / 100);
    
    // ISLR Retention
    const islrPercent = config.porcentajeISLR || 0;
    const islrValue = subtotalIngresos * (islrPercent / 100);

    const totalDeducciones = sso + rpe + faov + islrValue + Number(r.adelantos) + Number(r.inasistencias);

    let aPagar = subtotalIngresos - totalDeducciones + Number(r.subsidios);
    if (aPagar < 0) aPagar = 0;

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
        sso,
        rpe,
        faov,
        islrValue,
        totalDeducciones,
        aPagar
    };
};
