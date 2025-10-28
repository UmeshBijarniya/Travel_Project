import { useState } from 'react';
import { BookingProvider } from './context/BookingContext';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import ResultPage from './pages/ResultPage';

type Page = 'home' | 'details' | 'checkout' | 'result';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string>('');

  const handleSelectExperience = (id: string) => {
    setSelectedExperienceId(id);
    setCurrentPage('details');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedExperienceId(null);
  };

  const handleBackToDetails = () => {
    setCurrentPage('details');
  };

  const handleProceedToCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleBookingSuccess = (reference: string) => {
    setBookingReference(reference);
    setCurrentPage('result');
  };

  return (
    <BookingProvider>
      <div className="min-h-screen">
        {currentPage === 'home' && (
          <HomePage onSelectExperience={handleSelectExperience} />
        )}
        {currentPage === 'details' && selectedExperienceId && (
          <DetailsPage
            experienceId={selectedExperienceId}
            onBack={handleBackToHome}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}
        {currentPage === 'checkout' && (
          <CheckoutPage
            onBack={handleBackToDetails}
            onSuccess={handleBookingSuccess}
          />
        )}
        {currentPage === 'result' && (
          <ResultPage
            bookingReference={bookingReference}
            onGoHome={handleBackToHome}
          />
        )}
      </div>
    </BookingProvider>
  );
}

export default App;
