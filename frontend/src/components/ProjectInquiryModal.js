// frontend/src/components/ProjectInquiryModal.js
import React, { useState } from 'react';
import { API } from '../App';
import './ProjectInquiryModal.css';

const ProjectInquiryModal = ({ recipientId, recipientName, onClose }) => {
  const [projectDetails, setProjectDetails] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [budget, setBudget] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectDetails.trim()) {
      setError('Please provide project details.');
      return;
    }

    setIsSending(true);
    setError('');

    // --- FORMAT MESSAGE ---
    let formattedMessage = `**New Project Inquiry**\n\n**Project Details:**\n${projectDetails}`;
    if (targetDate) formattedMessage += `\n\n**Target Date:** ${targetDate}`;
    if (budget) formattedMessage += `\n\n**Proposed Budget:** $${budget}`;
    // ----------------------

    try {
      await API.post('/messages', {
        recipientId: recipientId,
        message: formattedMessage,
      });
      setIsSending(false);
      onClose(true); // true = success
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => onClose(false)}>&times;</button>
        <div className="modal-header">
          <div className="modal-avatar-placeholder"></div>
          <h3>Connect with {recipientName}</h3>
          <p>Responds within a few hours</p>
        </div>
        <form onSubmit={handleSubmit} className="inquiry-form">
          <label htmlFor="projectDetails">Project Details*</label>
          <textarea id="projectDetails" value={projectDetails} onChange={(e) => setProjectDetails(e.target.value)} placeholder="Describe your project..." required />
          
          <label htmlFor="targetDate">Target Date</label>
          <select id="targetDate" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}>
            <option value="">Select a timeframe</option>
            <option value="Within 1 month">Within 1 month</option>
            <option value="1-2 months">1-2 months</option>
            <option value="Flexible">Flexible</option>
          </select>

          <label htmlFor="budget">Project Budget (USD)</label>
          <div className="budget-input">
            <span>$</span>
            <input type="number" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Enter amount" />
          </div>

          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="send-btn-primary" disabled={isSending}>{isSending ? 'Sending...' : 'Send Message'}</button>
        </form>
      </div>
    </div>
  );
};

export default ProjectInquiryModal;