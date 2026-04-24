const fs = require('fs');
const file = 'c:/Users/ASUS Vivobook/Desktop/Work/smart-campus-api/frontend/src/pages/BookingsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1 & 2: Imports and constant
const importLinkPos = content.indexOf('import { Link } from "react-router-dom";');
if (importLinkPos > -1 && !content.includes('import { useAuth }')) {
  content = content.replace('import { Link } from "react-router-dom";', 'import { Link } from "react-router-dom";\nimport { useAuth } from "../auth/useAuth";');
}
content = content.replace('const CURRENT_USER_ID = "USER-001";\r\n', '');
content = content.replace('const CURRENT_USER_ID = "USER-001";\n', '');

// Fix 3: Inside component
const compStart = 'export default function BookingsPage() {';
const newCompStart = 'export default function BookingsPage() {\n  const { user, isAdmin, isManager } = useAuth();\n  const CURRENT_USER_ID = user?.id || user?.email || "USER-001";\n  const canManageBookings = isAdmin || isManager;';
if (content.includes(compStart) && !content.includes('const { user, isAdmin, isManager } = useAuth();')) {
  content = content.replace(compStart, newCompStart);
}

// Fix 4: summaryStats dependencies
content = content.replace(
  '}, [enhancedBookings, activeTab]);',
  '}, [enhancedBookings, activeTab, CURRENT_USER_ID]);'
);

// Fix 5: filteredBookings dependencies
content = content.replace(
  '    search,\r\n    sortBy,\r\n  ]);',
  '    search,\r\n    sortBy,\r\n    CURRENT_USER_ID,\r\n  ]);'
);
content = content.replace(
  '    search,\n    sortBy,\n  ]);',
  '    search,\n    sortBy,\n    CURRENT_USER_ID,\n  ]);'
);

// Fix 6: Protect actions
const actionsStartOld = `          <button
            className="uf-icon-btn approve"
            onClick={() =>
              openConfirmModal({`;
const actionsStartNew = `          {canManageBookings && (
            <>
              <button
                className="uf-icon-btn approve"
                onClick={() =>
                  openConfirmModal({`;
content = content.replace(actionsStartOld, actionsStartNew);
content = content.replace(actionsStartOld.replace(/\n/g, '\r\n'), actionsStartNew.replace(/\n/g, '\r\n'));

const rejectEndOld = `            <X size={18} />
          </button>`;
const rejectEndNew = `            <X size={18} />
          </button>
            </>
          )}`;
content = content.replace(rejectEndOld, rejectEndNew);
content = content.replace(rejectEndOld.replace(/\n/g, '\r\n'), rejectEndNew.replace(/\n/g, '\r\n'));

const cancelBtnOld = `disabled={actionLoading || isCancelled || isRejected}`;
const cancelBtnNew = `disabled={actionLoading || isCancelled || isRejected || (item.userId !== CURRENT_USER_ID && !canManageBookings)}`;
content = content.replace(cancelBtnOld, cancelBtnNew);

const deleteBtnOld = `          <button
            className="uf-icon-btn delete"
            onClick={() =>
              openConfirmModal({`;
const deleteBtnNew = `          {canManageBookings && (
            <button
              className="uf-icon-btn delete"
              onClick={() =>
                openConfirmModal({`;
content = content.replace(deleteBtnOld, deleteBtnNew);
content = content.replace(deleteBtnOld.replace(/\n/g, '\r\n'), deleteBtnNew.replace(/\n/g, '\r\n'));

const deleteBtnEndOld = `            <Trash2 size={18} />
          </button>
        </div>`;
const deleteBtnEndNew = `            <Trash2 size={18} />
            </button>
          )}
        </div>`;
content = content.replace(deleteBtnEndOld, deleteBtnEndNew);
content = content.replace(deleteBtnEndOld.replace(/\n/g, '\r\n'), deleteBtnEndNew.replace(/\n/g, '\r\n'));

// Protect Tabs
const allTabOld = `          <button
            className={\`uf-tab \${activeTab === "all" ? "active" : ""}\`}
            onClick={() => setActiveTab("all")}
            type="button"
          >
            All Bookings
          </button>`;
const allTabNew = `          {canManageBookings && (
            <button
              className={\`uf-tab \${activeTab === "all" ? "active" : ""}\`}
              onClick={() => setActiveTab("all")}
              type="button"
            >
              All Bookings (Admin)
            </button>
          )}`;
content = content.replace(allTabOld, allTabNew);
content = content.replace(allTabOld.replace(/\n/g, '\r\n'), allTabNew.replace(/\n/g, '\r\n'));

fs.writeFileSync(file, content);
console.log('Successfully applied all fixes to BookingsPage');
