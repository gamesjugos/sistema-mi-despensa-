import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface AdminFormData {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'SUPERADMIN';
}

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any | null;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<AdminFormData>({
        name: '', email: '', password: '', role: 'ADMIN'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({ name: initialData.name, email: initialData.email, password: '', role: initialData.role });
        } else {
            setFormData({ name: '', email: '', password: '', role: 'ADMIN' });
        }
        setError('');
        setShowPassword(false);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload: any = { name: formData.name, email: formData.email, role: formData.role };
            if (formData.password.trim()) payload.password = formData.password;
            await onSubmit(payload);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar el administrador');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-[#121212]">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {initialData ? 'Editar Administrador' : 'Nuevo Administrador'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form id="adminForm" onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre completo *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input" placeholder="Ej. Carlos López" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Correo electrónico *</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input" placeholder="admin@vikingos.com" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Contraseña {initialData ? <span className="text-slate-400 font-normal">(dejar vacío para no cambiar)</span> : '*'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input !pr-12"
                                placeholder={initialData ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                                required={!initialData}
                                minLength={initialData ? 0 : 6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rol *</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="input">
                            <option value="ADMIN">ADMIN — Acceso estándar</option>
                            <option value="SUPERADMIN">SUPERADMIN — Acceso completo</option>
                        </select>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-outline !py-3">Cancelar</button>
                    <button type="submit" form="adminForm" disabled={loading} className="btn-primary !py-3 min-w-[160px]">
                        {loading ? 'Guardando...' : (initialData ? 'Actualizar Admin' : 'Crear Admin')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminModal;
