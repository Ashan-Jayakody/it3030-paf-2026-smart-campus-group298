import { useEffect, useState } from "react";

export default function ActionModal({
  open,
  title,
  label,
  confirmText,
  confirmClass = "",
  loading = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>{label}</label>
          <textarea
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason here"
          />

          <div className="modal-actions">
            <button type="button" className="modal-secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`modal-primary-btn ${confirmClass}`}
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