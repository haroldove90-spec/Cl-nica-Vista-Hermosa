/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { DataManagementModal } from './components/DataManagementModal';
import { WorkflowModal } from './components/WorkflowModal';

// Modules
import { DireccionModule } from './components/modules/DireccionModule';
import { RecepcionModule } from './components/modules/RecepcionModule';
import { MedicoModule } from './components/modules/MedicoModule';
import { EnfermeriaModule } from './components/modules/EnfermeriaModule';
import { FarmaciaModule } from './components/modules/FarmaciaModule';

const MainDashboard: React.FC = () => {
  const { currentRole } = useClinic();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  // If no role is selected, show initial clean role selector
  if (!currentRole) {
    return (
      <>
        <RoleSelector />
        <DataManagementModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
        />
        <WorkflowModal
          isOpen={isWorkflowModalOpen}
          onClose={() => setIsWorkflowModalOpen(false)}
        />
      </>
    );
  }

  // Render active role module
  const renderActiveModule = () => {
    switch (currentRole) {
      case 'direccion':
        return <DireccionModule />;
      case 'recepcion':
        return <RecepcionModule />;
      case 'medico':
        return <MedicoModule />;
      case 'enfermeria':
        return <EnfermeriaModule />;
      case 'farmacia':
        return <FarmaciaModule />;
      default:
        return <DireccionModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans">
      {/* Unified Institutional Header */}
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
          onOpenDataModal={() => setIsDataModalOpen(true)}
        />

        {/* Main Work Area (Clean navigation without duplicate horizontal tabs) */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:ml-72 pb-24 lg:pb-8 transition-all">
          <div className="max-w-6xl mx-auto">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Touch-optimized Bottom Bar for Mobile & Tablet */}
      <BottomBar />

      {/* Global Modals */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
      <WorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainDashboard />
    </ClinicProvider>
  );
}
