import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BOOKINGS_API = "http://localhost:8080/api/bookings";
const RESOURCES_API = "http://localhost:8080/api/resources";
const CURRENT_USER_ID = "USER-001";

function Toast({ toast, onClose }) {
  if (!toast.show) return null;

  return (
    <div className={`uf-toast ${toast.type}`}>
      <div className="uf-toast-content">
        <strong>{toast.type === "success" ? "Success" : "Error"}</strong>
        <span>{toast.message}</span>
      </div>
      <button type="button" className="uf-toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

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
    capacity: resource.capacity ?? "",
    type: resource.type || "",
    location: resource.location || "",
  };
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTimeString() {
  const now = new Date();
  const hours = `${now.getHours()}`.padStart(2, "0");
  const minutes = `${now.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function toMinutes(time) {
  if (!time || !time.includes(":")) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatDuration(startTime, endTime) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start === null || end === null || end <= start) return "";

  const total = end - start;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

export default function NewBookingPage() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const today = useMemo(() => getTodayDateString(), []);
  const currentTime = useMemo(() => getCurrentTimeString(), []);

  const selectedResource = useMemo(
    () => resources.find((item) => item.id === form.resourceId),
    [resources, form.resourceId]
  );

  const durationText = useMemo(
    () => formatDuration(form.startTime, form.endTime),
    [form.startTime, form.endTime]
  );

  useEffect(() => {
    let timer;
    if (toast.show) {
      timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [toast.show]);

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);

        const response = await fetch(RESOURCES_API);
        if (!response.ok) {
          throw new Error("Failed to load resources");
        }

        const data = await response.json();
        const normalized = Array.isArray(data) ? data.map(normalizeResource) : [];
        setResources(normalized.filter((item) => item.status === "ACTIVE"));
      } catch (error) {
        showToast("error", error.message || "Failed to load resources.");
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

  const getFieldError = (fieldName, value, draft) => {
    const currentForm = draft || form;
    const currentValue = value ?? currentForm[fieldName];

    if (fieldName === "resourceId") {
      if (!currentValue) return "Please select a resource.";
      return "";
    }

    if (fieldName === "date") {
      if (!currentValue) return "Please select a booking date.";
      if (currentValue < today) return "Past dates are not allowed.";
      return "";
    }

    if (fieldName === "startTime") {
      if (!currentValue) return "Please select a start time.";

      if (
        currentForm.date &&
        currentForm.date === today &&
        currentValue < currentTime
      ) {
        return "Start time cannot be earlier than the current time.";
      }

      if (
        currentForm.endTime &&
        toMinutes(currentValue) !== null &&
        toMinutes(currentForm.endTime) !== null &&
        toMinutes(currentForm.endTime) <= toMinutes(currentValue)
      ) {
        return "Start time must be earlier than end time.";
      }

      return "";
    }

    if (fieldName === "endTime") {
      if (!currentValue) return "Please select an end time.";

      if (
        currentForm.startTime &&
        toMinutes(currentValue) !== null &&
        toMinutes(currentForm.startTime) !== null &&
        toMinutes(currentValue) <= toMinutes(currentForm.startTime)
      ) {
        return "End time must be later than start time.";
      }

      return "";
    }

    if (fieldName === "purpose") {
      const trimmed = String(currentValue || "").trim();
      if (!trimmed) return "Please enter a purpose.";
      if (trimmed.length < 5) return "Purpose must be at least 5 characters long.";
      return "";
    }

    if (fieldName === "expectedAttendees") {
      if (currentValue === "" || currentValue === null || currentValue === undefined) {
        return "Please enter expected attendees.";
      }

      if (Number.isNaN(Number(currentValue))) {
        return "Expected attendees must be a number.";
      }

      if (Number(currentValue) < 1) {
        return "Expected attendees must be at least 1.";
      }

      if (
        selectedResource &&
        selectedResource.capacity &&
        Number(currentValue) > Number(selectedResource.capacity)
      ) {
        return `Attendees cannot exceed resource capacity (${selectedResource.capacity}).`;
      }

      return "";
    }

    return "";
  };

  const validateAll = (draftForm = form) => {
    const nextErrors = {
      resourceId: getFieldError("resourceId", draftForm.resourceId, draftForm),
      date: getFieldError("date", draftForm.date, draftForm),
      startTime: getFieldError("startTime", draftForm.startTime, draftForm),
      endTime: getFieldError("endTime", draftForm.endTime, draftForm),
      purpose: getFieldError("purpose", draftForm.purpose, draftForm),
      expectedAttendees: getFieldError(
        "expectedAttendees",
        draftForm.expectedAttendees,
        draftForm
      ),
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((item) => !item);
  };

  const updateField = (name, value) => {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    const nextErrors = { ...errors };

    nextErrors[name] = touched[name] ? getFieldError(name, value, nextForm) : "";

    if (name === "date" || name === "startTime" || name === "endTime") {
      if (touched.date) {
        nextErrors.date = getFieldError("date", nextForm.date, nextForm);
      }
      if (touched.startTime || name === "endTime" || name === "date") {
        nextErrors.startTime = touched.startTime
          ? getFieldError("startTime", nextForm.startTime, nextForm)
          : nextErrors.startTime;
      }
      if (touched.endTime || name === "startTime" || name === "date") {
        nextErrors.endTime = touched.endTime
          ? getFieldError("endTime", nextForm.endTime, nextForm)
          : nextErrors.endTime;
      }
    }

    if (name === "resourceId" || name === "expectedAttendees") {
      if (touched.expectedAttendees) {
        nextErrors.expectedAttendees = getFieldError(
          "expectedAttendees",
          nextForm.expectedAttendees,
          nextForm
        );
      }
    }

    setErrors(nextErrors);
  };

  const handleBlur = (fieldName) => {
    const nextTouched = { ...touched, [fieldName]: true };
    setTouched(nextTouched);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: getFieldError(fieldName),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {
      resourceId: true,
      date: true,
      startTime: true,
      endTime: true,
      purpose: true,
      expectedAttendees: true,
    };
    setTouched(allTouched);

    const isValid = validateAll();
    if (!isValid) {
      showToast("error", "Please fix the highlighted form errors.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        resourceId: form.resourceId,
        userId: CURRENT_USER_ID,
        date: form.date,
        startTime: `${form.startTime}:00`,
        endTime: `${form.endTime}:00`,
        purpose: form.purpose.trim(),
        expectedAttendees: Number(form.expectedAttendees),
      };

      const response = await fetch(BOOKINGS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      showToast("success", "Booking created successfully.");

      setTimeout(() => {
        navigate("/bookings");
      }, 900);
    } catch (error) {
      showToast("error", error.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      form.resourceId &&
      form.date &&
      form.startTime &&
      form.endTime &&
      form.purpose.trim() &&
      form.expectedAttendees &&
      !getFieldError("resourceId", form.resourceId, form) &&
      !getFieldError("date", form.date, form) &&
      !getFieldError("startTime", form.startTime, form) &&
      !getFieldError("endTime", form.endTime, form) &&
      !getFieldError("purpose", form.purpose, form) &&
      !getFieldError("expectedAttendees", form.expectedAttendees, form)
    );
  }, [form, selectedResource, today, currentTime]);

  return (
    <div className="uf-page-shell">
      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />

      <div className="uf-page">
        <div className="uf-form-wrap">
          <form className="uf-booking-form-card" onSubmit={handleSubmit}>
            <div className="uf-form-header">
              <h2>New Booking</h2>
              <p>Create a new resource booking request with real-time validation.</p>
            </div>

            <div className="uf-form-group">
              <label>Resource *</label>
              <select
                value={form.resourceId}
                onChange={(e) => updateField("resourceId", e.target.value)}
                onBlur={() => handleBlur("resourceId")}
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

            {selectedResource ? (
              <div className="uf-resource-info">
                <div>
                  <span>Type</span>
                  <strong>{selectedResource.type || "-"}</strong>
                </div>
                <div>
                  <span>Capacity</span>
                  <strong>{selectedResource.capacity || "-"}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{selectedResource.location || "-"}</strong>
                </div>
              </div>
            ) : null}

            <div className="uf-form-group">
              <label>Date *</label>
              <input
                type="date"
                min={today}
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                onBlur={() => handleBlur("date")}
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
                  onBlur={() => handleBlur("startTime")}
                />
                {errors.startTime ? <small>{errors.startTime}</small> : null}
              </div>

              <div className="uf-form-group">
                <label>End Time *</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  onBlur={() => handleBlur("endTime")}
                />
                {errors.endTime ? <small>{errors.endTime}</small> : null}
              </div>
            </div>

            {durationText ? (
              <div className="uf-live-helper">Booking duration: {durationText}</div>
            ) : null}

            <div className="uf-form-group">
              <label>Purpose *</label>
              <textarea
                rows="4"
                placeholder="Describe the purpose of your booking..."
                value={form.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                onBlur={() => handleBlur("purpose")}
              />
              {errors.purpose ? <small>{errors.purpose}</small> : null}
            </div>

            <div className="uf-form-group">
              <label>Expected Attendees *</label>
              <input
                type="number"
                min="1"
                placeholder="Number of attendees"
                value={form.expectedAttendees}
                onChange={(e) => updateField("expectedAttendees", e.target.value)}
                onBlur={() => handleBlur("expectedAttendees")}
              />
              {errors.expectedAttendees ? <small>{errors.expectedAttendees}</small> : null}
            </div>

            {selectedResource?.capacity ? (
              <div className="uf-live-helper">
                Resource capacity: {selectedResource.capacity}
              </div>
            ) : null}

            <div className="uf-form-actions">
              <Link to="/bookings" className="uf-cancel-btn">
                Cancel
              </Link>
              <button
                type="submit"
                className="uf-submit-btn"
                disabled={submitting || !isFormValid}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}