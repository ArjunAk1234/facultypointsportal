// // // // import React, { useState, useEffect } from "react";
// // // // import axios from "axios";
// // // // import { useParams, useNavigate } from "react-router-dom";
// // // // import "./EventDashboard.css"; // Ensure this CSS file is present

// // // // const EventDashboard = () => {
// // // //   const { eventId } = useParams();
// // // //   const navigate = useNavigate();

// // // //   // Component states
// // // //   const [eventDetails, setEventDetails] = useState(null);
// // // //   const [facultyList, setFacultyList] = useState([]);
// // // //   const [roles, setRoles] = useState([]);
// // // //   const [assignments, setAssignments] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [autoAssigningRoleId, setAutoAssigningRoleId] = useState(null);

// // // //   // Form states
// // // //   const [showAssignForm, setShowAssignForm] = useState(false);
// // // //   const [isEditMode, setIsEditMode] = useState(false);
// // // //   const [assignmentFormData, setAssignmentFormData] = useState({ teacherId: "", roleId: "", assignmentId: "" });
  
// // // //   // Event edit states
// // // //   const [isEventEditMode, setIsEventEditMode] = useState(false);
// // // //   const [eventFormData, setEventFormData] = useState({ name: "", description: "", start_date: "", end_date: "", start_time: "", end_time: "" });

// // // //   // Point edit modal states
// // // //   const [showPointEditModal, setShowPointEditModal] = useState(false);
// // // //   const [currentAssignmentForEdit, setCurrentAssignmentForEdit] = useState(null);
// // // //   const [newPoints, setNewPoints] = useState(0);

// // // //   const formatDateForInput = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : "";
// // // //   const formatTimeForInput = (timeString) => timeString || "00:00";

// // // //   const fetchAllData = async () => {
// // // //     try {
// // // //       const [eventRes, teachersRes, rolesRes, assignmentsRes] = await Promise.all([
// // // //         axios.get(`https://facultypointsportal.onrender.com/eventid/${eventId}`),
// // // //         axios.get(`https://facultypointsportal.onrender.com/teachers`),
// // // //         axios.get(`https://facultypointsportal.onrender.com/events/${eventId}/roles`),
// // // //         axios.get(`https://facultypointsportal.onrender.com/events/assigned-teachers/${eventId}`)
// // // //       ]);

// // // //       setEventDetails(eventRes.data);
// // // //       setEventFormData({
// // // //         name: eventRes.data.name,
// // // //         description: eventRes.data.description,
// // // //         start_date: formatDateForInput(eventRes.data.start_date),
// // // //         end_date: formatDateForInput(eventRes.data.end_date),
// // // //         start_time: formatTimeForInput(eventRes.data.start_time),
// // // //         end_time: formatTimeForInput(eventRes.data.end_time),
// // // //       });
      
// // // //       setFacultyList(Array.isArray(teachersRes.data) ? teachersRes.data : []);
// // // //       setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
// // // //       setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);

// // // //     } catch (err) {
// // // //       console.error("Error fetching data:", err);
// // // //       alert("Failed to load event data.");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     setLoading(true);
// // // //     fetchAllData();
// // // //   }, [eventId]);

// // // //   const handleEventInputChange = (e) => setEventFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
// // // //   const handleUpdateEvent = async (e) => {
// // // //     e.preventDefault();
// // // //     try {
// // // //       await axios.put(`https://facultypointsportal.onrender.com/events/${eventId}`, eventFormData);
// // // //       alert("Event updated successfully!");
// // // //       setIsEventEditMode(false);
// // // //       await fetchAllData();
// // // //     } catch (error) {
// // // //       console.error("Error updating event:", error);
// // // //       alert(error.response?.data?.error || "An error occurred.");
// // // //     }
// // // //   };

// // // //   const handleAssignRole = async (e) => {
// // // //     e.preventDefault();
// // // //     try {
// // // //       if (isEditMode) {
// // // //         await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, {
// // // //           data: { assignment_id: assignmentFormData.assignmentId, deduct_points: true }
// // // //         });
// // // //       }
// // // //       await axios.post(`https://facultypointsportal.onrender.com/assignments`, {
// // // //         teacher_id: assignmentFormData.teacherId,
// // // //         role_id: assignmentFormData.roleId,
// // // //         event_id: eventId
// // // //       });
// // // //       await fetchAllData();
// // // //       resetForm();
// // // //     } catch (error) {
// // // //       console.error("Error assigning role:", error);
// // // //       alert(error.response?.data?.error || "An error occurred");
// // // //     }
// // // //   };
  
  
// // // //   const handleAutoAssign = async (roleId, roleName, availableSlots) => {
// // // //     const countStr = prompt(`How many teachers do you want to auto-assign to "${roleName}"?\n(Available slots: ${availableSlots})`, "1");

// // // //     if (countStr === null) {
// // // //       return; // User cancelled the prompt
// // // //     }

// // // //     const count = parseInt(countStr, 10);
// // // //     if (isNaN(count) || count <= 0) {
// // // //       alert("Please enter a valid, positive number.");
// // // //       return;
// // // //     }

// // // //     setAutoAssigningRoleId(roleId); // Set loading state for this specific role's button
// // // //     try {
// // // //       // Send the count in the request body
// // // //       const response = await axios.post(`https://facultypointsportal.onrender.com/events/${eventId}/roles/${roleId}/auto-assign`, {
// // // //         count: count 
// // // //       });

// // // //       // Use the more detailed message from the backend
// // // //       alert(`${response.data.message}\nAssigned: ${response.data.assigned_teachers.join(', ')}`);
// // // //       await fetchAllData(); // Refresh all data to show the new assignment(s)
// // // //     } catch (error) {
// // // //       console.error("Error auto-assigning teacher:", error);
// // // //       alert(error.response?.data?.error || "Failed to auto-assign teacher(s).");
// // // //     } finally {
// // // //       setAutoAssigningRoleId(null); // Clear loading state
// // // //     }
// // // //   };
// // // //   const handleEditAssignment = (assignment) => {
// // // //     setAssignmentFormData({
// // // //       teacherId: assignment.teacher_id,
// // // //       roleId: assignment.role_id,
// // // //       assignmentId: assignment.id
// // // //     });
// // // //     setIsEditMode(true);
// // // //     setShowAssignForm(true);
// // // //   };

// // // //   const handleDeleteAssignment = async (assignmentId) => {
// // // //     if (window.confirm("Are you sure? This will remove the assignment and deduct points.")) {
// // // //       try {
// // // //         await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, {
// // // //           data: { assignment_id: assignmentId, deduct_points: true }
// // // //         });
// // // //         await fetchAllData();
// // // //       } catch (error) {
// // // //         console.error("Error removing assignment:", error);
// // // //         alert(error.response?.data?.error || "An error occurred");
// // // //       }
// // // //     }
// // // //   };

// // // //   const handleCreateRole = async () => {
// // // //     const roleName = prompt("Enter role name:");
// // // //     if (!roleName) return;
// // // //     const roleDescription = prompt("Enter role description:");
// // // //     const rolePoints = parseInt(prompt("Enter points for this role:"), 10) || 0;
// // // //     const headCount = parseInt(prompt("Enter max teachers for this role:"), 10) || 1;
// // // //     try {
// // // //       await axios.post(`https://facultypointsportal.onrender.com/roles/${eventId}`, {
// // // //         name: roleName, description: roleDescription, point: rolePoints, head_count: headCount
// // // //       });
// // // //       await fetchAllData();
// // // //     } catch (error) {
// // // //       console.error("Error creating role:", error);
// // // //       alert(error.response?.data?.error || "An error occurred");
// // // //     }
// // // //   };

// // // //   const handleOpenPointEditModal = (assignment) => {
// // // //     const role = roles.find(r => r.id === assignment.role_id);
// // // //     const currentPoints = assignment.points_awarded != null ? assignment.points_awarded : (role ? role.point : 0);
// // // //     setCurrentAssignmentForEdit(assignment);
// // // //     setNewPoints(currentPoints);
// // // //     setShowPointEditModal(true);
// // // //   };

// // // //   const handleClosePointEditModal = () => {
// // // //     setShowPointEditModal(false);
// // // //     setCurrentAssignmentForEdit(null);
// // // //     setNewPoints(0);
// // // //   };

// // // //   const handleUpdatePoints = async (e) => {
// // // //     e.preventDefault();
// // // //     if (!currentAssignmentForEdit) return;
// // // //     try {
// // // //       await axios.put(`https://facultypointsportal.onrender.com/assignments/edit/${currentAssignmentForEdit.id}`, {
// // // //         points: parseInt(newPoints, 10)
// // // //       });
// // // //       alert("Points updated successfully!");
// // // //       handleClosePointEditModal();
// // // //       await fetchAllData();
// // // //     } catch (error) {
// // // //       console.error("Error updating points:", error);
// // // //       alert(error.response?.data?.error || "An error occurred.");
// // // //     }
// // // //   };

// // // //   const resetForm = () => {
// // // //     setAssignmentFormData({ teacherId: "", roleId: "", assignmentId: "" });
// // // //     setIsEditMode(false);
// // // //     setShowAssignForm(false);
// // // //   };
  
// // // //   if (loading) {
// // // //     return (
// // // //       <div className="event-dashboard-loading">
// // // //         <div className="spinner"></div>
// // // //         <p>Loading Event Data...</p>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="event-dashboard">
// // // //       <div className="dashboard-header">
// // // //         <button onClick={() => navigate(-1)} className="back-button">← Back to Dashboard</button>
// // // //         <h1>{eventDetails?.name}</h1>
// // // //       </div>

// // // //       <div className="card">
// // // //         <div className="card-header">
// // // //             <h2>Event Details</h2>
// // // //             {!isEventEditMode && <button className="btn btn-secondary" onClick={() => setIsEventEditMode(true)}>Edit Event</button>}
// // // //         </div>
// // // //         {isEventEditMode ? (
// // // //           <form onSubmit={handleUpdateEvent} className="form-container">
// // // //              <div className="form-group"><label>Name</label><input type="text" name="name" value={eventFormData.name} onChange={handleEventInputChange} required /></div>
// // // //             <div className="form-group"><label>Description</label><textarea name="description" value={eventFormData.description} onChange={handleEventInputChange} required /></div>
// // // //             <div className="form-grid">
// // // //                 <div className="form-group"><label>Start Date</label><input type="date" name="start_date" value={eventFormData.start_date} onChange={handleEventInputChange} required /></div>
// // // //                 <div className="form-group"><label>Start Time</label><input type="time" name="start_time" value={eventFormData.start_time} onChange={handleEventInputChange} required /></div>
// // // //                 <div className="form-group"><label>End Date</label><input type="date" name="end_date" value={eventFormData.end_date} onChange={handleEventInputChange} required /></div>
// // // //                 <div className="form-group"><label>End Time</label><input type="time" name="end_time" value={eventFormData.end_time} onChange={handleEventInputChange} required /></div>
// // // //             </div>
// // // //             <div className="form-actions">
// // // //                 <button type="submit" className="btn btn-success">Save Changes</button>
// // // //                 <button type="button" onClick={() => setIsEventEditMode(false)} className="btn btn-secondary">Cancel</button>
// // // //             </div>
// // // //           </form>
// // // //         ) : (
// // // //           <div className="event-details-display">
// // // //             <p><strong>Description:</strong> {eventDetails?.description}</p>
// // // //             <p><strong>Duration:</strong> {new Date(eventDetails?.start_date).toLocaleString()} - {new Date(eventDetails?.end_date).toLocaleString()}</p>
// // // //           </div>
// // // //         )}
// // // //       </div>

// // // //       <div className="card">
// // // //         <div className="card-header"><h2>Event Roles</h2><button className="btn btn-success" onClick={handleCreateRole}>+ Add Role</button></div>
// // // //         <div className="table-container">
// // // //           <table className="table">
// // // //             <thead><tr><th>Role</th><th>Description</th><th>Base Points</th><th>Assigned</th><th>Actions</th></tr></thead>
// // // //             {/* <tbody>
// // // //               {roles.length > 0 ? roles.map(role => {
// // // //                   const assignedCount = assignments.filter(a => a.role_id === role.id).length;
// // // //                   const isFull = assignedCount >= role.head_count;
// // // //                   const isAutoAssigning = autoAssigningRoleId === role.id;

// // // //                   return (
// // // //                     <tr key={role.id}>
// // // //                       <td>{role.name}</td>
// // // //                       <td>{role.description}</td>
// // // //                       <td>{role.point}</td>
// // // //                       <td>{assignedCount} / {role.head_count}</td>
// // // //                       <td>
// // // //                         <button 
// // // //                           className="btn btn-primary btn-sm"
// // // //                           onClick={() => handleAutoAssign(role.id, role.name)}
// // // //                           disabled={isFull || isAutoAssigning}
// // // //                           title={isFull ? "This role is full" : "Assign teacher with lowest points"}
// // // //                         >
// // // //                           {isAutoAssigning ? 'Assigning...' : 'Auto-Assign'}
// // // //                         </button>
// // // //                       </td>
// // // //                     </tr>
// // // //                   )
// // // //                 }) : (<tr><td colSpan="5">No roles defined for this event.</td></tr>)}
// // // //             </tbody> */}
// // // //             <tbody>
// // // //   {roles.length > 0 ? roles.map(role => {
// // // //       const assignedCount = assignments.filter(a => a.role_id === role.id).length;
// // // //       const isFull = assignedCount >= role.head_count;
// // // //       const isAutoAssigning = autoAssigningRoleId === role.id;
// // // //       // NEW: Calculate available slots to pass to the handler
// // // //       const availableSlots = role.head_count - assignedCount;

// // // //       return (
// // // //         <tr key={role.id}>
// // // //           <td>{role.name}</td>
// // // //           <td>{role.description}</td>
// // // //           <td>{role.point}</td>
// // // //           <td>{assignedCount} / {role.head_count}</td>
// // // //           <td>
// // // //             {/* UPDATED: The onClick now passes the availableSlots */}
// // // //             <button 
// // // //               className="btn btn-primary btn-sm"
// // // //               onClick={() => handleAutoAssign(role.id, role.name, availableSlots)}
// // // //               disabled={isFull || isAutoAssigning}
// // // //               title={isFull ? "This role is full" : "Assign teacher(s) with lowest points"}
// // // //             >
// // // //               {isAutoAssigning ? 'Assigning...' : 'Auto-Assign'}
// // // //             </button>
// // // //           </td>
// // // //         </tr>
// // // //       )
// // // //     }) : (<tr><td colSpan="5">No roles defined for this event.</td></tr>)}
// // // // </tbody>
// // // //           </table>
// // // //         </div>
// // // //       </div>
      
// // // //       <div className="card">
// // // //         <div className="card-header"><h2>Faculty Assignments</h2><button className="btn btn-primary" onClick={() => { resetForm(); setShowAssignForm(prev => !prev); }}>{showAssignForm ? "Cancel" : "Assign Manually"}</button></div>
// // // //         {showAssignForm && (
// // // //           <form onSubmit={handleAssignRole} className="form-container slide-down">
// // // //             <h3>{isEditMode ? "Change Role Assignment" : "Assign New Role"}</h3>
// // // //             <div className="form-group"><label>Faculty</label><select name="teacherId" value={assignmentFormData.teacherId} onChange={(e) => setAssignmentFormData(p => ({...p, teacherId: e.target.value}))} required><option value="" disabled>Select a faculty member</option>{facultyList.map(f => <option key={f._id} value={f._id}>{f.name} ({f.department_name})</option>)}</select></div>
// // // //             <div className="form-group"><label>Role</label><select name="roleId" value={assignmentFormData.roleId} onChange={(e) => setAssignmentFormData(p => ({...p, roleId: e.target.value}))} required><option value="" disabled>Select a role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
// // // //             <div className="form-actions"><button type="submit" className="btn btn-success">{isEditMode ? "Update Assignment" : "Assign Role"}</button></div>
// // // //           </form>
// // // //         )}
// // // //         <div className="table-container">
// // // //           <table className="table">
// // // //             <thead><tr><th>Faculty</th><th>Role</th><th>Points Awarded</th><th>Actions</th></tr></thead>
// // // //             <tbody>
// // // //               {assignments.length > 0 ? assignments.map(assignment => {
// // // //                 const role = roles.find(r => r.id === assignment.role_id);
// // // //                 const hasCustomPoints = assignment.points_awarded != null;
// // // //                 const displayPoints = hasCustomPoints ? assignment.points_awarded : role?.point;

// // // //                 return (
// // // //                   <tr key={assignment.id}>
// // // //                     <td>{assignment.teachername}</td>
// // // //                     <td>{assignment.rolename}</td>
// // // //                     <td>
// // // //                       <div className="points-cell">
// // // //                         <strong>{displayPoints ?? "N/A"}</strong>
// // // //                         {hasCustomPoints && <span className="custom-point-indicator" title="Points have been manually edited">★</span>}
// // // //                       </div>
// // // //                     </td>
// // // //                     <td>
// // // //                       <div className="table-actions">
// // // //                         <button className="btn btn-sm btn-secondary" onClick={() => handleEditAssignment(assignment)}>Change</button>
// // // //                         <button className="btn btn-sm btn-warning" onClick={() => handleOpenPointEditModal(assignment)}>Edit Points</button>
// // // //                         <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAssignment(assignment.id)}>Remove</button>
// // // //                       </div>
// // // //                     </td>
// // // //                   </tr>
// // // //                 );
// // // //               }) : (<tr><td colSpan="4">No faculty assigned to this event yet.</td></tr>)}
// // // //             </tbody>
// // // //           </table>
// // // //         </div>
// // // //       </div>

// // // //       {showPointEditModal && (
// // // //         <div className="modal-overlay">
// // // //           <div className="modal-content">
// // // //             <div className="modal-header">
// // // //                 <h3>Edit Assignment Points</h3>
// // // //                 <button onClick={handleClosePointEditModal} className="modal-close-btn">&times;</button>
// // // //             </div>
// // // //             <form onSubmit={handleUpdatePoints} className="form-container">
// // // //               <p>For: <strong>{currentAssignmentForEdit?.teachername}</strong> in role <strong>{currentAssignmentForEdit?.rolename}</strong></p>
// // // //               <div className="form-group"><label>New Points</label><input type="number" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} required /></div>
// // // //               <div className="form-actions">
// // // //                 <button type="submit" className="btn btn-success">Save Points</button>
// // // //                 <button type="button" onClick={handleClosePointEditModal} className="btn btn-secondary">Cancel</button>
// // // //               </div>
// // // //             </form>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default EventDashboard;

// // // import React, { useState, useEffect, useMemo } from "react";
// // // import axios from "axios";
// // // import { useParams, useNavigate } from "react-router-dom";
// // // import "./EventDashboard.css"; // Ensure this CSS file is present

// // // const EventDashboard = () => {
// // //   const { eventId } = useParams();
// // //   const navigate = useNavigate();

// // //   // Component states
// // //   const [eventDetails, setEventDetails] = useState(null);
// // //   const [facultyList, setFacultyList] = useState([]);
// // //   const [roles, setRoles] = useState([]);
// // //   const [assignments, setAssignments] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [autoAssigningRoleId, setAutoAssigningRoleId] = useState(null);

// // //   // Form states
// // //   const [showAssignForm, setShowAssignForm] = useState(false);
// // //   const [isEditMode, setIsEditMode] = useState(false);
// // //   const [assignmentFormData, setAssignmentFormData] = useState({ teacherId: "", roleId: "", assignmentId: "" });
// // //   const [facultySearch, setFacultySearch] = useState("");

// // //   // Event edit states
// // //   const [isEventEditMode, setIsEventEditMode] = useState(false);
// // //   const [eventFormData, setEventFormData] = useState({ name: "", description: "", start_date: "", end_date: "", start_time: "", end_time: "" });

// // //   // Point edit modal states
// // //   const [showPointEditModal, setShowPointEditModal] = useState(false);
// // //   const [currentAssignmentForEdit, setCurrentAssignmentForEdit] = useState(null);
// // //   const [newPoints, setNewPoints] = useState(0);

// // //   const formatDateForInput = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : "";
// // //   const formatTimeForInput = (timeString) => timeString || "00:00";

// // //   const fetchAllData = async () => {
// // //     try {
// // //       const [eventRes, teachersRes, rolesRes, assignmentsRes] = await Promise.all([
// // //         axios.get(`https://facultypointsportal.onrender.com/eventid/${eventId}`),
// // //         axios.get(`https://facultypointsportal.onrender.com/teachers`),
// // //         axios.get(`https://facultypointsportal.onrender.com/events/${eventId}/roles`),
// // //         axios.get(`https://facultypointsportal.onrender.com/events/assigned-teachers/${eventId}`)
// // //       ]);

// // //       setEventDetails(eventRes.data);
// // //       setEventFormData({
// // //         name: eventRes.data.name,
// // //         description: eventRes.data.description,
// // //         start_date: formatDateForInput(eventRes.data.start_date),
// // //         end_date: formatDateForInput(eventRes.data.end_date),
// // //         start_time: formatTimeForInput(eventRes.data.start_time),
// // //         end_time: formatTimeForInput(eventRes.data.end_time),
// // //       });

// // //       // Assuming teachersRes.data contains a 'points' property for sorting
// // //       setFacultyList(Array.isArray(teachersRes.data) ? teachersRes.data : []);
// // //       setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
// // //       setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);

// // //     } catch (err)  {
// // //       console.error("Error fetching data:", err);
// // //       alert("Failed to load event data.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     setLoading(true);
// // //     fetchAllData();
// // //   }, [eventId]);

// // //     const groupedAndSortedFaculty = useMemo(() => {
// // //     const sortedFaculty = [...facultyList].sort((a, b) => (a.points || 0) - (b.points || 0));

// // //     const filteredFaculty = sortedFaculty.filter(f =>
// // //       f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
// // //       f.department_name.toLowerCase().includes(facultySearch.toLowerCase())
// // //     );

// // //     return filteredFaculty.reduce((acc, faculty) => {
// // //       const department = faculty.department_name || 'No Department';
// // //       if (!acc[department]) {
// // //         acc[department] = [];
// // //       }
// // //       acc[department].push(faculty);
// // //       return acc;
// // //     }, {});
// // //   }, [facultyList, facultySearch]);


// // //   const handleEventInputChange = (e) => setEventFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

// // //   const handleUpdateEvent = async (e) => {
// // //     e.preventDefault();
// // //     try {
// // //       await axios.put(`https://facultypointsportal.onrender.com/events/${eventId}`, eventFormData);
// // //       alert("Event updated successfully!");
// // //       setIsEventEditMode(false);
// // //       await fetchAllData();
// // //     } catch (error) {
// // //       console.error("Error updating event:", error);
// // //       alert(error.response?.data?.error || "An error occurred.");
// // //     }
// // //   };

// // //   const handleAssignRole = async (e) => {
// // //     e.preventDefault();
// // //     try {
// // //       if (isEditMode) {
// // //         await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, {
// // //           data: { assignment_id: assignmentFormData.assignmentId, deduct_points: true }
// // //         });
// // //       }
// // //       await axios.post(`https://facultypointsportal.onrender.com/assignments`, {
// // //         teacher_id: assignmentFormData.teacherId,
// // //         role_id: assignmentFormData.roleId,
// // //         event_id: eventId
// // //       });
// // //       await fetchAllData();
// // //       resetForm();
// // //     } catch (error) {
// // //       console.error("Error assigning role:", error);
// // //       alert(error.response?.data?.error || "An error occurred");
// // //     }
// // //   };


// // //   const handleAutoAssign = async (roleId, roleName, availableSlots) => {
// // //     const countStr = prompt(`How many teachers do you want to auto-assign to "${roleName}"?\n(Available slots: ${availableSlots})`, "1");

// // //     if (countStr === null) {
// // //       return;
// // //     }

// // //     const count = parseInt(countStr, 10);
// // //     if (isNaN(count) || count <= 0) {
// // //       alert("Please enter a valid, positive number.");
// // //       return;
// // //     }

// // //     setAutoAssigningRoleId(roleId);
// // //     try {
// // //       const response = await axios.post(`https://facultypointsportal.onrender.com/events/${eventId}/roles/${roleId}/auto-assign`, {
// // //         count: count
// // //       });

// // //       alert(`${response.data.message}\nAssigned: ${response.data.assigned_teachers.join(', ')}`);
// // //       await fetchAllData();
// // //     } catch (error) {
// // //       console.error("Error auto-assigning teacher:", error);
// // //       alert(error.response?.data?.error || "Failed to auto-assign teacher(s).");
// // //     } finally {
// // //       setAutoAssigningRoleId(null);
// // //     }
// // //   };
// // //   const handleEditAssignment = (assignment) => {
// // //     setAssignmentFormData({
// // //       teacherId: assignment.teacher_id,
// // //       roleId: assignment.role_id,
// // //       assignmentId: assignment.id
// // //     });
// // //     setIsEditMode(true);
// // //     setShowAssignForm(true);
// // //   };

// // //   const handleDeleteAssignment = async (assignmentId) => {
// // //     if (window.confirm("Are you sure? This will remove the assignment and deduct points.")) {
// // //       try {
// // //         await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, {
// // //           data: { assignment_id: assignmentId, deduct_points: true }
// // //         });
// // //         await fetchAllData();
// // //       } catch (error) {
// // //         console.error("Error removing assignment:", error);
// // //         alert(error.response?.data?.error || "An error occurred");
// // //       }
// // //     }
// // //   };

// // //   const handleCreateRole = async () => {
// // //     const roleName = prompt("Enter role name:");
// // //     if (!roleName) return;
// // //     const roleDescription = prompt("Enter role description:");
// // //     const rolePoints = parseInt(prompt("Enter points for this role:"), 10) || 0;
// // //     const headCount = parseInt(prompt("Enter max teachers for this role:"), 10) || 1;
// // //     try {
// // //       await axios.post(`https://facultypointsportal.onrender.com/roles/${eventId}`, {
// // //         name: roleName, description: roleDescription, point: rolePoints, head_count: headCount
// // //       });
// // //       await fetchAllData();
// // //     } catch (error) {
// // //       console.error("Error creating role:", error);
// // //       alert(error.response?.data?.error || "An error occurred");
// // //     }
// // //   };

// // //   const handleOpenPointEditModal = (assignment) => {
// // //     const role = roles.find(r => r.id === assignment.role_id);
// // //     const currentPoints = assignment.points_awarded != null ? assignment.points_awarded : (role ? role.point : 0);
// // //     setCurrentAssignmentForEdit(assignment);
// // //     setNewPoints(currentPoints);
// // //     setShowPointEditModal(true);
// // //   };

// // //   const handleClosePointEditModal = () => {
// // //     setShowPointEditModal(false);
// // //     setCurrentAssignmentForEdit(null);
// // //     setNewPoints(0);
// // //   };

// // //   const handleUpdatePoints = async (e) => {
// // //     e.preventDefault();
// // //     if (!currentAssignmentForEdit) return;
// // //     try {
// // //       await axios.put(`https://facultypointsportal.onrender.com/assignments/edit/${currentAssignmentForEdit.id}`, {
// // //         points: parseInt(newPoints, 10)
// // //       });
// // //       alert("Points updated successfully!");
// // //       handleClosePointEditModal();
// // //       await fetchAllData();
// // //     } catch (error) {
// // //       console.error("Error updating points:", error);
// // //       alert(error.response?.data?.error || "An error occurred.");
// // //     }
// // //   };

// // //   const resetForm = () => {
// // //     setAssignmentFormData({ teacherId: "", roleId: "", assignmentId: "" });
// // //     setFacultySearch("");
// // //     setIsEditMode(false);
// // //     setShowAssignForm(false);
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="event-dashboard-loading">
// // //         <div className="spinner"></div>
// // //         <p>Loading Event Data...</p>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="event-dashboard">
// // //       <div className="dashboard-header">
// // //         <button onClick={() => navigate(-1)} className="back-button">← Back to Dashboard</button>
// // //         <h1>{eventDetails?.name}</h1>
// // //       </div>

// // //       <div className="card">
// // //         <div className="card-header">
// // //             <h2>Event Details</h2>
// // //             {!isEventEditMode && <button className="btn btn-secondary" onClick={() => setIsEventEditMode(true)}>Edit Event</button>}
// // //         </div>
// // //         {isEventEditMode ? (
// // //           <form onSubmit={handleUpdateEvent} className="form-container">
// // //              <div className="form-group"><label>Name</label><input type="text" name="name" value={eventFormData.name} onChange={handleEventInputChange} required /></div>
// // //             <div className="form-group"><label>Description</label><textarea name="description" value={eventFormData.description} onChange={handleEventInputChange} required /></div>
// // //             <div className="form-grid">
// // //                 <div className="form-group"><label>Start Date</label><input type="date" name="start_date" value={eventFormData.start_date} onChange={handleEventInputChange} required /></div>
// // //                 <div className="form-group"><label>Start Time</label><input type="time" name="start_time" value={eventFormData.start_time} onChange={handleEventInputChange} required /></div>
// // //                 <div className="form-group"><label>End Date</label><input type="date" name="end_date" value={eventFormData.end_date} onChange={handleEventInputChange} required /></div>
// // //                 <div className="form-group"><label>End Time</label><input type="time" name="end_time" value={eventFormData.end_time} onChange={handleEventInputChange} required /></div>
// // //             </div>
// // //             <div className="form-actions">
// // //                 <button type="submit" className="btn btn-success">Save Changes</button>
// // //                 <button type="button" onClick={() => setIsEventEditMode(false)} className="btn btn-secondary">Cancel</button>
// // //             </div>
// // //           </form>
// // //         ) : (
// // //           <div className="event-details-display">
// // //             <p><strong>Description:</strong> {eventDetails?.description}</p>
// // //             <p><strong>Duration:</strong> {new Date(eventDetails?.start_date).toLocaleString()} - {new Date(eventDetails?.end_date).toLocaleString()}</p>
// // //           </div>
// // //         )}
// // //       </div>

// // //       <div className="card">
// // //         <div className="card-header"><h2>Event Roles</h2><button className="btn btn-success" onClick={handleCreateRole}>+ Add Role</button></div>
// // //         <div className="table-container">
// // //           <table className="table">
// // //             <thead><tr><th>Role</th><th>Description</th><th>Base Points</th><th>Assigned</th><th>Actions</th></tr></thead>
// // //             <tbody>
// // //               {roles.length > 0 ? roles.map(role => {
// // //                   const assignedCount = assignments.filter(a => a.role_id === role.id).length;
// // //                   const isFull = assignedCount >= role.head_count;
// // //                   const isAutoAssigning = autoAssigningRoleId === role.id;
// // //                   const availableSlots = role.head_count - assignedCount;

// // //                   return (
// // //                     <tr key={role.id}>
// // //                       <td>{role.name}</td>
// // //                       <td>{role.description}</td>
// // //                       <td>{role.point}</td>
// // //                       <td>{assignedCount} / {role.head_count}</td>
// // //                       <td>
// // //                         <button
// // //                           className="btn btn-primary btn-sm"
// // //                           onClick={() => handleAutoAssign(role.id, role.name, availableSlots)}
// // //                           disabled={isFull || isAutoAssigning}
// // //                           title={isFull ? "This role is full" : "Assign teacher(s) with lowest points"}
// // //                         >
// // //                           {isAutoAssigning ? 'Assigning...' : 'Auto-Assign'}
// // //                         </button>
// // //                       </td>
// // //                     </tr>
// // //                   )
// // //                 }) : (<tr><td colSpan="5">No roles defined for this event.</td></tr>)}
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       </div>

// // //       <div className="card">
// // //         <div className="card-header"><h2>Faculty Assignments</h2><button className="btn btn-primary" onClick={() => { resetForm(); setShowAssignForm(prev => !prev); }}>{showAssignForm ? "Cancel" : "Assign Manually"}</button></div>
// // //         {showAssignForm && (
// // //           <form onSubmit={handleAssignRole} className="form-container slide-down">
// // //             <h3>{isEditMode ? "Change Role Assignment" : "Assign New Role"}</h3>
// // //              <div className="form-group">
// // //                 <label>Search Faculty (by Name or Department)</label>
// // //                 <input
// // //                     type="text"
// // //                     placeholder="Search..."
// // //                     value={facultySearch}
// // //                     onChange={(e) => setFacultySearch(e.target.value)}
// // //                 />
// // //             </div>
// // //             <div className="form-group">
// // //                 <label>Faculty</label>
// // //                 <select name="teacherId" value={assignmentFormData.teacherId} onChange={(e) => setAssignmentFormData(p => ({...p, teacherId: e.target.value}))} required>
// // //                     <option value="" disabled>Select a faculty member</option>
// // //                     {Object.keys(groupedAndSortedFaculty).map(department => (
// // //                         <optgroup label={department} key={department}>
// // //                             {groupedAndSortedFaculty[department].map(f => (
// // //                                 <option key={f._id} value={f._id}>
// // //                                     {f.name} ({f.points || 0} points)
// // //                                 </option>
// // //                             ))}
// // //                         </optgroup>
// // //                     ))}
// // //                 </select>
// // //             </div>
// // //             <div className="form-group"><label>Role</label><select name="roleId" value={assignmentFormData.roleId} onChange={(e) => setAssignmentFormData(p => ({...p, roleId: e.target.value}))} required><option value="" disabled>Select a role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
// // //             <div className="form-actions"><button type="submit" className="btn btn-success">{isEditMode ? "Update Assignment" : "Assign Role"}</button></div>
// // //           </form>
// // //         )}
// // //         <div className="table-container">
// // //           <table className="table">
// // //             <thead><tr><th>Faculty</th><th>Role</th><th>Points Awarded</th><th>Actions</th></tr></thead>
// // //             <tbody>
// // //               {assignments.length > 0 ? assignments.map(assignment => {
// // //                 const role = roles.find(r => r.id === assignment.role_id);
// // //                 const hasCustomPoints = assignment.points_awarded != null;
// // //                 const displayPoints = hasCustomPoints ? assignment.points_awarded : role?.point;

// // //                 return (
// // //                   <tr key={assignment.id}>
// // //                     <td>{assignment.teachername}</td>
// // //                     <td>{assignment.rolename}</td>
// // //                     <td>
// // //                       <div className="points-cell">
// // //                         <strong>{displayPoints ?? "N/A"}</strong>
// // //                         {hasCustomPoints && <span className="custom-point-indicator" title="Points have been manually edited">★</span>}
// // //                       </div>
// // //                     </td>
// // //                     <td>
// // //                       <div className="table-actions">
// // //                         <button className="btn btn-sm btn-secondary" onClick={() => handleEditAssignment(assignment)}>Change</button>
// // //                         <button className="btn btn-sm btn-warning" onClick={() => handleOpenPointEditModal(assignment)}>Edit Points</button>
// // //                         <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAssignment(assignment.id)}>Remove</button>
// // //                       </div>
// // //                     </td>
// // //                   </tr>
// // //                 );
// // //               }) : (<tr><td colSpan="4">No faculty assigned to this event yet.</td></tr>)}
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       </div>

// // //       {showPointEditModal && (
// // //         <div className="modal-overlay">
// // //           <div className="modal-content">
// // //             <div className="modal-header">
// // //                 <h3>Edit Assignment Points</h3>
// // //                 <button onClick={handleClosePointEditModal} className="modal-close-btn">&times;</button>
// // //             </div>
// // //             <form onSubmit={handleUpdatePoints} className="form-container">
// // //               <p>For: <strong>{currentAssignmentForEdit?.teachername}</strong> in role <strong>{currentAssignmentForEdit?.rolename}</strong></p>
// // //               <div className="form-group"><label>New Points</label><input type="number" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} required /></div>
// // //               <div className="form-actions">
// // //                 <button type="submit" className="btn btn-success">Save Points</button>
// // //                 <button type="button" onClick={handleClosePointEditModal} className="btn btn-secondary">Cancel</button>
// // //               </div>
// // //             </form>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default EventDashboard;
// // import React, { useState, useEffect, useMemo } from "react";
// // import axios from "axios";
// // import { useParams, useNavigate } from "react-router-dom";
// // import "./EventDashboard.css"; // Ensure this CSS file is present

// // const EventDashboard = () => {
// //   const { eventId } = useParams();
// //   const navigate = useNavigate();

// //   // Component states
// //   const [eventDetails, setEventDetails] = useState(null);
// //   const [facultyList, setFacultyList] = useState([]);
// //   const [roles, setRoles] = useState([]);
// //   const [assignments, setAssignments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [autoAssigningRoleId, setAutoAssigningRoleId] = useState(null);

// //   // --- NEW --- States for the main assignment modal and its filters
// //   const [showAssignModal, setShowAssignModal] = useState(false);
// //   const [nameSearch, setNameSearch] = useState("");
// //   const [departmentSearch, setDepartmentSearch] = useState("");

// //   // States for the second (role selection) modal
// //   const [showRoleModal, setShowRoleModal] = useState(false);
// //   const [selectedFaculty, setSelectedFaculty] = useState(null);
// //   const [selectedRoleId, setSelectedRoleId] = useState("");

// //   // Form states are now primarily for *editing* existing assignments
// //   const [showEditForm, setShowEditForm] = useState(false);
// //   const [isEditMode, setIsEditMode] = useState(false);
// //   const [assignmentFormData, setAssignmentFormData] = useState({ teacherId: "", roleId: "", assignmentId: "" });

// //   // Event edit states
// //   const [isEventEditMode, setIsEventEditMode] = useState(false);
// //   const [eventFormData, setEventFormData] = useState({ name: "", description: "", start_date: "", end_date: "", start_time: "", end_time: "" });

// //   // Point edit modal states
// //   const [showPointEditModal, setShowPointEditModal] = useState(false);
// //   const [currentAssignmentForEdit, setCurrentAssignmentForEdit] = useState(null);
// //   const [newPoints, setNewPoints] = useState(0);

// //   const formatDateForInput = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : "";
// //   const formatTimeForInput = (timeString) => timeString || "00:00";

// //   const fetchAllData = async () => {
// //     try {
// //       const [eventRes, teachersRes, rolesRes, assignmentsRes] = await Promise.all([
// //         axios.get(`https://facultypointsportal.onrender.com/eventid/${eventId}`),
// //         axios.get(`https://facultypointsportal.onrender.com/teachers`),
// //         axios.get(`https://facultypointsportal.onrender.com/events/${eventId}/roles`),
// //         axios.get(`https://facultypointsportal.onrender.com/events/assigned-teachers/${eventId}`)
// //       ]);
// //       setEventDetails(eventRes.data);
// //       setEventFormData({ name: eventRes.data.name, description: eventRes.data.description, start_date: formatDateForInput(eventRes.data.start_date), end_date: formatDateForInput(eventRes.data.end_date), start_time: formatTimeForInput(eventRes.data.start_time), end_time: formatTimeForInput(eventRes.data.end_time) });
// //       setFacultyList(Array.isArray(teachersRes.data) ? teachersRes.data : []);
// //       setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
// //       setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
// //     } catch (err) {
// //       console.error("Error fetching data:", err);
// //       alert("Failed to load event data.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => { setLoading(true); fetchAllData(); }, [eventId]);

// //   // --- UPDATED --- Memo hook now uses column-specific filters
// //   const filteredAndSortedFaculty = useMemo(() => {
// //     return [...facultyList]
// //       .sort((a, b) => (a.points || 0) - (b.points || 0))
// //       .filter(f =>
// //         f.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
// //         f.department_name.toLowerCase().includes(departmentSearch.toLowerCase())
// //       );
// //   }, [facultyList, nameSearch, departmentSearch]);

// //   const handleEventInputChange = (e) => setEventFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
// //   const handleUpdateEvent = async (e) => {
// //     e.preventDefault();
// //     try {
// //       await axios.put(`https://facultypointsportal.onrender.com/events/${eventId}`, eventFormData);
// //       alert("Event updated successfully!");
// //       setIsEventEditMode(false);
// //       await fetchAllData();
// //     } catch (error) { console.error("Error updating event:", error); alert(error.response?.data?.error || "An error occurred."); }
// //   };

// //   const handleUpdateAssignment = async (e) => {
// //     e.preventDefault();
// //     try {
// //       await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, { data: { assignment_id: assignmentFormData.assignmentId, deduct_points: true } });
// //       await axios.post(`https://facultypointsportal.onrender.com/assignments`, { teacher_id: assignmentFormData.teacherId, role_id: assignmentFormData.roleId, event_id: eventId });
// //       await fetchAllData();
// //       resetEditForm();
// //     } catch (error) { console.error("Error updating assignment:", error); alert(error.response?.data?.error || "An error occurred"); }
// //   };
  
// //   const handleSelectFacultyForAssignment = (faculty) => {
// //     setSelectedFaculty(faculty);
// //     setShowRoleModal(true);
// //   };

// //   const handleCloseRoleModal = () => {
// //     setShowRoleModal(false);
// //     setSelectedFaculty(null);
// //     setSelectedRoleId("");
// //   };

// //   const handleConfirmAssignment = async (e) => {
// //     e.preventDefault();
// //     if (!selectedFaculty || !selectedRoleId) return alert("Invalid selection.");
// //     try {
// //       await axios.post(`https://facultypointsportal.onrender.com/assignments`, { teacher_id: selectedFaculty._id, role_id: selectedRoleId, event_id: eventId });
// //       alert(`Assigned ${selectedFaculty.name} successfully!`);
// //       handleCloseRoleModal();
// //       await fetchAllData();
// //     } catch (error) { console.error("Error assigning role:", error); alert(error.response?.data?.error || "An error occurred"); }
// //   };

// //   const handleAutoAssign = async (roleId, roleName, availableSlots) => {
// //     const countStr = prompt(`How many teachers do you want to auto-assign to "${roleName}"?\n(Available slots: ${availableSlots})`, "1");
// //     if (countStr === null) return;
// //     const count = parseInt(countStr, 10);
// //     if (isNaN(count) || count <= 0) return alert("Please enter a valid, positive number.");
// //     setAutoAssigningRoleId(roleId);
// //     try {
// //       const response = await axios.post(`https://facultypointsportal.onrender.com/events/${eventId}/roles/${roleId}/auto-assign`, { count: count });
// //       alert(`${response.data.message}\nAssigned: ${response.data.assigned_teachers.join(', ')}`);
// //       await fetchAllData();
// //     } catch (error) { console.error("Error auto-assigning teacher:", error); alert(error.response?.data?.error || "Failed to auto-assign teacher(s).");
// //     } finally { setAutoAssigningRoleId(null); }
// //   };

// //   const handleEditAssignment = (assignment) => {
// //     setAssignmentFormData({ teacherId: assignment.teacher_id, roleId: assignment.role_id, assignmentId: assignment.id });
// //     setIsEditMode(true);
// //     setShowEditForm(true);
// //   };

// //   const handleDeleteAssignment = async (assignmentId) => {
// //     if (window.confirm("Are you sure? This will remove the assignment and deduct points.")) {
// //       try {
// //         await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, { data: { assignment_id: assignmentId, deduct_points: true } });
// //         await fetchAllData();
// //       } catch (error) { console.error("Error removing assignment:", error); alert(error.response?.data?.error || "An error occurred"); }
// //     }
// //   };

// //   const handleCreateRole = async () => {
// //     const roleName = prompt("Enter role name:");
// //     if (!roleName) return;
// //     const roleDescription = prompt("Enter role description:");
// //     const rolePoints = parseInt(prompt("Enter points for this role:"), 10) || 0;
// //     const headCount = parseInt(prompt("Enter max teachers for this role:"), 10) || 1;
// //     try {
// //       await axios.post(`https://facultypointsportal.onrender.com/roles/${eventId}`, { name: roleName, description: roleDescription, point: rolePoints, head_count: headCount });
// //       await fetchAllData();
// //     } catch (error) { console.error("Error creating role:", error); alert(error.response?.data?.error || "An error occurred"); }
// //   };

// //   const handleOpenPointEditModal = (assignment) => {
// //     const role = roles.find(r => r.id === assignment.role_id);
// //     const currentPoints = assignment.points_awarded != null ? assignment.points_awarded : (role ? role.point : 0);
// //     setCurrentAssignmentForEdit(assignment);
// //     setNewPoints(currentPoints);
// //     setShowPointEditModal(true);
// //   };

// //   const handleClosePointEditModal = () => { setShowPointEditModal(false); setCurrentAssignmentForEdit(null); setNewPoints(0); };

// //   const handleUpdatePoints = async (e) => {
// //     e.preventDefault();
// //     if (!currentAssignmentForEdit) return;
// //     try {
// //       await axios.put(`https://facultypointsportal.onrender.com/assignments/edit/${currentAssignmentForEdit.id}`, { points: parseInt(newPoints, 10) });
// //       alert("Points updated successfully!");
// //       handleClosePointEditModal();
// //       await fetchAllData();
// //     } catch (error) { console.error("Error updating points:", error); alert(error.response?.data?.error || "An error occurred."); }
// //   };
  
// //   const resetEditForm = () => {
// //     setAssignmentFormData({ teacherId: "", roleId: "", assignmentId: "" });
// //     setIsEditMode(false);
// //     setShowEditForm(false);
// //   };

// //   const openAssignModal = () => {
// //     setShowAssignModal(true);
// //     setShowEditForm(false);
// //   }

// //   const closeAssignModal = () => {
// //     setShowAssignModal(false);
// //     setNameSearch("");
// //     setDepartmentSearch("");
// //   }
  
// //   if (loading) return <div className="event-dashboard-loading"><div className="spinner"></div><p>Loading Event Data...</p></div>;

// //   return (
// //     <div className="event-dashboard">
// //       <div className="dashboard-header"><button onClick={() => navigate(-1)} className="back-button">← Back to Dashboard</button><h1>{eventDetails?.name}</h1></div>
      
// //       {/* Cards for Event Details and Roles remain the same */}
// //       <div className="card">
// //         <div className="card-header"><h2>Event Details</h2>{!isEventEditMode && <button className="btn btn-secondary" onClick={() => setIsEventEditMode(true)}>Edit Event</button>}</div>
// //         {isEventEditMode ? (
// //           <form onSubmit={handleUpdateEvent} className="form-container">
// //             <div className="form-group"><label>Name</label><input type="text" name="name" value={eventFormData.name} onChange={handleEventInputChange} required /></div>
// //             <div className="form-group"><label>Description</label><textarea name="description" value={eventFormData.description} onChange={handleEventInputChange} required /></div>
// //             <div className="form-grid">
// //                 <div className="form-group"><label>Start Date</label><input type="date" name="start_date" value={eventFormData.start_date} onChange={handleEventInputChange} required /></div>
// //                 <div className="form-group"><label>Start Time</label><input type="time" name="start_time" value={eventFormData.start_time} onChange={handleEventInputChange} required /></div>
// //                 <div className="form-group"><label>End Date</label><input type="date" name="end_date" value={eventFormData.end_date} onChange={handleEventInputChange} required /></div>
// //                 <div className="form-group"><label>End Time</label><input type="time" name="end_time" value={eventFormData.end_time} onChange={handleEventInputChange} required /></div>
// //             </div>
// //             <div className="form-actions"><button type="submit" className="btn btn-success">Save Changes</button><button type="button" onClick={() => setIsEventEditMode(false)} className="btn btn-secondary">Cancel</button></div>
// //           </form>
// //         ) : (
// //           <div className="event-details-display"><p><strong>Description:</strong> {eventDetails?.description}</p><p><strong>Duration:</strong> {new Date(eventDetails?.start_date).toLocaleString()} - {new Date(eventDetails?.end_date).toLocaleString()}</p></div>
// //         )}
// //       </div>

// //       <div className="card">
// //         <div className="card-header"><h2>Event Roles</h2><button className="btn btn-success" onClick={handleCreateRole}>+ Add Role</button></div>
// //         <div className="table-container">
// //           <table className="table">
// //             <thead><tr><th>Role</th><th>Description</th><th>Base Points</th><th>Assigned</th><th>Actions</th></tr></thead>
// //             <tbody>
// //               {roles.length > 0 ? roles.map(role => {
// //                   const assignedCount = assignments.filter(a => a.role_id === role.id).length;
// //                   const isFull = assignedCount >= role.head_count;
// //                   const isAutoAssigning = autoAssigningRoleId === role.id;
// //                   const availableSlots = role.head_count - assignedCount;

// //                   return (
// //                     <tr key={role.id}><td>{role.name}</td><td>{role.description}</td><td>{role.point}</td><td>{assignedCount} / {role.head_count}</td>
// //                       <td><button className="btn btn-primary btn-sm" onClick={() => handleAutoAssign(role.id, role.name, availableSlots)} disabled={isFull || isAutoAssigning} title={isFull ? "This role is full" : "Assign teacher(s) with lowest points"}>{isAutoAssigning ? 'Assigning...' : 'Auto-Assign'}</button></td>
// //                     </tr>
// //                   )
// //                 }) : (<tr><td colSpan="5">No roles defined for this event.</td></tr>)}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
      
// //       <div className="card">
// //         <div className="card-header"><h2>Faculty Assignments</h2><button className="btn btn-primary" onClick={openAssignModal}>Assign Manually</button></div>
        
// //         {showEditForm && (
// //           <form onSubmit={handleUpdateAssignment} className="form-container slide-down">
// //             <h3>Change Role Assignment</h3>
// //             <div className="form-group"><label>Faculty</label><select name="teacherId" value={assignmentFormData.teacherId} onChange={(e) => setAssignmentFormData(p => ({...p, teacherId: e.target.value}))} required><option value="" disabled>Select faculty</option>{facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}</select></div>
// //             <div className="form-group"><label>Role</label><select name="roleId" value={assignmentFormData.roleId} onChange={(e) => setAssignmentFormData(p => ({...p, roleId: e.target.value}))} required><option value="" disabled>Select role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
// //             <div className="form-actions"><button type="submit" className="btn btn-success">Update Assignment</button><button type="button" className="btn btn-secondary" onClick={resetEditForm}>Cancel</button></div>
// //           </form>
// //         )}

// //         <div className="table-container">
// //           <table className="table">
// //             <thead><tr><th>Faculty</th><th>Role</th><th>Points Awarded</th><th>Actions</th></tr></thead>
// //             <tbody>
// //               {assignments.length > 0 ? assignments.map(assignment => {
// //                 const role = roles.find(r => r.id === assignment.role_id);
// //                 const hasCustomPoints = assignment.points_awarded != null;
// //                 const displayPoints = hasCustomPoints ? assignment.points_awarded : role?.point;
// //                 return (
// //                   <tr key={assignment.id}>
// //                     <td>{assignment.teachername}</td><td>{assignment.rolename}</td>
// //                     <td><div className="points-cell"><strong>{displayPoints ?? "N/A"}</strong>{hasCustomPoints && <span className="custom-point-indicator" title="Points manually edited">★</span>}</div></td>
// //                     <td>
// //                       <div className="table-actions">
// //                         <button className="btn btn-sm btn-secondary" onClick={() => handleEditAssignment(assignment)}>Change</button>
// //                         <button className="btn btn-sm btn-warning" onClick={() => handleOpenPointEditModal(assignment)}>Edit Points</button>
// //                         <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAssignment(assignment.id)}>Remove</button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               }) : (<tr><td colSpan="4">No faculty assigned to this event yet.</td></tr>)}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* --- NEW --- Main Modal for Manual Assignment */}
// //       {showAssignModal && (
// //         <div className="modal-overlay">
// //           <div className="modal-content modal-lg">
// //             <div className="modal-header"><h3>Assign Faculty Manually</h3><button onClick={closeAssignModal} className="modal-close-btn">&times;</button></div>
// //             <div className="modal-body">
// //               <div className="table-container">
// //                 <table className="table table-hover">
// //                   <thead>
// //                     <tr>
// //                       <th>Name<input type="text" className="column-search" placeholder="Filter by name..." value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} /></th>
// //                       <th>Department<input type="text" className="column-search" placeholder="Filter by department..." value={departmentSearch} onChange={(e) => setDepartmentSearch(e.target.value)} /></th>
// //                       <th>Current Points</th>
// //                       <th>Action</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {filteredAndSortedFaculty.length > 0 ? filteredAndSortedFaculty.map(faculty => (
// //                       <tr key={faculty._id}>
// //                         <td>{faculty.name}</td><td>{faculty.department_name}</td><td>{faculty.point || 0}</td>
// //                         <td><button className="btn btn-success btn-sm" onClick={() => handleSelectFacultyForAssignment(faculty)}>Assign</button></td>
// //                       </tr>
// //                     )) : (<tr><td colSpan="4">No faculty match the current filters.</td></tr>)}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* --- MODIFIED --- Role selection modal now appears on top of the main modal if open */}
// //       {showRoleModal && (
// //         <div className="modal-overlay modal-on-top">
// //           <div className="modal-content">
// //             <div className="modal-header"><h3>Assign Role to {selectedFaculty?.name}</h3><button onClick={handleCloseRoleModal} className="modal-close-btn">&times;</button></div>
// //             <form onSubmit={handleConfirmAssignment} className="form-container">
// //               <div className="form-group"><label>Role</label><select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} required><option value="" disabled>Select a role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
// //               <div className="form-actions"><button type="submit" className="btn btn-success">Confirm Assignment</button><button type="button" onClick={handleCloseRoleModal} className="btn btn-secondary">Cancel</button></div>
// //             </form>
// //           </div>
// //         </div>
// //       )}

// //       {showPointEditModal && (
// //         <div className="modal-overlay"><div className="modal-content">
// //             <div className="modal-header"><h3>Edit Assignment Points</h3><button onClick={handleClosePointEditModal} className="modal-close-btn">&times;</button></div>
// //             <form onSubmit={handleUpdatePoints} className="form-container">
// //               <p>For: <strong>{currentAssignmentForEdit?.teachername}</strong> in role <strong>{currentAssignmentForEdit?.rolename}</strong></p>
// //               <div className="form-group"><label>New Points</label><input type="number" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} required /></div>
// //               <div className="form-actions"><button type="submit" className="btn btn-success">Save Points</button><button type="button" onClick={handleClosePointEditModal} className="btn btn-secondary">Cancel</button></div>
// //             </form>
// //         </div></div>
// //       )}
// //     </div>
// //   );
// // };

// // export default EventDashboard;

// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import "./EventDashboard.css"; // Ensure this CSS file is present

// const EventDashboard = () => {
//   const { eventId } = useParams();
//   const navigate = useNavigate();

//   // Component states
//   const [eventDetails, setEventDetails] = useState(null);
//   const [facultyList, setFacultyList] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [autoAssigningRoleId, setAutoAssigningRoleId] = useState(null);

//   // States for the main assignment modal and its filters/sorting
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [nameSearch, setNameSearch] = useState("");
//   const [departmentSearch, setDepartmentSearch] = useState("");
//   const [sortOrder, setSortOrder] = useState('asc'); // --- NEW --- 'asc' or 'desc' for points sorting

//   // States for the second (role selection) modal
//   const [showRoleModal, setShowRoleModal] = useState(false);
//   const [selectedFaculty, setSelectedFaculty] = useState(null);
//   const [selectedRoleId, setSelectedRoleId] = useState("");

//   // Form states for editing assignments
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [assignmentFormData, setAssignmentFormData] = useState({ teacherId: "", roleId: "", assignmentId: "" });

//   // Event edit states
//   const [isEventEditMode, setIsEventEditMode] = useState(false);
//   const [eventFormData, setEventFormData] = useState({ name: "", description: "", start_date: "", end_date: "", start_time: "", end_time: "" });

//   // Point edit modal states
//   const [showPointEditModal, setShowPointEditModal] = useState(false);
//   const [currentAssignmentForEdit, setCurrentAssignmentForEdit] = useState(null);
//   const [newPoints, setNewPoints] = useState(0);

//   const formatDateForInput = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : "";
//   const formatTimeForInput = (timeString) => timeString || "00:00";

//   const fetchAllData = async () => {
//     try {
//       const [eventRes, teachersRes, rolesRes, assignmentsRes] = await Promise.all([
//         axios.get(`https://facultypointsportal.onrender.com/eventid/${eventId}`),
//         axios.get(`https://facultypointsportal.onrender.com/teachers`),
//         axios.get(`https://facultypointsportal.onrender.com/events/${eventId}/roles`),
//         axios.get(`https://facultypointsportal.onrender.com/events/assigned-teachers/${eventId}`)
//       ]);
//       setEventDetails(eventRes.data);
//       setEventFormData({ name: eventRes.data.name, description: eventRes.data.description, start_date: formatDateForInput(eventRes.data.start_date), end_date: formatDateForInput(eventRes.data.end_date), start_time: formatTimeForInput(eventRes.data.start_time), end_time: formatTimeForInput(eventRes.data.end_time) });
//       setFacultyList(Array.isArray(teachersRes.data) ? teachersRes.data : []);
//       setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
//       setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       alert("Failed to load event data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { setLoading(true); fetchAllData(); }, [eventId]);

//   // --- UPDATED --- Memo hook now also depends on sortOrder
//   const filteredAndSortedFaculty = useMemo(() => {
//     return [...facultyList]
//       .sort((a, b) => {
//         const pointsA = a.point || 0;
//         const pointsB = b.point || 0;
//         // The core sorting logic based on the sortOrder state
//         return sortOrder === 'asc' ? pointsA - pointsB : pointsB - pointsA;
//       })
//       .filter(f =>
//         f.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
//         f.department_name.toLowerCase().includes(departmentSearch.toLowerCase())
//       );
//   }, [facultyList, nameSearch, departmentSearch, sortOrder]); // sortOrder added to dependency array

//   // --- NEW --- Toggles the sort order
//   const handleSortToggle = () => {
//     setSortOrder(currentOrder => (currentOrder === 'asc' ? 'desc' : 'asc'));
//   };

//   const handleEventInputChange = (e) => setEventFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
//   const handleUpdateEvent = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(`https://facultypointsportal.onrender.com/events/${eventId}`, eventFormData);
//       alert("Event updated successfully!");
//       setIsEventEditMode(false);
//       await fetchAllData();
//     } catch (error) { console.error("Error updating event:", error); alert(error.response?.data?.error || "An error occurred."); }
//   };

//   const handleUpdateAssignment = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, { data: { assignment_id: assignmentFormData.assignmentId, deduct_points: true } });
//       await axios.post(`https://facultypointsportal.onrender.com/assignments`, { teacher_id: assignmentFormData.teacherId, role_id: assignmentFormData.roleId, event_id: eventId });
//       await fetchAllData();
//       resetEditForm();
//     } catch (error) { console.error("Error updating assignment:", error); alert(error.response?.data?.error || "An error occurred"); }
//   };
  
//   const handleSelectFacultyForAssignment = (faculty) => {
//     setSelectedFaculty(faculty);
//     setShowRoleModal(true);
//   };

//   const handleCloseRoleModal = () => {
//     setShowRoleModal(false);
//     setSelectedFaculty(null);
//     setSelectedRoleId("");
//   };

//   const handleConfirmAssignment = async (e) => {
//     e.preventDefault();
//     if (!selectedFaculty || !selectedRoleId) return alert("Invalid selection.");
//     try {
//       await axios.post(`https://facultypointsportal.onrender.com/assignments`, { teacher_id: selectedFaculty._id, role_id: selectedRoleId, event_id: eventId });
//       alert(`Assigned ${selectedFaculty.name} successfully!`);
//       handleCloseRoleModal();
//       await fetchAllData();
//     } catch (error) { console.error("Error assigning role:", error); alert(error.response?.data?.error || "An error occurred"); }
//   };

//   const handleAutoAssign = async (roleId, roleName, availableSlots) => {
//     const countStr = prompt(`How many teachers do you want to auto-assign to "${roleName}"?\n(Available slots: ${availableSlots})`, "1");
//     if (countStr === null) return;
//     const count = parseInt(countStr, 10);
//     if (isNaN(count) || count <= 0) return alert("Please enter a valid, positive number.");
//     setAutoAssigningRoleId(roleId);
//     try {
//       const response = await axios.post(`https://facultypointsportal.onrender.com/events/${eventId}/roles/${roleId}/auto-assign`, { count: count });
//       alert(`${response.data.message}\nAssigned: ${response.data.assigned_teachers.join(', ')}`);
//       await fetchAllData();
//     } catch (error) { console.error("Error auto-assigning teacher:", error); alert(error.response?.data?.error || "Failed to auto-assign teacher(s).");
//     } finally { setAutoAssigningRoleId(null); }
//   };

//   const handleEditAssignment = (assignment) => {
//     setAssignmentFormData({ teacherId: assignment.teacher_id, roleId: assignment.role_id, assignmentId: assignment.id });
//     setIsEditMode(true);
//     setShowEditForm(true);
//   };

//   const handleDeleteAssignment = async (assignmentId) => {
//     if (window.confirm("Are you sure? This will remove the assignment and deduct points.")) {
//       try {
//         await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, { data: { assignment_id: assignmentId, deduct_points: true } });
//         await fetchAllData();
//       } catch (error) { console.error("Error removing assignment:", error); alert(error.response?.data?.error || "An error occurred"); }
//     }
//   };

//   const handleCreateRole = async () => {
//     const roleName = prompt("Enter role name:");
//     if (!roleName) return;
//     const roleDescription = prompt("Enter role description:");
//     const rolePoints = parseInt(prompt("Enter points for this role:"), 10) || 0;
//     const headCount = parseInt(prompt("Enter max teachers for this role:"), 10) || 1;
//     try {
//       await axios.post(`https://facultypointsportal.onrender.com/roles/${eventId}`, { name: roleName, description: roleDescription, point: rolePoints, head_count: headCount });
//       await fetchAllData();
//     } catch (error) { console.error("Error creating role:", error); alert(error.response?.data?.error || "An error occurred"); }
//   };

//   const handleOpenPointEditModal = (assignment) => {
//     const role = roles.find(r => r.id === assignment.role_id);
//     const currentPoints = assignment.points_awarded != null ? assignment.points_awarded : (role ? role.point : 0);
//     setCurrentAssignmentForEdit(assignment);
//     setNewPoints(currentPoints);
//     setShowPointEditModal(true);
//   };

//   const handleClosePointEditModal = () => { setShowPointEditModal(false); setCurrentAssignmentForEdit(null); setNewPoints(0); };

//   const handleUpdatePoints = async (e) => {
//     e.preventDefault();
//     if (!currentAssignmentForEdit) return;
//     try {
//       await axios.put(`https://facultypointsportal.onrender.com/assignments/edit/${currentAssignmentForEdit.id}`, { points: parseInt(newPoints, 10) });
//       alert("Points updated successfully!");
//       handleClosePointEditModal();
//       await fetchAllData();
//     } catch (error) { console.error("Error updating points:", error); alert(error.response?.data?.error || "An error occurred."); }
//   };
  
//   const resetEditForm = () => {
//     setAssignmentFormData({ teacherId: "", roleId: "", assignmentId: "" });
//     setIsEditMode(false);
//     setShowEditForm(false);
//   };

//   const openAssignModal = () => {
//     setShowAssignModal(true);
//     setShowEditForm(false);
//   }

//   const closeAssignModal = () => {
//     setShowAssignModal(false);
//     setNameSearch("");
//     setDepartmentSearch("");
//     setSortOrder('asc'); // Reset sort order when closing
//   }
  
//   if (loading) return <div className="event-dashboard-loading"><div className="spinner"></div><p>Loading Event Data...</p></div>;

//   return (
//     <div className="event-dashboard">
//       <div className="dashboard-header"><button onClick={() => navigate(-1)} className="back-button">← Back to Dashboard</button><h1>{eventDetails?.name}</h1></div>
      
//       <div className="card">
//         <div className="card-header"><h2>Program Details</h2>{!isEventEditMode && <button className="btn btn-secondary" onClick={() => setIsEventEditMode(true)}>Edit Program</button>}</div>
//         {isEventEditMode ? (
//           <form onSubmit={handleUpdateEvent} className="form-container">
//             <div className="form-group"><label>Name</label><input type="text" name="name" value={eventFormData.name} onChange={handleEventInputChange} required /></div>
//             <div className="form-group"><label>Description</label><textarea name="description" value={eventFormData.description} onChange={handleEventInputChange} required /></div>
//             <div className="form-grid">
//                 <div className="form-group"><label>Start Date</label><input type="date" name="start_date" value={eventFormData.start_date} onChange={handleEventInputChange} required /></div>
//                 <div className="form-group"><label>Start Time</label><input type="time" name="start_time" value={eventFormData.start_time} onChange={handleEventInputChange} required /></div>
//                 <div className="form-group"><label>End Date</label><input type="date" name="end_date" value={eventFormData.end_date} onChange={handleEventInputChange} required /></div>
//                 <div className="form-group"><label>End Time</label><input type="time" name="end_time" value={eventFormData.end_time} onChange={handleEventInputChange} required /></div>
//             </div>
//             <div className="form-actions"><button type="submit" className="btn btn-success">Save Changes</button><button type="button" onClick={() => setIsEventEditMode(false)} className="btn btn-secondary">Cancel</button></div>
//           </form>
//         ) : (
//           <div className="event-details-display"><p><strong>Description:</strong> {eventDetails?.description}</p><p><strong>Duration:</strong> {new Date(eventDetails?.start_date).toLocaleString()} - {new Date(eventDetails?.end_date).toLocaleString()}</p></div>
//         )}
//       </div>

//       <div className="card">
//         <div className="card-header"><h2>Program Roles</h2><button className="btn btn-success" onClick={handleCreateRole}>+ Add Role</button></div>
//         <div className="table-container">
//           <table className="table">
//             <thead><tr><th>Role</th><th>Description</th><th>Base Points</th><th>Assigned</th><th>Actions</th></tr></thead>
//             <tbody>
//               {roles.length > 0 ? roles.map(role => {
//                   const assignedCount = assignments.filter(a => a.role_id === role.id).length;
//                   const isFull = assignedCount >= role.head_count;
//                   const isAutoAssigning = autoAssigningRoleId === role.id;
//                   const availableSlots = role.head_count - assignedCount;
//                   return (
//                     <tr key={role.id}><td>{role.name}</td><td>{role.description}</td><td>{role.point}</td><td>{assignedCount} / {role.head_count}</td>
//                       <td><button className="btn btn-primary btn-sm" onClick={() => handleAutoAssign(role.id, role.name, availableSlots)} disabled={isFull || isAutoAssigning} title={isFull ? "This role is full" : "Assign teacher(s) with lowest points"}>{isAutoAssigning ? 'Assigning...' : 'Auto-Assign'}</button></td>
//                     </tr>
//                   )
//                 }) : (<tr><td colSpan="5">No roles defined for this event.</td></tr>)}
//             </tbody>
//           </table>
//         </div>
//       </div>
      
//       <div className="card">
//         <div className="card-header"><h2>Faculty Assignments</h2><button className="btn btn-primary" onClick={openAssignModal}>Assign Manually</button></div>
        
//         {showEditForm && (
//           <form onSubmit={handleUpdateAssignment} className="form-container slide-down">
//             <h3>Change Role Assignment</h3>
//             <div className="form-group"><label>Faculty</label><select name="teacherId" value={assignmentFormData.teacherId} onChange={(e) => setAssignmentFormData(p => ({...p, teacherId: e.target.value}))} required><option value="" disabled>Select faculty</option>{facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}</select></div>
//             <div className="form-group"><label>Role</label><select name="roleId" value={assignmentFormData.roleId} onChange={(e) => setAssignmentFormData(p => ({...p, roleId: e.target.value}))} required><option value="" disabled>Select role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
//             <div className="form-actions"><button type="submit" className="btn btn-success">Update Assignment</button><button type="button" className="btn btn-secondary" onClick={resetEditForm}>Cancel</button></div>
//           </form>
//         )}

//         <div className="table-container">
//           <table className="table">
//             <thead><tr><th>Faculty</th><th>Role</th><th>Points Awarded</th><th>Actions</th></tr></thead>
//             <tbody>
//               {assignments.length > 0 ? assignments.map(assignment => {
//                 const role = roles.find(r => r.id === assignment.role_id);
//                 const hasCustomPoints = assignment.points_awarded != null;
//                 const displayPoints = hasCustomPoints ? assignment.points_awarded : role?.point;
//                 return (
//                   <tr key={assignment.id}>
//                     <td>{assignment.teachername}</td><td>{assignment.rolename}</td>
//                     <td><div className="points-cell"><strong>{displayPoints ?? "N/A"}</strong>{hasCustomPoints && <span className="custom-point-indicator" title="Points manually edited">★</span>}</div></td>
//                     <td>
//                       <div className="table-actions">
//                         <button className="btn btn-sm btn-secondary" onClick={() => handleEditAssignment(assignment)}>Change</button>
//                         <button className="btn btn-sm btn-warning" onClick={() => handleOpenPointEditModal(assignment)}>Edit Points</button>
//                         <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAssignment(assignment.id)}>Remove</button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               }) : (<tr><td colSpan="4">No faculty assigned to this event yet.</td></tr>)}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showAssignModal && (
//         <div className="modal-overlay">
//           <div className="modal-content modal-lg">
//             <div className="modal-header"><h3>Assign Faculty Manually</h3><button onClick={closeAssignModal} className="modal-close-btn">&times;</button></div>
//             <div className="modal-body">
//               <div className="table-container">
//                 <table className="table table-hover">
//                   <thead>
//                     <tr>
//                       <th>Name<input type="text" className="column-search" placeholder="Filter by name..." value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} /></th>
//                       <th>Department<input type="text" className="column-search" placeholder="Filter by department..." value={departmentSearch} onChange={(e) => setDepartmentSearch(e.target.value)} /></th>
//                       {/* --- UPDATED --- Clickable header for sorting */}
//                       <th>
//                         <button className="sort-button" onClick={handleSortToggle}>
//                           Current Points {sortOrder === 'asc' ? '▲' : '▼'}
//                         </button>
//                       </th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredAndSortedFaculty.length > 0 ? filteredAndSortedFaculty.map(faculty => (
//                       <tr key={faculty._id}>
//                         <td>{faculty.name}</td><td>{faculty.department_name}</td><td>{faculty.point || 0}</td>
//                         <td><button className="btn btn-success btn-sm" onClick={() => handleSelectFacultyForAssignment(faculty)}>Assign</button></td>
//                       </tr>
//                     )) : (<tr><td colSpan="4">No faculty match the current filters.</td></tr>)}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showRoleModal && (
//         <div className="modal-overlay modal-on-top">
//           <div className="modal-content">
//             <div className="modal-header"><h3>Assign Role to {selectedFaculty?.name}</h3><button onClick={handleCloseRoleModal} className="modal-close-btn">&times;</button></div>
//             <form onSubmit={handleConfirmAssignment} className="form-container">
//               <div className="form-group"><label>Role</label><select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} required><option value="" disabled>Select a role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
//               <div className="form-actions"><button type="submit" className="btn btn-success">Confirm Assignment</button><button type="button" onClick={handleCloseRoleModal} className="btn btn-secondary">Cancel</button></div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showPointEditModal && (
//         <div className="modal-overlay"><div className="modal-content">
//             <div className="modal-header"><h3>Edit Assignment Points</h3><button onClick={handleClosePointEditModal} className="modal-close-btn">&times;</button></div>
//             <form onSubmit={handleUpdatePoints} className="form-container">
//               <p>For: <strong>{currentAssignmentForEdit?.teachername}</strong> in role <strong>{currentAssignmentForEdit?.rolename}</strong></p>
//               <div className="form-group"><label>New Points</label><input type="number" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} required /></div>
//               <div className="form-actions"><button type="submit" className="btn btn-success">Save Points</button><button type="button" onClick={handleClosePointEditModal} className="btn btn-secondary">Cancel</button></div>
//             </form>
//         </div></div>
//       )}
//     </div>
//   );
// };

// export default EventDashboard;
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EventDashboard.css"; // Ensure this CSS file is present

const EventDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Component states
  const [eventDetails, setEventDetails] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoAssigningRoleId, setAutoAssigningRoleId] = useState(null);

  // States for the main assignment modal and its filters/sorting
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [sortOrder, setSortOrder] = useState('asc');

  // States for the second (role selection) modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // --- NEW --- States for the role creation modal
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleFormData, setNewRoleFormData] = useState({
    name: "",
    description: "",
    point: 0,
    head_count: 1,
  });

  // Form states for editing assignments
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({ teacherId: "", roleId: "", assignmentId: "" });

  // Event edit states
  const [isEventEditMode, setIsEventEditMode] = useState(false);
  const [eventFormData, setEventFormData] = useState({ name: "", description: "", start_date: "", end_date: "", start_time: "", end_time: "" });

  // Point edit modal states
  const [showPointEditModal, setShowPointEditModal] = useState(false);
  const [currentAssignmentForEdit, setCurrentAssignmentForEdit] = useState(null);
  const [newPoints, setNewPoints] = useState(0);

  const formatDateForInput = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : "";
  const formatTimeForInput = (timeString) => timeString || "00:00";

  const fetchAllData = async () => {
    try {
      const [eventRes, teachersRes, rolesRes, assignmentsRes] = await Promise.all([
        axios.get(`https://facultypointsportal.onrender.com/eventid/${eventId}`),
        axios.get(`https://facultypointsportal.onrender.com/teachers`),
        axios.get(`https://facultypointsportal.onrender.com/events/${eventId}/roles`),
        axios.get(`https://facultypointsportal.onrender.com/events/assigned-teachers/${eventId}`)
      ]);
      setEventDetails(eventRes.data);
      setEventFormData({ name: eventRes.data.name, description: eventRes.data.description, start_date: formatDateForInput(eventRes.data.start_date), end_date: formatDateForInput(eventRes.data.end_date), start_time: formatTimeForInput(eventRes.data.start_time), end_time: formatTimeForInput(eventRes.data.end_time) });
      setFacultyList(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load event data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); fetchAllData(); }, [eventId]);

  const filteredAndSortedFaculty = useMemo(() => {
    return [...facultyList]
      .sort((a, b) => {
        const pointsA = a.point || 0;
        const pointsB = b.point || 0;
        return sortOrder === 'asc' ? pointsA - pointsB : pointsB - pointsA;
      })
      .filter(f =>
        f.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
        f.department_name.toLowerCase().includes(departmentSearch.toLowerCase())
      );
  }, [facultyList, nameSearch, departmentSearch, sortOrder]);

  const handleSortToggle = () => setSortOrder(currentOrder => (currentOrder === 'asc' ? 'desc' : 'asc'));
  const handleEventInputChange = (e) => setEventFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://facultypointsportal.onrender.com/events/${eventId}`, eventFormData);
      alert("Event updated successfully!");
      setIsEventEditMode(false);
      await fetchAllData();
    } catch (error) { console.error("Error updating event:", error); alert(error.response?.data?.error || "An error occurred."); }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, { data: { assignment_id: assignmentFormData.assignmentId, deduct_points: true } });
      await axios.post(`https://facultypointsportal.onrender.com/assignments`, { teacher_id: assignmentFormData.teacherId, role_id: assignmentFormData.roleId, event_id: eventId });
      await fetchAllData();
      resetEditForm();
    } catch (error) { console.error("Error updating assignment:", error); alert(error.response?.data?.error || "An error occurred"); }
  };
  
  const handleSelectFacultyForAssignment = (faculty) => {
    setSelectedFaculty(faculty);
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setSelectedFaculty(null);
    setSelectedRoleId("");
  };

  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!selectedFaculty || !selectedRoleId) return alert("Invalid selection.");
    try {
      await axios.post(`https://facultypointsportal.onrender.com/assignments`, { teacher_id: selectedFaculty._id, role_id: selectedRoleId, event_id: eventId });
      alert(`Assigned ${selectedFaculty.name} successfully!`);
      handleCloseRoleModal();
      await fetchAllData();
    } catch (error) { console.error("Error assigning role:", error); alert(error.response?.data?.error || "An error occurred"); }
  };

  const handleAutoAssign = async (roleId, roleName, availableSlots) => {
    const countStr = prompt(`How many teachers do you want to auto-assign to "${roleName}"?\n(Available slots: ${availableSlots})`, "1");
    if (countStr === null) return;
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count <= 0) return alert("Please enter a valid, positive number.");
    setAutoAssigningRoleId(roleId);
    try {
      const response = await axios.post(`https://facultypointsportal.onrender.com/events/${eventId}/roles/${roleId}/auto-assign`, { count: count });
      alert(`${response.data.message}\nAssigned: ${response.data.assigned_teachers.join(', ')}`);
      await fetchAllData();
    } catch (error) { console.error("Error auto-assigning teacher:", error); alert(error.response?.data?.error || "Failed to auto-assign teacher(s).");
    } finally { setAutoAssigningRoleId(null); }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    // Ask user whether to deduct points or not
    const confirmDelete = window.confirm(`Are you sure you want to delete the role "${roleName}"?`);
    if (!confirmDelete) return;
  
    const deduct = window.confirm("Do you also want to deduct points from teachers assigned to this role?");
  
    try {
      const response = await axios.delete(`https://facultypointsportal.onrender.com/roles/${roleId}`, {
        data: { deduct_points: deduct }, // body sent in DELETE request
        headers: { "Content-Type": "application/json" }
      });
  
      alert(response.data.message);
      await fetchAllData(); // refresh roles & assignments
    } catch (error) {
      console.error("Error deleting role:", error);
      alert(error.response?.data?.error || "Failed to delete role");
    }
  };
  

  const handleEditAssignment = (assignment) => {
    setAssignmentFormData({ teacherId: assignment.teacher_id, roleId: assignment.role_id, assignmentId: assignment.id });
    setIsEditMode(true);
    setShowEditForm(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure? This will remove the assignment and deduct points.")) {
      try {
        await axios.delete(`https://facultypointsportal.onrender.com/delete-role-assignment`, { data: { assignment_id: assignmentId, deduct_points: true } });
        await fetchAllData();
      } catch (error) { console.error("Error removing assignment:", error); alert(error.response?.data?.error || "An error occurred"); }
    }
  };

  // --- NEW --- Opens the create role modal
  const handleOpenCreateRoleModal = () => setShowCreateRoleModal(true);

  // --- NEW --- Closes the create role modal and resets its form data
  const handleCloseCreateRoleModal = () => {
    setShowCreateRoleModal(false);
    setNewRoleFormData({ name: "", description: "", point: 0, head_count: 1 });
  };
  
  // --- NEW --- Handles input changes for the new role form
  const handleNewRoleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoleFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- UPDATED --- Creates the role using data from the modal's state
  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://facultypointsportal.onrender.com/roles/${eventId}`, {
        ...newRoleFormData,
        point: parseInt(newRoleFormData.point, 10),
        head_count: parseInt(newRoleFormData.head_count, 10)
      });
      alert("Role created successfully!");
      handleCloseCreateRoleModal();
      await fetchAllData();
    } catch (error) {
      console.error("Error creating role:", error);
      alert(error.response?.data?.error || "An error occurred while creating the role.");
    }
  };

  const handleOpenPointEditModal = (assignment) => {
    const role = roles.find(r => r.id === assignment.role_id);
    const currentPoints = assignment.points_awarded != null ? assignment.points_awarded : (role ? role.point : 0);
    setCurrentAssignmentForEdit(assignment);
    setNewPoints(currentPoints);
    setShowPointEditModal(true);
  };

  const handleClosePointEditModal = () => { setShowPointEditModal(false); setCurrentAssignmentForEdit(null); setNewPoints(0); };

  const handleUpdatePoints = async (e) => {
    e.preventDefault();
    if (!currentAssignmentForEdit) return;
    try {
      await axios.put(`https://facultypointsportal.onrender.com/assignments/edit/${currentAssignmentForEdit.id}`, { points: parseInt(newPoints, 10) });
      alert("Points updated successfully!");
      handleClosePointEditModal();
      await fetchAllData();
    } catch (error) { console.error("Error updating points:", error); alert(error.response?.data?.error || "An error occurred."); }
  };
  
  const resetEditForm = () => {
    setAssignmentFormData({ teacherId: "", roleId: "", assignmentId: "" });
    setIsEditMode(false);
    setShowEditForm(false);
  };

  const openAssignModal = () => {
    setShowAssignModal(true);
    setShowEditForm(false);
  }

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setNameSearch("");
    setDepartmentSearch("");
    setSortOrder('asc');
  }
  
  if (loading) return <div className="event-dashboard-loading"><div className="spinner"></div><p>Loading Event Data...</p></div>;

  return (
    <div className="event-dashboard">
      <div className="dashboard-header"><button onClick={() => navigate(-1)} className="back-button">← Back to Dashboard</button><h1>{eventDetails?.name}</h1></div>
      
      <div className="card">
        <div className="card-header"><h2>Program Details</h2>{!isEventEditMode && <button className="btn btn-secondary" onClick={() => setIsEventEditMode(true)}>Edit Program</button>}</div>
        {isEventEditMode ? (
          <form onSubmit={handleUpdateEvent} className="form-container">
            <div className="form-group"><label>Name</label><input type="text" name="name" value={eventFormData.name} onChange={handleEventInputChange} required /></div>
            <div className="form-group"><label>Description</label><textarea name="description" value={eventFormData.description} onChange={handleEventInputChange} required /></div>
            <div className="form-grid">
                <div className="form-group"><label>Start Date</label><input type="date" name="start_date" value={eventFormData.start_date} onChange={handleEventInputChange} required /></div>
                <div className="form-group"><label>Start Time</label><input type="time" name="start_time" value={eventFormData.start_time} onChange={handleEventInputChange} required /></div>
                <div className="form-group"><label>End Date</label><input type="date" name="end_date" value={eventFormData.end_date} onChange={handleEventInputChange} required /></div>
                <div className="form-group"><label>End Time</label><input type="time" name="end_time" value={eventFormData.end_time} onChange={handleEventInputChange} required /></div>
            </div>
            <div className="form-actions"><button type="submit" className="btn btn-success">Save Changes</button><button type="button" onClick={() => setIsEventEditMode(false)} className="btn btn-secondary">Cancel</button></div>
          </form>
        ) : (
          <div className="event-details-display"><p><strong>Description:</strong> {eventDetails?.description}</p><p><strong>Duration:</strong> {new Date(eventDetails?.start_date).toLocaleString()} - {new Date(eventDetails?.end_date).toLocaleString()}</p></div>
        )}
      </div>

      <div className="card">
        {/* --- UPDATED --- Button now opens the modal */}
        <div className="card-header"><h2>Program Roles</h2><button className="btn btn-success" onClick={handleOpenCreateRoleModal}>+ Add Role</button></div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Role</th><th>Description</th><th>Base Points</th><th>Assigned</th><th>Actions</th><th></th></tr></thead>
            <tbody>
              {roles.length > 0 ? roles.map(role => {
                  const assignedCount = assignments.filter(a => a.role_id === role.id).length;
                  const isFull = assignedCount >= role.head_count;
                  const isAutoAssigning = autoAssigningRoleId === role.id;
                  const availableSlots = role.head_count - assignedCount;
                  return (
                    <tr key={role.id}><td>{role.name}</td><td>{role.description}</td><td>{role.point}</td><td>{assignedCount} / {role.head_count}</td>
                      <td><button className="btn btn-primary btn-sm" onClick={() => handleAutoAssign(role.id, role.name, availableSlots)} disabled={isFull || isAutoAssigning} title={isFull ? "This role is full" : "Assign teacher(s) with lowest points"}>{isAutoAssigning ? 'Assigning...' : 'Auto-Assign'}</button></td>
                      <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      title="Delete this role"
                    >
                      Delete
                    </button>
                  </td>

                    </tr>
                  )
                }) : (<tr><td colSpan="5">No roles defined for this event.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header"><h2>Faculty Assignments</h2><button className="btn btn-primary" onClick={openAssignModal}>Assign Manually</button></div>
        
        {showEditForm && (
          <form onSubmit={handleUpdateAssignment} className="form-container slide-down">
            <h3>Change Role Assignment</h3>
            <div className="form-group"><label>Faculty</label><select name="teacherId" value={assignmentFormData.teacherId} onChange={(e) => setAssignmentFormData(p => ({...p, teacherId: e.target.value}))} required><option value="" disabled>Select faculty</option>{facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}</select></div>
            <div className="form-group"><label>Role</label><select name="roleId" value={assignmentFormData.roleId} onChange={(e) => setAssignmentFormData(p => ({...p, roleId: e.target.value}))} required><option value="" disabled>Select role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="form-actions"><button type="submit" className="btn btn-success">Update Assignment</button><button type="button" className="btn btn-secondary" onClick={resetEditForm}>Cancel</button></div>
          </form>
        )}

        <div className="table-container">
          <table className="table">
            <thead><tr><th>Faculty</th><th>Role</th><th>Points Awarded</th><th>Actions</th></tr></thead>
            <tbody>
              {assignments.length > 0 ? assignments.map(assignment => {
                const role = roles.find(r => r.id === assignment.role_id);
                const hasCustomPoints = assignment.points_awarded != null;
                const displayPoints = hasCustomPoints ? assignment.points_awarded : role?.point;
                return (
                  <tr key={assignment.id}>
                    <td>{assignment.teachername}</td><td>{assignment.rolename}</td>
                    <td><div className="points-cell"><strong>{displayPoints ?? "N/A"}</strong>{hasCustomPoints && <span className="custom-point-indicator" title="Points manually edited">★</span>}</div></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleEditAssignment(assignment)}>Change</button>
                        <button className="btn btn-sm btn-warning" onClick={() => handleOpenPointEditModal(assignment)}>Edit Points</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAssignment(assignment.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (<tr><td colSpan="4">No faculty assigned to this event yet.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header"><h3>Assign Faculty Manually</h3><button onClick={closeAssignModal} className="modal-close-btn">&times;</button></div>
            <div className="modal-body">
              <div className="table-container">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name<input type="text" className="column-search" placeholder="Filter by name..." value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} /></th>
                      <th>Department<input type="text" className="column-search" placeholder="Filter by department..." value={departmentSearch} onChange={(e) => setDepartmentSearch(e.target.value)} /></th>
                      <th><button className="sort-button" onClick={handleSortToggle}>Current Points {sortOrder === 'asc' ? '▲' : '▼'}</button></th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedFaculty.length > 0 ? filteredAndSortedFaculty.map(faculty => (
                      <tr key={faculty._id}>
                        <td>{faculty.name}</td><td>{faculty.department_name}</td><td>{faculty.point || 0}</td>
                        <td><button className="btn btn-success btn-sm" onClick={() => handleSelectFacultyForAssignment(faculty)}>Assign</button></td>
                      </tr>
                    )) : (<tr><td colSpan="4">No faculty match the current filters.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="modal-overlay modal-on-top">
          <div className="modal-content">
            <div className="modal-header"><h3>Assign Role to {selectedFaculty?.name}</h3><button onClick={handleCloseRoleModal} className="modal-close-btn">&times;</button></div>
            <form onSubmit={handleConfirmAssignment} className="form-container">
              <div className="form-group"><label>Role</label><select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} required><option value="" disabled>Select a role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
              <div className="form-actions"><button type="submit" className="btn btn-success">Confirm Assignment</button><button type="button" onClick={handleCloseRoleModal} className="btn btn-secondary">Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW --- Modal for creating a new role */}
      {showCreateRoleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Role</h3>
              <button onClick={handleCloseCreateRoleModal} className="modal-close-btn">&times;</button>
            </div>
            <form onSubmit={handleCreateRole} className="form-container">
              <div className="form-group">
                <label htmlFor="role-name">Role Name</label>
                <input id="role-name" type="text" name="name" value={newRoleFormData.name} onChange={handleNewRoleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="role-description">Description</label>
                <textarea id="role-description" name="description" value={newRoleFormData.description} onChange={handleNewRoleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="role-points">Points</label>
                <input id="role-points" type="number" name="point" value={newRoleFormData.point} onChange={handleNewRoleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="role-headcount">Max Teachers (Head Count)</label>
                <input id="role-headcount" type="number" name="head_count" value={newRoleFormData.head_count} onChange={handleNewRoleInputChange} required min="1" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Save Role</button>
                <button type="button" onClick={handleCloseCreateRoleModal} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPointEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Edit Assignment Points</h3><button onClick={handleClosePointEditModal} className="modal-close-btn">&times;</button></div>
            <form onSubmit={handleUpdatePoints} className="form-container">
              <p>For: <strong>{currentAssignmentForEdit?.teachername}</strong> in role <strong>{currentAssignmentForEdit?.rolename}</strong></p>
              <div className="form-group"><label>New Points</label><input type="number" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} required /></div>
              <div className="form-actions"><button type="submit" className="btn btn-success">Save Points</button><button type="button" onClick={handleClosePointEditModal} className="btn btn-secondary">Cancel</button></div>
            </form>
        </div></div>
      )}
    </div>
  );
};

export default EventDashboard;
