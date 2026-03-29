export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  is_active: boolean
}

export interface Room {
  _id: string
  name: string
  room_type: 'standard' | 'deluxe' | 'suite'
  description: string
  price_per_night: number
  capacity: number
  amenities: string[]
  images: string[]
  is_available: boolean
}

export interface Booking {
  _id: string
  user_id: string
  room_id: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests?: string
  room_name?: string
  room_type?: string
  room_image?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}
