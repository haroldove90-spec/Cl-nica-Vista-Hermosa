import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  PenTool, 
  Receipt, 
  Stethoscope, 
  PackageCheck, 
  HeartPulse, 
  Syringe, 
  Boxes, 
  PillBottle, 
  AlertTriangle 
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { currentRole, activeModule, setActiveModule } = useClinic();

  const getBottomNavItems = () => {
    switch (currentRole) {
      case 'direccion':
        return [
          { id: 'auditoria', label: 'Bitácora', icon: FileText },
          { id: 'finanzas', label: 'Cuentas x Pagar', icon: DollarSign },
          { id: 'resumen', label: 'Panel Ejecutivo', icon: ShieldCheck },
        ];
      case 'recepcion':
        return [
          { id: 'ficha', label: 'Ficha NOM-004', icon: FileText },
          { id: 'consentimientos', label: 'Consentimientos', icon: PenTool },
          { id: 'cobranza', label: 'Caja & SAT', icon: Receipt },
        ];
      case 'medico':
        return [
          { id: 'notas', label: 'Notas Médicas', icon: Stethoscope },
          { id: 'consumo', label: 'Hoja Consumo', icon: PackageCheck },
        ];
      case 'enfermeria':
        return [
          { id: 'hoja_enfermeria', label: 'Signos & Horario', icon: HeartPulse },
          { id: 'insumos_menores', label: 'Insumos Menores', icon: Syringe },
        ];
      case 'farmacia':
        return [
          { id: 'inventario', label: 'Inventario Lotes', icon: Boxes },
          { id: 'controlados', label: 'Controlados', icon: PillBottle },
          { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
        ];
      default:
        return [];
    }
  };

  const items = getBottomNavItems();
  if (items.length === 0) return null;

  return (
    <nav 
      aria-label="Navegación Móvil y Tablet"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 w-full max-w-xl md:max-w-2xl mx-auto px-2 sm:px-6">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all rounded-xl active:scale-95 ${
                isActive
                  ? 'text-sky-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-sky-100 text-sky-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate max-w-[90px] sm:max-w-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
