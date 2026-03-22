import React, { useEffect, useState, useMemo } from 'react';
import { useEmployeeStore, Employee } from '../store/employeeStore';
import { useNominaStore, NominaRecord, calculatePayroll } from '../store/nominaStore';
import { Settings, Download, Edit3, X, Save } from 'lucide-react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function Nomina() {
    const { employees, fetchEmployees } = useEmployeeStore();
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

    // Compute derived payroll list
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
                cesta2ManualOverride: null
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
            cesta2ManualOverride: null
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
        const sheet = workbook.addWorksheet(`Nomina_${monthNames[currentMonth-1]}_${currentYear}`);

        sheet.columns = [
            { header: 'NOMBRE DEL TRABAJADOR', key: 'nombre', width: 30 },
            { header: 'C.I.', key: 'cedula', width: 15 },
            { header: 'CARGO', key: 'cargo', width: 25 },
            { header: 'SUELDO MENSUAL', key: 'sueldo', width: 15 },
            { header: 'SUELDO DIARIO', key: 'sdiario', width: 15 },
            { header: 'SUELDO POR HORA', key: 'shora', width: 15 },
            { header: 'SUELDO SEMANAL', key: 'ssemanal', width: 15 },
            { header: 'DIAS LABORADOS', key: 'dias', width: 15 },
            { header: 'BONOS', key: 'bonos', width: 12 },
            { header: 'DEVENGADO', key: 'devengado', width: 15 },
            { header: 'SSO 4%', key: 'sso', width: 12 },
            { header: 'RPE 0.5%', key: 'rpe', width: 12 },
            { header: 'FAOV 1%', key: 'faov', width: 12 },
            { header: 'ADELANTOS', key: 'adelantos', width: 12 },
            { header: 'INASIST. / OTROS', key: 'inasistencias', width: 15 },
            { header: 'TOTAL DEDUCC.', key: 'deducciones', width: 15 },
            { header: 'NETO', key: 'neto', width: 15 },
            { header: 'CESTA BASE', key: 'cesta', width: 15 },
            { header: 'CESTA 2', key: 'cesta2', width: 15 }
        ];

        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        headerRow.height = 40;

        payrollData.forEach((row, i) => {
            const dataRow = sheet.addRow({
                nombre: `${row.emp.nombre} ${row.emp.apellido}`,
                cedula: row.emp.cedula,
                cargo: row.emp.cargo,
                sueldo: row.emp.sueldoMensual,
                sdiario: row.calc.sueldoDiario,
                shora: row.calc.sueldoHora,
                ssemanal: row.calc.sueldoSemanal,
                dias: row.record.diasTrabajados,
                bonos: row.record.bonosAdicionales,
                devengado: row.calc.sueldoGanado + Number(row.record.bonosAdicionales),
                sso: row.calc.sso,
                rpe: row.calc.rpe,
                faov: row.calc.faov,
                adelantos: row.record.adelantos,
                inasistencias: row.record.inasistencias,
                deducciones: row.calc.deduccionesTotales,
                neto: row.calc.neto,
                cesta: row.calc.cestaticketBase,
                cesta2: row.calc.cestaticket2
            });
            // Formatting currencies
            [4,5,6,7,9,10,11,12,13,14,15,16,17,18,19].forEach(colIndex => {
                dataRow.getCell(colIndex).numFmt = '"$"#,##0.00';
            });
        });

        // Totals Row
        const totSueldos = payrollData.reduce((acc, r) => acc + r.calc.sueldoGanado, 0);
        const totNeto = payrollData.reduce((acc, r) => acc + r.calc.neto, 0);
        const totCesta = payrollData.reduce((acc, r) => acc + r.calc.cestaticketBase, 0);
        const totCesta2 = payrollData.reduce((acc, r) => acc + r.calc.cestaticket2, 0);
        const totDeducc = payrollData.reduce((acc, r) => acc + r.calc.deduccionesTotales, 0);

        const totalsRow = sheet.addRow({
            nombre: 'TOTALES',
            sueldo: payrollData.reduce((acc, r) => acc + r.emp.sueldoMensual, 0),
            devengado: totSueldos,
            deducciones: totDeducc,
            neto: totNeto,
            cesta: totCesta,
            cesta2: totCesta2
        });
        totalsRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
            cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Nomina_MiDespensa_${monthNames[currentMonth-1]}_${currentYear}.xlsx`);
    };

    const totPagado = payrollData.reduce((acc, r) => acc + r.calc.neto, 0);
    const totDeducciones = payrollData.reduce((acc, r) => acc + r.calc.deduccionesTotales, 0);
    const totCestaticket = payrollData.reduce((acc, r) => acc + r.calc.cestaticketBase + r.calc.cestaticket2, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nómina Mensual</h1>
                    <p className="text-sm text-slate-500">Cálculo en vivo de la plantilla salarial de la empresa.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={currentMonth} onChange={e => setCurrentMonth(Number(e.target.value))} className="px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white">
                        {monthNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
                    </select>
                    <input type="number" value={currentYear} onChange={e => setCurrentYear(Number(e.target.value))} className="w-24 px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                    <button onClick={() => setShowConfig(true)} className="p-2 border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-bg rounded-xl transition-colors shrink-0">
                        <Settings size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shrink-0">
                        <Download size={18} /> Exportar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Total Neto a Pagar</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">${totPagado.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Total Retenciones (Ley)</p>
                    <p className="text-2xl font-bold text-red-500">${totDeducciones.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Total Cestatickets</p>
                    <p className="text-2xl font-bold text-blue-500">${totCestaticket.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Tasa del Día Configurable</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">Bs. {config.tasaDelDia}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border p-4 overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-dark-bg/50">
                        <tr>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Devengado</th>
                            <th className="px-4 py-3">Cesta Base</th>
                            <th className="px-4 py-3">Cesta 2</th>
                            <th className="px-4 py-3 text-red-500">Deducciones</th>
                            <th className="px-4 py-3 text-green-600 font-bold">NETO ($)</th>
                            <th className="px-4 py-3 text-right">Ajustar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                        {payrollData.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-4">No hay empleados activos.</td></tr>
                        ) : payrollData.map((row) => (
                            <tr key={row.emp.id} className="hover:bg-slate-50 dark:hover:bg-dark-bg/50 transition-colors">
                                <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{row.emp.nombre} {row.emp.apellido}</td>
                                <td className="px-4 py-4">${row.calc.ingresosTotales.toFixed(2)}</td>
                                <td className="px-4 py-4">${row.calc.cestaticketBase.toFixed(2)}</td>
                                <td className="px-4 py-4">${row.calc.cestaticket2.toFixed(2)}</td>
                                <td className="px-4 py-4 text-red-500 text-xs">
                                    -${row.calc.deduccionesTotales.toFixed(2)} 
                                    {row.record.adelantos > 0 && <span className="block opacity-60">(Ad: ${row.record.adelantos})</span>}
                                </td>
                                <td className="px-4 py-4 text-green-600 font-bold text-base bg-green-50/50 dark:bg-green-900/10">${row.calc.neto.toFixed(2)}</td>
                                <td className="px-4 py-4 text-right">
                                    <button onClick={() => handleOpenEdit(row.emp)} className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                                        <Edit3 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-dark-bg/50 font-bold text-slate-900 dark:text-white">
                        <tr>
                            <td className="px-4 py-3">TOTALES</td>
                            <td className="px-4 py-3">${payrollData.reduce((a,b)=>a+b.calc.ingresosTotales,0).toFixed(2)}</td>
                            <td className="px-4 py-3">${payrollData.reduce((a,b)=>a+b.calc.cestaticketBase,0).toFixed(2)}</td>
                            <td className="px-4 py-3">${totCestaticket.toFixed(2)}</td>
                            <td className="px-4 py-3 text-red-500">-${totDeducciones.toFixed(2)}</td>
                            <td className="px-4 py-3 text-green-600">${totPagado.toFixed(2)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modal Editar Fila (Días, bonos, etc) */}
            {editingEmp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 dark:border-dark-border">
                        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                            <h2 className="font-bold text-lg">Ajustar Nómina de {editingEmp.nombre}</h2>
                            <button onClick={() => setEditingEmp(null)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Días Trabaj.</label>
                                    <input max="30" min="0" required type="number" value={recordForm.diasTrabajados} onChange={e => setRecordForm({...recordForm, diasTrabajados: Number(e.target.value)})} className="input py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Horas Noct.</label>
                                    <input min="0" required type="number" value={recordForm.horasNocturnas} onChange={e => setRecordForm({...recordForm, horasNocturnas: Number(e.target.value)})} className="input py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Bonos Indiv.</label>
                                    <input min="0" required type="number" value={recordForm.bonosAdicionales} onChange={e => setRecordForm({...recordForm, bonosAdicionales: Number(e.target.value)})} className="input py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Adelantos</label>
                                    <input min="0" required type="number" value={recordForm.adelantos} onChange={e => setRecordForm({...recordForm, adelantos: Number(e.target.value)})} className="input py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Descuentos ($)</label>
                                    <input min="0" required type="number" value={recordForm.inasistencias} onChange={e => setRecordForm({...recordForm, inasistencias: Number(e.target.value)})} className="input py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase mb-1 opacity-70">Subsidios ($)</label>
                                    <input min="0" required type="number" value={recordForm.subsidios} onChange={e => setRecordForm({...recordForm, subsidios: Number(e.target.value)})} className="input py-2" />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-full mt-4 flex items-center justify-center gap-2"><Save size={18}/> Guardar Ajustes</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Configuración Global */}
            {showConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-dark-border">
                        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                            <h2 className="font-bold text-lg">Parámetros Globales</h2>
                            <button onClick={() => setShowConfig(false)}><X className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Tasa del Día (Bs/$)</label>
                                <input min="0" step="0.01" type="number" value={configForm.tasaDelDia} onChange={e => setConfigForm({...configForm, tasaDelDia: Number(e.target.value)})} className="input py-2" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Valor Vales ($/día)</label>
                                <input min="0" step="0.01" type="number" value={configForm.valorCesta} onChange={e => setConfigForm({...configForm, valorCesta: Number(e.target.value)})} className="input py-2" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Valor Cestaticket 2 Base ($)</label>
                                <input min="0" step="0.01" type="number" value={configForm.valorCesta2} onChange={e => setConfigForm({...configForm, valorCesta2: Number(e.target.value)})} className="input py-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">% SSO</label>
                                    <input min="0" step="0.1" type="number" value={configForm.porcentajeSSO} onChange={e => setConfigForm({...configForm, porcentajeSSO: Number(e.target.value)})} className="input py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">% Paro Forzoso</label>
                                    <input min="0" step="0.1" type="number" value={configForm.porcentajeParo} onChange={e => setConfigForm({...configForm, porcentajeParo: Number(e.target.value)})} className="input py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">% FAOV</label>
                                    <input min="0" step="0.1" type="number" value={configForm.porcentajeFAOV} onChange={e => setConfigForm({...configForm, porcentajeFAOV: Number(e.target.value)})} className="input py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">% ISLR</label>
                                    <input min="0" step="0.1" type="number" value={configForm.porcentajeISLR} onChange={e => setConfigForm({...configForm, porcentajeISLR: Number(e.target.value)})} className="input py-2" />
                                </div>
                            </div>
                            <button onClick={handleSaveConfig} className="btn-primary w-full mt-4 flex items-center justify-center gap-2"><Save size={18}/> Guardar Configuración</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
