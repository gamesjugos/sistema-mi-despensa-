import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { Plus, X, Download } from 'lucide-react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Employees = () => {
    const { employees, loading, fetchEmployees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore();
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        cargo: '',
        sueldoMensual: 0,
        fechaIngreso: '',
        fechaEgreso: '',
        empresa: 'MI_DESPENSA' as 'MI_DESPENSA' | 'MI_CONTENEDOR',
        isActive: true,
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees(selectedEmpresa);
    }, [selectedEmpresa, fetchEmployees]);

    const handleOpenModal = (emp?: any) => {
        if (emp) {
            setFormData({
                nombre: emp.nombre,
                apellido: emp.apellido,
                cedula: emp.cedula,
                cargo: emp.cargo,
                sueldoMensual: emp.sueldoMensual,
                fechaIngreso: emp.fechaIngreso ? emp.fechaIngreso.split('T')[0] : '',
                fechaEgreso: emp.fechaEgreso ? emp.fechaEgreso.split('T')[0] : '',
                empresa: emp.empresa,
                isActive: emp.isActive,
            });
            setEditingId(emp.id);
        } else {
            setFormData({
                nombre: '',
                apellido: '',
                cedula: '',
                cargo: '',
                sueldoMensual: 0,
                fechaIngreso: new Date().toISOString().split('T')[0],
                fechaEgreso: '',
                empresa: 'MI_DESPENSA',
                isActive: true,
            });
            setEditingId(null);
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSave = {
                ...formData,
                fechaEgreso: formData.fechaEgreso || null,
            };
            
            if (editingId) {
                await updateEmployee(editingId, dataToSave);
            } else {
                await addEmployee(dataToSave);
            }
            setShowModal(false);
        } catch (error) {
            console.error(error);
        }
    };

    const createStyledSheet = (workbook: ExcelJS.Workbook, sheetName: string, emps: any[], headerColor: string) => {
        if (emps.length === 0) return;

        const sheet = workbook.addWorksheet(sheetName);

        // Configuración de las columnas (quitamos 'Empresa' ya que la hoja misma define la empresa)
        sheet.columns = [
            { header: 'Nº', key: 'num', width: 6 },
            { header: 'Nombre', key: 'nombre', width: 22 },
            { header: 'Apellido', key: 'apellido', width: 25 },
            { header: 'Cargo', key: 'cargo', width: 22 },
            { header: 'Ingreso', key: 'ingreso', width: 14 },
            { header: 'Egreso', key: 'egreso', width: 14 },
            { header: 'Estado', key: 'estado', width: 14 },
        ];

        // Estilos del encabezado
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: headerColor },
            };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        headerRow.height = 30;

        // Agregar filas con estilos
        emps.forEach((emp, index) => {
            const row = sheet.addRow({
                num: index + 1,
                nombre: emp.nombre,
                apellido: emp.apellido,
                cargo: emp.cargo,
                ingreso: new Date(emp.fechaIngreso).toLocaleDateString(),
                egreso: emp.fechaEgreso ? new Date(emp.fechaEgreso).toLocaleDateString() : 'N/A',
                estado: emp.isActive ? 'Activo' : 'Inactivo'
            });

            const isPair = index % 2 === 0;
            const rowBgColor = isPair ? 'FFF8FAFC' : 'FFFFFFFF'; // slate-50 / blanco
            
            row.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: rowBgColor },
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                };
                cell.alignment = { vertical: 'middle' };
            });
        });

        // Congelar primera fila
        sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
    };

    const handleExportExcel = async () => {
        if (employees.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        
        // Separar empleados por empresa
        const despensa = employees.filter(e => e.empresa === 'MI_DESPENSA');
        const contenedor = employees.filter(e => e.empresa === 'MI_CONTENEDOR');

        // Generar una pestaña (hoja) separada para cada empresa que tenga empleados
        if (despensa.length > 0) {
            createStyledSheet(workbook, 'Mi Despensa', despensa, 'FF0369A1'); // Azul
        }
        if (contenedor.length > 0) {
            createStyledSheet(workbook, 'Mi Contenedor', contenedor, 'FF7E22CE'); // Morado
        }
        
        // Descargar archivo Excel
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Reporte_Empleados_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Empleados</h1>
                    <p className="text-sm text-slate-500">Gestiona los empleados de Mi Despensa y Mi Contenedor.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        disabled={employees.length === 0}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-bg text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} />
                        Exportar Excel
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Nuevo Empleado
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border p-4">
                <div className="flex justify-end mb-4">
                    <select
                        value={selectedEmpresa}
                        onChange={(e) => setSelectedEmpresa(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-sm"
                    >
                        <option value="">Todas las empresas</option>
                        <option value="MI_DESPENSA">Mi Despensa</option>
                        <option value="MI_CONTENEDOR">Mi Contenedor</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-dark-bg/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nombre</th>
                                <th className="px-6 py-4 font-semibold">Cargo</th>
                                <th className="px-6 py-4 font-semibold">Empresa</th>
                                <th className="px-6 py-4 font-semibold">Ingreso</th>
                                <th className="px-6 py-4 font-semibold">Egreso</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4">Cargando...</td></tr>
                            ) : employees.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4 text-slate-500">No hay empleados registrados.</td></tr>
                            ) : (
                                employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-dark-bg/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {emp.nombre} {emp.apellido}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{emp.cargo}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${emp.empresa === 'MI_DESPENSA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {emp.empresa.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {new Date(emp.fechaIngreso).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {emp.fechaEgreso ? new Date(emp.fechaEgreso).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenModal(emp)} className="text-primary-600 hover:text-primary-700 font-medium mr-3">Editar</button>
                                            <button onClick={() => deleteEmployee(emp.id)} className="text-red-500 hover:text-red-600 font-medium">Borrar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-dark-border">
                        <div className="p-6 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingId ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre</label>
                                    <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Apellido</label>
                                    <input required type="text" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cédula</label>
                                    <input required type="text" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sueldo Mensual (Bs.)</label>
                                    <input required type="number" step="0.01" value={formData.sueldoMensual} onChange={e => setFormData({...formData, sueldoMensual: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cargo</label>
                                <input required type="text" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha Ingreso</label>
                                    <input required type="date" value={formData.fechaIngreso} onChange={e => setFormData({...formData, fechaIngreso: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white [color-scheme:light_dark]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha Egreso (Opcional)</label>
                                    <input type="date" value={formData.fechaEgreso} onChange={e => setFormData({...formData, fechaEgreso: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white [color-scheme:light_dark]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Empresa</label>
                                <select value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value as 'MI_DESPENSA' | 'MI_CONTENEDOR'})} className="w-full px-4 py-2 border rounded-xl dark:bg-dark-bg dark:border-dark-border dark:text-white">
                                    <option value="MI_DESPENSA">Mi Despensa</option>
                                    <option value="MI_CONTENEDOR">Mi Contenedor</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-dark-border dark:hover:bg-dark-bg font-medium transition-colors">Cancelar</button>
                                <button type="submit" className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
