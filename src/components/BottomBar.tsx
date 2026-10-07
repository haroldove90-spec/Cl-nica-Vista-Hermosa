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
          { id: 'default', label: 'Ejecutivo', icon: ShieldCheck },
          { id: 'auditoria', label: 'Bitácora', icon: FileText },
          { id: 'finanzas', label: 'Cuentas x Pagar', icon: DollarSign },
        ];
      case 'recepcion':
        return [
          { id: 'default', label: 'Ficha NOM-004', icon: FileText },
          { id: 'consentimientos', label: 'Consentimientos', icon: PenTool },
          { id: 'cobranza', label: 'Facturación SAT', icon: Receipt },
        ];
      case 'medico':
        return [
          { id: 'default', label: 'Notas Médicas', icon: Stethoscope },
          { id: 'consumo', label: 'Hoja Consumo', icon: PackageCheck },
        ];
      case 'enfermeria':
        return [
          { id: 'default', label: 'Signos & Horario', icon: HeartPulse },
          { id: 'insumos_menores', label: 'Insumos Menores', icon: Syringe },
        ];
      case 'farmacia':
        return [
          { id: 'default', label: 'Inventario', icon: Boxes },
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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/90 shadow-lg lg:hidden pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all rounded-lg active:scale-95 ${
                isActive
                  ? 'text-sky-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition ${
                  isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[80px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
