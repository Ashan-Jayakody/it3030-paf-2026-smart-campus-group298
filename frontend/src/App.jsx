<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import RequireAuth from './components/shared/RequireAuth'
import Navbar from './components/shared/Navbar'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage from './pages/BookingsPage'
import TicketsPage from './pages/TicketsPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/resources" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/resources" element={<RequireAuth><ResourcesPage /></RequireAuth>} />
            <Route path="/bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
            <Route path="/tickets" element={<RequireAuth><TicketsPage /></RequireAuth>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
=======
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BookingsPage from "./pages/BookingsPage";
import NewBookingPage from "./pages/NewBookingPage";
import "./styles/bookings.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/bookings" replace />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/new" element={<NewBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
>>>>>>> origin/varun
}