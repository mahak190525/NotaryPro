import React, { useState, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import ReceiptManagement from './ReceiptManagement';
import ElectronicJournal from './ElectronicJournal';
import MileageTracker from './MileageTracker';
import MileageReports from './MileageReports';
import AutomationDashboard from './AutomationDashboard';
import ImportOrders from './ImportOrders';
import DashboardHome from '../dashboard/DashboardHome';

interface DashboardProps {
  user: any;
  onUpdateUser: (updates: any) => void;
  onLogout: () => void;
  currentPageFromApp: string;
  setAppCurrentPage: (page: string) => void;
}

export default function Dashboard({ 
  user, 
  onUpdateUser, 
  onLogout, 
  currentPageFromApp, 
  setAppCurrentPage 
}: DashboardProps) {
  const [currentPage, setCurrentPage] = useState(currentPageFromApp || 'dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync with App component's currentPage state
  useEffect(() => {
    if (currentPageFromApp && currentPageFromApp !== currentPage) {
      setCurrentPage(currentPageFromApp);
    }
  }, [currentPageFromApp]);

  const renderPageContent = () => {
    switch (currentPage) {
      case 'receipts':
        return <ReceiptManagement />;
      case 'journal':
        return <ElectronicJournal />;
      case 'mileage':
        return <MileageTracker />;
      case 'reports':
        return <MileageReports />;
      case 'automation':
        return <AutomationDashboard />;
      case 'import-orders':
        return <ImportOrders />;
      default:
        return <DashboardHome user={user} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      
      <main className="flex-1 transition-all duration-300">
        {renderPageContent()}
      </main>
    </div>
  );
}