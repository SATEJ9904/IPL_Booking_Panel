import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./Components/Screens/Login";
import SeatBooking from "./Components/Screens/Booking";
import MatchSlots from "./Components/Screens/MatchSlots";
import Payment from "./Components/Screens/Payment";
import GetBookings from "./Components/Screens/GetBookings";
import TokenTimer from "./Components/Screens/TokenTimer";

// Auth Service Functions
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

const getTokenExpiration = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

// Private Route Component with token validation
const PrivateRoute = ({ element: Element }) => {
  const token = localStorage.getItem("authToken");
  const isValid = isTokenValid(token);

  if (!isValid) {
    localStorage.removeItem("authToken");
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Element />
    </>
  );
};

// Public Route Component (for login)
const PublicRoute = ({ element: Element }) => {
  const token = localStorage.getItem("authToken");
  const isValid = token && isTokenValid(token);

  return isValid ? (
    <Navigate to="/MatchSlots" replace />
  ) : (
    <Element />
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute element={Login} />} />
        <Route path="/booking" element={<PrivateRoute element={SeatBooking} />} />
        <Route path="/MatchSlots" element={<PrivateRoute element={MatchSlots} />} />
        <Route path="/PaymentPage" element={<PrivateRoute element={Payment} />} />
        <Route path="/getBookings" element={<PrivateRoute element={GetBookings} />} />
      </Routes>
    </Router>
  );
};

export default App;