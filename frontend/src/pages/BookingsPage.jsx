<<<<<<< HEAD
export default function BookingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Bookings</h1>
      <p className="text-slate-500 mt-1">Member 2 — coming soon</p>
    </div>
  )
=======
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  CircleAlert,
  CircleSlash,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import "../styles/bookings.css";

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

function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  confirmClass,
  loading,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="uf-modal-overlay">
      <div className="uf-modal-card uf-confirm-modal">
        <div className="uf-modal-header">
          <h3>{title}</h3>
          <button type="button" className="uf-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="uf-confirm-content">
          <p>{message}</p>
        </div>

        <div className="uf-modal-actions">
          <button type="button" className="uf-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className={`uf-btn-primary ${confirmClass}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReasonActionModal({
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

function ReasonViewModal({ open, title, reason, onClose }) {
  if (!open) return null;

  return (
    <div className="uf-modal-overlay">
      <div className="uf-modal-card uf-reason-view-modal">
        <div className="uf-modal-header">
          <h3>{title}</h3>
          <button type="button" className="uf-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="uf-reason-view-content">
          <p>{reason || "No reason available."}</p>
        </div>

        <div className="uf-modal-actions">
          <button type="button" className="uf-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingDetailsModal({ open, booking, onClose }) {
  if (!open || !booking) return null;

  return (
    <div className="uf-modal-overlay">
      <div className="uf-modal-card uf-details-modal">
        <div className="uf-modal-header">
          <h3>Booking Details</h3>
          <button type="button" className="uf-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="uf-details-grid">
          <div className="uf-detail-item">
            <span>Resource</span>
            <strong>{booking.resourceName}</strong>
          </div>

          <div className="uf-detail-item">
            <span>Type</span>
            <strong>{booking.resourceType || "-"}</strong>
          </div>

          <div className="uf-detail-item">
            <span>Location</span>
            <strong>{booking.resourceLocation || "-"}</strong>
          </div>

          <div className="uf-detail-item">
            <span>User ID</span>
            <strong>{booking.userId}</strong>
          </div>

          <div className="uf-detail-item">
            <span>Date</span>
            <strong>{booking.date}</strong>
          </div>

          <div className="uf-detail-item">
            <span>Time</span>
            <strong>{booking.time}</strong>
          </div>

          <div className="uf-detail-item">
            <span>Expected Attendees</span>
            <strong>{booking.expectedAttendees}</strong>
          </div>

          <div className="uf-detail-item">
            <span>Status</span>
            <div className="uf-detail-status-wrap">
              <StatusBadge status={booking.status} />
            </div>
          </div>
        </div>

        <div className="uf-detail-block">
          <span>Purpose</span>
          <p>{booking.purpose || "-"}</p>
        </div>

        {booking.rejectionReason ? (
          <div className="uf-detail-block uf-detail-block--danger">
            <span>Rejection Reason</span>
            <p>{booking.rejectionReason}</p>
          </div>
        ) : null}

        {booking.cancelReason ? (
          <div className="uf-detail-block uf-detail-block--warning">
            <span>Cancellation Reason</span>
            <p>{booking.cancelReason}</p>
          </div>
        ) : null}

        <div className="uf-modal-actions">
          <button type="button" className="uf-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
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
  };
}

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return "-";
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function sortBookings(list, sortBy) {
  const sorted = [...list];

  if (sortBy === "date_desc") {
    sorted.sort((a, b) => {
      const aKey = `${a.date} ${a.startTime}`;
      const bKey = `${b.date} ${b.startTime}`;
      return bKey.localeCompare(aKey);
    });
  }

  if (sortBy === "date_asc") {
    sorted.sort((a, b) => {
      const aKey = `${a.date} ${a.startTime}`;
      const bKey = `${b.date} ${b.startTime}`;
      return aKey.localeCompare(bKey);
    });
  }

  if (sortBy === "status") {
    const order = {
      PENDING: 1,
      APPROVED: 2,
      REJECTED: 3,
      CANCELLED: 4,
    };
    sorted.sort((a, b) => {
      const aRank = order[a.status] || 99;
      const bRank = order[b.status] || 99;
      if (aRank !== bRank) return aRank - bRank;

      const aKey = `${a.date} ${a.startTime}`;
      const bKey = `${b.date} ${b.startTime}`;
      return bKey.localeCompare(aKey);
    });
  }

  return sorted;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mine");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date_desc");
  const [actionLoading, setActionLoading] = useState(false);

  const [actionModalState, setActionModalState] = useState({
    open: false,
    type: "",
    bookingId: "",
  });

  const [viewReasonState, setViewReasonState] = useState({
    open: false,
    title: "",
    reason: "",
  });

  const [detailsState, setDetailsState] = useState({
    open: false,
    booking: null,
  });

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: "",
    bookingId: "",
    title: "",
    message: "",
    confirmText: "",
    confirmClass: "",
  });

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const resourceMap = useMemo(() => {
    const map = {};
    resources.forEach((resource) => {
      map[resource.id] = resource;
    });
    return map;
  }, [resources]);

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

  const fetchResources = async () => {
    const response = await fetch(RESOURCES_API);
    if (!response.ok) throw new Error("Failed to load resources");
    const data = await response.json();
    setResources(Array.isArray(data) ? data.map(normalizeResource) : []);
  };

  const fetchBookings = async () => {
    const response = await fetch(BOOKINGS_API);
    if (!response.ok) throw new Error("Failed to load bookings");
    const data = await response.json();
    setBookings(Array.isArray(data) ? data.map(normalizeBooking) : []);
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchResources()]);
    } catch (error) {
      showToast("error", error.message || "Failed to load page data");
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
        time: formatTimeRange(booking.startTime, booking.endTime),
        resourceName: resource?.name || booking.resourceId,
        resourceType: resource?.type || "",
        resourceLocation: resource?.location || "",
      };
    });
  }, [bookings, resourceMap]);

  const resourceOptions = useMemo(() => {
    return [...resources].sort((a, b) => a.name.localeCompare(b.name));
  }, [resources]);

  const summaryStats = useMemo(() => {
    const source =
      activeTab === "mine"
        ? enhancedBookings.filter((item) => item.userId === CURRENT_USER_ID)
        : enhancedBookings;

    return {
      total: source.length,
      pending: source.filter((item) => item.status === "PENDING").length,
      approved: source.filter((item) => item.status === "APPROVED").length,
      rejected: source.filter((item) => item.status === "REJECTED").length,
      cancelled: source.filter((item) => item.status === "CANCELLED").length,
    };
  }, [enhancedBookings, activeTab]);

  const filteredBookings = useMemo(() => {
    let data = enhancedBookings;

    if (activeTab === "mine") {
      data = data.filter((item) => item.userId === CURRENT_USER_ID);
    }

    if (statusFilter !== "ALL") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (dateFilter) {
      data = data.filter((item) => item.date === dateFilter);
    }

    if (resourceFilter !== "ALL") {
      data = data.filter((item) => item.resourceId === resourceFilter);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      data = data.filter(
        (item) =>
          item.resourceName.toLowerCase().includes(query) ||
          item.userId.toLowerCase().includes(query) ||
          item.purpose.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query) ||
          item.resourceLocation.toLowerCase().includes(query)
      );
    }

    return sortBookings(data, sortBy);
  }, [
    enhancedBookings,
    activeTab,
    statusFilter,
    dateFilter,
    resourceFilter,
    search,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("");
    setResourceFilter("ALL");
    setSortBy("date_desc");
  };

  const openRejectModal = (id) => {
    setActionModalState({ open: true, type: "reject", bookingId: id });
  };

  const openCancelModal = (id) => {
    setActionModalState({ open: true, type: "cancel", bookingId: id });
  };

  const closeActionModal = () => {
    setActionModalState({ open: false, type: "", bookingId: "" });
  };

  const openReasonView = (title, reason) => {
    setViewReasonState({
      open: true,
      title,
      reason,
    });
  };

  const closeReasonView = () => {
    setViewReasonState({
      open: false,
      title: "",
      reason: "",
    });
  };

  const openDetailsModal = (booking) => {
    setDetailsState({
      open: true,
      booking,
    });
  };

  const closeDetailsModal = () => {
    setDetailsState({
      open: false,
      booking: null,
    });
  };

  const openConfirmModal = ({
    type,
    bookingId,
    title,
    message,
    confirmText,
    confirmClass,
  }) => {
    setConfirmState({
      open: true,
      type,
      bookingId,
      title,
      message,
      confirmText,
      confirmClass,
    });
  };

  const closeConfirmModal = () => {
    setConfirmState({
      open: false,
      type: "",
      bookingId: "",
      title: "",
      message: "",
      confirmText: "",
      confirmClass: "",
    });
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

      showToast("success", "Booking approved successfully.");
      await loadPageData();
    } catch (error) {
      showToast("error", error.message || "Failed to approve booking");
    } finally {
      setActionLoading(false);
      closeConfirmModal();
    }
  };

  const handleActionModalConfirm = async (reason) => {
    try {
      setActionLoading(true);

      const endpoint =
        actionModalState.type === "reject"
          ? `${BOOKINGS_API}/${actionModalState.bookingId}/reject`
          : `${BOOKINGS_API}/${actionModalState.bookingId}/cancel`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              actionModalState.type === "reject" ? "reject" : "cancel"
            } booking`
        );
      }

      showToast(
        "success",
        actionModalState.type === "reject"
          ? "Booking rejected successfully."
          : "Booking cancelled successfully."
      );

      closeActionModal();
      await loadPageData();
    } catch (error) {
      showToast(
        "error",
        error.message ||
          `Failed to ${
            actionModalState.type === "reject" ? "reject" : "cancel"
          } booking`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteBooking = async (id) => {
    try {
      setActionLoading(true);

      const response = await fetch(`${BOOKINGS_API}/${id}`, {
        method: "DELETE",
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete booking");
      }

      showToast("success", "Booking deleted successfully.");
      await loadPageData();
    } catch (error) {
      showToast("error", error.message || "Failed to delete booking");
    } finally {
      setActionLoading(false);
      closeConfirmModal();
    }
  };

  const handleConfirmAction = async () => {
    if (confirmState.type === "approve") {
      await approveBooking(confirmState.bookingId);
      return;
    }

    if (confirmState.type === "delete") {
      await deleteBooking(confirmState.bookingId);
    }
  };

  const renderStatusCell = (item) => {
    const reasonText = item.rejectionReason || item.cancelReason || "";
    const reasonTitle = item.rejectionReason
      ? "Rejection Reason"
      : item.cancelReason
      ? "Cancellation Reason"
      : "Reason";

    return (
      <div className="uf-status-inline">
        <StatusBadge status={item.status} />
        {reasonText ? (
          <button
            className="uf-status-info-btn"
            onClick={() => openReasonView(reasonTitle, reasonText)}
            title="View reason"
            disabled={actionLoading}
            type="button"
          >
            <CircleAlert size={16} />
          </button>
        ) : (
          <span className="uf-status-info-placeholder" />
        )}
      </div>
    );
  };

  const renderActions = (item) => {
    const isPending = item.status === "PENDING";
    const isCancelled = item.status === "CANCELLED";
    const isRejected = item.status === "REJECTED";

    return (
      <div className="uf-action-stack">
        <div className="uf-row-actions-icons uf-row-actions-icons--five">
          <button
            className="uf-icon-btn view"
            onClick={() => openDetailsModal(item)}
            title="View details"
            type="button"
          >
            <Eye size={18} />
          </button>

          <button
            className="uf-icon-btn approve"
            onClick={() =>
              openConfirmModal({
                type: "approve",
                bookingId: item.id,
                title: "Approve Booking",
                message: "Are you sure you want to approve this booking?",
                confirmText: "Approve",
                confirmClass: "",
              })
            }
            disabled={actionLoading || !isPending}
            title={isPending ? "Approve booking" : "Only pending bookings can be approved"}
            type="button"
          >
            <Check size={18} />
          </button>

          <button
            className="uf-icon-btn reject"
            onClick={() => openRejectModal(item.id)}
            disabled={actionLoading || !isPending}
            title={isPending ? "Reject booking" : "Only pending bookings can be rejected"}
            type="button"
          >
            <X size={18} />
          </button>

          <button
            className="uf-icon-btn cancel"
            onClick={() => openCancelModal(item.id)}
            disabled={actionLoading || isCancelled || isRejected}
            title={
              isCancelled || isRejected
                ? "Cancelled or rejected bookings cannot be cancelled again"
                : "Cancel booking"
            }
            type="button"
          >
            <CircleSlash size={18} />
          </button>

          <button
            className="uf-icon-btn delete"
            onClick={() =>
              openConfirmModal({
                type: "delete",
                bookingId: item.id,
                title: "Delete Booking",
                message: "Are you sure you want to delete this booking record?",
                confirmText: "Delete",
                confirmClass: "danger",
              })
            }
            disabled={actionLoading}
            title="Delete booking"
            type="button"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="uf-page-shell">
      <Toast
        toast={toast}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="uf-page">
        <div className="uf-page-top">
          <div className="uf-page-heading">
            <h1 className="uf-page-title">Bookings</h1>
            <p className="uf-page-subtitle">
              View and manage resource bookings with approval, rejection,
              cancellation, and conflict-aware workflow.
            </p>
          </div>

          <div className="uf-page-top-action">
            <Link to="/bookings/new" className="uf-primary-link-btn">
              <span className="uf-plus">＋</span>
              <span>New Booking</span>
            </Link>
          </div>
        </div>

        <div className="uf-tabs">
          <button
            className={`uf-tab ${activeTab === "mine" ? "active" : ""}`}
            onClick={() => setActiveTab("mine")}
            type="button"
          >
            My Bookings
          </button>
          <button
            className={`uf-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
            type="button"
          >
            All Bookings
          </button>
        </div>

        <div className="uf-summary-grid">
          <div className="uf-summary-card">
            <span>Total Bookings</span>
            <strong>{summaryStats.total}</strong>
          </div>
          <div className="uf-summary-card pending">
            <span>Pending</span>
            <strong>{summaryStats.pending}</strong>
          </div>
          <div className="uf-summary-card approved">
            <span>Approved</span>
            <strong>{summaryStats.approved}</strong>
          </div>
          <div className="uf-summary-card rejected">
            <span>Rejected</span>
            <strong>{summaryStats.rejected}</strong>
          </div>
          <div className="uf-summary-card cancelled">
            <span>Cancelled</span>
            <strong>{summaryStats.cancelled}</strong>
          </div>
        </div>

        <div className="uf-toolbar uf-toolbar--advanced">
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

          <input
            type="date"
            className="uf-filter-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <select
            className="uf-status-select"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
          >
            <option value="ALL">All Resources</option>
            {resourceOptions.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>

          <select
            className="uf-status-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="status">Sort by Status</option>
          </select>

          <button
            type="button"
            className="uf-clear-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
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
                        {(item.resourceType || item.resourceLocation) && (
                          <div className="uf-resource-meta">
                            {[item.resourceType, item.resourceLocation]
                              .filter(Boolean)
                              .join(" • ")}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>{item.userId}</td>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
                    <td>{item.purpose}</td>
                    <td>{item.expectedAttendees}</td>
                    <td>{renderStatusCell(item)}</td>
                    <td className="uf-actions-col">{renderActions(item)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReasonActionModal
        open={actionModalState.open}
        title={actionModalState.type === "reject" ? "Reject Booking" : "Cancel Booking"}
        label={
          actionModalState.type === "reject"
            ? "Enter rejection reason"
            : "Enter cancellation reason"
        }
        confirmText={
          actionModalState.type === "reject" ? "Reject Booking" : "Cancel Booking"
        }
        confirmClass={actionModalState.type === "reject" ? "danger" : "warning"}
        loading={actionLoading}
        onClose={closeActionModal}
        onConfirm={handleActionModalConfirm}
      />

      <ReasonViewModal
        open={viewReasonState.open}
        title={viewReasonState.title}
        reason={viewReasonState.reason}
        onClose={closeReasonView}
      />

      <BookingDetailsModal
        open={detailsState.open}
        booking={detailsState.booking}
        onClose={closeDetailsModal}
      />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmClass={confirmState.confirmClass}
        loading={actionLoading}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
>>>>>>> origin/varun
}