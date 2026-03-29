import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsApi } from '../api'
import type { Booking } from '../types'
import { Loader, EmptyState, BookingStatusBadge } from '../components/UI'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      const res = await bookingsApi.myBookings()
      setBookings(res.data.data)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(id)
    try {
      await bookingsApi.cancel(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Cancel failed'
      toast.error(msg)
    } finally {
      setCancelling(null)
    }
  }

  const nights = (ci: string, co: string) =>
    Math.max(1, Math.ceil((new Date(co).getTime() - new Date(ci).getTime()) / 86400000))

  if (loading) return <Loader text="Loading your bookings..." />

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-8">Manage all your hotel reservations</p>

      {bookings.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="No bookings yet"
          subtitle="You haven't made any reservations. Start exploring our rooms!"
          action={<Link to="/rooms" className="btn-primary">Browse Rooms</Link>}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5 flex flex-col sm:flex-row gap-4">
              {/* Room image */}
              {b.room_image && (
                <img
                  src={b.room_image}
                  alt={b.room_name}
                  className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{b.room_name || 'Room'}</h3>
                    <p className="text-sm text-gray-500 capitalize">{b.room_type} room</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Check-in</p>
                    <p className="font-medium text-gray-800">{new Date(b.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Check-out</p>
                    <p className="font-medium text-gray-800">{new Date(b.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Duration</p>
                    <p className="font-medium text-gray-800">{nights(b.check_in, b.check_out)} night{nights(b.check_in, b.check_out) > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                  <div className="text-brand-600 font-bold text-lg">
                    ₹{b.total_price.toLocaleString()}
                    <span className="text-gray-400 text-xs font-normal ml-1">total</span>
                  </div>
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      disabled={cancelling === b._id}
                      className="btn-danger text-sm px-4 py-1.5"
                    >
                      {cancelling === b._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
