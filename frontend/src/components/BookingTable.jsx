export default function BookingTable({
  bookings,
  loading,
  onApprove,
  onReject,
  onCancel,
  onDelete,
}) {
  const shortId = (id) => {
    if (!id) return "";
    if (id.length <= 10) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  return (
    <div className="card table-card">
      <div className="card-header">
        <h2>All Bookings</h2>
        <p>Review booking requests and manage the workflow from one place.</p>
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
                <th>Booking</th>
                <th>Resource</th>
                <th>User</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Purpose</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="booking-cell">
                      <span className="booking-cell-label">ID</span>
                      <strong className="booking-id" title={booking.id}>
                        {shortId(booking.id)}
                      </strong>
                    </div>
                  </td>

                  <td>
                    <div className="booking-cell">
                      <span className="booking-cell-label">Resource</span>
                      <strong>{booking.resourceId}</strong>
                    </div>
                  </td>

                  <td>
                    <div className="booking-cell">
                      <span className="booking-cell-label">User</span>
                      <span>{booking.userId}</span>
                    </div>
                  </td>

                  <td>
                    <div className="booking-cell">
                      <span className="booking-cell-label">Date</span>
                      <span>{booking.date}</span>
                    </div>
                  </td>

                  <td>
                    <div className="booking-cell">
                      <span className="booking-cell-label">Time</span>
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="booking-cell">
                      <span className="booking-cell-label">Purpose</span>
                      <span>{booking.purpose}</span>
                    </div>
                  </td>

                  <td>
                    <div className="booking-cell">
                      <span className="booking-cell-label">Count</span>
                      <strong>{booking.expectedAttendees}</strong>
                    </div>
                  </td>

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