import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { roomsApi } from '../api'
import type { Room } from '../types'
import RoomCard from '../components/RoomCard'
import { Loader, EmptyState } from '../components/UI'

const TYPES = ['all', 'standard', 'deluxe', 'suite']

export default function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    checkIn:   searchParams.get('check_in')  || '',
    checkOut:  searchParams.get('check_out') || '',
    roomType:  searchParams.get('room_type') || 'all',
    minPrice:  '',
    maxPrice:  '',
  })

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filters.checkIn)              params.check_in  = filters.checkIn
      if (filters.checkOut)             params.check_out = filters.checkOut
      if (filters.roomType !== 'all')   params.room_type = filters.roomType
      if (filters.minPrice)             params.min_price = filters.minPrice
      if (filters.maxPrice)             params.max_price = filters.maxPrice

      const res = await roomsApi.list(params)
      setRooms(res.data.data)
    } catch {
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRooms() }, []) // eslint-disable-line

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p: Record<string, string> = {}
    if (filters.checkIn)            p.check_in  = filters.checkIn
    if (filters.checkOut)           p.check_out = filters.checkOut
    if (filters.roomType !== 'all') p.room_type = filters.roomType
    setSearchParams(p)
    fetchRooms()
  }

  const handleReset = () => {
    setFilters({ checkIn: '', checkOut: '', roomType: 'all', minPrice: '', maxPrice: '' })
    setSearchParams({})
    setTimeout(fetchRooms, 100)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Rooms</h1>
      <p className="text-gray-500 mb-8">Find and book your perfect room</p>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="card p-5 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-in</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={filters.checkIn}
            onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
            className="input-field"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-out</label>
          <input
            type="date"
            min={filters.checkIn || new Date().toISOString().split('T')[0]}
            value={filters.checkOut}
            onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
            className="input-field"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Room Type</label>
          <select
            value={filters.roomType}
            onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
            className="input-field capitalize"
          >
            {TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t === 'all' ? 'All Types' : t}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Min Price (₹)</label>
          <input
            type="number" min="0"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="0"
            className="input-field"
          />
        </div>
        <div className="min-w-[120px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Max Price (₹)</label>
          <input
            type="number" min="0"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="Any"
            className="input-field"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">Search</button>
          <button type="button" onClick={handleReset} className="btn-outline">Reset</button>
        </div>
      </form>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {loading ? (
        <Loader text="Searching available rooms..." />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No rooms found"
          subtitle="Try adjusting your filters or dates."
          action={<button onClick={handleReset} className="btn-outline">Clear Filters</button>}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{rooms.length} room{rooms.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => <RoomCard key={room._id} room={room} />)}
          </div>
        </>
      )}
    </div>
  )
}
