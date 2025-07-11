import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ReceiptManagement from './ReceiptManagement';
import ElectronicJournal from './ElectronicJournal';
import MileageTracker from './MileageTracker';
import MileageReports from './MileageReports';
import AutomationDashboard from './AutomationDashboard';
import ImportOrders from './ImportOrders';
import DashboardHome from './DashboardHome';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        return <DashboardHome user={user} />;
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