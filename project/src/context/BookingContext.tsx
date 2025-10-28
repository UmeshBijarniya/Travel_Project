import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Experience, ExperienceSlot } from '../types';

interface BookingContextType {
  experience: Experience | null;
  setExperience: (experience: Experience | null) => void;
  selectedSlot: ExperienceSlot | null;
  setSelectedSlot: (slot: ExperienceSlot | null) => void;
  numGuests: number;
  setNumGuests: (num: number) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  discountAmount: number;
  setDiscountAmount: (amount: number) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ExperienceSlot | null>(null);
  const [numGuests, setNumGuests] = useState<number>(1);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const resetBooking = () => {
    setExperience(null);
    setSelectedSlot(null);
    setNumGuests(1);
    setPromoCode('');
    setDiscountAmount(0);
  };

  return (
    <BookingContext.Provider
      value={{
        experience,
        setExperience,
        selectedSlot,
        setSelectedSlot,
        numGuests,
        setNumGuests,
        promoCode,
        setPromoCode,
        discountAmount,
        setDiscountAmount,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
