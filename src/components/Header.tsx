import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { RoleId } from '../types/clinic';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  LogOut, 
  ChevronDown, 
  Database, 
  ShieldCheck, 
  Receipt, 
  Stethoscope, 
  HeartPulse, 
  PillBottle,
  Workflow,
  Menu,
  Check
} from 'lucide-react';

interface HeaderProps {
  onOpenDataModal: () => void;
  onOpenWorkflowModal: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDataModal,
  onOpenWorkflowModal,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { currentRole, setCurrentRole, isSampleDataCleared } = useClinic();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleMeta: Record<RoleId, { label: string; short: string; color: string; icon: React.ElementType }> = {
    direccion: {
      label: 'Dirección / Responsable Sanitario',
      short: 'Dirección Sanitaria',
      color: 'bg-[#007D8F]/15 text-[#007D8F] border-[#007D8F]/40',
      icon: ShieldCheck,
    },
    recepcion: {
      label: 'Recepción y Caja',
      short: 'Recepción y Caja',
      color: 'bg-[#00838B]/15 text-[#00838B] border-[#00838B]/40',
      icon: Receipt,
    },
    medico: {
      label: 'Personal Médico y Quirófano',
      short: 'Médico / Quirófano',
      color: 'bg-[#007D8F]/20 text-[#000000] border-[#007D8F]/50',
      icon: Stethoscope,
    },
    enfermeria: {
      label: 'Enfermería / Recuperación',
      short: 'Enfermería',
      color: 'bg-[#FFBA38]/25 text-[#000000] border-[#FFBA38]/60',
      icon: HeartPulse,
    },
    farmacia: {
      label: 'Farmacia / Almacén Sanitario',
      short: 'Farmacia y Almacén',
      color: 'bg-[#00838B]/20 text-[#000000] border-[#00838B]/50',
      icon: PillBottle,
    },
  };

  const activeMeta = currentRole ? roleMeta[currentRole] : null;
  const ActiveIcon = activeMeta ? activeMeta.icon : ShieldCheck;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 md:h-18 gap-2">
          
          {/* Left: Sidebar Toggle + Full Size Unencapsulated Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Alternar Menú"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Institutional Logo - Full Size, Not Encapsulated */}
            <div 
              onClick={() => setCurrentRole(null)} 
              className="cursor-pointer flex items-center py-1 transition-opacity hover:opacity-90"
              title="Ir a inicio de roles"
            >
              <img
                src="https://appdesignproyectos.com/vistalogo.png"
                alt="Clínica Vista Hermosa"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </div>
          </div>

          {/* Center / Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">

            {/* Quick Flow / Workflow Button */}
            <button
              onClick={onOpenWorkflowModal}
              title="Ver Flujo de Trabajo Simple y Conforme a Norma"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#007D8F] bg-[#007D8F]/10 hover:bg-[#007D8F]/20 border border-[#007D8F]/30 rounded-lg transition"
            >
              <Workflow className="w-3.5 h-3.5 text-[#007D8F]" />
              <span>Flujo COFEPRIS</span>
            </button>

            {/* Data Management / Supabase Button */}
            <button
              onClick={onOpenDataModal}
              title="Borrar datos de muestra / Configurar Supabase"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition ${
                isSampleDataCleared
                  ? 'bg-[#007D8F]/10 text-[#007D8F] border-[#007D8F]/30 hover:bg-[#007D8F]/20'
                  : 'bg-[#FFBA38]/25 text-[#000000] border-[#FFBA38]/50 hover:bg-[#FFBA38]/35'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isSampleDataCleared ? 'Base en Limpio' : 'Datos Demo'}
              </span>
              <span className="md:hidden">Datos</span>
            </button>

            {/* PWA Quick Install Button */}
            <PWAInstallButton />

            {/* Active Role Selector / Badge with Dropdown */}
            {activeMeta && (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-extrabold rounded-lg border shadow-2xs transition hover:brightness-95 ${activeMeta.color}`}
                  title="Cambiar de Rol"
                >
                  <ActiveIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">{activeMeta.label}</span>
                  <span className="lg:hidden">{activeMeta.short}</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                </button>

                {/* Dropdown to switch roles quickly */}
                {isRoleDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsRoleDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-[#000000]">
                        Cambiar Rol Activo
                      </div>
                      {(Object.keys(roleMeta) as RoleId[]).map((rKey) => {
                        const m = roleMeta[rKey];
                        const RIcon = m.icon;
                        const isSelected = currentRole === rKey;
                        return (
                          <button
                            key={rKey}
                            onClick={() => {
                              setCurrentRole(rKey);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition hover:bg-slate-50 ${
                              isSelected ? 'bg-[#007D8F]/15 font-bold text-[#007D8F]' : 'text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <RIcon className="w-4 h-4 text-slate-500" />
                              <span>{m.label}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#007D8F]" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Logout / Exit to role selector */}
            <button
              onClick={() => setCurrentRole(null)}
              title="Cerrar Sesión / Volver al selector de roles"
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-bold text-[#000000] bg-slate-100 hover:bg-[#FFBA38]/30 rounded-lg border border-slate-300 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-[#000000]" />
              <span className="hidden sm:inline">Salir</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
