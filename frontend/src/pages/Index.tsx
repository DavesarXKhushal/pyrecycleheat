import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SavingsPredictionDashboard from '../components/SavingsPredictionDashboard';
import Header from '../components/Header';

const Index = () => {
  const handleNavigate = (page: 'home' | 'about' | 'map') => {
    if (page === 'home') {
      window.location.href = '/';
    } else {
      window.location.href = `/${page}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={handleNavigate} />
      <main className="container mx-auto px-4 py-8">
        <SavingsPredictionDashboard />
      </main>
    </div>
  );
};

export default Index;
