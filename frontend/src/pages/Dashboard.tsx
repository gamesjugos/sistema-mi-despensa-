import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Users, CreditCard, Clock, TrendingUp,
    UserPlus, Plus, ChevronRight, CheckCircle2, AlertCircle, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface DashboardStats {
    totalPlayers: number;
    activePlayers: number;
    pendingPayments: number;
    totalPaidThisMonth: number;
    recentPayments: any[];
    recentPlayers: any[];
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats>({
        totalPlayers: 0,
        activePlayers: 0,
        pendingPayments: 0,
        totalPaidThisMonth: 0,
        recentPayments: [],
        recentPlayers: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [playersRes, payStatsRes, paymentsRes] = await Promise.all([
                    api.get('/players', { params: { limit: 100 } }),
                    api.get('/payments/stats'),
                    api.get('/payments'),
                ]);

                const allPlayers: any[] = playersRes.data.data || [];
                const payStats = payStatsRes.data.data || {};
                const allPayments: any[] = paymentsRes.data.data || [];

                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                const paymentsThisMonth = allPayments.filter(
                    (p: any) => p.month === currentMonth && p.year === currentYear
                );
                const totalPaidThisMonth = paymentsThisMonth.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

                setStats({
                    totalPlayers: allPlayers.length,
                    activePlayers: payStats.activePlayersCount,
                    pendingPayments: payStats.pendingPayments,
                    totalPaidThisMonth,
                    recentPayments: allPayments.slice(0, 5),
                    recentPlayers: allPlayers.slice(0, 5),
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
        <Link to={to || '#'} className={`card !p-5 flex items-center gap-4 border-l-4 ${accent} hover:shadow-lg transition-all group`}>
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

    const MONTHS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <p className="text-primary-500 text-sm font-semibold uppercase tracking-widest mb-1">Panel principal</p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resumen General</h1>
                    <p className="text-slate-500 mt-1 capitalize">Estado del equipo • {monthName}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button onClick={() => navigate('/players')} className="btn-outline !py-2 !px-4 !text-sm flex items-center gap-2">
                        <UserPlus size={16} /> Jugador
                    </button>
                    <button onClick={() => navigate('/payments')} className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-2">
                        <Plus size={16} /> Pago
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                    title="Total Jugadores"
                    value={stats.totalPlayers}
                    sub="Registrados en el sistema"
                    icon={Users}
                    accent="border-l-blue-500"
                    to="/players"
                />
                <StatCard
                    title="Jugadores Activos"
                    value={stats.activePlayers}
                    sub="Con membresía vigente"
                    icon={CheckCircle2}
                    accent="border-l-emerald-500"
                    to="/players"
                />
                <StatCard
                    title="Pagos Pendientes"
                    value={stats.pendingPayments}
                    sub={`Sin pago en ${monthName}`}
                    icon={AlertCircle}
                    accent="border-l-red-500"
                    to="/payments"
                />
                <StatCard
                    title="Recaudado (Mes)"
                    value={loading ? '...' : `$${stats.totalPaidThisMonth.toLocaleString('es-ES', { minimumFractionDigits: 0 })}`}
                    sub={`Ingresos de ${monthName}`}
                    icon={TrendingUp}
                    accent="border-l-primary-500"
                    to="/payments"
                />
            </div>

            {/* Recent Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Payments */}
                <div className="card !p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-border">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CreditCard size={18} className="text-primary-500" /> Últimos Pagos
                        </h2>
                        <Link to="/payments" className="text-xs text-primary-500 hover:underline font-semibold">Ver todos →</Link>
                    </div>
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                        </div>
                    ) : stats.recentPayments.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">Sin pagos registrados aún.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-dark-border">
                            {stats.recentPayments.map((payment: any) => (
                                <div key={payment.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-[#121212] transition-colors">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={18} className="text-emerald-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                            {payment.player?.firstName} {payment.player?.lastName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-slate-400">{MONTHS[payment.month]} {payment.year}</p>
                                            {user?.role === 'SUPERADMIN' && payment.registeredBy && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30 flex items-center gap-1">
                                                    <ShieldCheck size={10} /> {payment.registeredBy.name.split(' ')[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm shrink-0">
                                        ${Number(payment.amount).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Players */}
                <div className="card !p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-border">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={18} className="text-blue-500" /> Jugadores Recientes
                        </h2>
                        <Link to="/players" className="text-xs text-primary-500 hover:underline font-semibold">Ver todos →</Link>
                    </div>
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                        </div>
                    ) : stats.recentPlayers.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">Sin jugadores registrados aún.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-dark-border">
                            {stats.recentPlayers.map((player: any) => (
                                <Link key={player.id} to={`/players/${player.id}`}
                                    className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-[#121212] transition-colors group">
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                        {player.photoUrl
                                            ? <img src={player.photoUrl} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                                {player.firstName?.charAt(0)}{player.lastName?.charAt(0)}
                                            </div>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary-600">
                                            {player.firstName} {player.lastName}
                                        </p>
                                        <p className="text-xs text-slate-400">{player.position || 'Sin posición'} • {player.cedula}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${player.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}>
                                        {player.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
