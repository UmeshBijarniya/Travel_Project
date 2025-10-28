import React from 'react';
import { CheckCircle, Calendar, Users, Mail, Phone, Home } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

interface ResultPageProps {
  bookingReference: string;
  onGoHome: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ bookingReference, onGoHome }) => {
  const { experience, selectedSlot, numGuests, resetBooking } = useBooking();

  const handleGoHome = () => {
    resetBooking();
    onGoHome();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Your adventure awaits! We've sent a confirmation email with all the details.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8 mb-8">
            <p className="text-sm font-medium text-blue-100 mb-2">Your Booking Reference</p>
            <p className="text-3xl md:text-4xl font-bold tracking-wider">{bookingReference}</p>
            <p className="text-sm text-blue-100 mt-3">
              Save this reference number for your records
            </p>
          </div>

          {experience && selectedSlot && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Home className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">{experience.title}</p>
                    <p className="text-gray-600 text-sm">{experience.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedSlot.date)}
                    </p>
                    <p className="text-gray-600 text-sm">{selectedSlot.time}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {numGuests} {numGuests === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              What's Next?
            </h3>
            <ul className="text-left space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">1.</span>
                <span>Check your email for booking confirmation and details</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">2.</span>
                <span>Arrive 15 minutes early at the meeting point</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">3.</span>
                <span>Bring your booking reference and a valid ID</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">4.</span>
                <span>Contact support if you need to make changes</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoHome}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Book Another Experience
            </button>
            <p className="text-gray-500 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@bookit.com" className="text-blue-600 hover:underline font-medium">
                support@bookit.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Thank you for choosing BookIt for your adventure!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
