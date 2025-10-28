import React, { useState } from 'react';
import { ArrowLeft, Tag, Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { api } from '../api';

interface CheckoutPageProps {
  onBack: () => void;
  onSuccess: (bookingReference: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onSuccess }) => {
  const { experience, selectedSlot, numGuests, promoCode, setPromoCode, discountAmount, setDiscountAmount } = useBooking();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!experience || !selectedSlot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No booking selected</h2>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const subtotal = experience.price * numGuests;
  const total = subtotal - discountAmount;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setValidatingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const result = await api.validatePromoCode(promoInput, subtotal);

      if (result.valid && result.discountAmount) {
        setDiscountAmount(result.discountAmount);
        setPromoCode(result.code || promoInput);
        setPromoSuccess(`Promo code applied! You saved $${result.discountAmount.toFixed(2)}`);
        setPromoError('');
      } else {
        setPromoError(result.error || 'Invalid promo code');
        setDiscountAmount(0);
        setPromoCode('');
      }
    } catch (err) {
      setPromoError('Failed to validate promo code');
      console.error(err);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await api.createBooking({
        slotId: selectedSlot.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        numGuests,
        promoCode: promoCode || undefined,
        discountAmount,
        totalPrice: total,
      });

      if (result.success && result.booking) {
        onSuccess(result.booking.bookingReference);
      } else {
        alert(result.error || 'Booking failed. Please try again.');
      }
    } catch (err) {
      alert('Failed to create booking. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-700 hover:text-gray-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Details
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    } focus:border-blue-600 focus:outline-none transition-colors`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-2">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    } focus:border-blue-600 focus:outline-none transition-colors`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-2">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.phone ? 'border-red-500' : 'border-gray-200'
                    } focus:border-blue-600 focus:outline-none transition-colors`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-2">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        disabled={!!promoCode}
                        className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Enter code"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={validatingPromo || !!promoCode}
                      className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                    >
                      {validatingPromo ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Validating
                        </>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                  {promoError && <p className="text-red-600 text-sm mt-2">{promoError}</p>}
                  {promoSuccess && (
                    <p className="text-green-600 text-sm mt-2 font-medium">{promoSuccess}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={experience.image_url}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{experience.title}</h3>
                  <p className="text-gray-600 text-sm">{experience.location}</p>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-900">{formatDate(selectedSlot.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium text-gray-900">{selectedSlot.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-medium text-gray-900">{numGuests}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-green-600">Discount ({promoCode})</span>
                    <span className="font-semibold text-green-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
