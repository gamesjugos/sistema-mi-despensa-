import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserCircle, ArrowLeft, Ruler, Footprints, Droplet, MoveUp, Shirt, Hash, ShieldAlert, Cake, Trophy, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface PlayerDetail {
    id: string;
    firstName: string;
    lastName: string;
    cedula: string;
    repCedula?: string;
    dateOfBirth?: string;
    position?: string;
    shoeSize?: string;
    shirtSize?: string;
    stride?: string;
    jumpLongevity?: string;
    height: number | null;
    photoUrl: string | null;
    createdAt: string;
    isActive: boolean;
    payments: any[];
}

const calcAge = (dob: string): string => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} años`;
};

const PlayerProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [player, setPlayer] = useState<PlayerDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await api.get(`/players/${id}`);
                setPlayer(res.data);
            } catch (error) {
                console.error("Error fetching player", error);
                navigate('/players');
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [id, navigate]);

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Cargando la ficha del jugador...</div>;
    }

    if (!player) return null;

    return (
        <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
            <button
                onClick={() => navigate('/players')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Volver a Jugadores</span>
            </button>

            <div className="card !p-8 lg:!p-10">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start border-b border-slate-200 dark:border-dark-border pb-10">

                    <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 relative flex-col items-center justify-center">
                        {player.photoUrl ? (
                            <img
                                src={player.photoUrl}
                                alt={`${player.firstName} ${player.lastName}`}
                                className="w-full h-full object-cover rounded-2xl shadow-lg border-4 border-white dark:border-dark-card"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-[#0a0a0a] rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-inner">
                                <UserCircle size={100} />
                            </div>
                        )}
                        <div className="absolute -bottom-4 left-0 w-full flex justify-center">
                            <span className={`whitespace-nowrap inline-block px-5 py-2 rounded-full text-sm font-bold shadow-md ${player.isActive
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                {player.isActive ? 'JUGADOR ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {player.firstName} <span className="text-primary-600">{player.lastName}</span>
                        </h1>
                        <p className="text-xl text-slate-500 mt-2 flex items-center justify-center md:justify-start gap-2">
                            <Hash size={20} className="text-slate-400" />
                            Cédula: <span className="font-semibold">{player.cedula}</span>
                        </p>
                        {player.repCedula && (
                            <p className="text-sm text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-2">
                                <ShieldAlert size={16} className="text-slate-400" />
                                Rep: {player.repCedula}
                            </p>
                        )}
                        <p className="text-sm text-slate-400 mt-4">
                            Miembro desde: {new Date(player.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Age */}
                    {player.dateOfBirth && (
                        <div className="bg-slate-50 dark:bg-[#121212] p-5 rounded-xl border border-slate-200 dark:border-dark-border flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-full flex items-center justify-center text-primary-500 shadow-sm">
                                <Cake size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Edad</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{calcAge(player.dateOfBirth)}</p>
                                <p className="text-xs text-slate-400">{new Date(player.dateOfBirth).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    )}
                    {/* Position */}
                    {player.position && (
                        <div className="bg-primary-50 dark:bg-primary-900/10 p-5 rounded-xl border border-primary-200 dark:border-primary-900/30 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-full flex items-center justify-center text-primary-600 shadow-sm">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Posición</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{player.position}</p>
                            </div>
                        </div>
                    )}
                    <div className="bg-slate-50 dark:bg-[#121212] p-5 rounded-xl border border-slate-200 dark:border-dark-border flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-full flex items-center justify-center text-primary-500 shadow-sm">
                            <Ruler size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Estatura</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{player.height ? `${player.height} cm` : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#121212] p-5 rounded-xl border border-slate-200 dark:border-dark-border flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-full flex items-center justify-center text-primary-500 shadow-sm">
                            <Footprints size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Talla Calzado</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{player.shoeSize || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#121212] p-5 rounded-xl border border-slate-200 dark:border-dark-border flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-full flex items-center justify-center text-primary-500 shadow-sm">
                            <Shirt size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Talla Camisa</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{player.shirtSize || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#121212] p-5 rounded-xl border border-slate-200 dark:border-dark-border flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-full flex items-center justify-center text-primary-500 shadow-sm">
                            <Droplet size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Zancada</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{player.stride || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#121212] p-5 rounded-xl border border-slate-200 dark:border-dark-border flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-full flex items-center justify-center text-primary-500 shadow-sm">
                            <MoveUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Longev. Salto</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{player.jumpLongevity || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Payment History Preview (We will implement fully in payments later) */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Historial de Pagos Reciente</h2>
                    {player.payments && player.payments.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-dark-border">
                            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-[#121212] text-xs uppercase text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Mes/Año</th>
                                        <th className="px-6 py-4">Monto</th>
                                        <th className="px-6 py-4">Estado</th>
                                        {user?.role === 'SUPERADMIN' && <th className="px-6 py-4">Por</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                                    {player.payments.map((p: any) => (
                                        <tr key={p.id} className="bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                            <td className="px-6 py-4">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 uppercase font-medium">{new Date(p.year, p.month - 1).toLocaleString('es-ES', { month: 'short', year: 'numeric' })}</td>
                                            <td className="px-6 py-4 font-bold text-primary-600">${p.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-medium text-xs">
                                                    Pagado
                                                </span>
                                            </td>
                                            {user?.role === 'SUPERADMIN' && (
                                                <td className="px-6 py-4">
                                                    {p.registeredBy ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30 w-max">
                                                            <ShieldCheck size={12} /> {p.registeredBy.name.split(' ')[0]}
                                                        </span>
                                                    ) : <span className="text-slate-400">-</span>}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-50 dark:bg-[#121212] rounded-xl border border-dashed border-slate-300 dark:border-dark-border text-slate-500">
                            No hay registros de pago para este jugador.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PlayerProfile;
