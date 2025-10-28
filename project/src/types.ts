export interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  image_url: string;
  rating: number;
  category: string;
  max_group_size: number;
  created_at: string;
}

export interface ExperienceSlot {
  id: string;
  experience_id: string;
  date: string;
  time: string;
  available_spots: number;
  total_spots: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  num_guests: number;
  promo_code?: string;
  discount_amount: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  booking_reference: string;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface BookingFormData {
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numGuests: number;
  promoCode?: string;
  discountAmount: number;
  totalPrice: number;
}

export interface BookingContext {
  experience: Experience | null;
  selectedSlot: ExperienceSlot | null;
  numGuests: number;
  promoCode?: string;
  discountAmount: number;
}
