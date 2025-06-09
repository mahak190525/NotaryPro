import React from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import FeaturesOverview from './components/FeaturesOverview';
import AutomationCapabilities from './components/AutomationCapabilities';
import TaxSavingsSection from './components/TaxSavingsSection';
import ReceiptManagement from './components/ReceiptManagement';
import DeviceCompatibility from './components/DeviceCompatibility';
import MobileApplication from './components/MobileApplication';
import ElectronicJournal from './components/ElectronicJournal';
import PrivacySecurity from './components/PrivacySecurity';
import Footer from './components/Footer';
import MileageTracker from './components/MileageTracker';
import MileageReports from './components/MileageReports';
import AutomationDashboard from './components/AutomationDashboard';
import PricingPage from './components/PricingPage';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState('home');

  // Simple routing based on hash or pathname
  React.useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path === '/mileage') {
        setCurrentPage('mileage');
      } else if (path === '/reports') {
        setCurrentPage('reports');
      } else if (path === '/automation') {
        setCurrentPage('automation');
      } else if (path === '/pricing') {
        setCurrentPage('pricing');
      } else if (path === '/journal') {
        setCurrentPage('journal');
      } else if (path === '/receipts') {
        setCurrentPage('receipts');
      } else {
        setCurrentPage('home');
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`);
  };

  if (currentPage === 'mileage') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <MileageTracker />
      </div>
    );
  }

  if (currentPage === 'reports') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <MileageReports />
      </div>
    );
  }

  if (currentPage === 'automation') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <AutomationDashboard />
      </div>
    );
  }

  if (currentPage === 'pricing') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <PricingPage />
      </div>
    );
  }

  if (currentPage === 'journal') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <ElectronicJournal />
      </div>
    );
  }

  if (currentPage === 'receipts') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <ReceiptManagement />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <HeroSection />
      <FeaturesOverview />
      <AutomationCapabilities />
      <TaxSavingsSection />
      <ReceiptManagement />
      <DeviceCompatibility />
      <MobileApplication />
      <ElectronicJournal />
      <PrivacySecurity />
      <Footer />
    </div>
  );
}

export default App;