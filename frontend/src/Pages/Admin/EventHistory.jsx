// // Pages/Admin/EventHistory.jsx

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const EventHistory = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     axios
//       .get("https://facultypointsportal.onrender.com/events/past") // Replace with your backend URL
//       .then((res) => {
//         setEvents(res.data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch event history:", err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p>Loading event history...</p>;

//   if (events.length === 0) return <p>No past events found.</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Past Events</h1>
//       <ul className="space-y-4">
//         {events.map((event) => (
//           <li
//             key={event.event_id}
//             className="p-4 border rounded shadow-sm bg-white hover:bg-gray-50"
//           >
//             <h2 className="text-lg font-semibold">{event.name}</h2>
//             <p className="text-sm text-gray-700">{event.description}</p>
//             <p className="text-xs text-gray-500">Held on: {event.start_date}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default EventHistory;
// Pages/Admin/EventHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EventHistory.css";

const EventHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState(null);

  useEffect(() => {
    axios
      .get("https://facultypointsportal.onrender.com/events/past")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch event history:", err);
        setLoading(false);
      });
  }, []);

  const toggleEventDetails = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading event history...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="no-events-container">
        <div className="no-events-icon">📅</div>
        <p className="no-events-text">No past events found.</p>
      </div>
    );
  }

  return (
    <div className="event-history-container">
      <div className="header">
        <h1 className="title">Past Events</h1>
        <div className="title-decoration"></div>
      </div>
      
      <div className="events-grid">
        {events.map((event) => (
          <div
            key={event.event_id}
            className={`event-card ${expandedEvent === event.event_id ? 'expanded' : ''}`}
          >
            <div 
              className="event-header"
              onClick={() => toggleEventDetails(event.event_id)}
            >
              <div className="event-main-info">
                <h2 className="event-name">{event.name}</h2>
                <p className="event-description">{event.description}</p>
                <div className="event-dates">
                  <div className="date-info">
                    <span className="date-label">Start:</span>
                    <span className="date-value">
                      {formatDate(event.start_date)} at {formatTime(event.start_time)}
                    </span>
                  </div>
                  <div className="date-info">
                    <span className="date-label">End:</span>
                    <span className="date-value">
                      {formatDate(event.end_date)} at {formatTime(event.end_time)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="expand-icon">
                <svg 
                  className={`chevron ${expandedEvent === event.event_id ? 'rotated' : ''}`}
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>
            </div>

            {expandedEvent === event.event_id && (
              <div className="event-details">
                <div className="details-grid">
                  <div className="roles-section">
                    <h3 className="section-title">
                      <span className="section-icon">🎯</span>
                      Roles ({event.roles?.length || 0})
                    </h3>
                    {event.roles && event.roles.length > 0 ? (
                      <div className="roles-list">
                        {event.roles.map((role) => (
                          <div key={role.id} className="role-tag">
                            {role.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No roles defined for this event.</p>
                    )}
                  </div>

                  <div className="teachers-section">
                    <h3 className="section-title">
                      <span className="section-icon">👨‍🏫</span>
                      Assigned Teachers ({event.assginedteachers?.length || 0})
                    </h3>
                    {event.assginedteachers && event.assginedteachers.length > 0 ? (
                      <div className="teachers-list">
                        {event.assginedteachers.map((teacher) => (
                          <div key={teacher.AssignmentID} className="teacher-card">
                            <div className="teacher-info">
                              <div className="teacher-name">{teacher.teachername}</div>
                              <div className="teacher-role">Role: {teacher.rolename}</div>
                            </div>
                            <div className="teacher-badge">
                              <span className="badge-text">Assigned</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No teachers assigned to this event.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventHistory;
