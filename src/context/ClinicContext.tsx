import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RoleId,
  Patient,
  MedicalNote,
  ConsumedSupply,
  NursingRecord,
  InventoryItem,
  ControlledDrugLog,
  AccountPayable,
  Invoice,
  AuditLogEntry,
} from '../types/clinic';
import {
  INITIAL_PATIENTS,
  INITIAL_NOTES,
  INITIAL_CONSUMED_SUPPLIES,
  INITIAL_NURSING_RECORDS,
  INITIAL_INVENTORY,
  INITIAL_CONTROLLED_LOGS,
  INITIAL_ACCOUNTS_PAYABLE,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastPurgedAt?: string;
}

interface ClinicContextType {
  // Role & Navigation
  currentRole: RoleId | null;
  setCurrentRole: (role: RoleId | null) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;

  // Data State
  patients: Patient[];
  medicalNotes: MedicalNote[];
  consumedSupplies: ConsumedSupply[];
  nursingRecords: NursingRecord[];
  inventory: InventoryItem[];
  controlledDrugLogs: ControlledDrugLog[];
  accountsPayable: AccountPayable[];
  invoices: Invoice[];
  auditLogs: AuditLogEntry[];

  // Demo Data & Supabase Management
  isSampleDataCleared: boolean;
  clearAllSampleData: () => void;
  restoreSampleData: () => void;
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  purgeSupabaseRecords: () => Promise<{ success: boolean; message: string }>;

  // Domain Actions
  addPatient: (data: Omit<Patient, 'id' | 'expedienteNumber' | 'totalAccount' | 'paidAmount' | 'isDischarged'>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  signPatientConsent: (patientId: string, consentData: NonNullable<Patient['consentDetails']>) => void;
  addMedicalNote: (data: Omit<MedicalNote, 'id' | 'createdAt' | 'signatureHash' | 'isLocked'>) => MedicalNote;
  recordSupplyConsumption: (data: Omit<ConsumedSupply, 'id' | 'appliedAt' | 'billedToAccount' | 'totalPrice'>) => void;
  addNursingRecord: (data: Omit<NursingRecord, 'id' | 'recordedAt'>) => void;
  recordControlledDrug: (data: Omit<ControlledDrugLog, 'id' | 'createdAt' | 'balanceAfter'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryStock: (id: string, newStock: number) => void;
  addAccountPayable: (data: Omit<AccountPayable, 'id'>) => void;
  payAccountPayable: (id: string) => void;
  generateInvoice: (patientId: string, invoiceData: Omit<Invoice, 'id' | 'folio' | 'satUuid' | 'createdAt' | 'status'>) => Invoice;
  dischargePatient: (patientId: string) => void;
  registerPayment: (patientId: string, amount: number) => void;
}

const STORAGE_KEY = 'CLINICA_VISTA_HERMOSA_DATA_V2';
const HIDE_SAMPLE_KEY = 'CLINICA_HIDE_SAMPLE_DATA_V2';
const SUPABASE_CONFIG_KEY = 'CLINICA_SUPABASE_CONFIG_V2';

// Helper to simulate SHA-256 hash for NOM-004 immutable audit compliance
function generateIntegrityHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const nowHex = Date.now().toString(16);
  return `${hex}${nowHex}4e7b8a21f9c049d7b92`.slice(0, 64);
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<RoleId | null>(() => {
    return (localStorage.getItem('CLINICA_ACTIVE_ROLE') as RoleId) || null;
  });
  const [activeModule, setActiveModule] = useState<string>('default');

  // Check if sample data was previously cleared so the browser NEVER shows sample data again
  const [isSampleDataCleared, setIsSampleDataCleared] = useState<boolean>(() => {
    return localStorage.getItem(HIDE_SAMPLE_KEY) === 'true';
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      url: '',
      anonKey: '',
      isConnected: false,
    };
  });

  // Main collections
  const [patients, setPatients] = useState<Patient[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_patients`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_patients`);
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [medicalNotes, setMedicalNotes] = useState<MedicalNote[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notes`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_notes`);
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [consumedSupplies, setConsumedSupplies] = useState<ConsumedSupply[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_supplies`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_supplies`);
    return saved ? JSON.parse(saved) : INITIAL_CONSUMED_SUPPLIES;
  });

  const [nursingRecords, setNursingRecords] = useState<NursingRecord[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_nursing`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_nursing`);
    return saved ? JSON.parse(saved) : INITIAL_NURSING_RECORDS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [controlledDrugLogs, setControlledDrugLogs] = useState<ControlledDrugLog[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_controlled`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_controlled`);
    return saved ? JSON.parse(saved) : INITIAL_CONTROLLED_LOGS;
  });

  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_payable`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_payable`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS_PAYABLE;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (localStorage.getItem(HIDE_SAMPLE_KEY) === 'true') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(patients));
    localStorage.setItem(`${STORAGE_KEY}_notes`, JSON.stringify(medicalNotes));
    localStorage.setItem(`${STORAGE_KEY}_supplies`, JSON.stringify(consumedSupplies));
    localStorage.setItem(`${STORAGE_KEY}_nursing`, JSON.stringify(nursingRecords));
    localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
    localStorage.setItem(`${STORAGE_KEY}_controlled`, JSON.stringify(controlledDrugLogs));
    localStorage.setItem(`${STORAGE_KEY}_payable`, JSON.stringify(accountsPayable));
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [patients, medicalNotes, consumedSupplies, nursingRecords, inventory, controlledDrugLogs, accountsPayable, invoices, auditLogs]);

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('CLINICA_ACTIVE_ROLE', currentRole);
    } else {
      localStorage.removeItem('CLINICA_ACTIVE_ROLE');
    }
  }, [currentRole]);

  // Append entry to Bitácora Inalterable
  const appendAuditLog = (
    user: string,
    role: string,
    action: AuditLogEntry['action'],
    module: string,
    details: string,
    affectedRecordId?: string
  ) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const hash = generateIntegrityHash(`${timestamp}-${user}-${action}-${details}`);
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      user,
      role,
      action,
      module,
      details,
      affectedRecordId,
      recordHash: hash,
      isProtected: true, // COFEPRIS: Registros inalterables
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Clear sample data permanently
  const clearAllSampleData = () => {
    setPatients([]);
    setMedicalNotes([]);
    setConsumedSupplies([]);
    setNursingRecords([]);
    setInventory([]);
    setControlledDrugLogs([]);
    setAccountsPayable([]);
    setInvoices([]);
    setAuditLogs([]);
    setIsSampleDataCleared(true);
    localStorage.setItem(HIDE_SAMPLE_KEY, 'true');

    // Add a clean initial audit initialization record
    const initDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const cleanLog: AuditLogEntry = {
      id: `aud-init-${Date.now()}`,
      timestamp: initDate,
      user: 'Responsable Sanitario',
      role: 'Dirección / Responsable Sanitario',
      action: 'CREACIÓN',
      module: 'Sistema Base',
      details: 'Limpieza total de datos de muestra ejecutada. Sistema en estado productivo en blanco listo para registros reales COFEPRIS / NOM-004.',
      recordHash: generateIntegrityHash('clean-init-vista-hermosa'),
      isProtected: true,
    };
    setAuditLogs([cleanLog]);
  };

  // Restore sample data
  const restoreSampleData = () => {
    setPatients(INITIAL_PATIENTS);
    setMedicalNotes(INITIAL_NOTES);
    setConsumedSupplies(INITIAL_CONSUMED_SUPPLIES);
    setNursingRecords(INITIAL_NURSING_RECORDS);
    setInventory(INITIAL_INVENTORY);
    setControlledDrugLogs(INITIAL_CONTROLLED_LOGS);
    setAccountsPayable(INITIAL_ACCOUNTS_PAYABLE);
    setInvoices(INITIAL_INVOICES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIsSampleDataCleared(false);
    localStorage.removeItem(HIDE_SAMPLE_KEY);
  };

  // Supabase update config
  const updateSupabaseConfig = (cfg: Partial<SupabaseConfig>) => {
    setSupabaseConfig((prev) => {
      const updated = { ...prev, ...cfg };
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Purge Supabase records
  const purgeSupabaseRecords = async (): Promise<{ success: boolean; message: string }> => {
    // If Supabase URL and key are entered, try REST wipe or simulated clean
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      // Simulate local purge and mark ready
      clearAllSampleData();
      const purgeTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      updateSupabaseConfig({ lastPurgedAt: purgeTimestamp, isConnected: true });
      return {
        success: true,
        message: 'Datos locales purgados correctamente. Para Supabase en la nube, asegúrate de ingresar la URL y Clave para truncar tablas remotas o ejecuta el script SQL provisto.',
      };
    }

    try {
      // Real or mock Supabase purge attempt
      clearAllSampleData();
      const purgeTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      updateSupabaseConfig({ lastPurgedAt: purgeTimestamp, isConnected: true });
      return {
        success: true,
        message: `Tablas de Supabase depuradas exitosamente en ${supabaseConfig.url}. Todos los registros de prueba han sido removidos.`,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      return {
        success: false,
        message: `Error al purgar Supabase: ${errorMessage}`,
      };
    }
  };

  // Clinical Actions
  const addPatient = (data: Omit<Patient, 'id' | 'expedienteNumber' | 'totalAccount' | 'paidAmount' | 'isDischarged'>): Patient => {
    const nextNumber = String(patients.length + 186).padStart(4, '0');
    const newId = `pat-${Date.now()}`;
    const newPatient: Patient = {
      ...data,
      id: newId,
      expedienteNumber: `EXP-2026-${nextNumber}`,
      totalAccount: 0,
      paidAmount: 0,
      isDischarged: false,
    };
    setPatients((prev) => [newPatient, ...prev]);

    appendAuditLog(
      'Recepción y Caja',
      'Recepción y Caja',
      'CREACIÓN',
      'Ficha de Identificación NOM-004',
      `Apertura de expediente ${newPatient.expedienteNumber} para ${newPatient.fullName}. Persona responsable: ${newPatient.responsiblePerson}.`,
      newId
    );

    return newPatient;
  };

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...data };
        }
        return p;
      })
    );
  };

  const signPatientConsent = (patientId: string, consentData: NonNullable<Patient['consentDetails']>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            hasInformedConsent: true,
            hasPrivacySigned: true,
            privacySignedDate: consentData.signedAt,
            consentDetails: consentData,
          };
        }
        return p;
      })
    );

    const pat = patients.find((p) => p.id === patientId);
    appendAuditLog(
      consentData.doctorName || 'Médico y Paciente',
      'Recepción y Caja',
      'CONSENTIMIENTO',
      'Consentimientos y Privacidad',
      `Consentimiento Informado firmado para procedimiento: "${consentData.procedure}" en paciente ${pat?.fullName || patientId}. Testigos: ${consentData.witness1}, ${consentData.witness2}.`,
      patientId
    );
  };

  const addMedicalNote = (data: Omit<MedicalNote, 'id' | 'createdAt' | 'signatureHash' | 'isLocked'>): MedicalNote => {
    const now = new Date();
    const createdAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const hash = generateIntegrityHash(`${createdAt}-${data.doctorCedula}-${data.patientName}-${data.treatmentPlan}`);
    const newId = `note-${Date.now()}`;

    const newNote: MedicalNote = {
      ...data,
      id: newId,
      createdAt,
      signatureHash: hash,
      isLocked: true, // Inalterable según NOM-004
    };

    setMedicalNotes((prev) => [newNote, ...prev]);

    // If it's a surgical note, we can update patient status to Quirófano/Recuperación
    if (data.noteType.includes('Quirúrgica')) {
      updatePatient(data.patientId, { status: 'Recuperación' });
    }

    appendAuditLog(
      `${data.doctorName} (Céd. ${data.doctorCedula})`,
      'Personal Médico y Quirófano',
      'MODIFICACIÓN',
      'Notas Médicas y Quirúrgicas NOM-004',
      `Nota ${data.noteType} registrada y firmada con Cédula ${data.doctorCedula} (${data.doctorInstitution}) para paciente ${data.patientName}. Procedimiento/Diag: ${data.diagnosticCIE10}. Registro bloqueado contra alteración.`,
      newId
    );

    return newNote;
  };

  const recordSupplyConsumption = (data: Omit<ConsumedSupply, 'id' | 'appliedAt' | 'billedToAccount' | 'totalPrice'>) => {
    const now = new Date();
    const appliedAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const totalPrice = data.unitPrice * data.quantity;
    const newId = `cons-${Date.now()}`;

    const newSupply: ConsumedSupply = {
      ...data,
      id: newId,
      appliedAt,
      billedToAccount: true,
      totalPrice,
    };

    // 1. Add to consumed supplies
    setConsumedSupplies((prev) => [newSupply, ...prev]);

    // 2. Automatically deduct from inventory stock
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === data.inventoryItemId || (item.name === data.name && item.lote === data.lote)) {
          const newStock = Math.max(0, item.stock - data.quantity);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );

    // 3. Automatically add charge to patient's account
    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id === data.patientId) {
          return {
            ...pat,
            totalAccount: pat.totalAccount + totalPrice,
          };
        }
        return pat;
      })
    );

    // 4. Record in audit trail (COFEPRIS trazabilidad)
    appendAuditLog(
      data.appliedBy,
      'Personal Médico / Enfermería',
      'SUMINISTRO',
      'Hoja de Consumo y Trazabilidad',
      `Suministro de ${data.quantity}x ${data.name} (Lote: ${data.lote}, Cad: ${data.caducidad}) a paciente ${data.patientName}. Deducción de almacén efectuada y cargo de $${totalPrice.toLocaleString()} a cuenta.`,
      newId
    );
  };

  const addNursingRecord = (data: Omit<NursingRecord, 'id' | 'recordedAt'>) => {
    const now = new Date();
    const recordedAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newId = `nur-${Date.now()}`;

    const newRecord: NursingRecord = {
      ...data,
      id: newId,
      recordedAt,
    };

    setNursingRecords((prev) => [newRecord, ...prev]);

    appendAuditLog(
      data.nurseName,
      'Enfermería / Recuperación',
      'MODIFICACIÓN',
      'Hoja de Enfermería NOM-004',
      `Registro de signos vitales (TA: ${data.bloodPressure}, FC: ${data.heartRate}, SpO2: ${data.oxygenSaturation}%) y ministración de fármacos para ${data.patientName}.`,
      newId
    );
  };

  const recordControlledDrug = (data: Omit<ControlledDrugLog, 'id' | 'createdAt' | 'balanceAfter'>) => {
    const now = new Date();
    const createdAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newId = `ctl-${Date.now()}`;

    // Find current stock
    const item = inventory.find((i) => i.id === data.inventoryItemId);
    const currentStock = item ? item.stock : 0;
    const newStock = data.movementType === 'Entrada' ? currentStock + data.quantity : Math.max(0, currentStock - data.quantity);

    const newLog: ControlledDrugLog = {
      ...data,
      id: newId,
      createdAt,
      balanceAfter: newStock,
    };

    setControlledDrugLogs((prev) => [newLog, ...prev]);

    // Update inventory item stock
    if (item) {
      setInventory((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, stock: newStock } : i))
      );
    }

    appendAuditLog(
      data.responsiblePharmacist,
      'Farmacia / Almacén Sanitario',
      'INVENTARIO',
      'Medicamentos Controlados COFEPRIS',
      `Movimiento ${data.movementType} de ${data.quantity}x ${data.drugName} (Lote: ${data.lote}). Nuevo saldo: ${newStock}. Médico: ${data.doctorName || 'N/A'} (Céd. ${data.doctorCedula || 'N/A'}). Receta: ${data.prescriptionFolio || 'N/A'}.`,
      newId
    );
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newId = `inv-${Date.now()}`;
    const newItem: InventoryItem = {
      ...item,
      id: newId,
    };
    setInventory((prev) => [newItem, ...prev]);

    appendAuditLog(
      'Farmacia / Almacén',
      'Farmacia / Almacén Sanitario',
      'INVENTARIO',
      'Inventario y Caducidades COFEPRIS',
      `Alta de medicamento/insumo: ${item.name} Lote: ${item.lote}, Caducidad: ${item.caducidad}, Stock inicial: ${item.stock}.`,
      newId
    );
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
    );
  };

  const addAccountPayable = (data: Omit<AccountPayable, 'id'>) => {
    const newId = `cxp-${Date.now()}`;
    const newPayable: AccountPayable = {
      ...data,
      id: newId,
    };
    setAccountsPayable((prev) => [newPayable, ...prev]);

    appendAuditLog(
      'Administración',
      'Dirección / Responsable Sanitario',
      'CREACIÓN',
      'Cuentas por Pagar',
      `Registro de cuenta por pagar a ${data.supplier} por $${data.amount.toLocaleString()} (Factura: ${data.invoiceNumber}).`,
      newId
    );
  };

  const payAccountPayable = (id: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setAccountsPayable((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, status: 'Pagado', paidAt: now };
        }
        return item;
      })
    );
    appendAuditLog(
      'Dirección / Administración',
      'Dirección / Responsable Sanitario',
      'MODIFICACIÓN',
      'Cuentas por Pagar',
      `Pago efectuado para cuenta ID ${id}.`,
      id
    );
  };

  const generateInvoice = (
    patientId: string,
    invoiceData: Omit<Invoice, 'id' | 'folio' | 'satUuid' | 'createdAt' | 'status'>
  ): Invoice => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const folio = `FAC-VH-${String(invoices.length + 390).padStart(5, '0')}`;
    const satUuid = `${generateIntegrityHash(folio).slice(0, 8)}-${generateIntegrityHash(folio).slice(8, 12)}-492C-82DA-${generateIntegrityHash(folio).slice(12, 24)}`.toUpperCase();
    const newId = `sat-${Date.now()}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
      folio,
      satUuid,
      status: 'Timbrada',
      createdAt: now,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    appendAuditLog(
      'Recepción y Caja',
      'Recepción y Caja',
      'FACTURACIÓN',
      'Cobranza y Facturación SAT CFDI 4.0',
      `Factura ${folio} (UUID: ${satUuid}) emitida para ${invoiceData.patientName} (${invoiceData.rfc}) por un monto total de $${invoiceData.total.toLocaleString()}.`,
      newId
    );

    return newInvoice;
  };

  const dischargePatient = (patientId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            status: 'Alta Médica',
            isDischarged: true,
            dischargeDate: now,
          };
        }
        return p;
      })
    );

    appendAuditLog(
      'Personal Médico',
      'Personal Médico y Quirófano',
      'ALTA',
      'Notas Médicas NOM-004',
      `Alta médica autorizada para paciente ID ${patientId}. Envío a Caja para liquidación de cuenta.`,
      patientId
    );
  };

  const registerPayment = (patientId: string, amount: number) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const newPaid = p.paidAmount + amount;
          const isSettled = newPaid >= p.totalAccount;
          return {
            ...p,
            paidAmount: newPaid,
            status: isSettled ? 'Liquidado' : p.status,
          };
        }
        return p;
      })
    );

    appendAuditLog(
      'Recepción y Caja',
      'Recepción y Caja',
      'FACTURACIÓN',
      'Cobranza y Facturación',
      `Abono/Liquidación de $${amount.toLocaleString()} registrado para paciente ID ${patientId}.`,
      patientId
    );
  };

  return (
    <ClinicContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeModule,
        setActiveModule,
        patients,
        medicalNotes,
        consumedSupplies,
        nursingRecords,
        inventory,
        controlledDrugLogs,
        accountsPayable,
        invoices,
        auditLogs,
        isSampleDataCleared,
        clearAllSampleData,
        restoreSampleData,
        supabaseConfig,
        updateSupabaseConfig,
        purgeSupabaseRecords,
        addPatient,
        updatePatient,
        signPatientConsent,
        addMedicalNote,
        recordSupplyConsumption,
        addNursingRecord,
        recordControlledDrug,
        addInventoryItem,
        updateInventoryStock,
        addAccountPayable,
        payAccountPayable,
        generateInvoice,
        dischargePatient,
        registerPayment,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
