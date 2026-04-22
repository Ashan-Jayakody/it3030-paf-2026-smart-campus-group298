import { useState } from "react";

export default function BookingForm({ onSubmit, loading, defaultUserId }) {
  const [formData, setFormData] = useState({
    resourceId: "",
    userId: defaultUserId || "USER-001",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.resourceId.trim()) newErrors.resourceId = "Resource ID is required";
    if (!formData.userId.trim()) newErrors.userId = "User ID is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";

    if (!formData.expectedAttendees || Number(formData.expectedAttendees) < 1) {
      newErrors.expectedAttendees = "Expected attendees must be at least 1";
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime = "End time must be later than start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      ...formData,
      expectedAttendees: Number(formData.expectedAttendees),
      startTime: `${formData.startTime}:00`,
      endTime: `${formData.endTime}:00`,
    };

    await onSubmit(payload);

    setFormData((prev) => ({
      ...prev,
      resourceId: "",
      date: "",
      startTime: "",
      endTime: "",
      purpose: "",
      expectedAttendees: "",
    }));
  };

  return (
    <div className="card booking-form-card">
      <div className="card-header">
        <h2>Create Booking</h2>
        <p>Submit a new booking request for a campus resource.</p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Resource ID</label>
            <input
              type="text"
              name="resourceId"
              placeholder="e.g. LAB-01"
              value={formData.resourceId}
              onChange={handleChange}
            />
            {errors.resourceId && <small>{errors.resourceId}</small>}
          </div>

          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              name="userId"
              placeholder="e.g. USER-001"
              value={formData.userId}
              onChange={handleChange}
            />
            {errors.userId && <small>{errors.userId}</small>}
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
            {errors.date && <small>{errors.date}</small>}
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />
            {errors.startTime && <small>{errors.startTime}</small>}
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
            {errors.endTime && <small>{errors.endTime}</small>}
          </div>

          <div className="form-group">
            <label>Expected Attendees</label>
            <input
              type="number"
              name="expectedAttendees"
              placeholder="e.g. 25"
              value={formData.expectedAttendees}
              onChange={handleChange}
            />
            {errors.expectedAttendees && <small>{errors.expectedAttendees}</small>}
          </div>
        </div>

        <div className="form-group full-width">
          <label>Purpose</label>
          <textarea
            name="purpose"
            rows="4"
            placeholder="Enter the reason for the booking"
            value={formData.purpose}
            onChange={handleChange}
          />
          {errors.purpose && <small>{errors.purpose}</small>}
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Creating Booking..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
}