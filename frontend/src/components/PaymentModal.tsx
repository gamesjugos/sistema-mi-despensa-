import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';

interface PaymentFormData {
    playerId: string;
    paymentDate: string;
    amount: string;
    month: string;
    year: string;
    receiptNumber: string;
    receiptImage: string;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    players: any[];
    preselectedPlayerId?: string | null;
    preselectedMonth?: number | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    players,
    preselectedPlayerId,
    preselectedMonth
}) => {
    const currentDate = new Date();

    const [formData, setFormData] = useState<PaymentFormData>({
        playerId: '',
        paymentDate: currentDate.toISOString().split('T')[0],
        amount: '',
        month: (currentDate.getMonth() + 1).toString(),
        year: currentDate.getFullYear().toString(),
        receiptNumber: '',
        receiptImage: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                playerId: preselectedPlayerId || '',
                paymentDate: currentDate.toISOString().split('T')[0],
                amount: '',
                month: preselectedMonth ? preselectedMonth.toString() : (currentDate.getMonth() + 1).toString(),
                year: currentDate.getFullYear().toString(),
                receiptNumber: '',
                receiptImage: ''
            });
            setError('');
        }
    }, [isOpen, preselectedPlayerId, preselectedMonth]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                setFormData(prev => ({ ...prev, receiptImage: e.target!.result as string }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Custom Validation
        if (!formData.receiptImage && !formData.receiptNumber) {
            setError('Debes ingresar el Número de Comprobante si no adjuntas una foto.');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar el pago');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-[#121212]">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Nuevo Pago</h2>
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

                    <form id="paymentForm" onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left: Standard Form Inputs */}
                        <div className="space-y-5">

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Jugador *</label>
                                <select
                                    required
                                    name="playerId"
                                    value={formData.playerId}
                                    onChange={handleChange}
                                    className="input"
                                    disabled={!!preselectedPlayerId}
                                >
                                    <option value="">Selecciona un jugador...</option>
                                    {players.map(p => (
                                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName} - {p.cedula}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mes a Pagar *</label>
                                    <select required name="month" value={formData.month} onChange={handleChange} className="input">
                                        <option value="1">Enero</option>
                                        <option value="2">Febrero</option>
                                        <option value="3">Marzo</option>
                                        <option value="4">Abril</option>
                                        <option value="5">Mayo</option>
                                        <option value="6">Junio</option>
                                        <option value="7">Julio</option>
                                        <option value="8">Agosto</option>
                                        <option value="9">Septiembre</option>
                                        <option value="10">Octubre</option>
                                        <option value="11">Noviembre</option>
                                        <option value="12">Diciembre</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Año *</label>
                                    <input required type="number" name="year" value={formData.year} onChange={handleChange} className="input" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monto ($) *</label>
                                    <input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="input" placeholder="Ej. 50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fecha de Pago *</label>
                                    <input required type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className="input" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Núm. de Comprobante / Ref</label>
                                <input type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} className="input" placeholder="Opcional si subes foto" />
                                <p className="text-xs text-slate-500 mt-1">Obligatorio si no adjuntas el comprobante.</p>
                            </div>

                        </div>

                        {/* Right: Picture Upload */}
                        <div className="flex flex-col items-center border-t pt-6 lg:border-t-0 lg:pt-0 lg:border-l border-slate-200 dark:border-dark-border lg:pl-8">
                            <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-500 uppercase tracking-wider mb-4 w-full text-center">Foto del Comprobante (Opcional)</h3>

                            <div
                                className={`w-full max-w-xs aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-300 cursor-pointer overflow-hidden relative group
                  ${dragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-dark-border hover:border-primary-500 bg-slate-50 dark:bg-[#0a0a0a]'}
                `}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {formData.receiptImage ? (
                                    <>
                                        <img src={formData.receiptImage} alt="Preview" className="w-full h-full object-contain absolute inset-0 group-hover:opacity-30 transition-opacity" />
                                        <div className="absolute inset-0 flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex">
                                            <UploadCloud className="text-white mb-2" size={32} />
                                            <span className="text-white text-xs font-semibold">Cambiar Foto</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="text-primary-500 mb-3" size={40} />
                                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium px-4">Click o arrastra imagen aquí</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
                                    }}
                                />
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-[#0a0a0a] flex justify-end gap-3 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="btn-outline !py-3">Cancelar</button>
                    <button type="submit" form="paymentForm" disabled={loading} className="btn-primary !py-3 min-w-[160px] text-base">
                        {loading ? 'Guardando...' : 'Registrar Pago'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaymentModal;
