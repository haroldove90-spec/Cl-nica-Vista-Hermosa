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
    gradient: 'from-sky-600 to-teal-600',
    borderColor: 'hover:border-sky-500',
  },
  {
    id: 'medico',
    name: 'Personal Médico y Quirófano',
    icon: Stethoscope,
    gradient: 'from-cyan-600 to-blue-700',
    borderColor: 'hover:border-cyan-500',
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
    gradient: 'from-violet-600 to-indigo-700',
    borderColor: 'hover:border-violet-500',
  },
];

export const RoleSelector: React.FC = () => {
  const { setCurrentRole, setActiveModule } = useClinic();

  const handleSelect = (roleId: RoleId) => {
    setCurrentRole(roleId);
    setActiveModule('default');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Full-size clean unencapsulated Logo */}
      <div className="w-full max-w-4xl flex flex-col items-center mb-8 md:mb-12">
        <img
          src="https://appdesignproyectos.com/vistalogo.png"
          alt="Clínica Vista Hermosa"
          className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain drop-shadow-xs transition duration-300"
          style={{ maxHeight: '180px' }}
        />
      </div>

      {/* Grid: 2 Columns on Mobile / 4-5 Columns on Desktop */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleSelect(role.id)}
                className={`group relative flex flex-col items-center justify-center text-center p-5 sm:p-6 md:p-7 bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm hover:shadow-xl ${role.borderColor} hover:-translate-y-1 transition-all duration-200 cursor-pointer min-h-[160px] sm:min-h-[190px]`}
              >
                {/* Visual Icon Accent */}
                <div className={`w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-gradient-to-br ${role.gradient} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                {/* Role Name ONLY */}
                <span className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-sky-700 leading-snug tracking-tight">
                  {role.name}
                </span>

                {/* Subtle indicator */}
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-sky-600 transition-colors">
                  <span>Ingresar</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
