import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, UserCircle } from 'lucide-react';

interface PlayerFormData {
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
    height?: number | string;
    photoUrl?: string;
}

interface PlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: PlayerFormData | null;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<PlayerFormData>({
        firstName: '',
        lastName: '',
        cedula: '',
        repCedula: '',
        shoeSize: '',
        shirtSize: '',
        stride: '',
        jumpLongevity: '',
        height: '',
        photoUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                firstName: '', lastName: '', cedula: '', repCedula: '',
                dateOfBirth: '', position: '',
                shoeSize: '', shirtSize: '', stride: '', jumpLongevity: '', height: '', photoUrl: ''
            });
        }
        setError('');
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Por favor selecciona una imagen válida (JPG, PNG).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && e.target.result) {
                setFormData(prev => ({ ...prev, photoUrl: e.target!.result as string }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload: any = { ...formData };
            if (payload.repCedula === '') delete payload.repCedula;
            if (payload.shoeSize === '') delete payload.shoeSize;
            if (payload.shirtSize === '') delete payload.shirtSize;
            if (payload.stride === '') delete payload.stride;
            if (payload.jumpLongevity === '') delete payload.jumpLongevity;
            if (payload.photoUrl === '') delete payload.photoUrl;
            if (payload.position === '') delete payload.position;
            if (payload.dateOfBirth === '' || payload.dateOfBirth === null) delete payload.dateOfBirth;

            payload.height = formData.height ? parseFloat(formData.height.toString()) : null;
            if (payload.height === null) delete payload.height;

            // Strip out properties that belong to Player but shouldn't be sent to update/create
            delete payload.id;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.payments;

            await onSubmit(payload);
            onClose();
        } catch (err: any) {
            console.error('FRONT ERROR', err.response?.data);
            setError(err.response?.data?.message || err.message || 'Error al guardar jugador');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-[#121212]">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {initialData ? 'Editar Perfil de Jugador' : 'Registrar Nuevo Jugador'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="m-6 mb-0 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form id="playerForm" onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Foto de Perfil */}
                        <div className="col-span-1 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-dark-border pb-8 lg:pb-0 lg:pr-8 flex flex-col items-center">
                            <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-500 uppercase tracking-wider mb-6 w-full text-center">Foto de Perfil</h3>

                            <div
                                className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-300 cursor-pointer overflow-hidden relative group shadow-sm
                  ${dragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-dark-border hover:border-primary-500 bg-slate-50 dark:bg-[#0a0a0a]'}
                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {formData.photoUrl ? (
                                    <>
                                        <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0 group-hover:opacity-30 transition-opacity" />
                                        <div className="absolute inset-0 flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex">
                                            <UploadCloud className="text-white mb-2" size={32} />
                                            <span className="text-white text-xs font-semibold">Cambiar Foto</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="text-primary-500 mb-3" size={48} />
                                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium px-4">Click o arrastra imagen aquí</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-6 text-center max-w-[200px]">Formatos aceptados: JPG y PNG. Se sugiere foto tipo retrato.</p>
                        </div>

                        {/* Datos Personales */}
                        <div className="col-span-1 lg:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-500 uppercase tracking-wider mb-4">Módulo de Identificación</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombres *</label>
                                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input" placeholder="Ej. Michael" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Apellidos *</label>
                                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input" placeholder="Ej. Jordan" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cédula del Jugador *</label>
                                        <input required type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="input" placeholder="Num. Cédula" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cédula Representante</label>
                                        <input type="text" name="repCedula" value={formData.repCedula} onChange={handleChange} className="input" placeholder="(Opcional)" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fecha de Nacimiento</label>
                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth ? String(formData.dateOfBirth).split('T')[0] : ''} onChange={handleChange} className="input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Posición de Juego</label>
                                        <select name="position" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="input">
                                            <option value="">— Seleccionar posición —</option>
                                            <option value="Piloto">🏀 Piloto (Point Guard)</option>
                                            <option value="Escolta">🏅 Escolta (Shooting Guard)</option>
                                            <option value="Alero">⚡ Alero (Small Forward)</option>
                                            <option value="Ala-Pivot">💪 Ala-Pivot (Power Forward)</option>
                                            <option value="Pivot">🏋️ Pivot (Center)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-500 uppercase tracking-wider mb-4">Medidas Físicas</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-50 dark:bg-[#121212] p-5 rounded-xl border border-slate-200 dark:border-dark-border">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Estatura (cm)</label>
                                        <input type="number" step="0.1" name="height" value={formData.height} onChange={handleChange} className="input !py-2.5 !bg-white dark:!bg-dark-card" placeholder="Ej. 198.5" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">C. Zapato</label>
                                        <input type="text" name="shoeSize" value={formData.shoeSize} onChange={handleChange} className="input !py-2.5 !bg-white dark:!bg-dark-card" placeholder="Ej. 45" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">T. Camisa</label>
                                        <input type="text" name="shirtSize" value={formData.shirtSize} onChange={handleChange} className="input !py-2.5 !bg-white dark:!bg-dark-card" placeholder="Ej. XL" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Zancada</label>
                                        <input type="text" name="stride" value={formData.stride} onChange={handleChange} className="input !py-2.5 !bg-white dark:!bg-dark-card" placeholder="Ej. 1.2m" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Salto Básico / Longevidad</label>
                                        <input type="text" name="jumpLongevity" value={formData.jumpLongevity} onChange={handleChange} className="input !py-2.5 !bg-white dark:!bg-dark-card" placeholder="Ej. 75cm" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="btn-outline !py-3">
                        Cancelar
                    </button>
                    <button type="submit" form="playerForm" disabled={loading} className="btn-primary !py-3 min-w-[160px] text-base">
                        {loading ? 'Guardando...' : (initialData ? 'Actualizar Ficha' : 'Guardar Jugador')}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PlayerModal;
