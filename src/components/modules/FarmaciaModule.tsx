import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { InventoryItem, ControlledDrugLog } from '../../types/clinic';
import { 
  Boxes, 
  PillBottle, 
  AlertTriangle, 
  Plus, 
  Search, 
  CheckCircle2, 
  Calendar, 
  UserCheck, 
  FileText,
  TrendingDown
} from 'lucide-react';

export const FarmaciaModule: React.FC = () => {
  const { 
    inventory, 
    addInventoryItem, 
    updateInventoryStock, 
    controlledDrugLogs, 
    recordControlledDrug, 
    activeModule 
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'inventario' | 'controlados' | 'alertas'>(() => {
    if (activeModule === 'controlados') return 'controlados';
    if (activeModule === 'alertas') return 'alertas';
    return 'inventario';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showControlledModal, setShowControlledModal] = useState(false);

  // New Item State
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    code: 'MED-004',
    name: '',
    genericName: '',
    category: 'Medicamento',
    presentation: 'Ampolleta / Frasco',
    lote: '',
    caducidad: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    stock: 20,
    minStock: 10,
    unitCost: 100,
    unitPrice: 220,
    supplier: 'Distribuidora Farmacéutica del Norte S.A.',
    isControlled: false,
    controlledGroup: undefined,
  });

  // Controlled Drug Movement State
  const [controlledForm, setControlledForm] = useState({
    inventoryItemId: inventory.find((i) => i.isControlled)?.id || '',
    movementType: 'Salida' as 'Entrada' | 'Salida',
    quantity: 1,
    doctorName: 'Dr. Alejandro Morales Garza',
    doctorCedula: '7482910',
    prescriptionFolio: 'REC-ESP-2026-402',
    patientName: 'María Elena Gutiérrez Morales',
    responsiblePharmacist: 'Q.F.B. Marcela Treviño (Céd. 5892102)',
  });

  // Calculations for Expiration and Stock Alerts
  const now = new Date();
  const alert30Days = new Date(now.getTime() + 30 * 86400000);
  const alert60Days = new Date(now.getTime() + 60 * 86400000);

  const expiredOrSoon = inventory.filter((item) => {
    const expDate = new Date(item.caducidad);
    return expDate <= alert60Days;
  });

  const lowStockItems = inventory.filter((item) => item.stock <= item.minStock);

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.lote || !newItem.caducidad) {
      alert('Nombre, Número de Lote y Fecha de Caducidad son obligatorios bajo regulación COFEPRIS.');
      return;
    }
    addInventoryItem(newItem);
    setShowNewItemModal(false);
    setNewItem({
      code: `MED-${String(inventory.length + 10).padStart(3, '0')}`,
      name: '',
      genericName: '',
      category: 'Medicamento',
      presentation: '',
      lote: '',
      caducidad: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      stock: 20,
      minStock: 10,
      unitCost: 100,
      unitPrice: 220,
      supplier: 'Distribuidora Farmacéutica del Norte S.A.',
      isControlled: false,
      controlledGroup: undefined,
    });
  };

  const handleSaveControlledLog = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find((i) => i.id === controlledForm.inventoryItemId);
    if (!item) return;

    if (controlledForm.movementType === 'Salida' && (!controlledForm.doctorName || !controlledForm.doctorCedula || !controlledForm.prescriptionFolio)) {
      alert('Para salidas de medicamentos controlados (COFEPRIS Grupo I-III), el Nombre del Médico, Cédula Profesional y Folio de Receta Especial son obligatorios por ley.');
      return;
    }

    if (controlledForm.movementType === 'Salida' && item.stock < controlledForm.quantity) {
      alert(`Existencias insuficientes. Stock actual en libro: ${item.stock}`);
      return;
    }

    recordControlledDrug({
      inventoryItemId: item.id,
      drugName: item.name,
      lote: item.lote,
      movementType: controlledForm.movementType,
      quantity: Number(controlledForm.quantity),
      doctorName: controlledForm.movementType === 'Salida' ? controlledForm.doctorName : undefined,
      doctorCedula: controlledForm.movementType === 'Salida' ? controlledForm.doctorCedula : undefined,
      prescriptionFolio: controlledForm.movementType === 'Salida' ? controlledForm.prescriptionFolio : undefined,
      patientName: controlledForm.movementType === 'Salida' ? controlledForm.patientName : undefined,
      responsiblePharmacist: controlledForm.responsiblePharmacist,
    });

    setShowControlledModal(false);
    alert('Movimiento asentado en el Libro Oficial de Controlados conforme a COFEPRIS.');
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-800">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Farmacia y Almacén Sanitario
            </h1>
            <p className="text-xs text-slate-500">
              Control estricto de medicamentos con Número de Lote, Caducidades y Libro Oficial de Controlados (COFEPRIS)
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'inventario' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Inventario & Lotes</span>
          </button>
          <button
            onClick={() => setActiveTab('controlados')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'controlados' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PillBottle className="w-3.5 h-3.5" />
            <span>Medicamentos Controlados</span>
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'alertas' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertas ({expiredOrSoon.length + lowStockItems.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INVENTARIO & LOTES COFEPRIS */}
      {activeTab === 'inventario' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por fármaco, lote, genérico o clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowNewItemModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Alta de Insumo / Lote COFEPRIS</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Medicamento / Presentación</th>
                    <th className="p-3">No. Lote (COFEPRIS)</th>
                    <th className="p-3">Fecha de Caducidad</th>
                    <th className="p-3 text-center">Stock / Mínimo</th>
                    <th className="p-3 text-right">Costo Compra</th>
                    <th className="p-3 text-right">Precio Paciente</th>
                    <th className="p-3 text-center">Tipo</th>
                    <th className="p-3 text-center">Ajuste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No hay insumos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const expDate = new Date(item.caducidad);
                      const isExpired = expDate < now;
                      const isSoon = expDate <= alert60Days && !isExpired;
                      const isLowStock = item.stock <= item.minStock;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="p-3 font-mono font-bold text-slate-600">{item.code}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="text-[11px] text-slate-500">{item.genericName} • {item.presentation}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-purple-800">{item.lote}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              isExpired
                                ? 'bg-rose-100 text-rose-800'
                                : isSoon
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-700'
                            }`}>
                              {item.caducidad}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-extrabold ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                              {item.stock}
                            </span>
                            <span className="text-slate-400 text-[10px]"> / mín {item.minStock}</span>
                          </td>
                          <td className="p-3 text-right text-slate-600">${item.unitCost.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-slate-900">${item.unitPrice.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            {item.isControlled ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                                {item.controlledGroup || 'Controlado'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                General
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                const add = prompt(`Ingresa cantidad a sumar al stock actual (${item.stock}):`, '10');
                                if (add && parseInt(add)) {
                                  updateInventoryStock(item.id, item.stock + parseInt(add));
                                }
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition"
                            >
                              + Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAMENTOS CONTROLADOS (GRUPO I, II, III COFEPRIS) */}
      {activeTab === 'controlados' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PillBottle className="w-4 h-4 text-rose-600" />
                Libro Oficial de Medicamentos Controlados (COFEPRIS Grupo I, II y III)
              </h2>
              <p className="text-xs text-slate-500">
                Registro inalterable de entradas y salidas con Cédula Profesional del médico prescriptor y retención de receta
              </p>
            </div>
            <button
              onClick={() => setShowControlledModal(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Asentar Movimiento en Libro</span>
            </button>
          </div>

          {/* Current Controlled Inventory Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inventory.filter((i) => i.isControlled).map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{item.name}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">
                    {item.controlledGroup}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Lote: <strong className="font-mono text-slate-800">{item.lote}</strong></span>
                  <span>Caducidad: {item.caducidad}</span>
                  <span>Existencia en Libro: <strong className="text-rose-700 text-sm font-extrabold">{item.stock} amp.</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Controlled Movement Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3">Fármaco Controlado</th>
                    <th className="p-3">Lote</th>
                    <th className="p-3 text-center">Tipo Mov.</th>
                    <th className="p-3 text-center">Cantidad</th>
                    <th className="p-3 text-center">Saldo</th>
                    <th className="p-3">Médico Prescriptor / Cédula</th>
                    <th className="p-3">Folio Receta / Factura</th>
                    <th className="p-3">Responsable Sanitario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {controlledDrugLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No hay movimientos registrados en el libro de controlados.
                      </td>
                    </tr>
                  ) : (
                    controlledDrugLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono text-[11px] text-slate-500">{log.createdAt}</td>
                        <td className="p-3 font-bold text-slate-900">{log.drugName}</td>
                        <td className="p-3 font-mono text-purple-700 font-bold">{log.lote}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.movementType === 'Entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.movementType}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">{log.quantity}</td>
                        <td className="p-3 text-center font-extrabold text-slate-900">{log.balanceAfter}</td>
                        <td className="p-3">
                          {log.doctorName ? (
                            <div>
                              <span className="font-semibold text-slate-800 block">{log.doctorName}</span>
                              <span className="text-[10px] font-mono text-sky-800">Céd. {log.doctorCedula}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Entrada almacén</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          {log.prescriptionFolio || log.invoiceFolio || 'N/A'}
                        </td>
                        <td className="p-3 text-slate-600 text-[11px]">{log.responsiblePharmacist}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALERTAS DE CADUCIDAD Y STOCK */}
      {activeTab === 'alertas' && (
        <div className="space-y-6">
          
          {/* Near Expiration Alert */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Insumos Próximos a Vencer o Vencidos (Requisito COFEPRIS)
            </h3>
            <p className="text-xs text-slate-500">
              Medicamentos con fecha de vencimiento menor a 60 días o caducados para cuarentena obligatoria
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {expiredOrSoon.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No hay insumos próximos a caducar en los siguientes 60 días.
                </div>
              ) : (
                expiredOrSoon.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between bg-amber-50/40 text-xs">
                    <div>
                      <strong className="text-slate-900">{item.name}</strong>
                      <span className="block text-[11px] text-slate-500 font-mono">
                        Lote: {item.lote} | Existencias: {item.stock} {item.presentation}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                        Caduca: {item.caducidad}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Insumos con Stock Bajo (Nivel Crítico de Reabastecimiento)
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {lowStockItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Todos los insumos superan el stock mínimo reglamentario.
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between bg-rose-50/30 text-xs">
                    <div>
                      <strong className="text-slate-900">{item.name}</strong>
                      <span className="block text-[11px] text-slate-500 font-mono">
                        Lote: {item.lote} | Proveedor: {item.supplier}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-bold text-xs">
                        {item.stock} piezas (Mín: {item.minStock})
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* MODAL: ALTA DE INSUMO COFEPRIS */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Alta de Insumo / Medicamento (COFEPRIS)
            </h3>
            <p className="text-slate-500 mb-4">
              Control de Lote y Fecha de Caducidad sanitaria
            </p>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700">Nombre Comercial del Medicamento / Material *</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Ej: Ketorolaco Trometamina Solución Inyectable 30mg"
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Denominación Genérica / Sal</label>
                <input
                  type="text"
                  value={newItem.genericName}
                  onChange={(e) => setNewItem({ ...newItem, genericName: e.target.value })}
                  placeholder="Ej: Ketorolaco"
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Número de Lote (COFEPRIS) *</label>
                  <input
                    type="text"
                    required
                    value={newItem.lote}
                    onChange={(e) => setNewItem({ ...newItem, lote: e.target.value })}
                    placeholder="LT-XXXXX"
                    className="mt-1 w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Fecha de Caducidad *</label>
                  <input
                    type="date"
                    required
                    value={newItem.caducidad}
                    onChange={(e) => setNewItem({ ...newItem, caducidad: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Stock Inicial</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.minStock}
                    onChange={(e) => setNewItem({ ...newItem, minStock: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Precio Paciente ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950 block">¿Es Medicamento Controlado?</span>
                  <span className="text-[11px] text-slate-500">Requiere libro de control oficial COFEPRIS</span>
                </div>
                <input
                  type="checkbox"
                  checked={newItem.isControlled}
                  onChange={(e) => setNewItem({ ...newItem, isControlled: e.target.checked, controlledGroup: e.target.checked ? 'Grupo II' : undefined })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
              </div>

              {newItem.isControlled && (
                <div>
                  <label className="block font-bold text-slate-700">Grupo COFEPRIS</label>
                  <select
                    value={newItem.controlledGroup}
                    onChange={(e) => setNewItem({ ...newItem, controlledGroup: e.target.value as any })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Grupo I">Grupo I (Estupefacientes - Receta código de barras)</option>
                    <option value="Grupo II">Grupo II (Psicotrópicos - Receta retenida)</option>
                    <option value="Grupo III">Grupo III (Psicotrópicos - Venta con receta médica)</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Guardar en Almacén
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASENTAR MOVIMIENTO EN LIBRO DE CONTROLADOS */}
      {showControlledModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Movimiento en Libro de Controlados (COFEPRIS)
            </h3>
            <p className="text-slate-500 mb-4">
              Registro obligatorio de entradas y salidas de psicotrópicos y estupefacientes
            </p>

            <form onSubmit={handleSaveControlledLog} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700">Medicamento Controlado</label>
                <select
                  value={controlledForm.inventoryItemId}
                  onChange={(e) => setControlledForm({ ...controlledForm, inventoryItemId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {inventory.filter((i) => i.isControlled).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Lote: {item.lote} - Saldo: {item.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Tipo de Movimiento</label>
                  <select
                    value={controlledForm.movementType}
                    onChange={(e) => setControlledForm({ ...controlledForm, movementType: e.target.value as any })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Salida">Salida (Administración al Paciente)</option>
                    <option value="Entrada">Entrada (Adquisición de Proveedor)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Cantidad (Ampolletas/Frascos)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={controlledForm.quantity}
                    onChange={(e) => setControlledForm({ ...controlledForm, quantity: parseInt(e.target.value) || 1 })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
              </div>

              {controlledForm.movementType === 'Salida' && (
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900">
                    Datos del Médico Prescriptor (Obligatorio COFEPRIS)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600">Nombre del Médico</label>
                      <input
                        type="text"
                        required
                        value={controlledForm.doctorName}
                        onChange={(e) => setControlledForm({ ...controlledForm, doctorName: e.target.value })}
                        className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600">Cédula Profesional</label>
                      <input
                        type="text"
                        required
                        value={controlledForm.doctorCedula}
                        onChange={(e) => setControlledForm({ ...controlledForm, doctorCedula: e.target.value })}
                        className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Folio de Receta Retenida / Especial</label>
                    <input
                      type="text"
                      required
                      value={controlledForm.prescriptionFolio}
                      onChange={(e) => setControlledForm({ ...controlledForm, prescriptionFolio: e.target.value })}
                      placeholder="REC-ESP-2026-402"
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Nombre del Paciente</label>
                    <input
                      type="text"
                      required
                      value={controlledForm.patientName}
                      onChange={(e) => setControlledForm({ ...controlledForm, patientName: e.target.value })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700">Responsable de Farmacia / Asiento</label>
                <input
                  type="text"
                  required
                  value={controlledForm.responsiblePharmacist}
                  onChange={(e) => setControlledForm({ ...controlledForm, responsiblePharmacist: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowControlledModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Asentar en Libro Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
