import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const currentUser = {
  name: "Anbalagan Shajievan",
  role: "Administrator",
  initial: "A",
  notifications: 19,
};

const bookings = [
  {
    id: "B001",
    resource: "Mini Auditorium 01",
    date: "2026-04-27",
    time: "09:55 - 17:00",
    purpose: "study",
    requestedBy: "Taniya Thilakarathne",
    status: "REJECTED",
    mine: false,
  },
  {
    id: "B002",
    resource: "Lecture room G1105",
    date: "2026-04-21",
    time: "01:32 - 14:38",
    purpose: "jh",
    requestedBy: "Hirushi Sharanya",
    status: "PENDING",
    mine: false,
  },
  {
    id: "B003",
    resource: "Lecture room G1105",
    date: "2026-04-28",
    time: "08:45 - 17:00",
    purpose: "new",
    requestedBy: "Hirushi Sharanya",
    status: "PENDING",
    mine: false,
  },
  {
    id: "B004",
    resource: "Lecture room G1105",
    date: "2026-04-16",
    time: "09:20 - 16:20",
    purpose: "jhbi",
    requestedBy: "Madusha Kavindi",
    status: "PENDING",
    mine: false,
  },
  {
    id: "B005",
    resource: "Lecture room G1105",
    date: "2026-04-08",
    time: "08:16 - 12:16",
    purpose: "jgfukt",
    requestedBy: "it23550858 JAYAWARDHENA R.M.M.K",
    status: "PENDING",
    mine: false,
  },
  {
    id: "B006",
    resource: "Lecture room G1105",
    date: "2026-04-27",
    time: "08:45 - 17:00",
    purpose: "meeting",
    requestedBy: "Hirushi Sharanya",
    status: "PENDING",
    mine: false,
  },
  {
    id: "B007",
    resource: "Mini Auditorium 01",
    date: "2026-04-25",
    time: "11:45 - 14:45",
    purpose: "presentation",
    requestedBy: "Anbalagan Shajievan",
    status: "CANCELLED",
    mine: true,
  },
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

function StatusBadge({ status }) {
  return (
    <span className={`uf-status-badge ${status.toLowerCase()}`}>{status}</span>
  );
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRows = useMemo(() => {
    let data = bookings;

    if (activeTab === "mine") {
      data = data.filter((item) => item.mine);
    }

    if (statusFilter !== "ALL") {
      data = data.filter((item) => item.status === statusFilter);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      data = data.filter(
        (item) =>
          item.resource.toLowerCase().includes(query) ||
          item.purpose.toLowerCase().includes(query) ||
          item.requestedBy.toLowerCase().includes(query)
      );
    }

    return data;
  }, [activeTab, search, statusFilter]);

  return (
    <div className="uf-layout">
      <Sidebar />

      <main className="uf-main">
        <HeaderBar />

        <div className="uf-page">
          <div className="uf-page-top">
            <div>
              <h1 className="uf-page-title">Bookings</h1>
              <p className="uf-page-subtitle">View and manage resource bookings</p>
            </div>

            <Link to="/bookings/new" className="uf-primary-link-btn">
              <span className="uf-plus">＋</span>
              <span>New Booking</span>
            </Link>
          </div>

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
                placeholder="Search by resource or purpose..."
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
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th className="uf-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="uf-empty-cell">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((item) => (
                    <tr key={item.id}>
                      <td>{item.resource}</td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>{item.purpose}</td>
                      <td>{item.requestedBy}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="uf-actions-col">
                        {item.status === "PENDING" ? (
                          <div className="uf-row-actions">
                            <button className="uf-icon-action approve">✓</button>
                            <button className="uf-icon-action reject">✕</button>
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

        <footer className="uf-footer">
          © 2026 UniFlow · Privacy Policy · Campus Map
        </footer>
      </main>
    </div>
  );
}