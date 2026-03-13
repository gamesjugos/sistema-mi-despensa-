import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, Plus, UserCircle, Edit2, Trash2 } from 'lucide-react';
import PlayerModal from '../components/PlayerModal';

interface Player {
    id: string;
    firstName: string;
    lastName: string;
    cedula: string;
    height: number | null;
    photoUrl: string | null;
    hasPaidCurrentMonth: boolean;
    repCedula?: string;
    shoeSize?: string;
    shirtSize?: string;
    stride?: string;
    jumpLongevity?: string;
    dateOfBirth?: string;
}

const calcAge = (dob: string): number => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const getCategory = (age: number | null): string => {
    if (age === null) return 'Sin Edad';
    if (age <= 10) return 'U10';
    if (age <= 12) return 'U12';
    if (age <= 14) return 'U14';
    if (age <= 16) return 'U16';
    if (age <= 18) return 'U18';
    if (age <= 21) return 'U21';
    return 'Libre';
};

const Players = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/players', { params: { search } });
            setPlayers(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceTimeout = setTimeout(() => {
            fetchPlayers();
        }, 500);
        return () => clearTimeout(delayDebounceTimeout);
    }, [search]);

    const handleOpenModal = (player: Player | null = null) => {
        setSelectedPlayer(player);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    };

    const handleFormSubmit = async (data: any) => {
        if (selectedPlayer) {
            // Update
            await api.put(`/players/${selectedPlayer.id}`, data);
        } else {
            // Create
            await api.post('/players', data);
        }
        fetchPlayers();
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Seguro que deseas eliminar el jugador permanentemente?')) {
            await api.delete(`/players/${id}`);
            fetchPlayers();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Jugadores</h1>
                    <p className="text-slate-500 mt-1">Gestión completa del roster de Vikingos.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center justify-center gap-2">
                    <Plus size={18} />
                    <span>Agregar Jugador</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="card w-full sm:w-96 flex flex-row items-center gap-3 p-3 !rounded-full">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o cédula..."
                        className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-100 placeholder-slate-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="card w-full sm:w-auto p-1 !rounded-full custom-select-wrapper border border-slate-200 dark:border-dark-border">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-100 px-4 py-2 font-medium cursor-pointer"
                    >
                        <option value="Todas" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">Todas las Categorías</option>
                        <option value="U10" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">U10</option>
                        <option value="U12" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">U12</option>
                        <option value="U14" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">U14</option>
                        <option value="U16" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">U16</option>
                        <option value="U18" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">U18</option>
                        <option value="U21" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">U21</option>
                        <option value="Libre" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">Libre</option>
                        <option value="Sin Edad" className="text-slate-900 dark:text-slate-200 bg-white dark:bg-dark-bg">Sin Edad</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Cargando jugadores...</div>
            ) : players.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border">
                    <UserCircle size={48} className="mx-auto text-slate-300 dark:text-dark-border mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No se encontraron jugadores</h3>
                    <p className="text-slate-500">Intenta con otra búsqueda o agrega un nuevo jugador.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {players.filter(player => {
                        if (filterCategory === 'Todas') return true;
                        const age = player.dateOfBirth ? calcAge(player.dateOfBirth) : null;
                        return getCategory(age) === filterCategory;
                    }).map((player) => {
                        const playerAge = player.dateOfBirth ? calcAge(player.dateOfBirth) : null;
                        const playerCategory = getCategory(playerAge);

                        return (
                            <div key={player.id} className="card group hover:border-primary-500 transition-colors">
                                <div className="relative">
                                    {player.photoUrl ? (
                                        <img src={player.photoUrl} alt={player.firstName} className="w-full h-48 object-cover rounded-lg bg-slate-100 dark:bg-dark-bg" />
                                    ) : (
                                        <div className="w-full h-48 bg-slate-100 dark:bg-[#0a0a0a] rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-700">
                                            <UserCircle size={80} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${player.hasPaidCurrentMonth
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                                            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                                            }`}>
                                            {player.hasPaidCurrentMonth ? 'Al día' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                            {player.firstName} {player.lastName}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded text-center">
                                            {playerCategory}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Estatura: {player.height ? `${player.height} cm` : 'N/A'}</p>
                                    <div className="flex gap-2 mt-5">
                                        <button
                                            onClick={() => navigate(`/players/${player.id}`)}
                                            className="flex-1 btn-primary !py-1.5 text-sm !bg-slate-900 dark:!bg-white dark:!text-slate-900 hover:!bg-slate-700 dark:hover:!bg-slate-200 border-none transition-colors"
                                        >
                                            Ver Ficha
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(player)}
                                            className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-500 transition-colors bg-slate-50 dark:bg-dark-bg rounded-md border border-slate-200 dark:border-dark-border"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(player.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors bg-slate-50 dark:bg-dark-bg rounded-md border border-slate-200 dark:border-dark-border">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Form Modal */}
            <PlayerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                initialData={selectedPlayer as any}
            />
        </div>
    );
};

export default Players;
