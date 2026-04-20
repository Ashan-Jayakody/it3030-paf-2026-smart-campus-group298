import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage  from './pages/BookingsPage'
import TicketsPage   from './pages/TicketsPage'
import LoginPage     from './pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/"          element={<Navigate to="/resources" replace />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/bookings"  element={<BookingsPage />}  />
          <Route path="/tickets"   element={<TicketsPage />}   />
          <Route path="/login"     element={<LoginPage />}     />
        </Routes>
      </div>
    </BrowserRouter>
  )
}