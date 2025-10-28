import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Star, Users, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import { Experience, ExperienceSlot } from '../types';
import { api } from '../api';
import { useBooking } from '../context/BookingContext';

interface DetailsPageProps {
  experienceId: string;
  onBack: () => void;
  onProceedToCheckout: () => void;
}

const DetailsPage: React.FC<DetailsPageProps> = ({ experienceId, onBack, onProceedToCheckout }) => {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [slots, setSlots] = useState<ExperienceSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);

  const { setExperience: setBookingExperience, setSelectedSlot, setNumGuests } = useBooking();

  useEffect(() => {
    loadExperienceDetails();
  }, [experienceId]);

  const loadExperienceDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getExperienceById(experienceId);
      setExperience(data.experience);
      setSlots(data.slots);
      setError(null);
    } catch (err) {
      setError('Failed to load experience details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    const slot = slots.find(s => s.id === selectedSlotId);
    if (!experience || !slot) return;

    setBookingExperience(experience);
    setSelectedSlot(slot);
    setNumGuests(guests);
    onProceedToCheckout();
  };

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: ExperienceSlot[] } = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error || 'Experience not found'}</p>
          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const selectedSlot = slots.find(s => s.id === selectedSlotId);
  const groupedSlots = groupSlotsByDate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-96 md:h-[500px]">
        <img
          src={experience.image_url}
          alt={experience.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <button
          onClick={onBack}
          className="absolute top-6 left-6 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div className="absolute bottom-8 left-6 right-6 text-white">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-3">
              {experience.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{experience.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current mr-1.5" />
                <span className="text-lg font-semibold">{experience.rating.toFixed(1)}</span>
              </div>
              <span className="text-white text-opacity-80">•</span>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-1.5" />
                <span className="text-lg">{experience.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About this experience</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-8">{experience.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Duration</h3>
                    <p className="text-gray-600">{experience.duration}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Group Size</h3>
                    <p className="text-gray-600">Up to {experience.max_group_size}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">{experience.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                Select Date & Time
              </h2>

              {slots.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No available slots at the moment</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                    <div key={date}>
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                        {formatDate(date)}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {dateSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            disabled={slot.available_spots === 0}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedSlotId === slot.id
                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                : slot.available_spots === 0
                                ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="font-semibold text-gray-900 mb-1">{slot.time}</div>
                            <div className="text-sm text-gray-600">
                              {slot.available_spots === 0 ? (
                                <span className="text-red-600 font-medium">Sold Out</span>
                              ) : (
                                <span>{slot.available_spots} spots left</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${experience.price}
                  <span className="text-lg font-normal text-gray-600"> / person</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Number of Guests
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-10 h-10 rounded-lg bg-white shadow hover:bg-gray-100 transition-colors font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-gray-900">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(experience.max_group_size, guests + 1))}
                      disabled={!selectedSlot || guests >= (selectedSlot?.available_spots || 0)}
                      className="w-10 h-10 rounded-lg bg-white shadow hover:bg-gray-100 transition-colors font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  {selectedSlot && guests > selectedSlot.available_spots && (
                    <p className="text-red-600 text-sm mt-2">
                      Only {selectedSlot.available_spots} spots available
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between text-lg mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ${(experience.price * guests).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleProceed}
                  disabled={!selectedSlotId || !selectedSlot || guests > selectedSlot.available_spots}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                >
                  {!selectedSlotId ? 'Select a time slot' : 'Continue to Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
