import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone PWA, show a subtle green checkmark badge
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>App Instalada</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar Clínica Vista Hermosa en Android, iOS o PC"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 shadow-sm transition active:scale-95"
      >
        <Download className="w-3.5 h-3.5 text-sky-600" />
        <span className="hidden md:inline">Instalar App</span>
        <span className="md:hidden">Instalar</span>
      </button>

      {/* Manual / iOS Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src="https://appdesignproyectos.com/vistaicono.png"
                  alt="Clínica Vista Hermosa"
                  className="w-7 h-7 rounded-md object-contain"
                />
                <h3 className="text-base font-bold text-slate-900">
                  Instalar Clínica Vista Hermosa
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {isIOS ? (
                <div className="rounded-xl bg-sky-50/60 p-4 border border-sky-100">
                  <p className="font-semibold text-sky-950 flex items-center gap-2">
                    <Share className="w-4 h-4 text-sky-600" />
                    Pasos en iPhone / iPad (Safari):
                  </p>
                  <ol className="mt-2 space-y-2 list-decimal list-inside text-slate-700">
                    <li>Presiona el botón <strong>Compartir</strong> en la barra de Safari.</li>
                    <li>Desplázate hacia abajo y selecciona <strong>«Agregar a Inicio»</strong>.</li>
                    <li>Toca <strong>«Agregar»</strong> en la esquina superior derecha.</li>
                  </ol>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    Instalación en Android, Chrome o Computadora:
                  </p>
                  <ol className="mt-2 space-y-2 list-decimal list-inside text-slate-700">
                    <li>Abre el menú del navegador (los tres puntos <strong>⋮</strong>).</li>
                    <li>Selecciona <strong>«Instalar Clínica Vista Hermosa»</strong> o <strong>«Agregar a la pantalla principal»</strong>.</li>
                    <li>La app se abrirá en ventana independiente de pantalla completa de forma ultra rápida.</li>
                  </ol>
                </div>
              )}

              <p className="text-xs text-slate-500">
                La aplicación funcionará sin barras de navegador, con soporte sin conexión y carga instantánea.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
