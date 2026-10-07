import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  X, 
  Trash2, 
  RotateCcw, 
  Database, 
  CheckCircle2, 
  Copy, 
  ShieldAlert, 
  AlertTriangle,
  Server
} from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const {
    isSampleDataCleared,
    clearAllSampleData,
    restoreSampleData,
    supabaseConfig,
    updateSupabaseConfig,
    purgeSupabaseRecords,
    patients,
    inventory,
    medicalNotes,
    auditLogs
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'local' | 'supabase'>('local');
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(supabaseConfig.anonKey || '');
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleClearLocal = () => {
    if (window.confirm('¿Confirmas que deseas borrar todos los datos de muestra? El navegador guardará esta preferencia y NUNCA volverá a cargar datos demo automáticamente.')) {
      clearAllSampleData();
    }
  };

  const handleRestoreLocal = () => {
    if (window.confirm('¿Deseas restaurar los datos de prueba y pacientes muestra para evaluar el sistema?')) {
      restoreSampleData();
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig({
      url: supabaseUrl,
      anonKey: supabaseKey,
      isConnected: Boolean(supabaseUrl && supabaseKey),
    });
    setPurgeStatus('Configuración de Supabase guardada exitosamente.');
    setTimeout(() => setPurgeStatus(null), 3000);
  };

  const handlePurgeSupabase = async () => {
    if (window.confirm('¿Seguro que deseas purgar y borrar todos los registros de prueba en Supabase? Esta acción reiniciará las tablas en la nube.')) {
      setIsPurging(true);
      const res = await purgeSupabaseRecords();
      setIsPurging(false);
      setPurgeStatus(res.message);
    }
  };

  const sqlSchema = `-- ========================================================
-- ESQUEMA SQL PARA SUPABASE / POSTGRESQL (CLÍNICA VISTA HERMOSA)
-- CUMPLIMIENTO CON NOM-004-SSA3-2012 Y COFEPRIS
-- ========================================================

-- 1. Pacientes (Ficha NOM-004)
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_number VARCHAR(50) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    age INT NOT NULL,
    sex VARCHAR(20) NOT NULL,
    birth_date DATE,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    responsible_person TEXT NOT NULL,
    relationship TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    emergency_phone VARCHAR(30) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    allergies TEXT NOT NULL,
    admission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admission_reason TEXT NOT NULL,
    service VARCHAR(50) NOT NULL,
    bed_number VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Ingresado',
    has_privacy_signed BOOLEAN DEFAULT false,
    has_informed_consent BOOLEAN DEFAULT false,
    total_account NUMERIC(12,2) DEFAULT 0.00,
    paid_amount NUMERIC(12,2) DEFAULT 0.00,
    is_discharged BOOLEAN DEFAULT false,
    discharge_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bitácora Inalterable de Auditoría (COFEPRIS Trazabilidad)
CREATE TABLE IF NOT EXISTS public.bitacora_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario TEXT NOT NULL,
    rol TEXT NOT NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    affected_record_id TEXT,
    record_hash VARCHAR(64) NOT NULL, -- SHA-256 inalterable
    is_protected BOOLEAN DEFAULT true
);

-- 3. Inventario y Control de Lotes / Caducidades (COFEPRIS)
CREATE TABLE IF NOT EXISTS public.inventario_cofepris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    presentation TEXT NOT NULL,
    lote VARCHAR(50) NOT NULL,
    caducidad DATE NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    unit_cost NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    supplier TEXT NOT NULL,
    is_controlled BOOLEAN DEFAULT false,
    controlled_group VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insumos Consumidos por Paciente
CREATE TABLE IF NOT EXISTS public.insumos_consumidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.pacientes(id),
    inventory_item_id UUID REFERENCES public.inventario_cofepris(id),
    name TEXT NOT NULL,
    lote VARCHAR(50) NOT NULL,
    caducidad DATE NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    applied_by TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Notas Médicas y Quirúrgicas (NOM-004)
CREATE TABLE IF NOT EXISTS public.notas_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.pacientes(id),
    note_type VARCHAR(50) NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_cedula VARCHAR(30) NOT NULL,
    doctor_institution TEXT NOT NULL,
    diagnostic_cie10 TEXT NOT NULL,
    surgical_procedure TEXT,
    findings TEXT,
    treatment_plan TEXT NOT NULL,
    signature_hash VARCHAR(64) NOT NULL,
    is_locked BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Libro de Medicamentos Controlados (COFEPRIS)
CREATE TABLE IF NOT EXISTS public.medicamentos_controlados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_name TEXT NOT NULL,
    lote VARCHAR(50) NOT NULL,
    movement_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    balance_after INT NOT NULL,
    doctor_name TEXT,
    doctor_cedula VARCHAR(30),
    prescription_folio VARCHAR(50),
    patient_name TEXT,
    responsible_pharmacist TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMANDO PARA BORRAR REGISTROS DE PRUEBA EN SUPABASE:
-- TRUNCATE TABLE public.insumos_consumidos, public.notas_medicas, public.medicamentos_controlados, public.pacientes CASCADE;
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gestión de Datos & Supabase
              </h2>
              <p className="text-xs text-slate-500">
                Control de datos de muestra y conexión a base de datos en la nube
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('local')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'local'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Limpieza de Datos de Muestra
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Configuración Supabase</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'local' ? (
            <div className="space-y-4">
              
              {/* Current Status Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isSampleDataCleared
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900'
                }`}
              >
                {isSampleDataCleared ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    {isSampleDataCleared
                      ? '✓ Sistema en modo productivo limpio'
                      : 'Actualmente mostrando datos demo / muestra'}
                  </p>
                  <p className="text-slate-600">
                    {isSampleDataCleared
                      ? 'La opción está guardada en este navegador. Nunca más se cargarán datos de ejemplo automáticamente.'
                      : 'Puedes pulsar el botón a continuación para vaciar todos los registros de prueba y comenzar a capturar pacientes reales.'}
                  </p>
                </div>
              </div>

              {/* Counts Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-lg font-bold text-slate-800">{patients.length}</div>
                  <div className="text-[11px] text-slate-500">Pacientes</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-lg font-bold text-slate-800">{inventory.length}</div>
                  <div className="text-[11px] text-slate-500">Insumos/Lotes</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-lg font-bold text-slate-800">{medicalNotes.length}</div>
                  <div className="text-[11px] text-slate-500">Notas NOM-004</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-lg font-bold text-slate-800">{auditLogs.length}</div>
                  <div className="text-[11px] text-slate-500">Bitácora</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClearLocal}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 shadow-sm transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Borrar Datos de Muestra de Todo el Sistema</span>
                </button>

                {isSampleDataCleared && (
                  <button
                    onClick={handleRestoreLocal}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 border border-slate-300 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurar Datos de Prueba</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950">
                <p className="font-bold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-sky-600" />
                  Integración y Borrado Directo en Supabase
                </p>
                <p className="mt-1 text-slate-600">
                  Configura las credenciales de tu proyecto Supabase para sincronizar y permitir el borrado de tablas en la nube.
                </p>
              </div>

              {/* Supabase Form */}
              <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Supabase Anon / Service Role Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition"
                  >
                    Guardar Conexión
                  </button>

                  <button
                    type="button"
                    onClick={handlePurgeSupabase}
                    disabled={isPurging}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isPurging ? 'Purgando...' : 'Purgar Registros en Supabase'}</span>
                  </button>
                </div>
              </form>

              {purgeStatus && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                  {purgeStatus}
                </div>
              )}

              {/* SQL Schema Copy */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">
                    Script SQL para Tablas COFEPRIS / NOM-004 en Supabase
                  </span>
                  <button
                    onClick={copySqlToClipboard}
                    className="flex items-center gap-1 text-sky-700 font-bold hover:underline"
                  >
                    {copiedSql ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] max-h-40 overflow-y-auto font-mono">
                  {sqlSchema}
                </pre>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
