export interface Database {
  public: {
    Tables: {
      property_subscriptions: {
        Row: {
          id: string;
          property_id: string;
          host_id: string;
          subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
          subscription_plan: 'monthly' | 'yearly';
          amount_paid: number;
          currency: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_subscription_id: string | null;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          auto_renew: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          property_id: string;
          host_id: string;
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled';
          subscription_plan?: 'monthly' | 'yearly';
          amount_paid?: number;
          currency?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_subscription_id?: string | null;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          auto_renew?: boolean;
        };
        Update: Partial<Database['public']['Tables']['property_subscriptions']['Insert']>;
      };
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          property_type: string;
          address: string;
          city: string;
          state: string;
          country: string;
          latitude: number;
          longitude: number;
          price_full_day: number | null;
          price_per_day: number;
          bedrooms: number;
          bathrooms: number;
          max_guests: number;
          amenities: string[];
          images: string[];
          rating: number;
          total_reviews: number;
          is_active: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
          host_id: string | null;
          listing_type: string;
          expert_listed: boolean;
          external_calendars: any[];
          external_listings: any[];
          stats: {
            total_views: number;
            views_last_24h: number;
            monthly_revenue: Record<string, number>;
            monthly_bookings: Record<string, number>;
          };
          slug: string | null;
          is_premium: boolean;
          premium_plan: string;
          premium_expiry: string | null;
          premium_stats: {
            demand_level: string;
            last_updated: string | null;
            conversion_rate: number;
            visibility_score: number;
          };
          is_couple_friendly: boolean;
          accepts_local_ids: boolean;
          hourly_stay_available: boolean;
          is_private_space: boolean;
          instant_booking: boolean;
          no_brokerage: boolean;
          pay_at_property: boolean;
        };
        Insert: {
          title: string;
          description: string;
          property_type?: string;
          address: string;
          city: string;
          state: string;
          country?: string;
          latitude?: number;
          longitude?: number;
          price_full_day?: number | null;
          price_per_day?: number;
          bedrooms?: number;
          bathrooms?: number;
          max_guests?: number;
          amenities?: string[];
          images?: string[];
          is_active?: boolean;
          is_verified?: boolean;
          host_id?: string | null;
          listing_type?: string;
          expert_listed?: boolean;
          external_calendars?: any[];
          external_listings?: any[];
          stats?: any;
          slug?: string | null;
          is_premium?: boolean;
          premium_plan?: string;
          premium_expiry?: string | null;
          premium_stats?: any;
        };
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          property_id: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          check_in_date: string;
          check_out_date: string | null;
          checkin: string | null;
          checkout: string | null;
          booking_type: 'full_day' | 'half_day';
          time_slot: 'morning' | 'evening' | 'full' | null;
          num_guests: number;
          total_price: number;
          amount_total: number | null;
          status: 'pending' | 'confirmed' | 'cancelled';
          payment_status: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          payment_method: string | null;
          paid_at: string | null;
          special_requests: string | null;
          include_decoration: boolean;
          host_id: string | null;
          nights: number | null;
          source: string;
          created_at: string;
        };
        Insert: {
          property_id: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          check_in_date: string;
          check_out_date?: string | null;
          checkin?: string | null;
          checkout?: string | null;
          booking_type: 'full_day' | 'half_day';
          time_slot?: 'morning' | 'evening' | 'full' | null;
          num_guests: number;
          total_price: number;
          amount_total?: number | null;
          status?: 'pending' | 'confirmed' | 'cancelled';
          payment_status?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_method?: string | null;
          paid_at?: string | null;
          special_requests?: string | null;
          include_decoration?: boolean;
          host_id?: string | null;
          nights?: number | null;
          source?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      hosts: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string;
          bio: string;
          kyc_status: string;
          rating: number;
          total_bookings: number;
          total_views: number;
          subscription_status: string;
          subscription_provider_id: string | null;
          subscription_next_billing: string | null;
          subscription_start_date: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          payout_details: {
            upi: string;
            bank: string;
          };
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          name: string;
          email: string;
          phone: string;
          bio?: string;
          kyc_status?: string;
          subscription_status?: string;
          subscription_provider_id?: string | null;
          subscription_next_billing?: string | null;
          subscription_start_date?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payout_details?: any;
        };
        Update: Partial<Database['public']['Tables']['hosts']['Insert']>;
      };
      property_calendar_availability: {
        Row: {
          id: string;
          property_id: string;
          date: string;
          is_available: boolean;
          price_override: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          property_id: string;
          date: string;
          is_available?: boolean;
          price_override?: number | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['property_calendar_availability']['Insert']>;
      };
      view_events: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          timestamp: string;
          visitor_ip_hash: string | null;
          session_id: string | null;
          referrer: string | null;
        };
        Insert: {
          entity_type: string;
          entity_id: string;
          visitor_ip_hash?: string | null;
          session_id?: string | null;
          referrer?: string | null;
        };
        Update: Partial<Database['public']['Tables']['view_events']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          booking_id: string | null;
          guest_name: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          property_id: string;
          booking_id?: string | null;
          guest_name: string;
          rating: number;
          comment?: string | null;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
    };
  };
}

export type Property = Database['public']['Tables']['properties']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Host = Database['public']['Tables']['hosts']['Row'];
export type PropertyCalendarAvailability = Database['public']['Tables']['property_calendar_availability']['Row'];
export type ViewEvent = Database['public']['Tables']['view_events']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
