import React from 'react';
import { X, CreditCard, Calendar, Hash, Receipt, ImageIcon, Clock, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: any | null;
    playerName: string;
}

const MONTHS = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ isOpen, onClose, payment, playerName }) => {
    const { user } = useAuthStore();

    if (!isOpen || !payment) return null;

    const DetailRow = ({ icon: Icon, label, value, className = '' }: { icon: any; label: string; value: string; className?: string }) => (
        <div className="flex items-start gap-4 py-4 border-b border-slate-100 dark:border-dark-border last:border-0">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-500 shrink-0 mt-0.5">
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`font-semibold text-slate-900 dark:text-white break-words ${className}`}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-900 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Detalle del Pago</h2>
                                <p className="text-slate-400 text-sm">{playerName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Month/Year Hero Badge */}
                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex-1 bg-white/10 rounded-2xl p-4">
                            <p className="text-slate-400 text-xs font-medium mb-1">Período</p>
                            <p className="text-2xl font-extrabold tracking-tight">
                                {MONTHS[payment.month]} {payment.year}
                            </p>
                        </div>
                        <div className="flex-1 bg-primary-600/80 rounded-2xl p-4">
                            <p className="text-primary-200 text-xs font-medium mb-1">Monto Pagado</p>
                            <p className="text-2xl font-extrabold tracking-tight text-white">
                                ${parseFloat(payment.amount).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="divide-y divide-slate-100 dark:divide-dark-border">
                        <DetailRow
                            icon={Calendar}
                            label="Fecha de Pago"
                            value={new Date(payment.paymentDate).toLocaleDateString('es-ES', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        />
                        <DetailRow
                            icon={Clock}
                            label="Registrado el"
                            value={new Date(payment.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        />
                        <DetailRow
                            icon={Hash}
                            label="ID del Pago"
                            value={payment.id}
                            className="!text-xs !font-mono text-slate-500 dark:text-slate-400 break-all"
                        />
                        {user?.role === 'SUPERADMIN' && payment.registeredBy && (
                            <DetailRow
                                icon={ShieldCheck}
                                label="Registrado por"
                                value={`${payment.registeredBy.name} (${payment.registeredBy.role})`}
                                className="text-amber-600 dark:text-amber-500"
                            />
                        )}
                        {payment.receiptNumber && (
                            <DetailRow
                                icon={CreditCard}
                                label="Número de Comprobante / Referencia"
                                value={payment.receiptNumber}
                                className="text-primary-600 dark:text-primary-400 font-mono"
                            />
                        )}
                    </div>

                    {/* Receipt Image */}
                    {payment.receiptImage ? (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <ImageIcon size={16} className="text-slate-500" />
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Foto del Comprobante</h3>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm bg-slate-50 dark:bg-[#0a0a0a]">
                                <img
                                    src={payment.receiptImage}
                                    alt="Comprobante de pago"
                                    className="w-full max-h-[400px] object-contain"
                                />
                            </div>
                            <div className="mt-3 flex justify-end">
                                <a
                                    href={payment.receiptImage}
                                    download={`comprobante-${payment.id}.jpg`}
                                    className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1"
                                >
                                    ↓ Descargar imagen
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-[#121212] border border-dashed border-slate-200 dark:border-dark-border flex items-center gap-3 text-slate-400 dark:text-slate-600">
                            <ImageIcon size={24} />
                            <p className="text-sm font-medium">Sin foto de comprobante adjuntada.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-[#0a0a0a] flex justify-end">
                    <button onClick={onClose} className="btn-primary !py-3 min-w-[120px]">
                        Cerrar
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaymentDetailModal;
