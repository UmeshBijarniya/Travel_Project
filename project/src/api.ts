import { Experience, ExperienceSlot, BookingFormData } from './types';

const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const getHeaders = () => ({
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
});

export const api = {
  async getExperiences(): Promise<Experience[]> {
    const response = await fetch(`${API_BASE_URL}/experiences`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch experiences');
    const data = await response.json();
    return data.experiences;
  },

  async getExperienceById(id: string): Promise<{ experience: Experience; slots: ExperienceSlot[] }> {
    const response = await fetch(`${API_BASE_URL}/experiences/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch experience details');
    return response.json();
  },

  async validatePromoCode(code: string, subtotal: number): Promise<{
    valid: boolean;
    code?: string;
    discountAmount?: number;
    discountType?: string;
    discountValue?: number;
    error?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/promo-validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, subtotal }),
    });
    if (!response.ok) throw new Error('Failed to validate promo code');
    return response.json();
  },

  async createBooking(bookingData: BookingFormData): Promise<{
    success: boolean;
    booking?: {
      id: string;
      bookingReference: string;
      status: string;
      totalPrice: number;
      numGuests: number;
    };
    error?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },
};
