import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { roomsApi, bookingsApi } from '../api'
import type { Room } from '../types'
import { Loader } from '../components/UI'
import { useAuthStore } from '../store/authStore'

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({
    checkIn: '', checkOut: '', guests: 1, specialRequests: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        const res = await roomsApi.getById(id!)
        setRoom(res.data.data)
      } catch {
        toast.error('Room not found')
        navigate('/rooms')
      } finally {
        setLoading(false)
      }
    })()
  }, [id]) // eslint-disable-line

  const nights = booking.checkIn && booking.checkOut
    ? Math.max(0, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))
    : 0

  const totalPrice = nights * (room?.price_per_night || 0)

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to book a room')
      navigate('/login')
      return
    }
    if (nights < 1) { toast.error('Please select valid dates'); return }

    setSubmitting(true)
    try {
      await bookingsApi.create({
        room_id: id,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests: booking.guests,
        special_requests: booking.specialRequests || undefined,
      })
      toast.success('🎉 Booking confirmed! Check your bookings.')
      navigate('/my-bookings')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Booking failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader text="Loading room details..." />
  if (!room) return null

  const TYPE_COLORS: Record<string, string> = {
    standard: 'bg-blue-100 text-blue-700',
    deluxe:   'bg-purple-100 text-purple-700',
    suite:    'bg-brand-100 text-brand-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-brand-600 hover:underline text-sm mb-6 flex items-center gap-1">
        ← Back to Rooms
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Room info ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="card overflow-hidden">
            <div className="h-72 sm:h-96 overflow-hidden">
              <img
                src={room.images[activeImg] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>
            {room.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {room.images.map((img, i) => (
                  <img
                    key={i} src={img} alt={`view-${i}`}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 object-cover rounded-lg cursor-pointer border-2 transition ${i === activeImg ? 'border-brand-500' : 'border-transparent'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
                <span className={`badge capitalize mt-1 ${TYPE_COLORS[room.room_type] || ''}`}>{room.room_type}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-brand-600">₹{room.price_per_night.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">per night</div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">{room.description}</p>

            <div className="flex gap-4 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">👥 Up to {room.capacity} guests</span>
              <span className={`flex items-center gap-1 ${room.is_available ? 'text-green-600' : 'text-red-500'}`}>
                {room.is_available ? '✅ Available' : '❌ Unavailable'}
              </span>
            </div>
          </div>

          {/* Amenities */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-brand-500">✓</span> {a}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Booking form ──────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-xl text-gray-900 mb-5">Book This Room</h2>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date" required
                  min={new Date().toISOString().split('T')[0]}
                  value={booking.checkIn}
                  onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date" required
                  min={booking.checkIn || new Date().toISOString().split('T')[0]}
                  value={booking.checkOut}
                  onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                <select
                  value={booking.guests}
                  onChange={(e) => setBooking({ ...booking, guests: Number(e.target.value) })}
                  className="input-field"
                >
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests <span className="text-gray-400">(optional)</span></label>
                <textarea
                  rows={3}
                  value={booking.specialRequests}
                  onChange={(e) => setBooking({ ...booking, specialRequests: e.target.value })}
                  placeholder="Any special requirements..."
                  className="input-field resize-none"
                />
              </div>

              {/* Price summary */}
              {nights > 0 && (
                <div className="bg-brand-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>₹{room.price_per_night.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-brand-200 pt-2 flex justify-between font-bold text-brand-700 text-base">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting || !room.is_available} className="btn-primary w-full text-base py-3">
                {submitting ? 'Booking...' : isAuthenticated ? '📅 Confirm Booking' : '🔒 Login to Book'}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-gray-400">You need to be logged in to make a booking</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
