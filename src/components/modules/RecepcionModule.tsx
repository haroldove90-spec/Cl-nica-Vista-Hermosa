import React, { useState, useRef } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient, Invoice } from '../../types/clinic';
import { 
  UserPlus, 
  Receipt, 
  PenTool, 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Printer, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';

export const RecepcionModule: React.FC = () => {
  const { 
    patients, 
    addPatient, 
    signPatientConsent, 
    consumedSupplies, 
    generateInvoice, 
    registerPayment,
    invoices,
    activeModule 
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'ficha' | 'consentimientos' | 'cobranza'>(() => {
    if (activeModule === 'consentimientos') return 'consentimientos';
    if (activeModule === 'cobranza') return 'cobranza';
    return 'ficha';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientForConsent, setSelectedPatientForConsent] = useState<Patient | null>(null);
  const [selectedPatientForBilling, setSelectedPatientForBilling] = useState<Patient | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // New Patient Form State according to NOM-004
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    age: 30,
    sex: 'Femenino' as 'Femenino' | 'Masculino' | 'Otro',
    birthDate: '1996-01-01',
    address: '',
    phone: '',
    responsiblePerson: '',
    relationship: 'Familiar directo',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: 'O Positivo (O+)',
    allergies: 'Negadas',
    admissionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    admissionReason: '',
    service: 'Quirófano' as 'Quirófano' | 'Hospitalización' | 'Recuperación' | 'Urgencias',
    bedNumber: 'Cama 101',
    status: 'Ingresado' as const,
    hasPrivacySigned: false,
    hasInformedConsent: false,
  });

  // Consent Form State
  const [consentProcedure, setConsentProcedure] = useState('');
  const [consentRisks, setConsentRisks] = useState('');
  const [consentDoctorName, setConsentDoctorName] = useState('Dr. Alejandro Morales Garza');
  const [consentDoctorCedula, setConsentDoctorCedula] = useState('7482910');
  const [consentWitness1, setConsentWitness1] = useState('Enf. Lucía Mendoza Ramos');
  const [consentWitness2, setConsentWitness2] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Invoice Form State
  const [invoiceRfc, setInvoiceRfc] = useState('XAXX010101000');
  const [invoiceFiscalName, setInvoiceFiscalName] = useState('');
  const [invoiceFiscalRegime, setInvoiceFiscalRegime] = useState('612 - Personas Físicas con Actividades Empresariales y Profesionales');
  const [invoiceCfdiUsage, setInvoiceCfdiUsage] = useState('D01 - Honorarios médicos, dentales y gastos hospitalarios');
  const [invoicePaymentWay, setInvoicePaymentWay] = useState<'01 Efectivo' | '03 Transferencia' | '04 Tarjeta de Crédito' | '28 Tarjeta de Débito'>('03 Transferencia');

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    return (
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.expedienteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.fullName || !newPatient.address || !newPatient.phone || !newPatient.responsiblePerson) {
      alert('Por favor completa todos los campos obligatorios bajo la NOM-004.');
      return;
    }
    const created = addPatient(newPatient);
    setShowNewPatientModal(false);
    // Reset form
    setNewPatient({
      fullName: '',
      age: 30,
      sex: 'Femenino',
      birthDate: '1996-01-01',
      address: '',
      phone: '',
      responsiblePerson: '',
      relationship: 'Familiar directo',
      emergencyContact: '',
      emergencyPhone: '',
      bloodType: 'O Positivo (O+)',
      allergies: 'Negadas',
      admissionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      admissionReason: '',
      service: 'Quirófano',
      bedNumber: 'Cama 101',
      status: 'Ingresado',
      hasPrivacySigned: false,
      hasInformedConsent: false,
    });
    // Prompt consent
    setSelectedPatientForConsent(created);
    setConsentWitness2(created.responsiblePerson);
    setActiveTab('consentimientos');
  };

  // Canvas Drawing for Consent Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveConsent = () => {
    if (!selectedPatientForConsent) return;
    if (!consentProcedure) {
      alert('Debes indicar el procedimiento para el consentimiento informado.');
      return;
    }
    const canvas = canvasRef.current;
    const sigUrl = canvas ? canvas.toDataURL() : '';

    signPatientConsent(selectedPatientForConsent.id, {
      procedure: consentProcedure,
      risks: consentRisks || 'Riesgos inherentes al procedimiento anestésico y quirúrgico.',
      signedBy: selectedPatientForConsent.responsiblePerson || selectedPatientForConsent.fullName,
      doctorName: consentDoctorName,
      doctorCedula: consentDoctorCedula,
      witness1: consentWitness1,
      witness2: consentWitness2 || selectedPatientForConsent.responsiblePerson,
      signatureDataUrl: sigUrl,
      signedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    alert('Consentimiento Informado y Aviso de Privacidad firmados y registrados con éxito.');
    setSelectedPatientForConsent(null);
  };

  const handleOpenBilling = (patient: Patient) => {
    setSelectedPatientForBilling(patient);
    setInvoiceFiscalName(patient.fullName.toUpperCase());
    setActiveTab('cobranza');
  };

  const handleEmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForBilling) return;

    const patientSupplies = consumedSupplies.filter((c) => c.patientId === selectedPatientForBilling.id);
    const totalAmount = selectedPatientForBilling.totalAccount;
    const subtotal = totalAmount / 1.16;
    const iva = totalAmount - subtotal;

    generateInvoice(selectedPatientForBilling.id, {
      patientId: selectedPatientForBilling.id,
      patientName: selectedPatientForBilling.fullName,
      rfc: invoiceRfc.toUpperCase(),
      fiscalName: invoiceFiscalName.toUpperCase(),
      fiscalRegime: invoiceFiscalRegime,
      cfdiUsage: invoiceCfdiUsage,
      cfdiVersion: '4.0',
      subtotal,
      iva,
      total: totalAmount,
      items: [
        {
          description: `Servicios de atención quirúrgica y hospitalaria para expediente ${selectedPatientForBilling.expedienteNumber}`,
          quantity: 1,
          unitPrice: subtotal * 0.7,
          amount: subtotal * 0.7,
          satKey: '85121600 - Servicios médicos especializados',
        },
        {
          description: `Desglose de medicamentos e insumos de quirófano (${patientSupplies.length} conceptos con Lote/Caducidad)`,
          quantity: 1,
          unitPrice: subtotal * 0.3,
          amount: subtotal * 0.3,
          satKey: '51101500 - Medicamentos y materiales',
        },
      ],
      paymentMethod: 'PUE',
      paymentWay: invoicePaymentWay,
    });

    setShowInvoiceModal(false);
    alert('Factura oficial SAT CFDI 4.0 generada y timbrada digitalmente.');
  };

  const handleRegisterPayment = () => {
    if (!selectedPatientForBilling || paymentAmount <= 0) return;
    registerPayment(selectedPatientForBilling.id, paymentAmount);
    setShowPaymentModal(false);
    setPaymentAmount(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Module Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-100 text-teal-800">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Recepción, Caja y Admisión Hospitalaria
            </h1>
            <p className="text-xs text-slate-500">
              Ficha de identificación NOM-004, Consentimientos informados y Facturación oficial SAT CFDI 4.0
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ficha')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'ficha' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Ficha NOM-004</span>
          </button>
          <button
            onClick={() => setActiveTab('consentimientos')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'consentimientos' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Consentimientos</span>
          </button>
          <button
            onClick={() => setActiveTab('cobranza')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'cobranza' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Caja & Facturación</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FICHA DE IDENTIFICACIÓN NOM-004 */}
      {activeTab === 'ficha' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por paciente, expediente o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowNewPatientModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Alta de Paciente (NOM-004)</span>
            </button>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Expediente</th>
                    <th className="p-3.5">Nombre Completo</th>
                    <th className="p-3.5">Edad / Sexo</th>
                    <th className="p-3.5">Persona Responsable (NOM-004)</th>
                    <th className="p-3.5">Contacto Emergencia</th>
                    <th className="p-3.5">Servicio / Cama</th>
                    <th className="p-3.5 text-center">Consentimiento</th>
                    <th className="p-3.5 text-center">Estatus</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No hay pacientes registrados. Presiona «Alta de Paciente» para capturar datos NOM-004.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((pat) => (
                      <tr key={pat.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-mono font-bold text-teal-800">{pat.expedienteNumber}</td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {pat.fullName}
                          {pat.allergies !== 'Negadas' && (
                            <span className="block text-[10px] text-rose-600 font-normal">
                              Alergias: {pat.allergies}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">{pat.age} años • {pat.sex}</td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800">{pat.responsiblePerson}</span>
                          <span className="block text-[10px] text-slate-400">{pat.relationship}</span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">{pat.emergencyPhone || pat.phone}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {pat.service} - {pat.bedNumber}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {pat.hasInformedConsent ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Firmado
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedPatientForConsent(pat);
                                setConsentWitness2(pat.responsiblePerson);
                                setActiveTab('consentimientos');
                              }}
                              className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold"
                            >
                              Pendiente Firmar
                            </button>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pat.status === 'Liquidado' ? 'bg-emerald-100 text-emerald-800' :
                            pat.status === 'Alta Médica' ? 'bg-blue-100 text-blue-800' :
                            pat.status === 'Recuperación' ? 'bg-purple-100 text-purple-800' :
                            'bg-sky-100 text-sky-800'
                          }`}>
                            {pat.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleOpenBilling(pat)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition"
                          >
                            Ver Cuenta
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSENTIMIENTOS Y PRIVACIDAD */}
      {activeTab === 'consentimientos' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-sky-600" />
              Gestión de Consentimientos Informados y Aviso de Privacidad (NOM-004)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Selecciona un paciente para registrar la firma digital legal del consentimiento informado para cirugía o procedimiento, junto con el médico responsable y dos testigos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPatientForConsent(p);
                    setConsentWitness2(p.responsiblePerson);
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedPatientForConsent?.id === p.id
                      ? 'border-sky-500 bg-sky-50/80 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-teal-700">{p.expedienteNumber}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.hasInformedConsent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {p.hasInformedConsent ? 'Firmado' : 'Sin Firma'}
                    </span>
                  </div>
                  <div className="mt-1 font-bold text-xs text-slate-900 truncate">{p.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">Resp: {p.responsiblePerson}</div>
                </button>
              ))}
            </div>

            {selectedPatientForConsent && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Documento Legal: Consentimiento para {selectedPatientForConsent.fullName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Expediente: {selectedPatientForConsent.expedienteNumber} | Domicilio: {selectedPatientForConsent.address}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded-lg text-xs font-bold">
                    NOM-004-SSA3-2012
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700">Procedimiento Quirúrgico o Diagnóstico</label>
                    <input
                      type="text"
                      placeholder="Ej: Colecistectomía Laparoscópica bajo Anestesia General"
                      value={consentProcedure}
                      onChange={(e) => setConsentProcedure(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700">Riesgos y Beneficios Informados</label>
                    <input
                      type="text"
                      placeholder="Ej: Infección, sangrado, conversión quirúrgica, posibles reacciones farmacológicas"
                      value={consentRisks}
                      onChange={(e) => setConsentRisks(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700">Médico Tratante / Cirujano</label>
                    <input
                      type="text"
                      value={consentDoctorName}
                      onChange={(e) => setConsentDoctorName(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700">Cédula Profesional del Médico</label>
                    <input
                      type="text"
                      value={consentDoctorCedula}
                      onChange={(e) => setConsentDoctorCedula(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700">Persona que Otorga Consentimiento</label>
                    <input
                      type="text"
                      value={selectedPatientForConsent.responsiblePerson || selectedPatientForConsent.fullName}
                      readOnly
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-slate-100 font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700">Testigo 1 (Personal Hospitalario)</label>
                    <input
                      type="text"
                      value={consentWitness1}
                      onChange={(e) => setConsentWitness1(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700">Testigo 2 (Familiar / Responsable)</label>
                    <input
                      type="text"
                      value={consentWitness2}
                      onChange={(e) => setConsentWitness2(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* Signature Pad */}
                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Firma Digital del Paciente o Persona Responsable
                    </span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Limpiar Trazo
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 border border-dashed border-slate-300 rounded-lg bg-slate-50 cursor-crosshair touch-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Firma táctil con el dedo en pantallas táctiles o con el ratón. Al guardar se genera el sello digital de custodia.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedPatientForConsent(null)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveConsent}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    Registrar y Sellar Consentimiento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COBRANZA Y FACTURACIÓN SAT CFDI 4.0 */}
      {activeTab === 'cobranza' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Patients List for Billing */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cuentas de Pacientes
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {patients.map((p) => {
                  const saldo = Math.max(0, p.totalAccount - p.paidAmount);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleOpenBilling(p)}
                      className={`w-full p-3 rounded-xl border text-left transition ${
                        selectedPatientForBilling?.id === p.id
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-teal-800">{p.expedienteNumber}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${saldo === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {saldo === 0 ? 'Liquidado' : `Saldo: $${saldo.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="mt-1 font-bold text-xs text-slate-900 truncate">{p.fullName}</div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Cuenta Total: ${p.totalAccount.toLocaleString()}</span>
                        <span>Pagado: ${p.paidAmount.toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Breakdown & Actions */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
              {selectedPatientForBilling ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        Estado de Cuenta Transparente
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-1">
                        {selectedPatientForBilling.fullName}
                      </h2>
                      <p className="text-xs text-slate-500 font-mono">
                        Expediente: {selectedPatientForBilling.expedienteNumber} | Servicio: {selectedPatientForBilling.service} ({selectedPatientForBilling.bedNumber})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-slate-900">
                        ${selectedPatientForBilling.totalAccount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-slate-500">
                        Total acumulado (Servicios + Insumos)
                      </div>
                    </div>
                  </div>

                  {/* Consumed Supplies Breakdown with Lote and Caducidad */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Desglose Detallado de Insumos y Medicamentos Suministrados (Trazabilidad)
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Insumo / Fármaco</th>
                            <th className="p-2.5">Lote COFEPRIS</th>
                            <th className="p-2.5">Caducidad</th>
                            <th className="p-2.5 text-center">Cant.</th>
                            <th className="p-2.5 text-right">Unitario</th>
                            <th className="p-2.5 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {consumedSupplies
                            .filter((c) => c.patientId === selectedPatientForBilling.id)
                            .map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/70">
                                <td className="p-2.5 font-semibold text-slate-900">{item.name}</td>
                                <td className="p-2.5 font-mono text-[11px] text-sky-800">{item.lote}</td>
                                <td className="p-2.5 text-slate-500">{item.caducidad}</td>
                                <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                                <td className="p-2.5 text-right">${item.unitPrice.toLocaleString()}</td>
                                <td className="p-2.5 text-right font-bold">${item.totalPrice.toLocaleString()}</td>
                              </tr>
                            ))}
                          {consumedSupplies.filter((c) => c.patientId === selectedPatientForBilling.id).length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-400">
                                Los consumos de quirófano y enfermería aparecerán aquí automáticamente al suministrarse.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Account Summary & Actions */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs space-y-1">
                      <p className="text-slate-600">
                        Total Pagado: <strong className="text-emerald-700">${selectedPatientForBilling.paidAmount.toLocaleString()}</strong>
                      </p>
                      <p className="text-slate-600">
                        Saldo Pendiente: <strong className="text-rose-700">${Math.max(0, selectedPatientForBilling.totalAccount - selectedPatientForBilling.paidAmount).toLocaleString()}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setPaymentAmount(Math.max(0, selectedPatientForBilling.totalAccount - selectedPatientForBilling.paidAmount));
                          setShowPaymentModal(true);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Registrar Cobro</span>
                      </button>

                      <button
                        onClick={() => setShowInvoiceModal(true)}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Emitir Factura SAT (CFDI 4.0)</span>
                      </button>
                    </div>
                  </div>

                  {/* Invoices Generated for this Patient */}
                  {invoices.filter((i) => i.patientId === selectedPatientForBilling.id).length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">Facturas Fiscales Emitidas</h4>
                      <div className="space-y-2">
                        {invoices
                          .filter((i) => i.patientId === selectedPatientForBilling.id)
                          .map((inv) => (
                            <div key={inv.id} className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-xs flex items-center justify-between">
                              <div>
                                <span className="font-bold text-sky-950">{inv.folio}</span> • RFC: {inv.rfc}
                                <p className="text-[10px] text-slate-500 font-mono">UUID: {inv.satUuid}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-900">${inv.total.toLocaleString()}</span>
                                <div className="text-[10px] text-emerald-700 font-bold">Timbrado SAT CFDI 4.0</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                </>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Selecciona un paciente del menú lateral para consultar su estado de cuenta, desglose de insumos y emitir factura.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* MODAL: ALTA DE PACIENTE NOM-004 */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Apertura de Expediente Clínico (NOM-004-SSA3-2012)
                </h3>
                <p className="text-xs text-slate-500">
                  Ficha de identificación obligatoria y persona responsable
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[11px] font-bold">
                Recepción
              </span>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700">Nombre Completo del Paciente *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.fullName}
                    onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                    placeholder="Apellidos y Nombres"
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Edad (Años) *</label>
                  <input
                    type="number"
                    required
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Sexo *</label>
                  <select
                    value={newPatient.sex}
                    onChange={(e) => setNewPatient({ ...newPatient, sex: e.target.value as any })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="81-xxxx-xxxx"
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Grupo y Factor RH</label>
                  <select
                    value={newPatient.bloodType}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="O Positivo (O+)">O Positivo (O+)</option>
                    <option value="O Negativo (O-)">O Negativo (O-)</option>
                    <option value="A Positivo (A+)">A Positivo (A+)</option>
                    <option value="A Negativo (A-)">A Negativo (A-)</option>
                    <option value="B Positivo (B+)">B Positivo (B+)</option>
                    <option value="AB Positivo (AB+)">AB Positivo (AB+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Domicilio Completo (Calle, Número, Colonia, Municipio) *</label>
                <input
                  type="text"
                  required
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Av. Hidalgo #120, Col. Centro, Monterrey"
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700">Persona Responsable (NOM-004) *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.responsiblePerson}
                    onChange={(e) => setNewPatient({ ...newPatient, responsiblePerson: e.target.value })}
                    placeholder="Nombre del familiar o tutor"
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Parentesco con el Paciente</label>
                  <input
                    type="text"
                    value={newPatient.relationship}
                    onChange={(e) => setNewPatient({ ...newPatient, relationship: e.target.value })}
                    placeholder="Esposo(a), Padre, Hermano(a)"
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Contacto de Emergencia</label>
                  <input
                    type="text"
                    value={newPatient.emergencyContact}
                    onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                    placeholder="Nombre y teléfono"
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Alergias Conocidas</label>
                  <input
                    type="text"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    placeholder="Penicilina, AINES, etc. (O Negadas)"
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Servicio de Ingreso</label>
                  <select
                    value={newPatient.service}
                    onChange={(e) => setNewPatient({ ...newPatient, service: e.target.value as any })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Quirófano">Quirófano</option>
                    <option value="Hospitalización">Hospitalización</option>
                    <option value="Recuperación">Recuperación</option>
                    <option value="Urgencias">Urgencias</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Cama / Sala Asignada</label>
                  <input
                    type="text"
                    value={newPatient.bedNumber}
                    onChange={(e) => setNewPatient({ ...newPatient, bedNumber: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Motivo de Ingreso</label>
                  <input
                    type="text"
                    value={newPatient.admissionReason}
                    onChange={(e) => setNewPatient({ ...newPatient, admissionReason: e.target.value })}
                    placeholder="Cirugía programada..."
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Registrar Paciente NOM-004
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR COBRO */}
      {showPaymentModal && selectedPatientForBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Registrar Cobro en Caja</h3>
            <p className="text-slate-500 mb-4">{selectedPatientForBilling.fullName}</p>
            
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700">Monto a Cobrar ($ MXN)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full px-3 py-2 text-sm font-bold border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRegisterPayment}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EMISIÓN FACTURA SAT CFDI 4.0 */}
      {showInvoiceModal && selectedPatientForBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Emisión de Factura Oficial SAT (CFDI 4.0)
            </h3>
            <p className="text-slate-500 mb-4">
              Desglose transparente de servicios hospitalarios e insumos con Lote
            </p>

            <form onSubmit={handleEmitInvoice} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700">RFC del Receptor</label>
                <input
                  type="text"
                  required
                  value={invoiceRfc}
                  onChange={(e) => setInvoiceRfc(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Nombre o Razón Social</label>
                <input
                  type="text"
                  required
                  value={invoiceFiscalName}
                  onChange={(e) => setInvoiceFiscalName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Régimen Fiscal</label>
                <input
                  type="text"
                  value={invoiceFiscalRegime}
                  onChange={(e) => setInvoiceFiscalRegime(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Uso de CFDI</label>
                  <select
                    value={invoiceCfdiUsage}
                    onChange={(e) => setInvoiceCfdiUsage(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="D01 - Honorarios médicos, dentales y gastos hospitalarios">D01 - Gastos hospitalarios</option>
                    <option value="G03 - Gastos en general">G03 - Gastos en general</option>
                    <option value="S01 - Sin efectos fiscales">S01 - Sin efectos fiscales</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Forma de Pago</label>
                  <select
                    value={invoicePaymentWay}
                    onChange={(e) => setInvoicePaymentWay(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="03 Transferencia">03 Transferencia electrónica</option>
                    <option value="04 Tarjeta de Crédito">04 Tarjeta de Crédito</option>
                    <option value="28 Tarjeta de Débito">28 Tarjeta de Débito</option>
                    <option value="01 Efectivo">01 Efectivo</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between font-bold">
                <span>Monto Total a Facturar:</span>
                <span className="text-slate-900">${selectedPatientForBilling.totalAccount.toLocaleString()} MXN</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Generar y Timbrar CFDI 4.0
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
