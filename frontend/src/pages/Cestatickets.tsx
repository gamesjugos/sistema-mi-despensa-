import React, { useEffect, useState, useMemo } from 'react';
import { useEmployeeStore, Employee } from '../store/employeeStore';
import { useNominaStore, NominaRecord, calculatePayroll } from '../store/nominaStore';
import { Settings, Download, Edit3, X, Save } from 'lucide-react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function Cestatickets() {
    const { employees, fetchEmployees, updateEmployee } = useEmployeeStore();
    const { config, records, fetchConfig, updateConfig, fetchRecords, saveRecord } = useNominaStore();

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    const [showConfig, setShowConfig] = useState(false);
    const [configForm, setConfigForm] = useState(config);

    const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
    const [recordForm, setRecordForm] = useState<Partial<NominaRecord>>({});

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
                subsidios: 0,
                aplicaPensiones: true
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
            subsidios: 0,
            aplicaPensiones: true
        };
        setRecordForm(existingRecord);
        setEditingEmp(emp);
    };

    const handleSaveRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEmp) {
            await saveRecord({ ...recordForm, employeeId: editingEmp.id, mes: currentMonth, anio: currentYear });
            setEditingEmp(null);
        }
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`Cestatickets_${monthNames[currentMonth-1]}_${currentYear}`);

        sheet.columns = [
            { header: 'NOMBRE DEL TRABAJADOR', key: 'nombre', width: 25 },
            { header: 'C.I.', key: 'cedula', width: 15 },
            { header: 'CARGO', key: 'cargo', width: 20 },
            { header: 'DIAS TRABAJADOS', key: 'dias', width: 15 },
            { header: 'CESTATICKETS 1 (Bs)', key: 'cesta1', width: 20 },
            { header: 'CESTATICKETS 2 (Bs)', key: 'cesta2', width: 20 },
            { header: 'TOTAL CESTATICKETS (Bs)', key: 'total_cesta', width: 25 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        headerRow.height = 30;

        payrollData.forEach((row) => {
            const dataRow = sheet.addRow({
                nombre: `${row.emp.nombre} ${row.emp.apellido}`,
                cedula: row.emp.cedula,
                cargo: row.emp.cargo,
                dias: row.record.diasTrabajados,
                cesta1: row.calc.cestaticket1,
                cesta2: row.calc.cestaticket2, // It already pro-rates based on logic
                total_cesta: row.calc.cestaticket1 + row.calc.cestaticket2,
            });
            [5,6,7].forEach(colIndex => {
                dataRow.getCell(colIndex).numFmt = '"Bs."#,##0.00';
            });
        });

        const totalsRow = sheet.addRow({
            nombre: 'TOTALES GENERALES',
            dias: payrollData.reduce((a,b)=>a+b.record.diasTrabajados,0),
            cesta1: payrollData.reduce((a,b)=>a+b.calc.cestaticket1,0),
            cesta2: payrollData.reduce((a,b)=>a+b.calc.cestaticket2,0),
            total_cesta: payrollData.reduce((a,b)=>a+(b.calc.cestaticket1 + b.calc.cestaticket2),0)
        });
        
        totalsRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
            cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Reporte_Cestatickets_${monthNames[currentMonth-1]}_${currentYear}.xlsx`);
    };

    const numFormat = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cestatickets {monthNames[currentMonth-1]} {currentYear}</h1>
                    <p className="text-sm text-slate-500 mt-1">Tasa BCV aplicable: <span className="font-bold text-blue-600 dark:text-blue-400">Bs. {config.tasaBCV1}</span></p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select value={currentMonth} onChange={e => setCurrentMonth(Number(e.target.value))} className="px-3 py-2 border rounded-xl dark:bg-dark-bg text-sm flex-1 md:flex-none">
                        {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
                    </select>
                    <input type="number" value={currentYear} onChange={e => setCurrentYear(Number(e.target.value))} className="w-20 px-3 py-2 border rounded-xl dark:bg-dark-bg text-sm" />
                    <button onClick={() => setShowConfig(true)} className="p-2 border border-slate-200 hover:bg-slate-50 dark:border-dark-border dark:hover:bg-dark-bg rounded-xl transition-colors shrink-0">
                        <Settings size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shrink-0 text-sm">
                        <Download size={18} /> <span className="hidden sm:inline">Exportar Excel</span>
                    </button>
                </div>
            </div>

            {/* VISTA MOVIL */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {payrollData.map((row) => (
                    <div key={row.emp.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">{row.emp.nombre} {row.emp.apellido}</h3>
                                <p className="text-xs text-slate-500">{row.emp.cargo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider text-purple-600">Total Cestaticket</p>
                                <p className="text-lg font-bold text-purple-600">Bs. {numFormat(row.calc.cestaticket1 + row.calc.cestaticket2)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs">
                            <div>
                                <p className="text-slate-500">Días Trabajados</p>
                                <p className="font-semibold">{row.record.diasTrabajados} / 30</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Cesta 1 (Bs)</p>
                                <p className="font-semibold text-yellow-600">{numFormat(row.calc.cestaticket1)}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Cesta 2 (Bs)</p>
                                <p className="font-semibold text-blue-600">{numFormat(row.calc.cestaticket2)}</p>
                            </div>
                        </div>
                        <button onClick={() => handleOpenEdit(row.emp)} className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-semibold">
                            <Edit3 size={16} /> Modificar Días Trabajados
                        </button>
                    </div>
                ))}
                
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-sm mt-4">
                    <h3 className="font-bold text-purple-900 dark:text-purple-100 text-lg mb-2">TOTALES CESTATICKETS</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between font-bold text-purple-700 dark:text-purple-400"><span>Gran Total (Bs):</span> <span>{numFormat(payrollData.reduce((a,b)=>a+(b.calc.cestaticket1 + b.calc.cestaticket2),0))}</span></div>
                    </div>
                </div>
            </div>

            {/* VISTA ESCRITORIO */}
            <div className="hidden lg:block bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-x-auto text-sm font-medium custom-scrollbar relative max-h-[70vh]">
                <table className="min-w-max w-full border-collapse text-left">
                    <thead className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 z-20">
                        <tr className="border-b divide-x divide-slate-300 dark:divide-slate-700 uppercase text-xs">
                            <th className="p-3 border-r whitespace-nowrap sticky left-0 z-30 bg-slate-200 dark:bg-slate-800">Nombre</th>
                            <th className="p-3">Cédula</th>
                            <th className="p-3">Cargo</th>
                            <th className="p-3 border-r border-l-2 border-l-slate-400 bg-slate-100 dark:bg-slate-900 text-center">Días<br/>Trabajados</th>
                            <th className="p-3 text-slate-900 font-bold bg-yellow-200 dark:bg-yellow-800/50 text-right">Cestaticket 1<br/><span className="font-normal text-[10px]">(Base ${config.montoCesta1} x {config.tasaBCV1} / 30 x Dias)</span></th>
                            <th className="p-3 text-slate-900 font-bold bg-blue-100 dark:bg-blue-900/50 text-right">Cestaticket 2<br/><span className="font-normal text-[10px]">(Base ${config.montoCesta2} x {config.tasaBCV1} / 30 x Dias)</span></th>
                            <th className="p-3 bg-purple-200 dark:bg-purple-900/80 text-purple-900 dark:text-purple-100 font-bold border-l-2 border-l-purple-400 text-right">TOTAL CESTATICKETS<br/>(Bs.)</th>
                            <th className="p-3 sticky right-0 z-30 bg-slate-200 dark:bg-slate-800 text-center">✏️</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-dark-bg">
                        {payrollData.map((row) => (
                            <tr key={row.emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 divide-x divide-slate-200 dark:divide-slate-800">
                                <td className="p-3 sticky left-0 z-10 bg-white dark:bg-dark-bg font-semibold">{row.emp.nombre} {row.emp.apellido}</td>
                                <td className="p-3">{row.emp.cedula}</td>
                                <td className="p-3 truncate max-w-[120px]">{row.emp.cargo}</td>
                                <td className="p-3 border-l-2 border-l-slate-300 bg-slate-50 dark:bg-slate-900/50 text-center font-bold text-blue-600 space-x-1">{row.record.diasTrabajados}</td>
                                <td className="p-3 font-bold text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 text-right">{numFormat(row.calc.cestaticket1)}</td>
                                <td className="p-3 font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 text-right">{numFormat(row.calc.cestaticket2)}</td>
                                <td className="p-3 bg-purple-50 dark:bg-purple-900/20 font-bold border-l-2 border-l-purple-300 text-right text-base text-purple-700 dark:text-purple-400">{numFormat(row.calc.cestaticket1 + row.calc.cestaticket2)}</td>
                                <td className="p-2 sticky right-0 z-10 bg-white dark:bg-dark-bg text-center">
                                    <button onClick={() => handleOpenEdit(row.emp)} className="p-2 text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                        <Edit3 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold divide-x divide-slate-300 dark:divide-slate-700 uppercase sticky bottom-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] text-xs">
                        <tr>
                            <td colSpan={3} className="p-3 text-right border-l-2 border-l-slate-300 sticky left-0 z-30 bg-slate-200 dark:bg-slate-800">TOTALES GENERALES</td>
                            <td className="p-3 text-center text-blue-600 dark:text-blue-400">{payrollData.reduce((a,b)=>a+b.record.diasTrabajados,0)}</td>
                            <td className="p-3 bg-yellow-300 dark:bg-yellow-800 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.cestaticket1,0))}</td>
                            <td className="p-3 bg-blue-200 dark:bg-blue-900 text-right">{numFormat(payrollData.reduce((a,b)=>a+b.calc.cestaticket2,0))}</td>
                            <td className="p-3 border-l-2 border-l-purple-400 text-right text-purple-800 dark:text-purple-300 text-base">{numFormat(payrollData.reduce((a,b)=>a+(b.calc.cestaticket1 + b.calc.cestaticket2),0))}</td>
                            <td className="sticky right-0 bg-slate-200 dark:bg-slate-800 z-30"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modals */}
            {editingEmp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-dark-border">
                        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                            <h2 className="font-bold text-lg">Ajuste de Cestatickets</h2>
                            <button onClick={() => setEditingEmp(null)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2 text-primary-600">Días Trabajados ({editingEmp.nombre})</label>
                                <input max="30" min="0" required type="number" value={recordForm.diasTrabajados} onChange={e => setRecordForm({...recordForm, diasTrabajados: Number(e.target.value)})} className="w-full px-4 py-3 border rounded-xl text-lg font-bold dark:bg-black text-center" />
                                <p className="text-xs text-slate-500 mt-2 text-center">Este valor ajustará visualmente el monto depositado proporcional a los días transcurridos. (Total mes: 30 días)</p>
                            </div>
                            <button type="submit" className="w-full mt-4 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded p-3 transition-colors"><Save size={18}/> Guardar Cambios</button>
                        </form>
                    </div>
                </div>
            )}

            {showConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-dark-border">
                        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                            <h2 className="font-bold text-lg">Parámetros Cestatickets</h2>
                            <button onClick={() => setShowConfig(false)}><X className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50">
                                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Tasa Oficial del Día (BCV)</label>
                                <input min="0" step="0.01" type="number" value={configForm.tasaBCV1} onChange={e => setConfigForm({...configForm, tasaBCV1: Number(e.target.value)})} className="w-full border rounded px-3 py-3 font-bold text-xl dark:bg-black" />
                                <p className="text-xs text-blue-600 mt-2">Altera el cálculo en ambos tickets.</p>
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
                            <button onClick={handleSaveConfig} className="bg-primary-600 text-white font-bold w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl transition hover:bg-primary-700"><Save size={18}/> Guardar Parámetros</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
