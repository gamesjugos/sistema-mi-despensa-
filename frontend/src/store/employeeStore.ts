import { create } from 'zustand';
import api from '../api';

export interface Employee {
    id: string;
    nombre: string;
    apellido: string;
    cedula: string;
    cargo: string;
    sueldoMensual: number;
    fechaIngreso: string;
    fechaEgreso?: string | null;
    empresa: 'MI_DESPENSA' | 'MI_CONTENEDOR';
    isActive: boolean;
}

interface EmployeeState {
    employees: Employee[];
    loading: boolean;
    error: string | null;
    fetchEmployees: (empresa?: string) => Promise<void>;
    addEmployee: (data: Partial<Employee>) => Promise<void>;
    updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
    employees: [],
    loading: false,
    error: null,

    fetchEmployees: async (empresa) => {
        set({ loading: true, error: null });
        try {
            const url = empresa ? `/employees?empresa=${empresa}` : '/employees';
            const { data } = await api.get(url);
            set({ employees: data.data, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Error fetching employees', loading: false });
        }
    },

    addEmployee: async (employeeData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/employees', employeeData);
            set((state) => ({ employees: [data.data, ...state.employees], loading: false }));
        } catch (error: any) {
            set({ error: error.message || 'Error adding employee', loading: false });
            throw error;
        }
    },

    updateEmployee: async (id, employeeData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.put(`/employees/${id}`, employeeData);
            set((state) => ({
                employees: state.employees.map((emp) =>
                    emp.id === id ? data.data : emp
                ),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Error updating employee', loading: false });
            throw error;
        }
    },

    deleteEmployee: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/employees/${id}`);
            set((state) => ({
                employees: state.employees.filter((emp) => emp.id !== id),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message || 'Error deleting employee', loading: false });
            throw error;
        }
    },
}));
