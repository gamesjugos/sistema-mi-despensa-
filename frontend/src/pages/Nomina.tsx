import React, { useEffect, useState, useMemo } from 'react';
import { useEmployeeStore, Employee } from '../store/employeeStore';
import { useNominaStore, NominaRecord, calculatePayroll } from '../store/nominaStore';
import { Settings, Download, Edit3, X, Save } from 'lucide-react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function Nomina() {
    const { employees, fetchEmployees, updateEmployee } = useEmployeeStore();
    const { config, records, fetchConfig, updateConfig, fetchRecords, saveRecord } = useNominaStore();

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    const [showConfig, setShowConfig] = useState(false);
    const [configForm, setConfigForm] = useState(config);

    const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
    const [recordForm, setRecordForm] = useState<Partial<NominaRecord>>({});
    const [sueldoForm, setSueldoForm] = useState<number>(0);

    useEffect(() => {
        fetchEmployees();
        fetchConfig();
    }, []);

    useEffect(() => {
        fetchRecords(currentMonth, currentYear);
    }, [currentMonth, currentYear]);

    useEffect(() => {
        setConfigForm(config);
    }, [config]);

    const activeEmployees = employees.filter(e => e.isActive);

    const payrollData = useMemo(() => {
        return activeEmployees.map(emp => {
            const existingRecord = records.find(r => r.employeeId === emp.id) || {
                employeeId: emp.id,
                mes: currentMonth,
                anio: currentYear,
                diasTrabajados: 30,
                horasNocturnas: 0,
                domingosTrabajados: 0,
                feriadosTrabajados: 0,
                bonosAdicionales: 0,
                adelantos: 0,
                inasistencias: 0,
                subsidios: 0
            };
            const calc = calculatePayroll(emp, existingRecord, config);
            return { emp, record: existingRecord, calc };
        });
    }, [activeEmployees, records, config, currentMonth, currentYear]);

    const handleSaveConfig = () => {
        updateConfig(configForm);
        setShowConfig(false);
    };

    const handleOpenEdit = (emp: Employee) => {
        const existingRecord = records.find(r => r.employeeId === emp.id) || {
            employeeId: emp.id,
            mes: currentMonth,
            anio: currentYear,
            diasTrabajados: 30,
            horasNocturnas: 0,
            domingosTrabajados: 0,
            feriadosTrabajados: 0,
            bonosAdicionales: 0,
            adelantos: 0,
            inasistencias: 0,
            subsidios: 0
        };
        setRecordForm(existingRecord);
        setSueldoForm(emp.sueldoMensual || 0);
        setEditingEmp(emp);
    };

    const handleSaveRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEmp) {
            await updateEmployee(editingEmp.id, { sueldoMensual: sueldoForm });
            await saveRecord({ ...recordForm, employeeId: editingEmp.id, mes: currentMonth, anio: currentYear });
            setEditingEmp(null);
        }
    };

    const numFormat = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const totPagado = payrollData.reduce((acc, r) => acc + r.calc.aPagar, 0);

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nómina {monthNames[currentMonth-1]} {currentYear}</h1>
                    <p className="text-sm text-slate-500 mt-1">Tasa BCV del Día: <span className="font-bold text-blue-600 dark:text-blue-400">Bs. {config.tasaBCV1}</span></p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select value={currentMonth} onChange={e => setCurrentMonth(Number(e.target.value))} className="px-3 py-2 border rounded-xl dark:bg-dark-bg text-sm flex-1 md:flex-none">
                        {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
                    </select>
                    <input type="number" value={currentYear} onChange={e => setCurrentYear(Number(e.target.value))} className="w-20 px-3 py-2 border rounded-xl dark:bg-dark-bg text-sm" />
                    <button onClick={() => setShowConfig(true)} className="p-2 border border-slate-200 hover:bg-slate-50 dark:border-dark-border dark:hover:bg-dark-bg rounded-xl transition-colors shrink-0">
                        <Settings size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    {/* Boton Excel Temporalmente Visual para el ejemplo */}
                    <button onClick={() => alert('Exportar a Excel...')} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shrink-0 text-sm">
                        <Download size={18} /> <span className="hidden sm:inline">Exportar</span>
                    </button>
                </div>
            </div>

            {/* VISTA MOVIL (Tarjetas) */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {payrollData.map((row) => (
                    <div key={row.emp.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">{row.emp.nombre} {row.emp.apellido}</h3>
                                <p className="text-xs text-slate-500">{row.emp.cargo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">A Pagar Neto</p>
                                <p className="text-lg font-bold text-green-600">${numFormat(row.calc.aPagar)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs">
                            <div>
                                <p className="text-slate-500">Sueldo Asignado</p>
                                <p className="font-semibold">${numFormat(row.emp.sueldoMensual)}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Días Trabajados</p>
                                <p className="font-semibold">{row.record.diasTrabajados} / 30</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Cestatickets</p>
                                <p className="font-semibold text-blue-600">Bs. {numFormat(row.calc.cestaticket2 + row.calc.cestaticket1)}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Total Deducciones</p>
                                <p className="font-semibold text-red-500">${numFormat(row.calc.totalDeducciones)}</p>
                            </div>
                        </div>
                        <button onClick={() => handleOpenEdit(row.emp)} className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-semibold">
                            <Edit3 size={16} /> Ajustar Sueldo y Nómina
                        </button>
                    </div>
                ))}
                
                <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-200 dark:border-primary-900/50 shadow-sm mt-4">
                    <h3 className="font-bold text-primary-900 dark:text-primary-100 text-lg mb-2">TOTALES GENERALES</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between font-bold"><span>Total Netos a Pagar:</span> <span className="text-green-600">${numFormat(totPagado)}</span></div>
                        <div className="flex justify-between"><span>Subtotal Dólares:</span> <span>${numFormat(payrollData.reduce((a,b)=>a+b.calc.subtotalIngresos,0))}</span></div>
                        <div className="flex justify-between text-blue-600"><span>Cestaticket Total:</span> <span>Bs. {numFormat(payrollData.reduce((a,b)=>a+b.calc.cestaticket2 + b.calc.cestaticket1,0))}</span></div>
                        <div className="flex justify-between text-red-500"><span>Retenciones Ley (SSO/FAOV/PF):</span> <span>${numFormat(payrollData.reduce((a,b)=>a+b.calc.sso + b.calc.faov + b.calc.rpe,0))}</span></div>
                    </div>
                </div>
            </div>

            {/* VISTA ESCRITORIO (Tabla Completa Expandida) */}
            <div className="hidden lg:block bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-x-auto text-[11px] font-medium custom-scrollbar relative max-h-[70vh]">
                <table className="min-w-max w-full border-collapse text-left">
                    <thead className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 z-20">
                        <tr className="border-b divide-x divide-slate-300 dark:divide-slate-700 uppercase">
                            <th className="p-2 border-r whitespace-nowrap sticky left-0 z-30 bg-slate-200 dark:bg-slate-800">Nombre</th>
                            <th className="p-2">Cédula</th>
                            <th className="p-2">Cargo</th>
                            <th className="p-2 border-r border-l-2 border-l-slate-400 bg-slate-100 dark:bg-slate-900">Sueldo<br/>Mensual</th>
                            <th className="p-2 border-r bg-slate-100 dark:bg-slate-900">Jornada<br/>Diario</th>
                            <th className="p-2 border-r bg-slate-100 dark:bg-slate-900">Jornada<br/>Hora</th>
                            <th className="p-2 border-r bg-slate-100 dark:bg-slate-900">Salario<br/>Semanal</th>
                            <th className="p-2">Días<br/>Trab.</th>
                            <th className="p-2">Horas Noct.<br/>(Bono $)</th>
                            <th className="p-2">Domingo<br/>Trab. ($)</th>
                            <th className="p-2">Feriado<br/>Trab. ($)</th>
                            <th className="p-2 border-r border-l-2 border-l-slate-400 bg-slate-100 dark:bg-slate-900">Sueldo<br/>Real</th>
                            <th className="p-2 text-slate-900 font-bold bg-slate-300 dark:bg-slate-700 text-center">Subtotal<br/>Ingresos ($)</th>
                            <th className="p-2 text-slate-900 font-bold bg-blue-100 dark:bg-blue-900/50 text-center">Cestaticket 2<br/><span className="font-normal text-[10px]">(Base ${config.montoCesta2} x {config.tasaBCV1})</span></th>
                            <th className="p-2 text-slate-900 font-bold bg-yellow-200 dark:bg-yellow-800/50 text-center">Cestaticket 1<br/><span className="font-normal text-[10px]">(Base ${config.montoCesta1} x {config.tasaBCV1} / 30)</span></th>
                            <th className="p-2 text-slate-900 font-bold bg-slate-300 dark:bg-slate-700 text-center border-r-2 border-r-slate-400">Ingreso<br/>Index. (Bs)</th>
                            <th className="p-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">Ret.<br/>SSO {config.porcentajeSSO}%</th>
                            <th className="p-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">Ret.<br/>PF {config.porcentajeParo}%</th>
                            <th className="p-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-r text-center">Ret.<br/>FAOV {config.porcentajeFAOV}%</th>
                            <th className="p-2">Adelantos</th>
                            <th className="p-2">Inasist.</th>
                            <th className="p-2 border-l text-center">Total<br/>Deducc.</th>
                            <th className="p-2 bg-slate-200 dark:bg-slate-800 font-bold border-l-2 border-l-slate-400">A PAGAR ($)</th>
                            <th className="p-2 sticky right-0 z-30 bg-slate-200 dark:bg-slate-800 text-center">✏️</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-dark-bg">
                        {payrollData.map((row) => (
                            <tr key={row.emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 divide-x divide-slate-200 dark:divide-slate-800">
                                <td className="p-2 sticky left-0 z-10 bg-white dark:bg-dark-bg font-semibold">{row.emp.nombre} {row.emp.apellido}</td>
                                <td className="p-2">{row.emp.cedula}</td>
                                <td className="p-2 truncate max-w-[120px]">{row.emp.cargo}</td>
                                <td className="p-2 border-l-2 border-l-slate-300 bg-slate-50 dark:bg-slate-900/50 text-right">{numFormat(row.emp.sueldoMensual)}</td>
                                <td className="p-2 bg-slate-50 dark:bg-slate-900/50 text-right">{numFormat(row.calc.sueldoDiario)}</td>
                                <td className="p-2 bg-slate-50 dark:bg-slate-900/50 text-right">{numFormat(row.calc.sueldoHora)}</td>
                                <td className="p-2 bg-slate-50 dark:bg-slate-900/50 text-right">{numFormat(row.calc.sueldoSemanal)}</td>
                                <td className="p-2 text-center text-blue-600 dark:text-blue-400 font-bold">{row.record.diasTrabajados}</td>
                                <td className="p-2 text-right">{numFormat(row.calc.bonoNocturno)}</td>
                                <td className="p-2 text-right">{numFormat(row.calc.domingosValor)}</td>
                                <td className="p-2 text-right">{numFormat(row.calc.feriadosValor)}</td>
                                <td className="p-2 border-l-2 border-l-slate-300 bg-slate-50 dark:bg-slate-900/50 text-right">{numFormat(row.calc.sueldoReal)}</td>
                                <td className="p-2 font-bold text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-700 text-right">{numFormat(row.calc.subtotalIngresos)}</td>
                                <td className="p-2 font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 text-right">{numFormat(row.calc.cestaticket2)}</td>
                                <td className="p-2 font-bold text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 text-right">{numFormat(row.calc.cestaticket1)}</td>
                                <td className="p-2 font-bold text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-700 border-r-2 border-r-slate-300 text-right">{numFormat(row.calc.ingresoTotalIndexado)}</td>
                                <td className="p-2 bg-red-50 dark:bg-red-900/10 text-red-600 text-right">{numFormat(row.calc.sso)}</td>
                                <td className="p-2 bg-red-50 dark:bg-red-900/10 text-red-600 text-right">{numFormat(row.calc.rpe)}</td>
                                <td className="p-2 bg-red-50 dark:bg-red-900/10 text-red-600 text-right">{numFormat(row.calc.faov)}</td>
                                <td className="p-2 text-right">{numFormat(row.record.adelantos)}</td>
                                <td className="p-2 text-right text-red-500">{numFormat(row.record.inasistencias)}</td>
                                <td className="p-2 text-right text-red-600 font-bold">{numFormat(row.calc.totalDeducciones)}</td>
                                <td className="p-2 bg-slate-100 dark:bg-slate-800 font-bold border-l-2 border-l-slate-300 text-right text-base text-green-700 dark:text-green-500">${numFormat(row.calc.aPagar)}</td>
                                <td className="p-1 sticky right-0 z-10 bg-white dark:bg-dark-bg text-center">
                                    <button onClick={() => handleOpenEdit(row.emp)} className="p-1 text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                        <Edit3 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold divide-x divide-slate-300 dark:divide-slate-700 uppercase sticky bottom-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                        <tr>
                            <td colSpan={3} className="p-2 text-right border-l-2 border-l-slate-300 sticky left-0 z-30 bg-slate-200 dark:bg-slate-800">TOTALES GENERALES</td>
                            <td className="p-2 bg-slate-300 dark:bg-slate-700 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.emp.sueldoMensual,0))}</td>
                            <td className="p-2 bg-slate-300 dark:bg-slate-700 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.sueldoDiario,0))}</td>
                            <td className="p-2 bg-slate-300 dark:bg-slate-700 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.sueldoHora,0))}</td>
                            <td className="p-2 bg-slate-300 dark:bg-slate-700 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.sueldoSemanal,0))}</td>
                            <td className="p-2"></td>
                            <td className="p-2 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.bonoNocturno,0))}</td>
                            <td className="p-2 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.domingosValor,0))}</td>
                            <td className="p-2 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.feriadosValor,0))}</td>
                            <td className="p-2 bg-slate-300 dark:bg-slate-700 text-right text-blue-800 dark:text-blue-300">{numFormat(payrollData.reduce((a,b)=>a+b.calc.sueldoReal,0))}</td>
                            <td className="p-2 bg-slate-300 dark:bg-slate-700 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.subtotalIngresos,0))}</td>
                            <td className="p-2 bg-blue-200 dark:bg-blue-900 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.cestaticket2,0))}</td>
                            <td className="p-2 bg-yellow-300 dark:bg-yellow-800 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.cestaticket1,0))}</td>
                            <td className="p-2 bg-slate-300 dark:bg-slate-700 border-r-2 border-r-slate-400 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.ingresoTotalIndexado,0))}</td>
                            <td className="p-2 bg-red-100 dark:bg-red-900 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.sso,0))}</td>
                            <td className="p-2 bg-red-100 dark:bg-red-900 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.rpe,0))}</td>
                            <td className="p-2 bg-red-100 dark:bg-red-900 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.faov,0))}</td>
                            <td className="p-2 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.record.adelantos,0))}</td>
                            <td className="p-2 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.record.inasistencias,0))}</td>
                            <td className="p-2 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.totalDeducciones,0))}</td>
                            <td className="p-2 border-l-2 border-l-slate-400 text-right text-green-700 dark:text-green-500 text-lg">${numFormat(totPagado)}</td>
                            <td className="sticky right-0 bg-slate-200 dark:bg-slate-800 z-30"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modals */}
            {editingEmp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 dark:border-dark-border">
                        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                            <h2 className="font-bold text-lg">Ajustar Nómina de {editingEmp.nombre}</h2>
                            <button onClick={() => setEditingEmp(null)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                                <label className="block text-sm font-bold uppercase mb-2 text-primary-600">Sueldo Asignado Fijo ($)</label>
                                <input min="0" step="0.01" type="number" value={sueldoForm} onChange={e => setSueldoForm(Number(e.target.value))} className="w-full px-3 py-2 border rounded p-1 dark:bg-black font-bold text-lg text-slate-900 dark:text-white" />
                                <p className="text-xs text-slate-500 mt-1">Este es el sueldo global del empleado, afectará la Jornada Diaria y Semanal.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Días Trabaj.</label>
                                    <input max="30" min="0" required type="number" value={recordForm.diasTrabajados} onChange={e => setRecordForm({...recordForm, diasTrabajados: Number(e.target.value)})} className="w-full px-3 py-2 border rounded p-1 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Bono Nocturno ($)</label>
                                    <input min="0" step="0.01" type="number" value={recordForm.horasNocturnas} onChange={e => setRecordForm({...recordForm, horasNocturnas: Number(e.target.value)})} className="w-full px-3 py-2 border rounded p-1 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Domingo Tr. ($)</label>
                                    <input min="0" step="0.01" type="number" value={recordForm.domingosTrabajados} onChange={e => setRecordForm({...recordForm, domingosTrabajados: Number(e.target.value)})} className="w-full px-3 py-2 border rounded p-1 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Feriado Tr. ($)</label>
                                    <input min="0" step="0.01" type="number" value={recordForm.feriadosTrabajados} onChange={e => setRecordForm({...recordForm, feriadosTrabajados: Number(e.target.value)})} className="w-full px-3 py-2 border rounded p-1 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Adelantos ($)</label>
                                    <input min="0" step="0.01" type="number" value={recordForm.adelantos} onChange={e => setRecordForm({...recordForm, adelantos: Number(e.target.value)})} className="w-full px-3 py-2 border rounded p-1 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Inasist. ($)</label>
                                    <input min="0" step="0.01" type="number" value={recordForm.inasistencias} onChange={e => setRecordForm({...recordForm, inasistencias: Number(e.target.value)})} className="w-full px-3 py-2 border rounded p-1 dark:bg-black" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-4 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded p-3 transition-colors"><Save size={18}/> Guardar Todos los Ajustes</button>
                        </form>
                    </div>
                </div>
            )}

            {showConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-dark-border">
                        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                            <h2 className="font-bold text-lg">Ajustes Generales</h2>
                            <button onClick={() => setShowConfig(false)}><X className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50">
                                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Tasa Oficial del Día (BCV)</label>
                                <input min="0" step="0.01" type="number" value={configForm.tasaBCV1} onChange={e => setConfigForm({...configForm, tasaBCV1: Number(e.target.value)})} className="w-full border rounded px-3 py-3 font-bold text-xl dark:bg-black" />
                                <p className="text-xs text-blue-600 mt-2">Esta tasa se aplicará para calcular tanto la Cesta 1 como la Cesta 2 simultáneamente.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">Monto Base Cesta 1 ($)</label>
                                    <input min="0" step="0.01" type="number" value={configForm.montoCesta1} onChange={e => setConfigForm({...configForm, montoCesta1: Number(e.target.value)})} className="w-full border rounded px-3 py-2 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">Monto Base Cesta 2 ($)</label>
                                    <input min="0" step="0.01" type="number" value={configForm.montoCesta2} onChange={e => setConfigForm({...configForm, montoCesta2: Number(e.target.value)})} className="w-full border rounded px-3 py-2 dark:bg-black" />
                                </div>
                            </div>
                            <hr className="my-2 border-slate-200 dark:border-slate-800" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">% Residencia SSO</label>
                                    <input min="0" step="0.1" type="number" value={configForm.porcentajeSSO} onChange={e => setConfigForm({...configForm, porcentajeSSO: Number(e.target.value)})} className="w-full border rounded px-3 py-2 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">% Paro Forzoso</label>
                                    <input min="0" step="0.1" type="number" value={configForm.porcentajeParo} onChange={e => setConfigForm({...configForm, porcentajeParo: Number(e.target.value)})} className="w-full border rounded px-3 py-2 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">% FAOV</label>
                                    <input min="0" step="0.1" type="number" value={configForm.porcentajeFAOV} onChange={e => setConfigForm({...configForm, porcentajeFAOV: Number(e.target.value)})} className="w-full border rounded px-3 py-2 dark:bg-black" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">% ISLR</label>
                                    <input min="0" step="0.1" type="number" value={configForm.porcentajeISLR} onChange={e => setConfigForm({...configForm, porcentajeISLR: Number(e.target.value)})} className="w-full border rounded px-3 py-2 dark:bg-black" />
                                </div>
                            </div>
                            <button onClick={handleSaveConfig} className="bg-primary-600 text-white font-bold w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl transition hover:bg-primary-700"><Save size={18}/> Guardar Todos los Ajustes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
