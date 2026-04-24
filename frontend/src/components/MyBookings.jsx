export default function MyBookings({ bookings }) {
  return (
    <div className="card my-bookings-card">
      <div className="card-header">
        <h2>My Bookings</h2>
        <p>Quick view of bookings for the current demo user.</p>
      </div>

      <div className="my-bookings-list">
        {bookings.length === 0 ? (
          <div className="empty-state">No bookings available for this user.</div>
        ) : (
          bookings.slice(0, 5).map((booking) => (
            <div className="mini-booking-card" key={booking.id}>
              <div className="mini-top">
                <strong>{booking.resourceId}</strong>
                <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>

              <p>{booking.purpose}</p>

              <div className="mini-meta">
                <span>{booking.date}</span>
                <span>
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}