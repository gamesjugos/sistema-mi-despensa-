import { create } from 'zustand';
import api from '../api';
import { Employee } from './employeeStore';

export interface NominaConfig {
    id: string;
    tasaDelDia: number;
    valorCesta: number;
    valorCesta2: number;
    porcentajeSSO: number;
    porcentajeFAOV: number;
    porcentajeParo: number;
    porcentajeISLR: number;
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
        tasaDelDia: 36.10,
        valorCesta: 1.33,
        valorCesta2: 40.0,
        porcentajeSSO: 4.0,
        porcentajeFAOV: 1.0,
        porcentajeParo: 0.5,
        porcentajeISLR: 0.0,
    },
    records: [],
    loading: false,
    error: null,

    fetchConfig: async () => {
        try {
            const { data } = await api.get('/nomina/config');
            set({ config: data });
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

// Utility to calculate Payroll results
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
        cesta2ManualOverride: null,
        ...record
    };

    // SUELDOS
    const sueldoMensual = emp.sueldoMensual || 0;
    const sueldoDiario = sueldoMensual / 30;
    const sueldoHora = sueldoDiario / 8;
    const sueldoSemanal = (sueldoMensual * 12) / 52;

    // INGRESOS
    const sueldoGanado = sueldoDiario * r.diasTrabajados;
    const pagoNocturno = r.horasNocturnas * sueldoHora * 1.3; // Ejemplo de recargo
    const pagoDomingos = r.domingosTrabajados * sueldoDiario * 1.5; 
    const pagoFeriados = r.feriadosTrabajados * sueldoDiario * 1.5;
    
    // CESTATICKET
    const cestaticketBase = r.diasTrabajados * config.valorCesta;
    const cestaticket2 = r.cesta2ManualOverride !== null ? r.cesta2ManualOverride : config.valorCesta2;

    const ingresosExtras = pagoNocturno + pagoDomingos + pagoFeriados + Number(r.bonosAdicionales);
    const ingresosTotales = sueldoGanado + ingresosExtras + cestaticketBase + cestaticket2;

    // DEDUCCIONES (calculadas sobre el sueldo semanal o base)
    // SSO suele ser ssoPercent * Salario semanal * Lunes del mes (simplificado según requerimiento)
    // Aquí implementamos una deducción base simplificada del sueldo ganado:
    const sso = sueldoGanado * (config.porcentajeSSO / 100);
    const rpe = sueldoGanado * (config.porcentajeParo / 100);
    const faov = sueldoGanado * (config.porcentajeFAOV / 100);
    const islr = sueldoGanado * (config.porcentajeISLR / 100);
    
    const deduccionesBase = sso + rpe + faov + islr;
    const deduccionesTotales = deduccionesBase + Number(r.adelantos) + Number(r.inasistencias); // Las inasistencias pueden ser tratadas como descuento monetario

    // NETO
    let neto = ingresosTotales - deduccionesTotales + Number(r.subsidios);

    // Evitar negativos
    if (neto < 0) neto = 0;

    return {
        sueldoDiario,
        sueldoHora,
        sueldoSemanal,
        sueldoGanado,
        cestaticketBase,
        cestaticket2,
        ingresosTotales,
        sso,
        rpe,
        faov,
        islr,
        deduccionesTotales,
        neto
    };
};
