import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css"; // Uses your existing CSS

const PointsResetManagement = () => {
  const [resetLogs, setResetLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchResetLogs();
  }, []);

  const fetchResetLogs = () => {
    setLoading(true);
    axios
      .get("https://facultypointsportal.onrender.com/point-reset-logs")
      .then((res) => setResetLogs(res.data || []))
      .catch((err) => {
        console.error("Error fetching reset logs:", err);
        setResetLogs([]);
      })
      .finally(() => setLoading(false));
  };

  const handleResetPoints = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all teacher points?\n\n" +
      "This will:\n" +
      "• Archive all current points\n" +
      "• Set all teacher points to 0\n" +
      "• Create a new reset log entry"
    );
    
    if (!confirmReset) return;

    setResetting(true);
    axios
      .post("https://facultypointsportal.onrender.com/reset-teacher-points", {})
      .then((res) => {
        alert(res.data.message);
        fetchResetLogs(); // Refresh the logs
      })
      .catch((error) => {
        console.error("Error resetting points:", error);
        alert(error.response?.data?.error || "Failed to reset points. Please try again.");
      })
      .finally(() => setResetting(false));
  };

  const handleDownloadCSV = (logId, resetDate) => {
    const formattedDate = new Date(resetDate).toISOString().split('T')[0].replace(/-/g, '');
    const filename = `point_reset_report_${formattedDate}.csv`;
    
    axios
      .get(`https://facultypointsportal.onrender.com/point-reset-logs/${logId}/csv`, {
        responseType: "blob"
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading CSV:", error);
        alert("Failed to download report. Please try again.");
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalPoints = (teachers) => {
    return teachers.reduce((sum, teacher) => sum + (teacher.points_at_reset || 0), 0);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Teacher Points Reset Management</h2>

        {/* Reset Action Section */}
        <div className="card">
          <div className="card-header">
            <h2>Reset All Teacher Points</h2>
          </div>
          <div className="table-container">
            <p style={{ 
              marginBottom: '20px', 
              fontSize: '1.1rem', 
              color: '#495057',
              lineHeight: '1.6'
            }}>
              This action will archive all current teacher points and reset them to 0. 
              The previous points will be logged and available for download as a CSV report.
            </p>
            <button 
              className="btn btn-danger" 
              onClick={handleResetPoints}
              disabled={resetting}
            >
              {resetting ? "Resetting..." : "Reset All Teacher Points"}
            </button>
          </div>
        </div>

        {/* Reset Logs Section */}
        <div className="card">
          <div className="card-header">
            <h2>Point Reset History</h2>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={fetchResetLogs}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <div className="table-container">
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#6c757d',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '15px' }}>Loading reset logs...</p>
              </div>
            ) : resetLogs.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#6c757d',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <p style={{ fontSize: '1.1rem' }}>
                  No reset logs found. Click "Reset All Teacher Points" to create the first log.
                </p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Reset Date</th>
                    <th>Previous Reset Date</th>
                    <th>Teachers Affected</th>
                    <th>Total Points Reset</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resetLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{formatDate(log.reset_date)}</td>
                      <td>
                        {log.previous_reset_date 
                          ? formatDate(log.previous_reset_date) 
                          : <em style={{ color: '#868e96' }}>First Reset</em>
                        }
                      </td>
                      <td>{log.teachers.length}</td>
                      <td><strong>{calculateTotalPoints(log.teachers)}</strong></td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDownloadCSV(log._id, log.reset_date)}
                        >
                          Download CSV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detailed View Section */}
        {resetLogs.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2>Detailed Reset Information</h2>
            </div>
            <div className="table-container">
              {resetLogs.map((log, index) => (
                <details 
                  key={log._id} 
                  style={{ 
                    marginBottom: '20px', 
                    border: '2px solid #e9ecef', 
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <summary 
                    style={{ 
                      cursor: 'pointer', 
                      fontWeight: '600', 
                      fontSize: '1.1rem',
                      color: '#2c3e50',
                      marginBottom: '10px',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px'
                    }}
                  >
                    Reset #{resetLogs.length - index} - {formatDate(log.reset_date)} 
                    <span style={{ 
                      marginLeft: '15px', 
                      color: '#6c757d',
                      fontWeight: 'normal',
                      fontSize: '0.95rem'
                    }}>
                      ({log.teachers.length} teachers, {calculateTotalPoints(log.teachers)} total points)
                    </span>
                  </summary>
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ 
                      padding: '15px',
                      backgroundColor: '#f1f8ff',
                      borderRadius: '6px',
                      marginBottom: '15px'
                    }}>
                      <p style={{ margin: '0', fontSize: '1rem' }}>
                        <strong>Reporting Period:</strong>{' '}
                        {log.previous_reset_date 
                          ? `${formatDate(log.previous_reset_date)} to ${formatDate(log.reset_date)}`
                          : `Inception to ${formatDate(log.reset_date)}`
                        }
                      </p>
                    </div>
                    <table className="table" style={{ marginTop: '15px' }}>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Teacher Name</th>
                          <th>Points Before Reset</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.teachers
                          .sort((a, b) => b.points_at_reset - a.points_at_reset)
                          .map((teacher, idx) => (
                            <tr key={teacher.teacher_id}>
                              <td>{idx + 1}</td>
                              <td>{teacher.teacher_name}</td>
                              <td><strong>{teacher.points_at_reset}</strong></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsResetManagement;
