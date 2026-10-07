import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { NursingRecord } from '../../types/clinic';
import { 
  HeartPulse, 
  Syringe, 
  Plus, 
  Clock, 
  Activity, 
  Thermometer, 
  Droplet, 
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const EnfermeriaModule: React.FC = () => {
  const { 
    patients, 
    nursingRecords, 
    addNursingRecord, 
    activeModule 
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'hoja' | 'insumos_menores'>(() => {
    if (activeModule === 'insumos_menores') return 'insumos_menores';
    return 'hoja';
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return patients[0]?.id || '';
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Nursing Sheet Form according to NOM-004
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({
    nurseName: 'Enf. Lucía Mendoza Ramos (Céd. 1192834)',
    bloodPressure: '120/80',
    heartRate: 75,
    respiratoryRate: 18,
    temperature: 36.5,
    oxygenSaturation: 98,
    glucose: 95,
    painScaleEva: 2,
    fluidInputMl: 400,
    fluidOutputMl: 300,
    evolutionNotes: 'Paciente tranquilo, afebril, hemodinámicamente estable. Heridas quirúrgicas con apósitos limpios y secos.',
    medicationItem: 'Ketorolaco 30mg IV',
    medicationDose: '30 mg',
    medicationRoute: 'Intravenosa',
    medicationScheduledTime: '14:00',
    medicationActualTime: '14:05',
    medicationLote: 'LT-KET2648',
    minorSupplyItem: 'Jeringa 5ml con aguja 21G',
    minorSupplyQty: 2,
  });

  const handleSaveNursingRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    addNursingRecord({
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      nurseName: recordForm.nurseName,
      bloodPressure: `${recordForm.bloodPressure} mmHg`,
      heartRate: Number(recordForm.heartRate),
      respiratoryRate: Number(recordForm.respiratoryRate),
      temperature: Number(recordForm.temperature),
      oxygenSaturation: Number(recordForm.oxygenSaturation),
      glucose: Number(recordForm.glucose) || undefined,
      painScaleEva: Number(recordForm.painScaleEva),
      fluidInputMl: Number(recordForm.fluidInputMl),
      fluidOutputMl: Number(recordForm.fluidOutputMl),
      evolutionNotes: recordForm.evolutionNotes,
      medicationsAdministered: recordForm.medicationItem ? [
        {
          medication: recordForm.medicationItem,
          dose: recordForm.medicationDose,
          route: recordForm.medicationRoute,
          scheduledTime: recordForm.medicationScheduledTime,
          actualTime: recordForm.medicationActualTime,
          lote: recordForm.medicationLote,
        }
      ] : [],
      minorSuppliesUsed: recordForm.minorSupplyItem ? [
        {
          item: recordForm.minorSupplyItem,
          quantity: Number(recordForm.minorSupplyQty),
        }
      ] : [],
    });

    setShowRecordModal(false);
    alert('Hoja de Enfermería NOM-004 actualizada exitosamente.');
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Enfermería y Recuperación Post-Quirúrgica
            </h1>
            <p className="text-xs text-slate-500">
              Hoja de enfermería oficial NOM-004: Signos vitales, ministración por horario e insumos menores
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('hoja')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'hoja' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hoja de Signos & Horarios</span>
          </button>
          <button
            onClick={() => setActiveTab('insumos_menores')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'insumos_menores' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Insumos Menores de Estancia</span>
          </button>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Seleccionar Paciente en Recuperación
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {patients.map((pat) => (
            <button
              key={pat.id}
              onClick={() => setSelectedPatientId(pat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-left shrink-0 transition border ${
                selectedPatient?.id === pat.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold truncate max-w-[180px]">{pat.fullName}</div>
              <div className={`text-[10px] ${selectedPatient?.id === pat.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                {pat.bedNumber} • {pat.status}
              </div>
            </button>
          ))}
          {patients.length === 0 && (
            <p className="text-xs text-slate-400 p-2">No hay pacientes registrados.</p>
          )}
        </div>
      </div>

      {selectedPatient && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Monitoreo de {selectedPatient.fullName}
              </h2>
              <p className="text-xs text-slate-500">
                Cama: <strong>{selectedPatient.bedNumber}</strong> | Servicio: <strong>{selectedPatient.service}</strong> | Alergias: <strong className="text-rose-600">{selectedPatient.allergies}</strong>
              </p>
            </div>
            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Capturar Signos / Ministración</span>
            </button>
          </div>

          {/* Records Feed */}
          <div className="space-y-4">
            {nursingRecords
              .filter((r) => r.patientId === selectedPatient.id)
              .map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                        Turno de Enfermería
                      </span>
                      <span className="text-xs font-bold text-slate-800">{rec.nurseName}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{rec.recordedAt}</span>
                  </div>

                  {/* Vital Signs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Presión Art.</span>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">{rec.bloodPressure}</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Frec. Cardíaca</span>
                      <div className="text-sm font-extrabold text-sky-700 mt-0.5">{rec.heartRate} lpm</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Frec. Resp.</span>
                      <div className="text-sm font-extrabold text-teal-700 mt-0.5">{rec.respiratoryRate} rpm</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Temperatura</span>
                      <div className="text-sm font-extrabold text-amber-700 mt-0.5">{rec.temperature} °C</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Sat. Oxígeno</span>
                      <div className="text-sm font-extrabold text-emerald-700 mt-0.5">{rec.oxygenSaturation}%</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Glucosa</span>
                      <div className="text-sm font-extrabold text-indigo-700 mt-0.5">{rec.glucose ? `${rec.glucose} mg/dL` : 'N/D'}</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Dolor (EVA)</span>
                      <div className="text-sm font-extrabold text-rose-700 mt-0.5">{rec.painScaleEva} / 10</div>
                    </div>
                  </div>

                  {/* Scheduled Medications Administered */}
                  {rec.medicationsAdministered && rec.medicationsAdministered.length > 0 && (
                    <div className="text-xs space-y-1.5">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        Fármacos Administrados por Horario:
                      </span>
                      <div className="space-y-1.5">
                        {rec.medicationsAdministered.map((med, idx) => (
                          <div key={idx} className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center justify-between">
                            <div>
                              <strong className="text-sky-950">{med.medication}</strong> ({med.dose} • {med.route})
                              <span className="block text-[10px] text-slate-500">Lote: {med.lote}</span>
                            </div>
                            <div className="text-right text-[11px]">
                              <span className="text-slate-500">Prog: {med.scheduledTime}</span> • <span className="font-bold text-sky-800">Aplicado: {med.actualTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evolution Notes & Fluid Balance */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="font-bold text-slate-700 block mb-1">Observaciones de Evolución:</span>
                      <p className="text-slate-700 leading-relaxed">{rec.evolutionNotes}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-700 block mb-1">Balance Hídrico:</span>
                      <div className="flex justify-between text-slate-600">
                        <span>Ingresos (Soluciones):</span>
                        <strong className="text-slate-900">{rec.fluidInputMl} ml</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Egresos (Diuresis):</span>
                        <strong className="text-slate-900">{rec.fluidOutputMl} ml</strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                        <span>Balance Neto:</span>
                        <span className={rec.fluidInputMl - rec.fluidOutputMl >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {rec.fluidInputMl - rec.fluidOutputMl > 0 ? `+${rec.fluidInputMl - rec.fluidOutputMl}` : rec.fluidInputMl - rec.fluidOutputMl} ml
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Minor supplies used */}
                  {rec.minorSuppliesUsed && rec.minorSuppliesUsed.length > 0 && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-100">
                      <Syringe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Insumos menores empleados:</span>
                      {rec.minorSuppliesUsed.map((s, idx) => (
                        <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                          {s.quantity}x {s.item}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              ))}

            {nursingRecords.filter((r) => r.patientId === selectedPatient.id).length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No hay registros de enfermería para este paciente. Presiona «Capturar Signos / Ministración».
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR EN HOJA DE ENFERMERÍA NOM-004 */}
      {showRecordModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Registro en Hoja de Enfermería (NOM-004-SSA3-2012)
            </h3>
            <p className="text-slate-500 mb-4">
              Paciente: {selectedPatient.fullName} ({selectedPatient.bedNumber})
            </p>

            <form onSubmit={handleSaveNursingRecord} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700">Enfermera(o) Responsable del Turno</label>
                <input
                  type="text"
                  required
                  value={recordForm.nurseName}
                  onChange={(e) => setRecordForm({ ...recordForm, nurseName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Vital Signs Row */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Signos Vitales
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600">Presión Arterial</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={recordForm.bloodPressure}
                      onChange={(e) => setRecordForm({ ...recordForm, bloodPressure: e.target.value })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Frec. Cardíaca (lpm)</label>
                    <input
                      type="number"
                      value={recordForm.heartRate}
                      onChange={(e) => setRecordForm({ ...recordForm, heartRate: parseInt(e.target.value) || 0 })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Frec. Resp. (rpm)</label>
                    <input
                      type="number"
                      value={recordForm.respiratoryRate}
                      onChange={(e) => setRecordForm({ ...recordForm, respiratoryRate: parseInt(e.target.value) || 0 })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Temperatura (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={recordForm.temperature}
                      onChange={(e) => setRecordForm({ ...recordForm, temperature: parseFloat(e.target.value) || 0 })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-600">Sat. Oxígeno (% SpO2)</label>
                    <input
                      type="number"
                      value={recordForm.oxygenSaturation}
                      onChange={(e) => setRecordForm({ ...recordForm, oxygenSaturation: parseInt(e.target.value) || 0 })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Glucemia Capilar</label>
                    <input
                      type="number"
                      value={recordForm.glucose}
                      onChange={(e) => setRecordForm({ ...recordForm, glucose: parseInt(e.target.value) || 0 })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Dolor Escala EVA (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={recordForm.painScaleEva}
                      onChange={(e) => setRecordForm({ ...recordForm, painScaleEva: parseInt(e.target.value) || 0 })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Medication Administered by Schedule */}
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-950">
                  Ministración de Medicamento por Horario
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-600">Medicamento y Dosis</label>
                    <input
                      type="text"
                      value={recordForm.medicationItem}
                      onChange={(e) => setRecordForm({ ...recordForm, medicationItem: e.target.value })}
                      placeholder="Ketorolaco 30mg IV"
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Lote COFEPRIS</label>
                    <input
                      type="text"
                      value={recordForm.medicationLote}
                      onChange={(e) => setRecordForm({ ...recordForm, medicationLote: e.target.value })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600">Horario Programado</label>
                    <input
                      type="time"
                      value={recordForm.medicationScheduledTime}
                      onChange={(e) => setRecordForm({ ...recordForm, medicationScheduledTime: e.target.value })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Horario Real Aplicado</label>
                    <input
                      type="time"
                      value={recordForm.medicationActualTime}
                      onChange={(e) => setRecordForm({ ...recordForm, medicationActualTime: e.target.value })}
                      className="mt-0.5 w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Minor Supplies & Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Insumos Menores Empleados</label>
                  <input
                    type="text"
                    value={recordForm.minorSupplyItem}
                    onChange={(e) => setRecordForm({ ...recordForm, minorSupplyItem: e.target.value })}
                    placeholder="Jeringa 5ml, gasas, apósito Tegaderm"
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700">Ingresos (ml)</label>
                    <input
                      type="number"
                      value={recordForm.fluidInputMl}
                      onChange={(e) => setRecordForm({ ...recordForm, fluidInputMl: parseInt(e.target.value) || 0 })}
                      className="mt-1 w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700">Egresos (ml)</label>
                    <input
                      type="number"
                      value={recordForm.fluidOutputMl}
                      onChange={(e) => setRecordForm({ ...recordForm, fluidOutputMl: parseInt(e.target.value) || 0 })}
                      className="mt-1 w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Notas de Evolución de Enfermería</label>
                <textarea
                  rows={2}
                  value={recordForm.evolutionNotes}
                  onChange={(e) => setRecordForm({ ...recordForm, evolutionNotes: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Guardar en Hoja NOM-004
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
