export type RoleId = 
  | 'direccion'
  | 'recepcion'
  | 'medico'
  | 'enfermeria'
  | 'farmacia';

export interface RoleConfig {
  id: RoleId;
  name: string;
  badge: string;
  color: string;
  description?: string;
  modules: string[];
}

export interface Patient {
  id: string;
  expedienteNumber: string; // Ej: EXP-2026-0041
  fullName: string;
  age: number;
  sex: 'Femenino' | 'Masculino' | 'Otro';
  birthDate?: string;
  address: string;
  phone: string;
  responsiblePerson: string;
  relationship: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  admissionDate: string;
  admissionReason: string;
  service: 'Quirófano' | 'Hospitalización' | 'Recuperación' | 'Urgencias';
  bedNumber?: string;
  status: 'Ingresado' | 'En Cirugía' | 'Recuperación' | 'Alta Médica' | 'Liquidado';
  hasPrivacySigned: boolean;
  privacySignedDate?: string;
  hasInformedConsent: boolean;
  consentDetails?: {
    procedure: string;
    risks: string;
    signedBy: string;
    doctorName: string;
    doctorCedula: string;
    witness1: string;
    witness2: string;
    signatureDataUrl?: string;
    signedAt: string;
  };
  totalAccount: number;
  paidAmount: number;
  isDischarged: boolean;
  dischargeDate?: string;
}

export interface MedicalNote {
  id: string;
  patientId: string;
  patientName: string;
  noteType: 'Ingreso' | 'Evolución' | 'Pre-Quirúrgica' | 'Post-Quirúrgica / Operatoria' | 'Egreso / Alta';
  createdAt: string;
  // NOM-004 Obligatory Doctor Data
  doctorName: string;
  doctorCedula: string;
  doctorInstitution: string; // Institución que expidió el título
  doctorSpecialty?: string;
  // Clinical Data
  diagnosticCIE10: string;
  surgicalProcedure?: string;
  findings?: string;
  operativeIncidents?: string;
  treatmentPlan: string;
  prognosis: 'Bueno' | 'Reservado' | 'Grave';
  isSigned: boolean;
  signatureHash: string; // Inalterable audit hash
  isLocked: boolean; // Cannot be edited or deleted
}

export interface ConsumedSupply {
  id: string;
  patientId: string;
  patientName: string;
  inventoryItemId: string;
  name: string;
  category: 'Medicamento' | 'Material de Curación' | 'Quirúrgico' | 'Solución';
  dose?: string;
  route?: string;
  lote: string; // Número de Lote COFEPRIS
  caducidad: string; // Fecha de Caducidad YYYY-MM-DD
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  appliedBy: string; // Médico o Enfermera
  appliedAt: string;
  billedToAccount: boolean;
}

export interface NursingRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordedAt: string;
  nurseName: string;
  // Signos Vitales
  bloodPressure: string; // ej: 120/80 mmHg
  heartRate: number; // lpm
  respiratoryRate: number; // rpm
  temperature: number; // °C
  oxygenSaturation: number; // % SpO2
  glucose?: number; // mg/dL
  painScaleEva: number; // 0 - 10
  // Observaciones y Balance
  fluidInputMl: number; // Líquidos administrados
  fluidOutputMl: number; // Diuresis / drenajes
  evolutionNotes: string;
  // Horarios de Medicación
  medicationsAdministered: {
    medication: string;
    dose: string;
    route: string;
    scheduledTime: string;
    actualTime: string;
    lote: string;
  }[];
  // Insumos Menores
  minorSuppliesUsed: {
    item: string;
    quantity: number;
  }[];
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: 'Medicamento' | 'Material de Curación' | 'Quirófano' | 'Solución' | 'Controlado';
  presentation: string;
  lote: string;
  caducidad: string; // YYYY-MM-DD
  stock: number;
  minStock: number;
  unitCost: number; // Precio de compra
  unitPrice: number; // Precio al paciente
  supplier: string;
  isControlled: boolean;
  controlledGroup?: 'Grupo I' | 'Grupo II' | 'Grupo III'; // COFEPRIS classification
}

export interface ControlledDrugLog {
  id: string;
  inventoryItemId: string;
  drugName: string;
  lote: string;
  movementType: 'Entrada' | 'Salida';
  quantity: number;
  balanceAfter: number;
  doctorName?: string;
  doctorCedula?: string;
  prescriptionFolio?: string;
  patientName?: string;
  invoiceFolio?: string; // Para entradas
  supplier?: string;
  responsiblePharmacist: string;
  createdAt: string;
}

export interface AccountPayable {
  id: string;
  supplier: string;
  concept: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'Pendiente' | 'Programado' | 'Pagado';
  category: 'Medicamentos' | 'Material Quirúrgico' | 'Servicios Generales' | 'Mantenimiento';
  paidAt?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  rfc: string;
  fiscalName: string;
  fiscalRegime: string;
  cfdiUsage: string;
  cfdiVersion: '4.0';
  folio: string;
  satUuid: string;
  subtotal: number;
  iva: number;
  total: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    lote?: string;
    satKey: string;
  }[];
  paymentMethod: 'PUE' | 'PPD';
  paymentWay: '01 Efectivo' | '03 Transferencia' | '04 Tarjeta de Crédito' | '28 Tarjeta de Débito';
  status: 'Emitida' | 'Timbrada' | 'Cancelada';
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: 'CREACIÓN' | 'RECETA' | 'SUMINISTRO' | 'MODIFICACIÓN' | 'CONSENTIMIENTO' | 'ALTA' | 'FACTURACIÓN' | 'INVENTARIO';
  module: string;
  details: string;
  affectedRecordId?: string;
  recordHash: string; // Hash SHA-256 inalterable
  isProtected: boolean; // COFEPRIS: Registros clínicos inalterables
}
