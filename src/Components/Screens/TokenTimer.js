import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const TokenTimer = ({ token }) => {
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const expirationTime = jwtDecode(token).exp * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = expirationTime - now;

      if (diff <= 0) {
        localStorage.removeItem("authToken");
        navigate("/");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '10px 15px',
      backgroundColor: '#f0f0f0',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      Token expires in: {timeLeft}
    </div>
  );
};

export default TokenTimer;