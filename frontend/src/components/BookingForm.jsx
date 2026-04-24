import { useEffect, useMemo, useState } from "react";
import httpClient from "../api/httpClient";
import { useAuth } from "../auth/useAuth";

const RESOURCE_API = "/resources";

export default function BookingForm({ onSubmit, loading, defaultUserId }) {
  const { user } = useAuth();
  const CURRENT_USER_ID = user?.id || user?.email || defaultUserId || "USER-001";
  
  const [resources, setResources] = useState([]);
  const [resourceLoading, setResourceLoading] = useState(false);

  const [formData, setFormData] = useState({
    resourceId: "",
    userId: CURRENT_USER_ID,
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setResourceLoading(true);
        const response = await httpClient.get(RESOURCE_API);
        setResources(response.data || []);
      } catch (error) {
        console.error("Failed to load resources", error);
      } finally {
        setResourceLoading(false);
      }
    };

    fetchResources();
  }, []);

  const activeResources = useMemo(() => {
    return resources.filter((resource) => resource.status === "AVAILABLE");
  }, [resources]);

  const selectedResource = useMemo(() => {
    return resources.find((resource) => resource.id === formData.resourceId) || null;
  }, [resources, formData.resourceId]);

  const validate = () => {
    const newErrors = {};

    if (!formData.resourceId.trim()) newErrors.resourceId = "Please select a resource";
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

    if (
      selectedResource &&
      formData.expectedAttendees &&
      Number(formData.expectedAttendees) > Number(selectedResource.capacity || 0)
    ) {
      newErrors.expectedAttendees = `Attendees cannot exceed resource capacity (${selectedResource.capacity})`;
    }

    if (selectedResource && selectedResource.status !== "AVAILABLE") {
      newErrors.resourceId = "Selected resource is not available for booking";
    }

    if (selectedResource && selectedResource.availabilityWindows) {
      const parts = selectedResource.availabilityWindows.split('-');
      if (parts.length === 2) {
        const [from, to] = parts;
        if (formData.startTime && formData.startTime < from) {
          newErrors.startTime = `Must be after ${from} (available range: ${from} - ${to})`;
        }
        if (formData.endTime && formData.endTime > to) {
          newErrors.endTime = `Must be before ${to} (available range: ${from} - ${to})`;
        }
      }
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
            <label>Select Resource</label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              disabled={resourceLoading}
            >
              <option value="">
                {resourceLoading ? "Loading resources..." : "Choose a resource"}
              </option>

              {activeResources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} • {resource.type} • {resource.location}
                </option>
              ))}
            </select>
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

        {selectedResource && (
          <div className="resource-preview">
            <div className="resource-preview-header">
              <h3>Selected Resource Details</h3>
            </div>

            <div className="resource-preview-grid">
              <div>
                <span className="resource-label">Name</span>
                <strong>{selectedResource.name}</strong>
              </div>
              <div>
                <span className="resource-label">Type</span>
                <strong>{selectedResource.type}</strong>
              </div>
              <div>
                <span className="resource-label">Location</span>
                <strong>{selectedResource.location}</strong>
              </div>
              <div>
                <span className="resource-label">Capacity</span>
                <strong>{selectedResource.capacity}</strong>
              </div>
              <div>
                <span className="resource-label">Status</span>
                <strong>{selectedResource.status}</strong>
              </div>
            </div>
          </div>
        )}

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

        <button className="primary-btn" type="submit" disabled={loading || resourceLoading}>
          {loading ? "Creating Booking..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
}