import React, { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Edit2, Trash2, ShieldCheck, ShieldOff, Crown, Shield, Mail, Calendar } from 'lucide-react';
import AdminModal from '../components/AdminModal';

interface Admin {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'SUPERADMIN';
    isActive: boolean;
    createdAt: string;
}

const Admins = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [actionMsg, setActionMsg] = useState('');

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/admins');
            setAdmins(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const showMsg = (msg: string) => {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(''), 3000);
    };

    const handleOpenModal = (admin: Admin | null = null) => {
        setSelectedAdmin(admin);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: any) => {
        if (selectedAdmin) {
            await api.put(`/auth/admins/${selectedAdmin.id}`, data);
            showMsg('✅ Administrador actualizado correctamente.');
        } else {
            await api.post('/auth/admins', data);
            showMsg('✅ Nuevo administrador creado correctamente.');
        }
        fetchAdmins();
    };

    const handleDelete = async (admin: Admin) => {
        if (!confirm(`¿Seguro que deseas ELIMINAR permanentemente a "${admin.name}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.delete(`/auth/admins/${admin.id}`);
            showMsg('🗑️ Administrador eliminado.');
            fetchAdmins();
        } catch (err: any) {
            showMsg(`❌ Error: ${err.response?.data?.message || 'No se pudo eliminar.'}`);
        }
    };

    const handleToggle = async (admin: Admin) => {
        try {
            await api.patch(`/auth/admins/${admin.id}/toggle`);
            showMsg(admin.isActive ? '🔴 Administrador desactivado.' : '🟢 Administrador activado.');
            fetchAdmins();
        } catch (err) {
            showMsg('❌ Error al cambiar estado.');
        }
    };

    const superadmins = admins.filter(a => a.role === 'SUPERADMIN');
    const regularAdmins = admins.filter(a => a.role === 'ADMIN');

    const AdminCard = ({ admin }: { admin: Admin }) => (
        <div className={`card !p-5 flex flex-col gap-4 transition-all duration-300 group ${!admin.isActive ? 'opacity-60' : ''}`}>
            {/* Top Row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${admin.role === 'SUPERADMIN'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                        {admin.role === 'SUPERADMIN' ? <Crown size={22} /> : <Shield size={22} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{admin.name}</h3>
                        <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${admin.role === 'SUPERADMIN'
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                            {admin.role}
                        </span>
                    </div>
                </div>
                {/* Active Badge */}
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${admin.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-dark-border'
                    }`}>
                    {admin.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            {/* Info */}
            <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{admin.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0" />
                    <span>Creado: {new Date(admin.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-dark-border">
                <button
                    onClick={() => handleOpenModal(admin)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 bg-slate-50 dark:bg-[#1a1a1a] hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-slate-200 dark:border-dark-border rounded-xl transition-all duration-200"
                >
                    <Edit2 size={13} /> Editar
                </button>
                <button
                    onClick={() => handleToggle(admin)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold border rounded-xl transition-all duration-200 ${admin.isActive
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-500 hover:text-white hover:border-amber-500'
                            : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                        }`}
                >
                    {admin.isActive ? <><ShieldOff size={13} /> Desactivar</> : <><ShieldCheck size={13} /> Activar</>}
                </button>
                <button
                    onClick={() => handleDelete(admin)}
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-[#1a1a1a] hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-200 dark:border-dark-border hover:border-red-300 rounded-xl transition-all duration-200"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Administradores</h1>
                    <p className="text-slate-500 mt-1">Gestión de accesos y roles del sistema.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center justify-center gap-2 px-6 shadow-md shadow-primary-500/30">
                    <Plus size={20} />
                    <span>Nuevo Admin</span>
                </button>
            </div>

            {/* Toast notification */}
            {actionMsg && (
                <div className="fixed top-6 right-6 z-[300] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-in slide-in-from-top-4 fade-in">
                    {actionMsg}
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card !p-5 flex items-center gap-4 border-l-4 border-l-primary-500">
                    <Crown size={26} className="text-primary-500 shrink-0" />
                    <div>
                        <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-0.5">Superadmins</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{superadmins.length}</p>
                    </div>
                </div>
                <div className="card !p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
                    <Shield size={26} className="text-blue-500 shrink-0" />
                    <div>
                        <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-0.5">Administradores</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{regularAdmins.length}</p>
                    </div>
                </div>
                <div className="card !p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
                    <ShieldCheck size={26} className="text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-0.5">Activos</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{admins.filter(a => a.isActive).length}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-500">Cargando administradores...</div>
            ) : admins.length === 0 ? (
                <div className="py-20 text-center bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border">
                    <Crown size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-slate-500">No hay administradores registrados.</p>
                </div>
            ) : (
                <>
                    {/* Superadmins */}
                    {superadmins.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Crown size={18} className="text-primary-500" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Superadministradores</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {superadmins.map(a => <AdminCard key={a.id} admin={a} />)}
                            </div>
                        </section>
                    )}

                    {/* Regular Admins */}
                    {regularAdmins.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Shield size={18} className="text-blue-500" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Administradores</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {regularAdmins.map(a => <AdminCard key={a.id} admin={a} />)}
                            </div>
                        </section>
                    )}
                </>
            )}

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedAdmin}
            />
        </div>
    );
};

export default Admins;
