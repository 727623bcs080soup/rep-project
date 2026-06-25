// frontend/src/components/Notification.js
import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import './Notification.css';

const Notification = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Wrap handleClose in useCallback so its identity is stable
  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Give time for the CSS transition (0.3s) before calling the parent's onClose
    setTimeout(onClose, 300); 
  }, [onClose]); // Only changes if onClose prop changes

  // Auto-hide logic
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, handleClose]); // <-- ADDED handleClose to dependencies

  if (!isVisible) return null;

  return (
    <div className={`notification ${type}`}>
      <p>{message}</p>
      <button className="close-btn" onClick={handleClose}>
        &times;
      </button>
    </div>
  );
};

export default Notification;