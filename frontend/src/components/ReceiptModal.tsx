import { useState } from 'react';
import { Employee } from '../store/employeeStore';
import { NominaRecord } from '../store/nominaStore';
import { X, Printer } from 'lucide-react';

interface ReceiptModalProps {
    emp: Employee;
    record: NominaRecord;
    calc: any;
    onClose: () => void;
    initialType?: 'NOMINA' | 'CESTATICKET' | 'AMBOS';
    monthName: string;
    year: number;
}

export default function ReceiptModal({ emp, record, calc, onClose, initialType = 'AMBOS', monthName, year }: ReceiptModalProps) {
    const [type, setType] = useState(initialType);

    const handlePrint = () => {
        window.print();
    };

    const numFormat = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const isDespensa = emp.empresa === 'MI_DESPENSA';
    const companyName = isDespensa ? 'INVERSIONES MI DESPENSA, C.A.' : 'MI CONTENEDOR, C.A.';
    const companyRif = isDespensa ? 'J-50000000-0' : 'J-50000000-1'; // Mock RIFs

    const renderNominaReceipt = () => (
        <div className="border border-black p-6 mb-8 text-black bg-white break-inside-avoid">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="font-bold text-xl uppercase">{companyName}</h2>
                    <p className="text-sm">RIF: {companyRif}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm border border-black p-2 font-bold uppercase">Mes: {monthName} {year}</p>
                </div>
            </div>

            <h1 className="text-center font-bold text-lg mb-6 underline uppercase">Recibo de Pago de Sueldo</h1>

            <div className="border border-black mb-6">
                <div className="grid grid-cols-2 border-b border-black text-sm">
                    <div className="p-2 border-r border-black"><strong>Cédula:</strong> V-{emp.cedula}</div>
                    <div className="p-2"><strong>Nombres y Apellidos:</strong> {emp.nombre} {emp.apellido}</div>
                </div>
                <div className="grid grid-cols-2 text-sm">
                    <div className="p-2 border-r border-black"><strong>Cargo:</strong> {emp.cargo}</div>
                    <div className="p-2"><strong>Fecha de Ingreso:</strong> {emp.fechaIngreso || 'N/A'}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <table className="w-full text-sm border-collapse border border-black">
                    <thead>
                        <tr>
                            <th className="border-b border-r border-black p-2 bg-gray-100 text-left">Asignaciones</th>
                            <th className="border-b border-black p-2 bg-gray-100 text-right">Monto ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border-b border-r border-black p-2">Sueldo Base (Días Trab: {record.diasTrabajados})</td>
                            <td className="border-b border-black p-2 text-right">{numFormat(calc.sueldoReal)}</td>
                        </tr>
                        {calc.bonoNocturno > 0 && (
                            <tr>
                                <td className="border-b border-r border-black p-2">Horas Nocturnas ({record.horasNocturnas}H)</td>
                                <td className="border-b border-black p-2 text-right">{numFormat(calc.bonoNocturno)}</td>
                            </tr>
                        )}
                        {calc.domingosValor > 0 && (
                            <tr>
                                <td className="border-b border-r border-black p-2">Domingos Trabajados ({record.domingosTrabajados}D)</td>
                                <td className="border-b border-black p-2 text-right">{numFormat(calc.domingosValor)}</td>
                            </tr>
                        )}
                        {calc.feriadosValor > 0 && (
                            <tr>
                                <td className="border-b border-r border-black p-2">Feriados Trabajados ({record.feriadosTrabajados}D)</td>
                                <td className="border-b border-black p-2 text-right">{numFormat(calc.feriadosValor)}</td>
                            </tr>
                        )}
                        {record.bonosAdicionales > 0 && (
                            <tr>
                                <td className="border-b border-r border-black p-2">Bonos Adicionales</td>
                                <td className="border-b border-black p-2 text-right">{numFormat(record.bonosAdicionales)}</td>
                            </tr>
                        )}
                        {record.subsidios > 0 && (
                            <tr>
                                <td className="border-b border-r border-black p-2">Subsidios / Otros</td>
                                <td className="border-b border-black p-2 text-right">{numFormat(record.subsidios)}</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th className="border-t border-r border-black p-2 text-right">Total Ingresos:</th>
                            <th className="border-t border-black p-2 text-right bg-gray-100">{numFormat(calc.subtotalIngresos + record.subsidios)}</th>
                        </tr>
                    </tfoot>
                </table>

                <table className="w-full text-sm border-collapse border border-black h-fit">
                    <thead>
                        <tr>
                            <th className="border-b border-r border-black p-2 bg-gray-100 text-left">Deducciones</th>
                            <th className="border-b border-black p-2 bg-gray-100 text-right">Monto ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border-b border-r border-black p-2">SSO</td>
                            <td className="border-b border-black p-2 text-right">{numFormat(calc.sso)}</td>
                        </tr>
                        <tr>
                            <td className="border-b border-r border-black p-2">Paro Forzoso</td>
                            <td className="border-b border-black p-2 text-right">{numFormat(calc.rpe)}</td>
                        </tr>
                        <tr>
                            <td className="border-b border-r border-black p-2">FAOV</td>
                            <td className="border-b border-black p-2 text-right">{numFormat(calc.faov)}</td>
                        </tr>
                        {calc.islrValue > 0 && (
                            <tr>
                                <td className="border-b border-r border-black p-2">I.S.L.R</td>
                                <td className="border-b border-black p-2 text-right">{numFormat(calc.islrValue)}</td>
                            </tr>
                        )}
                        {record.adelantos > 0 && (
                            <tr>
                                <td className="border-b border-r border-black p-2">Adelantos de Quincena</td>
                                <td className="border-b border-black p-2 text-right">{numFormat(record.adelantos)}</td>
                            </tr>
                        )}
                        {record.inasistencias > 0 && (
                            <tr>
                                <td className="border-b border-r border-black p-2">Inasistencias</td>
                                <td className="border-b border-black p-2 text-right">{numFormat(record.inasistencias)}</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th className="border-t border-r border-black p-2 text-right">Total Deducciones:</th>
                            <th className="border-t border-black p-2 text-right bg-gray-100">{numFormat(calc.totalDeducciones)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-end mb-16">
                <table className="w-1/2 text-sm border-collapse border border-black">
                    <tbody>
                        <tr>
                            <th className="border-r border-black p-3 bg-gray-200 uppercase text-right w-2/3 tracking-wider">Neto A Pagar:</th>
                            <th className="p-3 text-right bg-gray-100 text-lg">${numFormat(calc.aPagar)}</th>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-2 gap-16 text-center mt-12 px-8">
                <div>
                    <div className="border-t border-black pt-2 font-bold text-sm">Recibí Conforme (Firma)</div>
                </div>
                <div>
                    <div className="border-t border-black pt-2 font-bold text-sm">Por {companyName}</div>
                </div>
            </div>
        </div>
    );

    const renderCestaticketReceipt = () => (
        <div className="border border-black p-6 mb-8 text-black bg-white break-inside-avoid">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="font-bold text-xl uppercase">{companyName}</h2>
                    <p className="text-sm">RIF: {companyRif}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm border border-black p-2 font-bold uppercase">Mes: {monthName} {year}</p>
                </div>
            </div>

            <h1 className="text-center font-bold text-lg mb-6 underline uppercase">Recibo de Cestaticket</h1>

            <div className="border border-black mb-6">
                <div className="grid grid-cols-2 border-b border-black text-sm">
                    <div className="p-2 border-r border-black"><strong>Cédula:</strong> V-{emp.cedula}</div>
                    <div className="p-2"><strong>Nombres y Apellidos:</strong> {emp.nombre} {emp.apellido}</div>
                </div>
                <div className="grid grid-cols-2 text-sm">
                    <div className="p-2 border-r border-black"><strong>Cargo:</strong> {emp.cargo}</div>
                    <div className="p-2"><strong>Fecha de Ingreso:</strong> {emp.fechaIngreso || 'N/A'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
                <table className="w-full text-sm border-collapse border border-black">
                    <thead>
                        <tr>
                            <th className="border-b border-r border-black p-2 bg-gray-100 text-left">Asignaciones (Beneficio Alimentación)</th>
                            <th className="border-b border-black p-2 bg-gray-100 text-right w-1/4">Monto (Bs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border-b border-r border-black p-2">Cestaticket Oficial (Base Legal) - Días: {record.diasTrabajados + record.diasVacaciones}</td>
                            <td className="border-b border-black p-2 text-right">{numFormat(calc.cestaticket1)}</td>
                        </tr>
                        <tr>
                            <td className="border-b border-r border-black p-2">Bono Cestaticket Adicional Indexado - Días: {record.diasTrabajados + record.diasVacaciones}</td>
                            <td className="border-b border-black p-2 text-right">{numFormat(calc.cestaticket2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mb-16">
                <table className="w-1/2 text-sm border-collapse border border-black">
                    <tbody>
                        <tr>
                            <th className="border-r border-black p-3 bg-gray-200 uppercase text-right w-2/3 tracking-wider">Total Cestaticket A Pagar:</th>
                            <th className="p-3 text-right bg-gray-100 text-lg">Bs. {numFormat(calc.cestaticket1 + calc.cestaticket2)}</th>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-2 gap-16 text-center mt-12 px-8">
                <div>
                    <div className="border-t border-black pt-2 font-bold text-sm">Recibí Conforme (Firma)</div>
                </div>
                <div>
                    <div className="border-t border-black pt-2 font-bold text-sm">Por {companyName}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 dark:bg-slate-900 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                        <X size={24} />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg dark:text-white">Imprimir Recibo de {emp.nombre}</h2>
                        <p className="text-sm text-slate-500">Haz clic en Imprimir y luego selecciona tu impresora, o elige "Guardar como PDF".</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <select value={type} onChange={(e) => setType(e.target.value as any)} className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-black font-semibold text-slate-700 dark:text-slate-200 outline-none">
                        <option value="NOMINA">Sólo Nómina</option>
                        <option value="CESTATICKET">Sólo Cestaticket</option>
                        <option value="AMBOS">Nómina y Cestaticket</option>
                    </select>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors shadow-sm">
                        <Printer size={20} />
                        <span>Imprimir / Exportar PDF</span>
                    </button>
                </div>
            </div>

            {/* Print wrapper */}
            <div className="p-8 mx-auto w-full max-w-4xl pt-8">
                <div id="printable-receipt" className="bg-white shadow flex flex-col print:shadow-none p-10 print:p-0">
                    {(type === 'NOMINA' || type === 'AMBOS') && renderNominaReceipt()}
                    {(type === 'CESTATICKET' || type === 'AMBOS') && renderCestaticketReceipt()}
                </div>
            </div>
        </div>
    );
}
