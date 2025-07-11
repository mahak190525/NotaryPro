import React from 'react';
import HeroSection from './HeroSection';
import FeaturesOverview from './FeaturesOverview';
import AutomationCapabilities from './AutomationCapabilities';
import TaxSavingsSection from './TaxSavingsSection';
import DeviceCompatibility from './DeviceCompatibility';
import MobileApplication from './MobileApplication';
import PrivacySecurity from './PrivacySecurity';
import Footer from './Footer';

interface HomePageProps {
  onShowAuth: () => void;
}

export default function HomePage({ onShowAuth }: HomePageProps) {
  return (
    <>
      <HeroSection onShowAuth={onShowAuth} />
      <FeaturesOverview />
      <AutomationCapabilities />
      <TaxSavingsSection />
      <DeviceCompatibility />
      <MobileApplication />
      <PrivacySecurity />
      <Footer />
    </>
  );
}