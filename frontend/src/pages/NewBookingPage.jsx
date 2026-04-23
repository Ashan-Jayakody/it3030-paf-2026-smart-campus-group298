import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BOOKINGS_API = "http://localhost:8080/api/bookings";
const RESOURCES_API = "http://localhost:8080/api/resources";
const CURRENT_USER_ID = "USER-001";

function normalizeResource(resource) {
  return {
    id: resource.id,
    label:
      resource.name ||
      resource.resourceId ||
      resource.code ||
      resource.id ||
      "Unnamed Resource",
    status: resource.status || "ACTIVE",
  };
}

export default function NewBookingPage() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [errors, setErrors] = useState({});

  const minDate = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);

        const response = await fetch(RESOURCES_API);
        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }

        const data = await response.json();
        const normalized = Array.isArray(data) ? data.map(normalizeResource) : [];
        setResources(normalized.filter((item) => item.status === "ACTIVE"));
      } catch (err) {
        setServerError(err.message || "Failed to load resources.");
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
    setSuccessMessage("");
  };

  const validate = () => {
    const next = {};

    if (!form.resourceId) next.resourceId = "Resource is required";
    if (!form.date) next.date = "Date is required";
    if (!form.startTime) next.startTime = "Start time is required";
    if (!form.endTime) next.endTime = "End time is required";
    if (!form.purpose.trim()) next.purpose = "Purpose is required";

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      next.endTime = "End time must be later than start time";
    }

    if (form.expectedAttendees && Number(form.expectedAttendees) < 1) {
      next.expectedAttendees = "Expected attendees must be at least 1";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setServerError("");
      setSuccessMessage("");

      const payload = {
        resourceId: form.resourceId,
        userId: CURRENT_USER_ID,
        date: form.date,
        startTime: `${form.startTime}:00`,
        endTime: `${form.endTime}:00`,
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees
          ? Number(form.expectedAttendees)
          : 0,
      };

      const response = await fetch(BOOKINGS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Failed to create booking.";
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      setSuccessMessage("Booking request submitted successfully.");

      setTimeout(() => {
        navigate("/bookings");
      }, 700);
    } catch (err) {
      setServerError(err.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="uf-page-shell">
      <div className="uf-page">
        <div className="uf-form-wrap">
          <form className="uf-booking-form-card" onSubmit={handleSubmit}>
            <div className="uf-form-header">
              <h2>New Booking</h2>
              <p>Create a new resource booking request.</p>
            </div>

            {serverError ? <div className="uf-message-box error">{serverError}</div> : null}
            {successMessage ? (
              <div className="uf-message-box success">{successMessage}</div>
            ) : null}

            <div className="uf-form-group">
              <label>Resource *</label>
              <select
                value={form.resourceId}
                onChange={(e) => updateField("resourceId", e.target.value)}
                disabled={loadingResources}
              >
                <option value="">
                  {loadingResources ? "Loading resources..." : "Select a resource..."}
                </option>
                {resources.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.resourceId ? <small>{errors.resourceId}</small> : null}
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
                value={form.expectedAttendees}
                onChange={(e) => updateField("expectedAttendees", e.target.value)}
              />
              {errors.expectedAttendees ? (
                <small>{errors.expectedAttendees}</small>
              ) : null}
            </div>

            <div className="uf-form-actions">
              <Link to="/bookings" className="uf-cancel-btn">
                Cancel
              </Link>
              <button type="submit" className="uf-submit-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}