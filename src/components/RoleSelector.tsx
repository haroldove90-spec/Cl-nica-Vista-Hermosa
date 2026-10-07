import React from 'react';
import { RoleId } from '../types/clinic';
import { useClinic } from '../context/ClinicContext';
import { 
  ShieldCheck, 
  Receipt, 
  Stethoscope, 
  HeartPulse, 
  PillBottle,
  ChevronRight
} from 'lucide-react';

interface RoleOption {
  id: RoleId;
  name: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'direccion',
    name: 'Dirección / Responsable Sanitario',
    icon: ShieldCheck,
    gradient: 'from-blue-600 to-indigo-700',
    borderColor: 'hover:border-blue-500',
  },
  {
    id: 'recepcion',
    name: 'Recepción y Caja',
    icon: Receipt,
    gradient: 'from-teal-600 to-emerald-700',
    borderColor: 'hover:border-teal-500',
  },
  {
    id: 'medico',
    name: 'Personal Médico y Quirófano',
    icon: Stethoscope,
    gradient: 'from-sky-600 to-blue-700',
    borderColor: 'hover:border-sky-500',
  },
  {
    id: 'enfermeria',
    name: 'Enfermería / Recuperación',
    icon: HeartPulse,
    gradient: 'from-emerald-600 to-teal-700',
    borderColor: 'hover:border-emerald-500',
  },
  {
    id: 'farmacia',
    name: 'Farmacia / Almacén Sanitario',
    icon: PillBottle,
    gradient: 'from-purple-600 to-indigo-700',
    borderColor: 'hover:border-purple-500',
  },
];

export const RoleSelector: React.FC = () => {
  const { setCurrentRole } = useClinic();

  const handleSelect = (roleId: RoleId) => {
    setCurrentRole(roleId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-3.5 sm:p-6 md:p-8">
      {/* Institutional Logo - Smaller on mobile and tablet as requested */}
      <div className="w-full flex flex-col items-center mb-4 sm:mb-6 md:mb-8">
        <img
          src="https://appdesignproyectos.com/vistalogo.png"
          alt="Clínica Vista Hermosa"
          className="w-44 sm:w-56 md:w-68 lg:w-96 max-h-14 sm:max-h-20 md:max-h-24 lg:max-h-36 h-auto object-contain transition-all duration-300 drop-shadow-2xs"
        />
      </div>

      {/* Grid: 2 Columns on Mobile / 4-5 Columns on Desktop */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleSelect(role.id)}
                className={`group relative flex flex-col items-center justify-center text-center p-3 sm:p-5 md:p-6 bg-white rounded-2xl border-2 border-slate-200/90 shadow-2xs hover:shadow-lg ${role.borderColor} hover:-translate-y-0.5 active:scale-98 transition-all duration-200 cursor-pointer min-h-[135px] sm:min-h-[160px] md:min-h-[185px]`}
              >
                {/* Visual Icon Accent */}
                <div className={`w-10 h-10 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${role.gradient} text-white flex items-center justify-center shadow-xs mb-2 sm:mb-3.5 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>

                {/* Role Name ONLY */}
                <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 group-hover:text-sky-700 leading-snug tracking-tight">
                  {role.name}
                </span>

                {/* Subtle indicator */}
                <div className="mt-2 sm:mt-2.5 flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-slate-400 group-hover:text-sky-600 transition-colors">
                  <span>Acceder</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
