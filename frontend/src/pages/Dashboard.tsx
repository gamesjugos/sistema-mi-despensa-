import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Users, Briefcase, Building, Clock,
    UserPlus, ChevronRight, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface DashboardStats {
    totalEmployees: number;
    activeEmployees: number;
    employeesMiDespensa: number;
    employeesMiContenedor: number;
    recentEmployees: any[];
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        activeEmployees: 0,
        employeesMiDespensa: 0,
        employeesMiContenedor: 0,
        recentEmployees: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const res = await api.get('/employees');
                const allEmployees: any[] = res.data.data || [];

                setStats({
                    totalEmployees: allEmployees.length,
                    activeEmployees: allEmployees.filter(e => e.isActive !== false).length,
                    employeesMiDespensa: allEmployees.filter(e => e.empresa === 'MI_DESPENSA').length,
                    employeesMiContenedor: allEmployees.filter(e => e.empresa === 'MI_CONTENEDOR').length,
                    recentEmployees: allEmployees.slice(0, 5),
                });
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const monthName = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const StatCard = ({ title, value, sub, icon: Icon, accent, to }: any) => (
        <Link to={to || '#'} className={`card !p-5 flex items-center gap-4 border-l-4 ${accent} hover:shadow-lg transition-all group bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${accent.replace('border-l-', 'bg-').replace('-500', '-100')} dark:bg-opacity-10`}>
                <Icon size={28} className={accent.replace('border-l-', 'text-')} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-1">{title}</p>
                {loading ? (
                    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                )}
                {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
        </Link>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <p className="text-primary-500 text-sm font-semibold uppercase tracking-widest mb-1">Panel Administrativo</p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resumen General</h1>
                    <p className="text-slate-500 mt-1 capitalize">Estado de Empleados • {monthName}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button onClick={() => navigate('/employees')} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                        <UserPlus size={16} /> Empleado
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                    title="Total Empleados"
                    value={stats.totalEmployees}
                    sub="En ambas empresas"
                    icon={Users}
                    accent="border-l-blue-500"
                    to="/employees"
                />
                <StatCard
                    title="Empleados Activos"
                    value={stats.activeEmployees}
                    sub="Actualmente trabajando"
                    icon={CheckCircle2}
                    accent="border-l-emerald-500"
                    to="/employees"
                />
                <StatCard
                    title="Mi Despensa"
                    value={stats.employeesMiDespensa}
                    sub="Empleados asignados"
                    icon={Building}
                    accent="border-l-purple-500"
                    to="/employees"
                />
                <StatCard
                    title="Mi Contenedor"
                    value={stats.employeesMiContenedor}
                    sub="Empleados asignados"
                    icon={Briefcase}
                    accent="border-l-orange-500"
                    to="/employees"
                />
            </div>

            {/* Recent Employees */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-border">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users size={18} className="text-blue-500" /> Empleados Recientes
                    </h2>
                    <Link to="/employees" className="text-xs text-primary-500 hover:underline font-semibold">Ver todos →</Link>
                </div>
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                    </div>
                ) : stats.recentEmployees.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-sm">Sin empleados registrados aún.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-dark-border">
                        {stats.recentEmployees.map((emp) => (
                            <Link key={emp.id} to="/employees"
                                className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-[#121212] transition-colors group">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary-600">
                                        {emp.nombre} {emp.apellido}
                                    </p>
                                    <p className="text-xs text-slate-400">{emp.cargo} • {new Date(emp.fechaIngreso).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${emp.empresa === 'MI_DESPENSA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {emp.empresa.replace('_', ' ')}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
