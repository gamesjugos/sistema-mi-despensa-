import React, { useEffect, useState } from 'react';
import api from '../api';
import { CreditCard, Users, Clock, Plus, ArrowLeft, CheckCircle2, XCircle, Search, UserCircle } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import PaymentDetailModal from '../components/PaymentDetailModal';

interface Stats {
    totalPayments: number;
    activePlayersCount: number;
    pendingPayments: number;
}

interface Player {
    id: string;
    firstName: string;
    lastName: string;
    cedula: string;
    photoUrl: string | null;
    payments: any[]; // we will filter these by year manually
}

const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
];

const Payments = () => {
    const [stats, setStats] = useState<Stats>({ totalPayments: 0, activePlayersCount: 0, pendingPayments: 0 });
    const [players, setPlayers] = useState<Player[]>([]);
    const [search, setSearch] = useState('');

    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPreselectedMonth, setModalPreselectedMonth] = useState<number | null>(null);

    // Detail Modal State
    const [detailPayment, setDetailPayment] = useState<any | null>(null);

    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/payments/stats');
            setStats(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/players', { params: { search } });
            setPlayers(res.data.data);
            // update selected player if it's currently open
            if (selectedPlayer) {
                const updated = res.data.data.find((p: Player) => p.id === selectedPlayer.id);
                if (updated) setSelectedPlayer(updated);
            }
        } catch (err) { console.error(err); } finally {
            setLoading(false);
        }
    };

    const loadData = () => {
        fetchStats();
        fetchPlayers();
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(delay);
    }, [search]);

    const handleOpenGlobalModal = () => {
        setModalPreselectedMonth(null);
        setIsModalOpen(true); // Since it's global, we don't set a preselected player id manually if we open it from top
        // handle case where we might be inside a selectedPlayer context
        if (!selectedPlayer) {
            // Just opens normally
        }
    };

    const handleOpenPlayerModal = (monthValue?: number) => {
        setModalPreselectedMonth(monthValue || null);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        await api.post('/payments', data);
        loadData(); // reload stats and players
    };

    const handleDeletePayment = async (paymentId: string) => {
        if (confirm('¿Seguro que deseas eliminar este pago (marcar como No Pagado)?')) {
            await api.delete(`/payments/${paymentId}`);
            loadData();
        }
    };

    const renderStats = () => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 animate-in slide-in-from-bottom-4">
            <div className="card !p-6 flex items-center gap-5 border-l-4 border-l-primary-500">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-500">
                    <CreditCard size={28} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Pagos</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalPayments}</h3>
                </div>
            </div>

            <div className="card !p-6 flex items-center gap-5 border-l-4 border-l-blue-500">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
                    <Users size={28} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Jugadores Activos</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.activePlayersCount}</h3>
                </div>
            </div>

            <div className="card !p-6 flex items-center gap-5 border-l-4 border-l-red-500">
                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500">
                    <Clock size={28} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pagos Pendientes</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.pendingPayments}</h3>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in space-y-6">

            {/* Header Container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pagos y Calendario</h1>
                    <p className="text-slate-500 mt-1">Control interactivo de membresías mensuales.</p>
                </div>
                <button onClick={handleOpenGlobalModal} className="btn-primary flex items-center justify-center gap-2 px-6 shadow-md shadow-primary-500/30">
                    <Plus size={20} />
                    <span>Registrar Pago</span>
                </button>
            </div>

            {/* Main View Toggle */}
            {!selectedPlayer ? (
                <>
                    {renderStats()}
                    <div className="card !rounded-full p-2 mb-6 flex w-full max-w-md items-center gap-3">
                        <div className="pl-3 text-slate-400"><Search size={20} /></div>
                        <input
                            type="text"
                            placeholder="Buscar jugador para ver su calendario..."
                            className="bg-transparent border-none outline-none w-full text-sm block"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-slate-500">Cargando datos...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {players.map(player => (
                                <div
                                    key={player.id}
                                    onClick={() => setSelectedPlayer(player)}
                                    className="card p-4 hover:border-primary-500 cursor-pointer flex items-center gap-4 group transition-colors"
                                >
                                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-[#1a1a1a]">
                                        {player.photoUrl ? (
                                            <img src={player.photoUrl} alt={player.firstName} className="w-full h-full object-cover" />
                                        ) : (<UserCircle size={56} className="text-slate-300 dark:text-slate-700" />)}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                                            {player.firstName} {player.lastName}
                                        </h3>
                                        <p className="text-xs text-slate-500 truncate">{player.cedula}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                // ******************** //
                // INDIVIDUAL PLAYER CALENDAR VIEW
                // ******************** //
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">

                    <button onClick={() => setSelectedPlayer(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6">
                        <ArrowLeft size={18} /><span>Volver a la lista</span>
                    </button>

                    <div className="card !p-0 overflow-hidden shadow-xl">

                        {/* Player Header */}
                        <div className="bg-slate-900 text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12">
                                <CreditCard size={300} />
                            </div>

                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 shadow-lg overflow-hidden relative z-10 shrink-0 bg-slate-800">
                                {selectedPlayer.photoUrl ? (
                                    <img src={selectedPlayer.photoUrl} alt="Player" className="w-full h-full object-cover" />
                                ) : (<UserCircle size={120} className="text-slate-400" />)}
                            </div>

                            <div className="relative z-10 text-center sm:text-left pt-2">
                                <h2 className="text-3xl sm:text-4xl font-extrabold">{selectedPlayer.firstName} {selectedPlayer.lastName}</h2>
                                <p className="text-slate-400 text-lg mt-1 font-mono">{selectedPlayer.cedula}</p>
                                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                                    <button onClick={() => handleOpenPlayerModal()} className="btn-primary !py-2 !text-sm flex items-center gap-2">
                                        <Plus size={16} /> Añadir Pago Libre
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Year Selector */}
                        <div className="bg-slate-50 dark:bg-[#121212] border-b border-slate-200 dark:border-dark-border px-8 py-4 flex items-center justify-between">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">Calendario de Pagos</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setCurrentYear(y => y - 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-bold text-slate-500">&lt;</button>
                                <span className="text-lg font-extrabold text-slate-900 dark:text-white w-16 text-center">{currentYear}</span>
                                <button onClick={() => setCurrentYear(y => y + 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-bold text-slate-500">&gt;</button>
                            </div>
                        </div>

                        {/* Grid of 12 Months */}
                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-white dark:bg-[#0a0a0a]">
                            {months.map(m => {
                                const payment = selectedPlayer.payments?.find((p: any) => p.month === m.value && p.year === currentYear);

                                return (
                                    <div key={m.value} className={`border rounded-2xl p-4 transition-all duration-300 relative group flex flex-col ${payment
                                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10'
                                        : 'border-slate-200 dark:border-dark-border'
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`font-bold text-base uppercase tracking-wide ${payment ? 'text-emerald-700 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>
                                                {m.label}
                                            </span>
                                            {payment ? (
                                                <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                                            ) : (
                                                <XCircle size={24} className="text-red-300 dark:text-red-900 shrink-0" />
                                            )}
                                        </div>

                                        {payment ? (
                                            <div className="flex flex-col gap-2 flex-1">
                                                <div className="text-xs text-slate-500 font-medium">
                                                    Pagado: {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                                                </div>
                                                <div className="font-bold text-slate-900 dark:text-white text-xl">${payment.amount}</div>
                                                <div className="mt-auto pt-2 flex flex-col gap-2">
                                                    <button
                                                        onClick={() => setDetailPayment(payment)}
                                                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-700 dark:hover:text-white text-xs font-bold rounded-xl transition-all duration-200"
                                                    >
                                                        🔍 Ver Detalles
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePayment(payment.id)}
                                                        className="w-full py-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white text-xs font-bold rounded-xl transition-all duration-200"
                                                    >
                                                        ✕ Marcar No Pagado
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 flex-1 mt-2">
                                                <p className="text-xs text-slate-400 dark:text-slate-700 font-medium">Sin pago registrado</p>
                                                <div className="mt-auto pt-2">
                                                    <button
                                                        onClick={() => handleOpenPlayerModal(m.value)}
                                                        className="w-full py-1.5 bg-slate-100 hover:bg-primary-600 hover:text-white dark:bg-[#1a1a1a] dark:hover:bg-primary-700 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-all duration-200 border border-slate-200 dark:border-dark-border"
                                                    >
                                                        + Registrar Pago
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal is shared for global or player-specific addition */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                players={players}
                preselectedPlayerId={selectedPlayer ? selectedPlayer.id : null}
                preselectedMonth={modalPreselectedMonth}
            />

            {/* Payment Detail Modal */}
            <PaymentDetailModal
                isOpen={!!detailPayment}
                onClose={() => setDetailPayment(null)}
                payment={detailPayment}
                playerName={selectedPlayer ? `${selectedPlayer.firstName} ${selectedPlayer.lastName}` : ''}
            />
        </div>
    );
};

export default Payments;
