import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeTopBar } from '../features/home/HomeTopBar';
import { HeroSection } from '../features/home/HeroSection';
import { FeatureGrid } from '../features/home/FeatureGrid';
import { ArchitectureProof } from '../features/home/ArchitectureProof';
import { HomeFooter } from '../features/home/HomeFooter';
import { BackgroundAnimation } from '../features/home/BackgroundAnimation';

export function HomePage() {
  const navigate = useNavigate();
  const handleLaunch = () => navigate('/app');

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-black overflow-x-hidden">
      <BackgroundAnimation />
      <HomeTopBar onSkip={handleLaunch} />
      <HeroSection onLaunch={handleLaunch} />
      <FeatureGrid onLaunch={handleLaunch} />
      <ArchitectureProof />
      <HomeFooter />
    </div>
  );
}

export default HomePage;
