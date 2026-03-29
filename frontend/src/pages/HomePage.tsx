import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState({ checkIn: '', checkOut: '', guests: '1' })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.checkIn)  params.set('check_in', search.checkIn)
    if (search.checkOut) params.set('check_out', search.checkOut)
    navigate(`/rooms?${params.toString()}`)
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 leading-tight">
            Your Perfect Stay<br />
            <span className="text-brand-400">Awaits You</span>
          </h1>
          <p className="text-lg text-white/80 mb-10">
            Discover luxury rooms, seamless booking, and unforgettable experiences at LuxeStay Hotel.
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-3 shadow-2xl"
          >
            <div className="flex-1 text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-in</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={search.checkIn}
                onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
                className="input-field text-gray-800"
              />
            </div>
            <div className="flex-1 text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-out</label>
              <input
                type="date"
                min={search.checkIn || new Date().toISOString().split('T')[0]}
                value={search.checkOut}
                onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
                className="input-field text-gray-800"
              />
            </div>
            <div className="sm:w-28 text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Guests</label>
              <select
                value={search.guests}
                onChange={(e) => setSearch({ ...search, guests: e.target.value })}
                className="input-field text-gray-800"
              >
                {[1,2,3,4].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="sm:self-end">
              <button type="submit" className="btn-primary w-full sm:w-auto whitespace-nowrap">
                🔍 Search Rooms
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose LuxeStay?</h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">
            We combine comfort, luxury, and convenience to make every stay memorable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🏆', title: 'Premium Rooms', desc: 'Carefully curated rooms from standard to presidential suites.' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Book in seconds. Confirmation arrives instantly.' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Your data and payments are always protected.' },
              { icon: '🛎️', title: '24/7 Support', desc: 'Our team is always here to assist you any time.' },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-brand-50 transition-colors">
                <span className="text-4xl">{f.icon}</span>
                <h3 className="font-semibold text-lg text-gray-800">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Room Types ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Room Categories</h2>
          <p className="text-gray-500 mb-12">From budget-friendly to ultra-luxury — we have the perfect room for you.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: 'Standard', emoji: '🛏️', price: '₹1,500', desc: 'Comfortable rooms with all essential amenities for a pleasant stay.', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop' },
              { type: 'Deluxe',   emoji: '✨', price: '₹4,000', desc: 'Spacious rooms with premium furnishings and stunning views.', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop' },
              { type: 'Suite',    emoji: '👑', price: '₹8,000', desc: 'Lavish suites with butler service, private pools and more.', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop' },
            ].map((r) => (
              <div
                key={r.type}
                onClick={() => navigate(`/rooms?room_type=${r.type.toLowerCase()}`)}
                className="card cursor-pointer hover:shadow-lg transition-shadow group"
              >
                <div className="h-48 overflow-hidden">
                  <img src={r.img} alt={r.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl">{r.emoji} {r.type}</h3>
                    <span className="text-brand-600 font-semibold">From {r.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready for an Unforgettable Stay?</h2>
        <p className="text-brand-100 mb-8 max-w-lg mx-auto">
          Browse our available rooms and book your perfect getaway in minutes.
        </p>
        <button onClick={() => navigate('/rooms')} className="bg-white text-brand-600 font-bold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors">
          Browse All Rooms →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8">
        <p className="text-sm">© 2025 LuxeStay Hotel · Built with FastAPI + React + MongoDB</p>
        <p className="text-xs mt-1 text-gray-600">BTech Sem 4 — Programming in Python with Full Stack Development</p>
      </footer>
    </div>
  )
}
