import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/reminders.css";

const Reminders = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await api.get("/api/reminders");
        setReminders(res.data.reminders || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load reminders");
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const reminderDate = new Date(dateString);
    const today = new Date();
    const diffTime = reminderDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyInfo = (daysUntil) => {
    if (daysUntil < 0) return { class: 'overdue', badge: 'ft-badge-error', label: 'Overdue' };
    if (daysUntil <= 7) return { class: 'urgent', badge: 'ft-badge-error', label: 'Urgent' };
    if (daysUntil <= 30) return { class: 'soon', badge: 'ft-badge-warning', label: 'Soon' };
    return { class: 'normal', badge: 'ft-badge-success', label: 'On Track' };
  };

  if (loading) {
    return (
      <div className="ft-page">
        <div className="ft-loading">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="ft-page fade-in">
      {/* Page Header */}
      <div className="ft-page-header">
        <div className="ft-page-header-row">
          <div>
            <h1>⏰ Reminders</h1>
            <p>Stay on top of your important document deadlines</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="ft-btn ft-btn-primary"
          >
            + Add Document
          </button>
        </div>
      </div>

      {error && <div className="ft-alert ft-alert-error">{error}</div>}

      {/* Stats Summary */}
      <div className="ft-section">
        <div className="section-header">
          <div className="section-badge">1</div>
          <div className="section-content">
            <h2>Reminder Summary</h2>
            <p>OVERVIEW</p>
          </div>
        </div>

        <div className="ft-grid-4">
          <div className="ft-stat-card">
            <span className="ft-stat-label">Total Reminders</span>
            <span className="ft-stat-value">{reminders.length}</span>
          </div>
          <div className="ft-stat-card">
            <span className="ft-stat-label">Overdue</span>
            <span className="ft-stat-value error">
              {reminders.filter(r => getDaysUntil(r.reminderDate) < 0).length}
            </span>
          </div>
          <div className="ft-stat-card">
            <span className="ft-stat-label">Due This Week</span>
            <span className="ft-stat-value warning">
              {reminders.filter(r => {
                const days = getDaysUntil(r.reminderDate);
                return days >= 0 && days <= 7;
              }).length}
            </span>
          </div>
          <div className="ft-stat-card">
            <span className="ft-stat-label">Due This Month</span>
            <span className="ft-stat-value">
              {reminders.filter(r => {
                const days = getDaysUntil(r.reminderDate);
                return days >= 0 && days <= 30;
              }).length}
            </span>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="ft-section">
        <div className="section-header">
          <div className="section-badge">2</div>
          <div className="section-content">
            <h2>All Reminders</h2>
            <p>YOUR UPCOMING DEADLINES</p>
          </div>
        </div>

        {reminders.length === 0 ? (
          <div className="ft-empty-state">
            <div className="ft-empty-icon">⏰</div>
            <h3 className="ft-empty-title">No reminders yet</h3>
            <p className="ft-empty-description">
              Upload documents with expiry dates to get automatic reminders
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="ft-btn ft-btn-primary"
            >
              + Upload Document
            </button>
          </div>
        ) : (
          <div className="reminders-grid">
            {reminders.map((reminder) => {
              const daysUntil = getDaysUntil(reminder.reminderDate);
              const urgency = getUrgencyInfo(daysUntil);

              return (
                <div
                  key={reminder._id}
                  className={`ft-card ft-card-clickable reminder-card-new ${urgency.class}`}
                  onClick={() =>
                    reminder.document?._id &&
                    navigate(`/documents/${reminder.document._id}`)
                  }
                >
                  <div className="ft-card-body">
                    <div className="reminder-header">
                      <span className={`ft-badge ${urgency.badge}`}>{urgency.label}</span>
                      {reminder.read ? (
                        <span className="ft-badge ft-badge-neutral">✓ Read</span>
                      ) : (
                        <span className="ft-badge ft-badge-info">● New</span>
                      )}
                    </div>

                    <h3 className="reminder-title">
                      📄 {reminder.document?.title || "Unknown Document"}
                    </h3>

                    <div className="reminder-details">
                      <div className="reminder-date">
                        <span className="detail-label">Due Date</span>
                        <span className="detail-value">{formatDate(reminder.reminderDate)}</span>
                      </div>
                      
                      <div className="reminder-countdown">
                        {daysUntil < 0 ? (
                          <span className="countdown overdue">
                            ⚠️ {Math.abs(daysUntil)} days overdue
                          </span>
                        ) : daysUntil === 0 ? (
                          <span className="countdown today">
                            🔔 Due today!
                          </span>
                        ) : (
                          <span className={`countdown ${urgency.class}`}>
                            ⏳ {daysUntil} {daysUntil === 1 ? "day" : "days"} remaining
                          </span>
                        )}
                      </div>
                    </div>

                    {reminder.document?.category && (
                      <div className="reminder-category">
                        <span className="ft-badge ft-badge-info">{reminder.document.category}</span>
                      </div>
                    )}

                    <button className="ft-btn ft-btn-secondary reminder-view-btn">
                      View Document →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      {reminders.length > 0 && (
        <div className="ft-info-box warning">
          <span className="ft-info-box-icon">💡</span>
          <div>
            <strong>Stay Organized:</strong> Review your reminders regularly to ensure you don't miss important document renewals or expirations.
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
