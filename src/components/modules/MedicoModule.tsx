import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient, MedicalNote } from '../../types/clinic';
import { 
  Stethoscope, 
  PackageCheck, 
  Plus, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Boxes, 
  AlertTriangle,
  UserCheck,
  Send
} from 'lucide-react';

export const MedicoModule: React.FC = () => {
  const { 
    patients, 
    medicalNotes, 
    addMedicalNote, 
    dischargePatient,
    consumedSupplies, 
    recordSupplyConsumption, 
    inventory, 
    activeModule 
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'notas' | 'consumo'>(() => {
    if (activeModule === 'consumo') return 'consumo';
    return 'notas';
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return patients[0]?.id || '';
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Medical Note Form according to NOM-004
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    noteType: 'Post-Quirúrgica / Operatoria' as MedicalNote['noteType'],
    doctorName: 'Dr. Alejandro Morales Garza',
    doctorCedula: '7482910',
    doctorInstitution: 'Facultad de Medicina, Universidad Autónoma de Nuevo León (UANL)',
    doctorSpecialty: 'Cirugía General y Laparoscópica',
    diagnosticCIE10: 'K80.1 - Colecistitis crónica litiásica',
    surgicalProcedure: 'Colecistectomía laparoscópica de 4 puertos',
    findings: 'Vesícula de paredes engrosadas, múltiples litos facetados, sin fugas biliares.',
    operativeIncidents: 'Sin complicaciones. Gasas y compresas completas verificado por circulante.',
    treatmentPlan: 'Ayuno 6 horas, Solución Hartmann 1000ml a 100ml/h, Ketorolaco 30mg IV c/8h.',
    prognosis: 'Bueno' as const,
  });

  // Supply Consumption Form
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string>(() => inventory[0]?.id || '');
  const [consumptionQuantity, setConsumptionQuantity] = useState<number>(1);
  const [consumptionDose, setConsumptionDose] = useState('Dosis según prescripción quirúrgica');
  const [consumptionRoute, setConsumptionRoute] = useState('Intravenosa');
  const [appliedBy, setAppliedBy] = useState('Dr. Alejandro Morales Garza (Cirujano)');

  const handleSaveMedicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!noteForm.doctorName || !noteForm.doctorCedula || !noteForm.doctorInstitution) {
      alert('Los datos del médico (Nombre, Cédula Profesional e Institución que expidió el título) son obligatorios según la NOM-004.');
      return;
    }

    addMedicalNote({
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      noteType: noteForm.noteType,
      doctorName: noteForm.doctorName,
      doctorCedula: noteForm.doctorCedula,
      doctorInstitution: noteForm.doctorInstitution,
      doctorSpecialty: noteForm.doctorSpecialty,
      diagnosticCIE10: noteForm.diagnosticCIE10,
      surgicalProcedure: noteForm.surgicalProcedure,
      findings: noteForm.findings,
      operativeIncidents: noteForm.operativeIncidents,
      treatmentPlan: noteForm.treatmentPlan,
      prognosis: noteForm.prognosis,
      isSigned: true,
    });

    if (noteForm.noteType === 'Egreso / Alta') {
      dischargePatient(selectedPatient.id);
    }

    setShowNoteModal(false);
    alert('Nota médica registrada con éxito y bloqueada inalterablemente bajo la NOM-004.');
  };

  const handleApplySupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const inventoryItem = inventory.find((i) => i.id === selectedInventoryItemId);
    if (!inventoryItem) {
      alert('Selecciona un insumo o medicamento válido.');
      return;
    }

    if (inventoryItem.stock < consumptionQuantity) {
      alert(`Stock insuficiente en almacén. Existencia actual: ${inventoryItem.stock}`);
      return;
    }

    recordSupplyConsumption({
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      inventoryItemId: inventoryItem.id,
      name: inventoryItem.name,
      category: inventoryItem.category as any,
      dose: consumptionDose,
      route: consumptionRoute,
      lote: inventoryItem.lote,
      caducidad: inventoryItem.caducidad,
      quantity: consumptionQuantity,
      unitPrice: inventoryItem.unitPrice,
      appliedBy,
    });

    setShowSupplyModal(false);
    setConsumptionQuantity(1);
    alert(`Insumo asignado. Se descargó del almacén (Lote: ${inventoryItem.lote}) y se sumó $${(inventoryItem.unitPrice * consumptionQuantity).toLocaleString()} a la cuenta del paciente.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-100 text-sky-800">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Personal Médico y Quirófano
            </h1>
            <p className="text-xs text-slate-500">
              Notas médicas NOM-004 validadas con Cédula Profesional e Institución, y Hoja de Consumo con deducción de almacén
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('notas')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'notas' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notas Médicas NOM-004</span>
          </button>
          <button
            onClick={() => setActiveTab('consumo')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'consumo' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Hoja de Consumo (Lotes)</span>
          </button>
        </div>
      </div>

      {/* Patient Selector Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Paciente Activo en Quirófano / Hospitalización
          </span>
          {selectedPatient && (
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {selectedPatient.expedienteNumber}
            </span>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {patients.map((pat) => (
            <button
              key={pat.id}
              onClick={() => setSelectedPatientId(pat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-left shrink-0 transition border ${
                selectedPatient?.id === pat.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold truncate max-w-[180px]">{pat.fullName}</div>
              <div className={`text-[10px] ${selectedPatient?.id === pat.id ? 'text-sky-100' : 'text-slate-400'}`}>
                {pat.service} • {pat.bedNumber}
              </div>
            </button>
          ))}
          {patients.length === 0 && (
            <p className="text-xs text-slate-400 p-2">No hay pacientes registrados en el sistema.</p>
          )}
        </div>
      </div>

      {selectedPatient && (
        <>
          {/* TAB 1: NOTAS MÉDICAS NOM-004 */}
          {activeTab === 'notas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Expediente Clínico Electrónico de {selectedPatient.fullName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Alergias: <strong className="text-rose-600">{selectedPatient.allergies}</strong> | Diagnóstico/Motivo: {selectedPatient.admissionReason}
                  </p>
                </div>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Elaborar Nota Médica</span>
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {medicalNotes
                  .filter((n) => n.patientId === selectedPatient.id)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 text-sky-800">
                            Nota: {note.noteType}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{note.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Bloqueada inalterable (NOM-004)</span>
                        </div>
                      </div>

                      {/* Doctor Mandatory Credentials (NOM-004) */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                          <UserCheck className="w-4 h-4 text-sky-700" />
                          <span>{note.doctorName}</span>
                          <span className="text-sky-800 font-mono font-bold">Céd. Prof: {note.doctorCedula}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600">
                          Institución que expidió el título: <strong>{note.doctorInstitution}</strong>
                        </p>
                      </div>

                      {/* Clinical Content */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-bold text-slate-700">Diagnóstico (CIE-10):</span>
                          <p className="mt-0.5 text-slate-900">{note.diagnosticCIE10}</p>
                        </div>
                        {note.surgicalProcedure && (
                          <div>
                            <span className="font-bold text-slate-700">Procedimiento Quirúrgico:</span>
                            <p className="mt-0.5 text-slate-900">{note.surgicalProcedure}</p>
                          </div>
                        )}
                      </div>

                      {note.findings && (
                        <div className="text-xs">
                          <span className="font-bold text-slate-700">Hallazgos Quirúrgicos:</span>
                          <p className="mt-0.5 text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            {note.findings}
                          </p>
                        </div>
                      )}

                      <div className="text-xs">
                        <span className="font-bold text-slate-700">Plan Terapéutico y Manejo Postoperatorio:</span>
                        <p className="mt-0.5 text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {note.treatmentPlan}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 font-mono">
                        <span>Firma Digital SHA-256: {note.signatureHash}</span>
                        <span className="font-sans font-bold text-slate-600">Pronóstico: {note.prognosis}</span>
                      </div>
                    </div>
                  ))}

                {medicalNotes.filter((n) => n.patientId === selectedPatient.id).length === 0 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                    No hay notas médicas registradas para este paciente. Presiona «Elaborar Nota Médica» para iniciar la captura bajo NOM-004.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HOJA DE CONSUMO Y TRAZABILIDAD */}
          {activeTab === 'consumo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Hoja de Consumo y Medicación Aplicada en Quirófano
                  </h2>
                  <p className="text-xs text-slate-500">
                    Trazabilidad estricta: cada medicamento asignado deduce existencias en farmacia con su Número de Lote y Caducidad
                  </p>
                </div>
                <button
                  onClick={() => setShowSupplyModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aplicar Insumo / Medicamento</span>
                </button>
              </div>

              {/* Table of Applied Supplies */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Fármaco / Material</th>
                        <th className="p-3">Lote COFEPRIS</th>
                        <th className="p-3">Caducidad</th>
                        <th className="p-3">Dosis / Vía</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Precio Unit.</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3">Aplicado Por</th>
                        <th className="p-3">Fecha y Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {consumedSupplies
                        .filter((c) => c.patientId === selectedPatient.id)
                        .map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/70">
                            <td className="p-3 font-bold text-slate-900">{c.name}</td>
                            <td className="p-3 font-mono font-bold text-purple-700">{c.lote}</td>
                            <td className="p-3 text-slate-500">{c.caducidad}</td>
                            <td className="p-3">{c.dose || 'N/A'}</td>
                            <td className="p-3 text-center font-bold text-slate-900">{c.quantity}</td>
                            <td className="p-3 text-right">${c.unitPrice.toLocaleString()}</td>
                            <td className="p-3 text-right font-bold text-slate-900">${c.totalPrice.toLocaleString()}</td>
                            <td className="p-3 text-slate-600">{c.appliedBy}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-400">{c.appliedAt}</td>
                          </tr>
                        ))}
                      {consumedSupplies.filter((c) => c.patientId === selectedPatient.id).length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-400">
                            Aún no se han asignado insumos de quirófano a este paciente.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: ELABORAR NOTA MÉDICA NOM-004 */}
      {showNoteModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Captura de Nota Médica / Quirúrgica (NOM-004-SSA3-2012)
                </h3>
                <p className="text-slate-500">
                  Paciente: {selectedPatient.fullName} ({selectedPatient.expedienteNumber})
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                Cédula Requerida
              </span>
            </div>

            <form onSubmit={handleSaveMedicalNote} className="space-y-4">
              
              <div>
                <label className="block font-bold text-slate-700">Tipo de Nota Médica</label>
                <select
                  value={noteForm.noteType}
                  onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value as any })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Post-Quirúrgica / Operatoria">Post-Quirúrgica / Operatoria (Reporte Quirúrgico)</option>
                  <option value="Pre-Quirúrgica">Pre-Quirúrgica</option>
                  <option value="Evolución">Evolución Médica</option>
                  <option value="Ingreso">Ingreso Hospitalario</option>
                  <option value="Egreso / Alta">Egreso / Alta Médica</option>
                </select>
              </div>

              {/* Obligatory Doctor Info */}
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900">
                  Datos Obligatorios del Médico (NOM-004 Numeral 5)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700">Nombre del Médico *</label>
                    <input
                      type="text"
                      required
                      value={noteForm.doctorName}
                      onChange={(e) => setNoteForm({ ...noteForm, doctorName: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700">Cédula Profesional *</label>
                    <input
                      type="text"
                      required
                      value={noteForm.doctorCedula}
                      onChange={(e) => setNoteForm({ ...noteForm, doctorCedula: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Institución que Expide el Título *</label>
                  <input
                    type="text"
                    required
                    value={noteForm.doctorInstitution}
                    onChange={(e) => setNoteForm({ ...noteForm, doctorInstitution: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Clinical Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Diagnóstico CIE-10 *</label>
                  <input
                    type="text"
                    required
                    value={noteForm.diagnosticCIE10}
                    onChange={(e) => setNoteForm({ ...noteForm, diagnosticCIE10: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Procedimiento Quirúrgico</label>
                  <input
                    type="text"
                    value={noteForm.surgicalProcedure}
                    onChange={(e) => setNoteForm({ ...noteForm, surgicalProcedure: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Hallazgos Quirúrgicos y Descripción de la Técnica</label>
                <textarea
                  rows={2}
                  value={noteForm.findings}
                  onChange={(e) => setNoteForm({ ...noteForm, findings: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Plan Terapéutico y Medicación Indicada *</label>
                <textarea
                  rows={2}
                  required
                  value={noteForm.treatmentPlan}
                  onChange={(e) => setNoteForm({ ...noteForm, treatmentPlan: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Firmar y Bloquear Nota (NOM-004)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APLICAR INSUMO DE ALMACÉN */}
      {showSupplyModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Asignación de Medicamento o Insumo al Paciente
            </h3>
            <p className="text-slate-500 mb-4">
              Deducción automática de inventario y cargo a cuenta de {selectedPatient.fullName}
            </p>

            <form onSubmit={handleApplySupply} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700">Seleccionar Insumo del Almacén</label>
                <select
                  value={selectedInventoryItemId}
                  onChange={(e) => setSelectedInventoryItemId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (Lote: {inv.lote} - Stock: {inv.stock} - ${inv.unitPrice} MXN)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Cantidad a Suministrar</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={consumptionQuantity}
                    onChange={(e) => setConsumptionQuantity(parseInt(e.target.value) || 1)}
                    className="mt-1 w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Vía de Administración</label>
                  <select
                    value={consumptionRoute}
                    onChange={(e) => setConsumptionRoute(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Intravenosa">Intravenosa</option>
                    <option value="Oral">Oral</option>
                    <option value="Subcutánea">Subcutánea</option>
                    <option value="Tópica / Quirúrgica">Tópica / Quirúrgica</option>
                    <option value="Inhalatoria">Inhalatoria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Dosis / Indicación</label>
                <input
                  type="text"
                  value={consumptionDose}
                  onChange={(e) => setConsumptionDose(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Personal que Aplica / Prescribe</label>
                <input
                  type="text"
                  value={appliedBy}
                  onChange={(e) => setAppliedBy(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSupplyModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirmar Suministro y Cargar a Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
