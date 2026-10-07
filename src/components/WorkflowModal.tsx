import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  X, 
  UserPlus, 
  Stethoscope, 
  Boxes, 
  HeartPulse, 
  FileCheck2, 
  Receipt, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentRole, setActiveModule, patients, auditLogs } = useClinic();

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: '1. Ingreso del Paciente',
      role: 'Recepción y Caja',
      roleId: 'recepcion' as const,
      moduleId: 'default',
      icon: UserPlus,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      description: 'Recepción da de alta la ficha de identificación bajo la NOM-004 y registra la firma del Aviso de Privacidad y Consentimiento Informado para cirugía con testigos.',
      norma: 'NOM-004-SSA3-2012 (Numeral 5 y 6)',
    },
    {
      step: 2,
      title: '2. Atención Médica y Cirugía',
      role: 'Personal Médico y Quirófano',
      roleId: 'medico' as const,
      moduleId: 'default',
      icon: Stethoscope,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      description: 'El cirujano realiza el procedimiento, anota el reporte quirúrgico validado con su Cédula Profesional e Institución que expidió el título, diagnóstico CIE-10 y hallazgos.',
      norma: 'NOM-004-SSA3-2012 (Numeral 8 - Notas Quirúrgicas)',
    },
    {
      step: 3,
      title: '3. Control Sanitario e Inventario',
      role: 'Farmacia / Quirófano',
      roleId: 'medico' as const,
      moduleId: 'consumo',
      icon: Boxes,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Cada medicamento e insumo aplicado se descarga automáticamente del inventario registrando su Lote y Caducidad, sumándose en tiempo real a la cuenta del paciente.',
      norma: 'COFEPRIS (Reglamento de Insumos para la Salud)',
    },
    {
      step: 4,
      title: '4. Enfermería y Recuperación',
      role: 'Enfermería / Recuperación',
      roleId: 'enfermeria' as const,
      moduleId: 'default',
      icon: HeartPulse,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Enfermería registra signos vitales por horario, balance hídrico, administración de fármacos por horario e insumos menores utilizados en recuperación.',
      norma: 'NOM-004-SSA3-2012 (Numeral 9 - Hoja de Enfermería)',
    },
    {
      step: 5,
      title: '5. Cierre y Alta Médica',
      role: 'Personal Médico / Caja',
      roleId: 'medico' as const,
      moduleId: 'default',
      icon: FileCheck2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Se emite la nota de egreso / alta médica con plan terapéutico. Caja revisa el desglose total y transparente de servicios + insumos consumidos.',
      norma: 'NOM-004-SSA3-2012 (Numeral 10 - Nota de Egreso)',
    },
    {
      step: 6,
      title: '6. Cobro y Facturación SAT',
      role: 'Recepción y Caja',
      roleId: 'recepcion' as const,
      moduleId: 'cobranza',
      icon: Receipt,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      description: 'El paciente liquida su cuenta, se le entrega recibo transparente con desglose de insumos y se genera su factura fiscal electrónica oficial SAT CFDI 4.0 con UUID.',
      norma: 'Código Fiscal de la Federación (SAT CFDI 4.0)',
    },
    {
      step: 7,
      title: '7. Respaldo y Custodia Inalterable',
      role: 'Dirección / Responsable Sanitario',
      roleId: 'direccion' as const,
      moduleId: 'auditoria',
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      description: 'Toda la información médica y administrativa queda bloqueada criptográficamente en bitácora inalterable (hashes SHA-256) para cumplir con los 5 años de custodia exigidos por COFEPRIS.',
      norma: 'COFEPRIS y NOM-004 (Custodia mínima 5 años)',
    },
  ];

  const handleGoToStep = (roleId: 'direccion' | 'recepcion' | 'medico' | 'enfermeria' | 'farmacia', moduleId: string) => {
    setCurrentRole(roleId);
    setActiveModule(moduleId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Flujo de Trabajo Conforme a Norma (COFEPRIS & NOM-004)
              </h2>
              <p className="text-xs text-slate-500">
                Trazabilidad hospitalaria integral desde el ingreso hasta el alta y custodia legal
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

        {/* Steps List */}
        <div className="p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {s.role}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
                        {s.norma}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl">
                      {s.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleGoToStep(s.roleId, s.moduleId)}
                  className="self-end sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition"
                >
                  <span>Ir al Módulo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{patients.length} pacientes registrados en circuito | {auditLogs.length} eventos en bitácora inalterable</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition"
          >
            Cerrar Flujo
          </button>
        </div>

      </div>
    </div>
  );
};
