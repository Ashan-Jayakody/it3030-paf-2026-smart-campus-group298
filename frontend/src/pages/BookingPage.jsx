import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BookingForm from "../components/BookingForm";
import BookingStats from "../components/BookingStats";
import BookingTable from "../components/BookingTable";
import MyBookings from "../components/MyBookings";
import ActionModal from "../components/ActionModal";
import "../styles/booking.css";

const API_BASE = "http://localhost:8080/api/bookings";
const DEMO_USER_ID = "USER-001";

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [modalState, setModalState] = useState({
    open: false,
    type: "",
    bookingId: null,
  });

  const fetchAllBookings = async () => {
    try {
      setTableLoading(true);
      const response = await axios.get(API_BASE);
      setBookings(response.data || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to load bookings.",
      });
    } finally {
      setTableLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE}/my`, {
        params: { userId: DEMO_USER_ID },
      });
      setMyBookings(response.data || []);
    } catch (error) {
      console.error("Failed to load my bookings", error);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchAllBookings(), fetchMyBookings()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      approved: bookings.filter((b) => b.status === "APPROVED").length,
      rejected: bookings.filter((b) => b.status === "REJECTED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeFilter === "ALL") return bookings;
    return bookings.filter((booking) => booking.status === activeFilter);
  }, [bookings, activeFilter]);

  const handleCreateBooking = async (payload) => {
    try {
      setFormLoading(true);
      setMessage({ type: "", text: "" });

      const response = await axios.post(API_BASE, payload);

      setMessage({
        type: "success",
        text: `Booking created successfully. Booking ID: ${response.data.id}`,
      });

      await refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to create booking. Please check the details.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${API_BASE}/${id}/approve`);
      setMessage({ type: "success", text: "Booking approved successfully." });
      await refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to approve booking.",
      });
    }
  };

  const openRejectModal = (id) => {
    setModalState({ open: true, type: "reject", bookingId: id });
  };

  const openCancelModal = (id) => {
    setModalState({ open: true, type: "cancel", bookingId: id });
  };

  const closeModal = () => {
    setModalState({ open: false, type: "", bookingId: null });
  };

  const handleModalConfirm = async (reason) => {
    if (!modalState.bookingId || !modalState.type) return;

    try {
      setActionLoading(true);

      if (modalState.type === "reject") {
        await axios.patch(`${API_BASE}/${modalState.bookingId}/reject`, { reason });
        setMessage({ type: "success", text: "Booking rejected successfully." });
      }

      if (modalState.type === "cancel") {
        await axios.patch(`${API_BASE}/${modalState.bookingId}/cancel`, { reason });
        setMessage({ type: "success", text: "Booking cancelled successfully." });
      }

      closeModal();
      await refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          `Failed to ${modalState.type} booking.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      setMessage({ type: "success", text: "Booking deleted successfully." });
      await refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete booking.",
      });
    }
  };

  const modalTitle =
    modalState.type === "reject" ? "Reject Booking" : "Cancel Booking";

  const modalLabel =
    modalState.type === "reject"
      ? "Enter rejection reason"
      : "Enter cancellation reason";

  const modalButtonText =
    modalState.type === "reject" ? "Reject Booking" : "Cancel Booking";

  const modalButtonClass =
    modalState.type === "reject" ? "danger-btn" : "warning-btn";

  const filterTabs = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="booking-page">
      <div className="booking-shell">
        <header className="page-header">
          <p className="page-kicker">Smart Campus · Member 2</p>
          <h1>Booking Management Dashboard</h1>
          <p className="page-subtitle">
            Create bookings, review requests, manage approvals, rejections,
            cancellations, and monitor booking statuses in one place.
          </p>
        </header>

        {message.text && (
          <div className={`alert-box ${message.type}`}>
            <span>{message.text}</span>
          </div>
        )}

        <BookingStats stats={stats} />

        <div className="top-grid">
          <BookingForm
            onSubmit={handleCreateBooking}
            loading={formLoading}
            defaultUserId={DEMO_USER_ID}
          />
          <MyBookings bookings={myBookings} />
        </div>

        <div className="filter-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              className={`filter-tab ${activeFilter === tab.value ? "active" : ""}`}
              onClick={() => setActiveFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <BookingTable
          bookings={filteredBookings}
          loading={tableLoading}
          onApprove={handleApprove}
          onReject={openRejectModal}
          onCancel={openCancelModal}
          onDelete={handleDelete}
        />

        <ActionModal
          open={modalState.open}
          title={modalTitle}
          label={modalLabel}
          confirmText={modalButtonText}
          confirmClass={modalButtonClass}
          loading={actionLoading}
          onClose={closeModal}
          onConfirm={handleModalConfirm}
        />
      </div>
    </div>
  );
}