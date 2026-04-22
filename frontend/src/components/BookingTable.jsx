export default function BookingTable({
  bookings,
  loading,
  onApprove,
  onReject,
  onCancel,
  onDelete,
}) {
  return (
    <div className="card table-card">
      <div className="card-header">
        <h2>All Bookings</h2>
        <p>Review booking requests and perform workflow actions.</p>
      </div>

      {loading ? (
        <div className="empty-state">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">No bookings found.</div>
      ) : (
        <div className="table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Resource</th>
                <th>User</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="booking-id">{booking.id}</td>
                  <td>{booking.resourceId}</td>
                  <td>{booking.userId}</td>
                  <td>{booking.date}</td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>{booking.purpose}</td>
                  <td>{booking.expectedAttendees}</td>
                  <td>
                    <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn approve-btn"
                        onClick={() => onApprove(booking.id)}
                        disabled={booking.status !== "PENDING"}
                      >
                        Approve
                      </button>

                      <button
                        className="action-btn reject-btn"
                        onClick={() => onReject(booking.id)}
                        disabled={booking.status !== "PENDING"}
                      >
                        Reject
                      </button>

                      <button
                        className="action-btn cancel-btn"
                        onClick={() => onCancel(booking.id)}
                        disabled={
                          booking.status !== "PENDING" &&
                          booking.status !== "APPROVED"
                        }
                      >
                        Cancel
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => onDelete(booking.id)}
                      >
                        Delete
                      </button>
                    </div>

                    {booking.rejectionReason && (
                      <div className="reason-text rejected-text">
                        Reject reason: {booking.rejectionReason}
                      </div>
                    )}

                    {booking.cancelReason && (
                      <div className="reason-text cancelled-text">
                        Cancel reason: {booking.cancelReason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}