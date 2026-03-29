import { Link } from 'react-router-dom'
import type { Room } from '../types'

interface Props { room: Room }

const TYPE_COLORS: Record<string, string> = {
  standard: 'bg-blue-100 text-blue-700',
  deluxe:   'bg-purple-100 text-purple-700',
  suite:    'bg-brand-100 text-brand-700',
}

export default function RoomCard({ room }: Props) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        <img
          src={room.images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
          alt={room.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <span className={`absolute top-3 left-3 badge ${TYPE_COLORS[room.room_type] || 'bg-gray-100 text-gray-700'} capitalize`}>
          {room.room_type}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{room.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{room.description}</p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {room.amenities.slice(0, 3).map((a) => (
            <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
          ))}
          {room.amenities.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-2xl font-bold text-brand-600">₹{room.price_per_night.toLocaleString()}</span>
            <span className="text-gray-400 text-sm"> / night</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <span>👥</span>
            <span>Up to {room.capacity}</span>
          </div>
        </div>

        <Link to={`/rooms/${room._id}`} className="btn-primary text-center mt-4 block">
          View Details
        </Link>
      </div>
    </div>
  )
}
