import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const currentUser = {
  name: "Anbalagan Shajievan",
  role: "Administrator",
  initial: "A",
  notifications: 19,
};

const resources = [
  "Mini Auditorium 01",
  "Lecture room G1105",
  "Computer Lab CL201",
  "Board Room BR102",
];

function Sidebar() {
  const items = [
    "Dashboard",
    "Facilities",
    "Bookings",
    "Incidents",
    "Notifications",
    "User Management",
  ];

  return (
    <aside className="uf-sidebar">
      <div className="uf-brand">
        <div className="uf-brand-icon">U</div>
        <div>
          <div className="uf-brand-title">UniFlow</div>
          <div className="uf-brand-subtitle">SmartCampus</div>
        </div>
      </div>

      <nav className="uf-nav">
        {items.map((item) => (
          <div
            key={item}
            className={`uf-nav-item ${item === "Bookings" ? "active" : ""}`}
          >
            <span className="uf-nav-dot" />
            <span>{item}</span>
          </div>
        ))}
      </nav>

      <div className="uf-sidebar-footer">
        <div className="uf-profile-pill">
          <div className="uf-profile-dot">N</div>
          <span>Profile</span>
        </div>
      </div>
    </aside>
  );
}

function HeaderBar() {
  return (
    <div className="uf-header">
      <div className="uf-header-title">UniFlow</div>

      <div className="uf-header-right">
        <div className="uf-bell-wrap">
          <span className="uf-bell">🔔</span>
          <span className="uf-bell-badge">{currentUser.notifications}</span>
        </div>

        <div className="uf-user-text">
          <div className="uf-user-name">{currentUser.name}</div>
          <div className="uf-user-role">{currentUser.role}</div>
        </div>

        <div className="uf-user-avatar">{currentUser.initial}</div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    resource: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  });

  const [errors, setErrors] = useState({});

  const minDate = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};

    if (!form.resource) next.resource = "Resource is required";
    if (!form.date) next.date = "Date is required";
    if (!form.startTime) next.startTime = "Start time is required";
    if (!form.endTime) next.endTime = "End time is required";
    if (!form.purpose.trim()) next.purpose = "Purpose is required";

    if (
      form.startTime &&
      form.endTime &&
      form.startTime >= form.endTime
    ) {
      next.endTime = "End time must be later than start time";
    }

    if (form.attendees && Number(form.attendees) < 1) {
      next.attendees = "Expected attendees must be at least 1";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    alert("Booking request submitted");
    navigate("/bookings");
  };

  return (
    <div className="uf-layout">
      <Sidebar />

      <main className="uf-main">
        <HeaderBar />

        <div className="uf-page">
          <div className="uf-form-wrap">
            <form className="uf-booking-form-card" onSubmit={handleSubmit}>
              <div className="uf-form-group">
                <label>Resource *</label>
                <select
                  value={form.resource}
                  onChange={(e) => updateField("resource", e.target.value)}
                >
                  <option value="">Select a resource...</option>
                  {resources.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.resource ? <small>{errors.resource}</small> : null}
              </div>

              <div className="uf-form-group">
                <label>Date *</label>
                <input
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
                {errors.date ? <small>{errors.date}</small> : null}
              </div>

              <div className="uf-form-row">
                <div className="uf-form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => updateField("startTime", e.target.value)}
                  />
                  {errors.startTime ? <small>{errors.startTime}</small> : null}
                </div>

                <div className="uf-form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => updateField("endTime", e.target.value)}
                  />
                  {errors.endTime ? <small>{errors.endTime}</small> : null}
                </div>
              </div>

              <div className="uf-form-group">
                <label>Purpose *</label>
                <textarea
                  rows="4"
                  placeholder="Describe the purpose of your booking..."
                  value={form.purpose}
                  onChange={(e) => updateField("purpose", e.target.value)}
                />
                {errors.purpose ? <small>{errors.purpose}</small> : null}
              </div>

              <div className="uf-form-group">
                <label>Expected Attendees</label>
                <input
                  type="number"
                  placeholder="Number of attendees"
                  value={form.attendees}
                  onChange={(e) => updateField("attendees", e.target.value)}
                />
                {errors.attendees ? <small>{errors.attendees}</small> : null}
              </div>

              <div className="uf-form-actions">
                <Link to="/bookings" className="uf-cancel-btn">
                  Cancel
                </Link>
                <button type="submit" className="uf-submit-btn">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}