import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { bookingsApi, roomsApi } from '../api'
import type { Booking, Room } from '../types'
import { Loader, BookingStatusBadge } from '../components/UI'

type Tab = 'bookings' | 'rooms'

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [bRes, rRes] = await Promise.all([bookingsApi.all(), roomsApi.list()])
      setBookings(bRes.data.data)
      setRooms(rRes.data.data)
    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleStatusChange = async (bookingId: string, status: string) => {
    setUpdating(bookingId)
    try {
      await bookingsApi.updateStatus(bookingId, status)
      toast.success(`Status updated to ${status}`)
      fetchAll()
    } catch {
      toast.error('Update failed')
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleRoom = async (room: Room) => {
    try {
      await roomsApi.update(room._id, { is_available: !room.is_available })
      toast.success(`Room marked as ${!room.is_available ? 'available' : 'unavailable'}`)
      fetchAll()
    } catch {
      toast.error('Update failed')
    }
  }

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Delete this room permanently?')) return
    try {
      await roomsApi.delete(id)
      toast.success('Room deleted')
      fetchAll()
    } catch {
      toast.error('Delete failed')
    }
  }

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    revenue: bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.total_price, 0),
  }

  if (loading) return <Loader text="Loading admin dashboard..." />

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage bookings and rooms</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: stats.total, color: 'bg-blue-50 text-blue-700', icon: '📋' },
          { label: 'Pending',        value: stats.pending, color: 'bg-yellow-50 text-yellow-700', icon: '⏳' },
          { label: 'Confirmed',      value: stats.confirmed, color: 'bg-green-50 text-green-700', icon: '✅' },
          { label: 'Revenue (₹)',    value: `₹${stats.revenue.toLocaleString()}`, color: 'bg-brand-50 text-brand-700', icon: '💰' },
        ].map((s) => (
          <div key={s.label} className={`card p-5 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm opacity-75 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {(['bookings', 'rooms'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-medium text-sm capitalize transition ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'bookings' ? `📋 Bookings (${bookings.length})` : `🏨 Rooms (${rooms.length})`}
          </button>
        ))}
      </div>

      {/* ── Bookings Tab ─────────────────────────────────────────────── */}
      {tab === 'bookings' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Room', 'Guest', 'Check-in', 'Check-out', 'Guests', 'Total', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[140px] truncate">{b.room_name || b.room_id.slice(-6)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{b.user_id.slice(-8)}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(b.check_in).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(b.check_out).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-600">{b.guests}</td>
                    <td className="px-4 py-3 font-semibold text-brand-600">₹{b.total_price.toLocaleString()}</td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        disabled={updating === b._id}
                        onChange={(e) => handleStatusChange(b._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="text-center py-12 text-gray-400">No bookings yet</div>
            )}
          </div>
        </div>
      )}

      {/* ── Rooms Tab ────────────────────────────────────────────────── */}
      {tab === 'rooms' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Room', 'Type', 'Price/Night', 'Capacity', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rooms.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={r.images[0]} alt={r.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium text-gray-900 max-w-[140px] truncate">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{r.room_type}</td>
                    <td className="px-4 py-3 font-semibold text-brand-600">₹{r.price_per_night.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{r.capacity} guests</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${r.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {r.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleRoom(r)}
                          className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition"
                        >
                          {r.is_available ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r._id)}
                          className="text-xs border border-red-200 text-red-500 px-3 py-1 rounded-lg hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
