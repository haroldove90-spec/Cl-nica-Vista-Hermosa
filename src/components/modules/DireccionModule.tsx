import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Hash,
  AlertCircle
} from 'lucide-react';
import { AccountPayable } from '../../types/clinic';

export const DireccionModule: React.FC = () => {
  const { 
    auditLogs, 
    accountsPayable, 
    addAccountPayable, 
    payAccountPayable, 
    patients, 
    inventory, 
    activeModule,
    setActiveModule 
  } = useClinic();

  const currentTab = (activeModule === 'finanzas' || activeModule === 'resumen') ? activeModule : 'auditoria';

  // Filters for Audit Log
  const [auditSearch, setAuditSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('TODAS');

  // New Account Payable Form State
  const [showNewPayableModal, setShowNewPayableModal] = useState(false);
  const [newPayable, setNewPayable] = useState<Omit<AccountPayable, 'id'>>({
    supplier: '',
    concept: '',
    invoiceNumber: '',
    amount: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    status: 'Pendiente',
    category: 'Medicamentos',
  });

  // Calculations for Financial Dashboard
  const totalIngresos = patients.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalPorCobrar = patients.reduce((acc, p) => acc + Math.max(0, (p.totalAccount || 0) - (p.paidAmount || 0)), 0);
  const totalCuentasPorPagar = accountsPayable.reduce((acc, c) => c.status !== 'Pagado' ? acc + c.amount : acc, 0);
  const totalGastosPagados = accountsPayable.reduce((acc, c) => c.status === 'Pagado' ? acc + c.amount : acc, 0);
  const margenOperativo = totalIngresos - totalGastosPagados;

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.module.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.recordHash.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesAction = filterAction === 'TODAS' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const handleCreatePayable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayable.supplier || !newPayable.amount) return;
    addAccountPayable(newPayable);
    setShowNewPayableModal(false);
    setNewPayable({
      supplier: '',
      concept: '',
      invoiceNumber: '',
      amount: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Pendiente',
      category: 'Medicamentos',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Module Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#007D8F]/15 text-[#007D8F]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#000000]">
              Dirección y Responsable Sanitario
            </h1>
            <p className="text-xs text-slate-500">
              Custodia legal, auditoría inalterable conforme a COFEPRIS y control financiero hospitalario
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveModule('auditoria')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'auditoria' ? 'bg-[#007D8F] text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-[#000000]'
            }`}
          >
            <Lock className={`w-3.5 h-3.5 ${currentTab === 'auditoria' ? 'text-white' : 'text-[#007D8F]'}`} />
            <span>Bitácora Inalterable</span>
          </button>
          <button
            onClick={() => setActiveModule('finanzas')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'finanzas' ? 'bg-[#007D8F] text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-[#000000]'
            }`}
          >
            <DollarSign className={`w-3.5 h-3.5 ${currentTab === 'finanzas' ? 'text-white' : 'text-[#00838B]'}`} />
            <span>Cuentas por Pagar</span>
          </button>
          <button
            onClick={() => setActiveModule('resumen')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'resumen' ? 'bg-[#007D8F] text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-[#000000]'
            }`}
          >
            Panel Ejecutivo
          </button>
        </div>
      </div>

      {/* VIEW: Resumen Operativo */}
      {currentTab === 'resumen' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Ingresos Cobrados</span>
                <div className="p-2 bg-[#007D8F]/10 text-[#007D8F] rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-[#000000]">
                ${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs text-[#007D8F] font-bold">
                Cobros liquidados en caja
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Saldos por Cobrar</span>
                <div className="p-2 bg-[#00838B]/10 text-[#00838B] rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-[#000000]">
                ${totalPorCobrar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs text-[#00838B] font-bold">
                En recuperación hospitalaria
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Cuentas por Pagar (Proveedores)</span>
                <div className="p-2 bg-[#FFBA38]/20 text-[#000000] rounded-lg">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-[#000000]">
                ${totalCuentasPorPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs text-[#000000] font-bold">
                {accountsPayable.filter(c => c.status !== 'Pagado').length} facturas pendientes
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Margen Operativo Neto</span>
                <div className="p-2 bg-[#007D8F]/10 text-[#007D8F] rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className={`mt-3 text-2xl font-extrabold ${margenOperativo >= 0 ? 'text-[#000000]' : 'text-rose-700'}`}>
                ${margenOperativo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Ingresos menos egresos liquidados
              </div>
            </div>

          </div>

          {/* Legal Compliance Banner COFEPRIS */}
          <div className="bg-gradient-to-r from-[#000000] via-[#007D8F] to-[#00838B] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFBA38]/20 text-[#FFBA38] text-xs font-bold border border-[#FFBA38]/40">
                  ESTADO SANITARIO CONFORME
                </span>
                <span className="text-xs text-slate-200">Custodia NOM-004-SSA3-2012</span>
              </div>
              <h2 className="text-lg font-bold">Bitácora de Trazabilidad Activa y Bloqueada</h2>
              <p className="text-xs text-slate-200 leading-relaxed">
                Todos los registros clínicos (recetas, cirugías, notas de enfermería y suministros) se encuentran protegidos contra borrado, alteración o sobreescritura con firmas y sellos inalterables.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('auditoria')}
              className="px-4 py-2.5 bg-[#FFBA38] text-[#000000] font-extrabold rounded-xl text-xs hover:bg-[#FFBA38]/90 transition shrink-0 cursor-pointer shadow-xs"
            >
              Auditar Registros ({auditLogs.length})
            </button>
          </div>

          {/* Quick status tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Audit Events */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#007D8F]" />
                  Últimos Eventos Inalterables
                </h3>
                <span className="text-xs text-slate-500">{auditLogs.length} eventos</span>
              </div>
              <div className="space-y-3">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#000000]">{log.user}</span>
                      <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="mt-1 text-slate-600">{log.details}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Hash: {log.recordHash.slice(0, 16)}...</span>
                      <span className="text-[#007D8F] font-sans font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Bloqueado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impending Payables */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#00838B]" />
                  Cuentas por Pagar Próximas
                </h3>
                <button
                  onClick={() => setShowNewPayableModal(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#007D8F] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Cuenta
                </button>
              </div>
              <div className="space-y-3">
                {accountsPayable.slice(0, 4).map((cxp) => (
                  <div key={cxp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#000000]">{cxp.supplier}</p>
                      <p className="text-slate-500 text-[11px]">{cxp.concept}</p>
                      <span className="text-[10px] text-slate-400">Vence: {cxp.dueDate} | Factura: {cxp.invoiceNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#000000]">
                        ${cxp.amount.toLocaleString('es-MX')}
                      </span>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cxp.status === 'Pagado' ? 'bg-[#007D8F]/15 text-[#007D8F]' : 'bg-[#FFBA38]/25 text-[#000000]'
                        }`}>
                          {cxp.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW: Bitácora Inalterable de Auditoría */}
      {currentTab === 'auditoria' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción, expediente o hash..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#007D8F] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filtrar Acción:</span>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
              >
                <option value="TODAS">Todas las acciones</option>
                <option value="CREACIÓN">CREACIÓN (Ficha/Apertura)</option>
                <option value="RECETA">RECETA (Prescripción/Controlados)</option>
                <option value="SUMINISTRO">SUMINISTRO (Medicamentos/Insumos)</option>
                <option value="MODIFICACIÓN">MODIFICACIÓN (Notas/Enfermería)</option>
                <option value="CONSENTIMIENTO">CONSENTIMIENTO (Firmas)</option>
                <option value="ALTA">ALTA MÉDICA</option>
                <option value="FACTURACIÓN">FACTURACIÓN SAT</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table / Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#007D8F]" />
                <span className="text-xs font-bold text-[#000000] uppercase tracking-wider">
                  Bitácora Oficial de Trazabilidad (COFEPRIS NOM-004)
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Mostrando {filteredLogs.length} de {auditLogs.length} eventos
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No se encontraron registros de auditoría coincidentes.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/70 transition space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'SUMINISTRO' ? 'bg-[#00838B]/15 text-[#00838B]' :
                          log.action === 'RECETA' ? 'bg-[#FFBA38]/25 text-[#000000]' :
                          log.action === 'CONSENTIMIENTO' ? 'bg-[#007D8F]/15 text-[#007D8F]' :
                          log.action === 'FACTURACIÓN' ? 'bg-[#007D8F] text-white' :
                          'bg-slate-100 text-[#000000]'
                        }`}>
                          {log.action}
                        </span>
                        <span className="font-bold text-[#000000]">{log.user}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-medium">{log.module}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-700 pl-1 leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-100/70">
                      <div className="flex items-center gap-1 font-mono">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>Sello SHA-256: {log.recordHash}</span>
                      </div>
                      <span className="text-[#007D8F] font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Inalterable
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Cuentas por Pagar & Administración */}
      {currentTab === 'finanzas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#000000]">
              Control de Cuentas por Pagar y Proveedores
            </h2>
            <button
              onClick={() => setShowNewPayableModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#007D8F] text-white rounded-xl text-xs font-bold hover:bg-[#00838B] shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Cuenta por Pagar</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Proveedor</th>
                    <th className="p-3.5">Concepto / Insumo</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">No. Factura</th>
                    <th className="p-3.5">Vencimiento</th>
                    <th className="p-3.5 text-right">Monto</th>
                    <th className="p-3.5 text-center">Estatus</th>
                    <th className="p-3.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {accountsPayable.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No hay cuentas por pagar registradas.
                      </td>
                    </tr>
                  ) : (
                    accountsPayable.map((cxp) => (
                      <tr key={cxp.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-bold text-[#000000]">{cxp.supplier}</td>
                        <td className="p-3.5 max-w-xs truncate">{cxp.concept}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {cxp.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">{cxp.invoiceNumber}</td>
                        <td className="p-3.5">{cxp.dueDate}</td>
                        <td className="p-3.5 text-right font-bold text-[#000000]">
                          ${cxp.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cxp.status === 'Pagado'
                              ? 'bg-[#007D8F]/15 text-[#007D8F]'
                              : cxp.status === 'Programado'
                              ? 'bg-[#00838B]/15 text-[#00838B]'
                              : 'bg-[#FFBA38]/25 text-[#000000]'
                          }`}>
                            {cxp.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {cxp.status !== 'Pagado' ? (
                            <button
                              onClick={() => payAccountPayable(cxp.id)}
                              className="px-2.5 py-1 bg-[#007D8F]/10 hover:bg-[#007D8F]/20 text-[#007D8F] border border-[#007D8F]/30 rounded-lg font-bold text-[11px] transition cursor-pointer"
                            >
                              Liquidar
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Pagado ({cxp.paidAt?.slice(0, 10)})</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nueva Cuenta por Pagar */}
      {showNewPayableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-[#000000] mb-4">
              Registrar Cuenta por Pagar a Proveedor
            </h3>
            <form onSubmit={handleCreatePayable} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Nombre del Proveedor</label>
                <input
                  type="text"
                  required
                  value={newPayable.supplier}
                  onChange={(e) => setNewPayable({ ...newPayable, supplier: e.target.value })}
                  placeholder="Ej: Distribuidora Farmacéutica del Norte"
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007D8F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Concepto / Insumos Suministrados</label>
                <input
                  type="text"
                  required
                  value={newPayable.concept}
                  onChange={(e) => setNewPayable({ ...newPayable, concept: e.target.value })}
                  placeholder="Ej: Adquisición de anestésicos y suturas"
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007D8F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">No. Factura / Folio</label>
                  <input
                    type="text"
                    required
                    value={newPayable.invoiceNumber}
                    onChange={(e) => setNewPayable({ ...newPayable, invoiceNumber: e.target.value })}
                    placeholder="FAC-9841"
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007D8F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Monto Total ($ MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPayable.amount || ''}
                    onChange={(e) => setNewPayable({ ...newPayable, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="25000"
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007D8F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Categoría</label>
                  <select
                    value={newPayable.category}
                    onChange={(e) => setNewPayable({ ...newPayable, category: e.target.value as any })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Material Quirúrgico">Material Quirúrgico</option>
                    <option value="Servicios Generales">Servicios Generales</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={newPayable.dueDate}
                    onChange={(e) => setNewPayable({ ...newPayable, dueDate: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewPayableModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#007D8F] hover:bg-[#00838B] text-white font-bold cursor-pointer shadow-xs"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
