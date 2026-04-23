import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const BOOKINGS_API = "http://localhost:8080/api/bookings";
const RESOURCES_API = "http://localhost:8080/api/resources";
const CURRENT_USER_ID = "USER-001";

function StatusBadge({ status }) {
  const safeStatus = (status || "PENDING").toLowerCase();

  return (
    <span className={`uf-status-badge ${safeStatus}`}>
      {status || "PENDING"}
    </span>
  );
}

function ReasonModal({
  open,
  title,
  label,
  confirmText,
  confirmClass,
  loading,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="uf-modal-overlay">
      <div className="uf-modal-card">
        <div className="uf-modal-header">
          <h3>{title}</h3>
          <button type="button" className="uf-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="uf-modal-form" onSubmit={handleSubmit}>
          <label>{label}</label>
          <textarea
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason here..."
          />

          <div className="uf-modal-actions">
            <button type="button" className="uf-btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="submit"
              className={`uf-btn-primary ${confirmClass}`}
              disabled={loading || !reason.trim()}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function normalizeBooking(booking) {
  return {
    id: booking.id,
    resourceId: booking.resourceId || "-",
    userId: booking.userId || "-",
    date: booking.date || "-",
    startTime: booking.startTime || "",
    endTime: booking.endTime || "",
    time:
      booking.startTime && booking.endTime
        ? `${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}`
        : "-",
    purpose: booking.purpose || "-",
    status: booking.status || "PENDING",
    rejectionReason: booking.rejectionReason || "",
    cancelReason: booking.cancelReason || "",
    expectedAttendees: booking.expectedAttendees ?? 0,
  };
}

function normalizeResource(resource) {
  return {
    id: resource.id,
    name:
      resource.name ||
      resource.resourceId ||
      resource.code ||
      resource.id ||
      "Unnamed Resource",
    type: resource.type || "",
    location: resource.location || "",
    capacity: resource.capacity ?? "",
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("mine");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(false);

  const [modalState, setModalState] = useState({
    open: false,
    type: "",
    bookingId: "",
  });

  const resourceMap = useMemo(() => {
    const map = {};
    resources.forEach((resource) => {
      map[resource.id] = resource;
    });
    return map;
  }, [resources]);

  const fetchResources = async () => {
    const response = await fetch(RESOURCES_API);
    if (!response.ok) {
      throw new Error("Failed to load resources");
    }

    const data = await response.json();
    setResources(Array.isArray(data) ? data.map(normalizeResource) : []);
  };

  const fetchBookings = async () => {
    const response = await fetch(BOOKINGS_API);
    if (!response.ok) {
      throw new Error("Failed to load bookings");
    }

    const data = await response.json();
    setBookings(Array.isArray(data) ? data.map(normalizeBooking) : []);
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchResources()]);
    } catch (error) {
      setPageMessage({
        type: "error",
        text: error.message || "Failed to load page data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const enhancedBookings = useMemo(() => {
    return bookings.map((booking) => {
      const resource = resourceMap[booking.resourceId];

      return {
        ...booking,
        resourceName: resource?.name || booking.resourceId,
        resourceType: resource?.type || "",
        resourceLocation: resource?.location || "",
      };
    });
  }, [bookings, resourceMap]);

  const filteredBookings = useMemo(() => {
    let data = enhancedBookings;

    if (activeTab === "mine") {
      data = data.filter((item) => item.userId === CURRENT_USER_ID);
    }

    if (statusFilter !== "ALL") {
      data = data.filter((item) => item.status === statusFilter);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      data = data.filter(
        (item) =>
          item.resourceName.toLowerCase().includes(query) ||
          item.resourceId.toLowerCase().includes(query) ||
          item.userId.toLowerCase().includes(query) ||
          item.purpose.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query) ||
          item.resourceLocation.toLowerCase().includes(query)
      );
    }

    return data;
  }, [enhancedBookings, activeTab, statusFilter, search]);

  const showMessage = (type, text) => {
    setPageMessage({ type, text });
  };

  const approveBooking = async (id) => {
    try {
      setActionLoading(true);

      const response = await fetch(`${BOOKINGS_API}/${id}/approve`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve booking");
      }

      showMessage("success", "Booking approved successfully.");
      await loadPageData();
    } catch (error) {
      showMessage("error", error.message || "Failed to approve booking");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setModalState({
      open: true,
      type: "reject",
      bookingId: id,
    });
  };

  const openCancelModal = (id) => {
    setModalState({
      open: true,
      type: "cancel",
      bookingId: id,
    });
  };

  const closeModal = () => {
    setModalState({
      open: false,
      type: "",
      bookingId: "",
    });
  };

  const handleModalConfirm = async (reason) => {
    try {
      setActionLoading(true);

      const endpoint =
        modalState.type === "reject"
          ? `${BOOKINGS_API}/${modalState.bookingId}/reject`
          : `${BOOKINGS_API}/${modalState.bookingId}/cancel`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${modalState.type === "reject" ? "reject" : "cancel"} booking`
        );
      }

      showMessage(
        "success",
        modalState.type === "reject"
          ? "Booking rejected successfully."
          : "Booking cancelled successfully."
      );

      closeModal();
      await loadPageData();
    } catch (error) {
      showMessage(
        "error",
        error.message ||
          `Failed to ${modalState.type === "reject" ? "reject" : "cancel"} booking`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteBooking = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await fetch(`${BOOKINGS_API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete booking");
      }

      showMessage("success", "Booking deleted successfully.");
      await loadPageData();
    } catch (error) {
      showMessage("error", error.message || "Failed to delete booking");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="uf-page-shell">
      <div className="uf-page">
        <div className="uf-page-top">
          <div>
            <h1 className="uf-page-title">Bookings</h1>
            <p className="uf-page-subtitle">
              View and manage resource bookings with approval, rejection,
              cancellation, and conflict-aware workflow.
            </p>
          </div>

          <Link to="/bookings/new" className="uf-primary-link-btn">
            <span className="uf-plus">＋</span>
            <span>New Booking</span>
          </Link>
        </div>

        {pageMessage.text ? (
          <div className={`uf-message-box ${pageMessage.type}`}>
            {pageMessage.text}
          </div>
        ) : null}

        <div className="uf-tabs">
          <button
            className={`uf-tab ${activeTab === "mine" ? "active" : ""}`}
            onClick={() => setActiveTab("mine")}
          >
            My Bookings
          </button>
          <button
            className={`uf-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Bookings
          </button>
        </div>

        <div className="uf-toolbar">
          <div className="uf-search-box">
            <span className="uf-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by resource, purpose, user, location, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="uf-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="uf-table-shell">
          <table className="uf-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>User</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Attendees</th>
                <th>Status</th>
                <th className="uf-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="uf-empty-cell">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="uf-empty-cell">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <strong>{item.resourceName}</strong>
                        {item.resourceType || item.resourceLocation ? (
                          <div className="uf-reason" style={{ marginTop: 6 }}>
                            {[item.resourceType, item.resourceLocation]
                              .filter(Boolean)
                              .join(" • ")}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td>{item.userId}</td>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
                    <td>{item.purpose}</td>
                    <td>{item.expectedAttendees}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="uf-actions-col">
                      <div className="uf-row-actions">
                        <button
                          className="uf-icon-action approve"
                          onClick={() => approveBooking(item.id)}
                          disabled={item.status !== "PENDING" || actionLoading}
                          title="Approve"
                        >
                          ✓
                        </button>

                        <button
                          className="uf-icon-action reject"
                          onClick={() => openRejectModal(item.id)}
                          disabled={item.status !== "PENDING" || actionLoading}
                          title="Reject"
                        >
                          ✕
                        </button>

                        <button
                          className="uf-text-action cancel"
                          onClick={() => openCancelModal(item.id)}
                          disabled={
                            (item.status !== "PENDING" &&
                              item.status !== "APPROVED") ||
                            actionLoading
                          }
                        >
                          Cancel
                        </button>

                        <button
                          className="uf-text-action delete"
                          onClick={() => deleteBooking(item.id)}
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                      </div>

                      {item.rejectionReason ? (
                        <div className="uf-reason rejected">
                          Reject reason: {item.rejectionReason}
                        </div>
                      ) : null}

                      {item.cancelReason ? (
                        <div className="uf-reason cancelled">
                          Cancel reason: {item.cancelReason}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReasonModal
        open={modalState.open}
        title={modalState.type === "reject" ? "Reject Booking" : "Cancel Booking"}
        label={
          modalState.type === "reject"
            ? "Enter rejection reason"
            : "Enter cancellation reason"
        }
        confirmText={modalState.type === "reject" ? "Reject Booking" : "Cancel Booking"}
        confirmClass={modalState.type === "reject" ? "danger" : "warning"}
        loading={actionLoading}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}