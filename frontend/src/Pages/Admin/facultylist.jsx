
import { useState, useEffect } from "react";
import { Trash2, Edit, X, Check, AlertCircle, Download } from "lucide-react";
import './facultylist.css';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null); // This will now store the _id
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    departmentname: "",
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://facultypointsportal.onrender.com/teachers");
  
        if (!response.ok) {
          throw new Error(`Error fetching teachers: ${response.status}`);
        }
  
        const data = await response.json();
  
        // If data is null, fallback to empty array
        setTeachers(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditClick = (teacher) => {
    // Use teacher._id instead of teacher.id
    setEditingTeacher(teacher._id);
    setEditFormData({
      name: teacher.name,
      email: teacher.email,
      departmentname: teacher.department_name,
    });
  };

  const handleCancelEdit = () => {
    setEditingTeacher(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleSaveEdit = async (teacherId) => { // teacherId is now the _id
    try {
      const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update teacher");
      }

      const updatedTeacherData = {
          ...teachers.find(t => t._id === teacherId), // Find by _id
          name: editFormData.name,
          email: editFormData.email,
          department_name: editFormData.departmentname
      };

      setTeachers(
        teachers.map((teacher) =>
          // Compare with _id
          teacher._id === teacherId ? updatedTeacherData : teacher
        )
      );

      setEditingTeacher(null);
      showNotification("Teacher updated successfully");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const confirmDelete = (message) => {
    return window.confirm(message);
  };

  const handleDeleteTeacher = async (teacherId) => { // teacherId is now the _id
    const shouldDelete = confirmDelete(
      "Are you sure you want to delete this teacher? This will also remove all associated assignments and references."
    );

    if (!shouldDelete) return;

    try {
      const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete teacher");
      }

      // Filter using _id
      setTeachers(teachers.filter((teacher) => teacher._id !== teacherId));
      showNotification("Teacher deleted successfully");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDownloadReport = async (teacherId, teacherName) => { // teacherId is now the _id
      showNotification("Generating report...", "info");
      try {
          const response = await fetch(`https://facultypointsportal.onrender.com/reports/teacher/${teacherId}`);

          if (!response.ok) {
              throw new Error(`Failed to download report: ${response.statusText}`);
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          const safeName = teacherName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          a.download = `report_${safeName}.csv`;
          
          document.body.appendChild(a);
          a.click();
          
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          showNotification("Report downloaded successfully.", "success");

      } catch (err) {
          showNotification(err.message, "error");
      }
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading teachers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <AlertCircle className="error-icon" />
          <div>
            <h3 className="error-title">Error loading teachers</h3>
            <div className="error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teachers-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="teachers-header">
        <div>
          <h1 className="teachers-title">Teachers</h1>
          <p className="teachers-description">
            A list of all teachers including their name, email, department, and points.
          </p>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-container">
          <table className="teachers-table">
            <thead className="table-header">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Points</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="table-body">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-state-text">No teachers found</div>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  // Use _id for the key prop
                  <tr key={teacher._id} className="table-row">
                    <td className="table-cell">
                      {/* Compare with _id */}
                      {editingTeacher === teacher._id ? (
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditFormChange}
                          className="edit-input"
                        />
                      ) : (
                        <div className="teacher-name">{teacher.name}</div>
                      )}
                    </td>
                    <td className="table-cell">
                      {editingTeacher === teacher._id ? (
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditFormChange}
                          className="edit-input"
                        />
                      ) : (
                        <div className="teacher-email">{teacher.email}</div>
                      )}
                    </td>
                    <td className="table-cell">
                      {editingTeacher === teacher._id ? (
                        <input
                          type="text"
                          name="departmentname"
                          value={editFormData.departmentname}
                          onChange={handleEditFormChange}
                          className="edit-input"
                        />
                      ) : (
                        <div className="teacher-department">
                          {teacher.department_name || "N/A"}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="teacher-points">{teacher.point}</div>
                    </td>
                    <td className="table-cell">
                      {editingTeacher === teacher._id ? (
                        <div className="actions-container">
                          <button
                            // Pass _id to the handler
                            onClick={() => handleSaveEdit(teacher._id)}
                            className="action-button save-button"
                            title="Save changes"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="action-button cancel-button"
                            title="Cancel editing"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="actions-container">
                           <button
                            // Pass _id to the handler
                            onClick={() => handleDownloadReport(teacher._id, teacher.name)}
                            className="action-button download-button"
                            title="Download report"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(teacher)}
                            className="action-button edit-button"
                            title="Edit teacher"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            // Pass _id to the handler
                            onClick={() => handleDeleteTeacher(teacher._id)}
                            className="action-button delete-button"
                            title="Delete teacher"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
