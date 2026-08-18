import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TripWizard } from '../components/trip/TripWizard';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { CreateTripInput } from '../types';
import { apiTrips } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

export const CreateTripPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, demoLogin } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDestination, setActiveDestination] = useState<string | undefined>(
    searchParams.get('destination') || 'Goa'
  );
  const [activeDuration, setActiveDuration] = useState<number | undefined>(4);

  const initialData: Partial<CreateTripInput> = {
    destination: searchParams.get('destination') || 'Goa',
  };

  const handleGenerate = async (input: CreateTripInput) => {
    setError(null);
    setIsLoading(true);
    setActiveDestination(input.destination);

    // If user is not authenticated yet, automatically perform quick demo login
    if (!isAuthenticated) {
      try {
        await demoLogin('user');
      } catch (err) {
        console.warn('Auto demo login warning:', err);
      }
    }

    try {
      const generatedTrip = await apiTrips.generate(input);
      // Navigate to full trip view
      navigate(`/trips/${generatedTrip.id}`);
    } catch (err: any) {
      console.error('Failed to generate trip:', err);
      setError(err.message || 'Something went wrong while generating the itinerary. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Loading milestone screen */}
      {isLoading && <LoadingScreen destination={activeDestination} duration={activeDuration} />}

      {/* Error alert if any */}
      {error && (
        <div className="max-w-3xl mx-auto mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Trip Wizard */}
      <TripWizard initialData={initialData} onGenerate={handleGenerate} isLoading={isLoading} />
    </div>
  );
};
