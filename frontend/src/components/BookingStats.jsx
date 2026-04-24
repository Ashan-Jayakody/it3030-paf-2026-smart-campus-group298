export default function BookingStats({ stats }) {
  const cards = [
    { label: "Total Bookings", value: stats.total, className: "stat-total" },
    { label: "Pending", value: stats.pending, className: "stat-pending" },
    { label: "Approved", value: stats.approved, className: "stat-approved" },
    { label: "Rejected", value: stats.rejected, className: "stat-rejected" },
    { label: "Cancelled", value: stats.cancelled, className: "stat-cancelled" },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div className={`stat-card ${card.className}`} key={card.label}>
          <p>{card.label}</p>
          <h3>{card.value}</h3>
        </div>
      ))}
    </div>
  );
}