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

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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