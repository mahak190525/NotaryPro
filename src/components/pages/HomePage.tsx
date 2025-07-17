import React from 'react';
import HeroSection from '../shared/HeroSection';
import FeaturesOverview from '../shared/FeaturesOverview';
import AutomationCapabilities from '../shared/AutomationCapabilities';
import TaxSavingsSection from '../shared/TaxSavingsSection';
import DeviceCompatibility from '../shared/DeviceCompatibility';
import MobileApplication from '../shared/MobileApplication';
import PrivacySecurity from '../shared/PrivacySecurity';
import Footer from '../layout/Footer';

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