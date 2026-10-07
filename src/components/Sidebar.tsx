import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  PenTool, 
  Receipt, 
  Stethoscope, 
  PackageCheck, 
  HeartPulse, 
  Syringe, 
  Boxes, 
  PillBottle, 
  AlertTriangle,
  Workflow,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenWorkflow: () => void;
  onOpenDataModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  onOpenWorkflow,
  onOpenDataModal,
}) => {
  const { currentRole, activeModule, setActiveModule, setCurrentRole } = useClinic();

  // Modules definition per role
  const getModulesForRole = () => {
    switch (currentRole) {
      case 'direccion':
        return [
          { id: 'default', label: 'Panel Ejecutivo', icon: ShieldCheck },
          { id: 'auditoria', label: 'Bitácora Inalterable', icon: FileText, tag: 'COFEPRIS' },
          { id: 'finanzas', label: 'Cuentas por Pagar & Gastos', icon: DollarSign },
        ];
      case 'recepcion':
        return [
          { id: 'default', label: 'Ficha Pacientes NOM-004', icon: FileText, tag: 'NOM-004' },
          { id: 'consentimientos', label: 'Consentimientos & Privacidad', icon: PenTool },
          { id: 'cobranza', label: 'Cobranza & Facturación SAT', icon: Receipt, tag: 'CFDI 4.0' },
        ];
      case 'medico':
        return [
          { id: 'default', label: 'Notas Médicas & Quirúrgicas', icon: Stethoscope, tag: 'NOM-004' },
          { id: 'consumo', label: 'Hoja de Consumo & Trazabilidad', icon: PackageCheck, tag: 'Lote/Cad.' },
        ];
      case 'enfermeria':
        return [
          { id: 'default', label: 'Hoja de Enfermería NOM-004', icon: HeartPulse, tag: 'Signos & Horario' },
          { id: 'insumos_menores', label: 'Insumos Menores & Estancia', icon: Syringe },
        ];
      case 'farmacia':
        return [
          { id: 'default', label: 'Inventario & Caducidades', icon: Boxes, tag: 'COFEPRIS' },
          { id: 'controlados', label: 'Medicamentos Controlados', icon: PillBottle, tag: 'Grupo I-III' },
          { id: 'alertas', label: 'Alertas de Vencimiento', icon: AlertTriangle },
        ];
      default:
        return [];
    }
  };

  const modules = getModulesForRole();

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-2xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 md:top-18 bottom-0 left-0 z-40 w-64 md:w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <img
              src="https://appdesignproyectos.com/vistaicono.png"
              alt="Icono"
              className="w-6 h-6 object-contain"
            />
            <span className="font-bold text-sm text-slate-800">Menú de Navegación</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Módulos del Rol
          </div>

          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModule(m.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition text-left ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border border-sky-200/80 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="truncate">{m.label}</span>
                </div>
                {m.tag && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                      isActive ? 'bg-sky-200/60 text-sky-900' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {m.tag}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Access Tools */}
          <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Accesos Globales
          </div>

          <button
            onClick={() => {
              onOpenWorkflow();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Workflow className="w-4 h-4 text-sky-600" />
            <span>Flujo Conforme a Norma</span>
          </button>

          <button
            onClick={() => {
              onOpenDataModal();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Gestión de Datos & Supabase</span>
          </button>
        </div>

        {/* Footer Area with Institutional Credential */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Clínica Vista Hermosa</p>
              <p>Norma NOM-004 / COFEPRIS</p>
            </div>
            <button
              onClick={() => setCurrentRole(null)}
              className="text-xs font-bold text-sky-700 hover:underline"
            >
              Cambiar Rol
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
