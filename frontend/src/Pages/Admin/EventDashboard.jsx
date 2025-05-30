// // import React, { useState, useEffect } from "react";
// // import axios from "axios";
// // import { useParams, useNavigate } from "react-router-dom";
// // import "./EventDashboard.css"; 
// // const EventDashboard = () => {
// //   const { eventId } = useParams();
// //   const navigate = useNavigate();
// //   const [eventDetails, setEventDetails] = useState(null);
// //   const [facultyList, setFacultyList] = useState([]);
// //   const [roles, setRoles] = useState([]);
// //   const [assignments, setAssignments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showAssignForm, setShowAssignForm] = useState(false);
// //   const [isEditMode, setIsEditMode] = useState(false);
// //   const [assignmentFormData, setAssignmentFormData] = useState({
// //     teacherId: "",
// //     roleId: "",
// //     eventId: "",
// //     assignmentId: ""
// //   });

// //   useEffect(() => {
// //     fetchAllData();
// //   }, [eventId]);

// //   const fetchAllData = async () => {
// //     setLoading(true);
// //     try {
// //       // Fetch event details
// //       const eventResponse = await axios.get(`http://localhost:8080/eventid/${eventId}`);
// //       setEventDetails(eventResponse.data);
      
// //       // Fetch faculty/teachers list
// //       const teachersResponse = await axios.get(`http://localhost:8080/teachers`);
// //       setFacultyList(teachersResponse.data);
      
// //       // Fetch roles for this event
// //       const rolesResponse = await axios.get(`http://localhost:8080/event/${eventId}/roles`);
// //       setRoles(rolesResponse.data);
      
// //       // Fetch assignments for this event
// //       const assignmentsResponse = await axios.get(`http://localhost:8080/events/assigned-teachers/${eventId}`);
// //       setAssignments(assignmentsResponse.data);
// //     } catch (err) {
// //       console.error("Error fetching data:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleAssignmentInputChange = (e) => {
// //     const { name, value } = e.target;
// //     setAssignmentFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }));
// //   };

// //   const resetForm = () => {
// //     setAssignmentFormData({
// //       teacherId: "",
// //       roleId: "",
// //       eventId: eventId,
// //       assignmentId: ""
// //     });
// //     setIsEditMode(false);
// //     setShowAssignForm(false);
// //   };

// //   const handleAssignRole = async (e) => {
// //     e.preventDefault();
    
// //     try {
// //       if (isEditMode) {
// //         // Delete the old assignment
// //         await axios.post(`http://localhost:8080/deleteAssignment`, {
// //           assignment_id: assignmentFormData.assignmentId,
// //           deduct_points: true // Deduct points when removing assignment
// //         });
        
// //         // Create new assignment with updated values
// //         await axios.post(`http://localhost:8080/assignTeacher`, {
          
// //           teacher_id: assignmentFormData.teacherId,
// //           role_id: assignmentFormData.roleId,
// //           event_id: eventId
// //         });
        
// //         console.log("Role assignment updated");
// //       } else {
// //         // alert(assignmentFormData.teacherId)
// //         // // alert(assignmentFormData.eventId)
// //         // // alert(assignmentFormData.roleId)
// //         // // Creatse new assignment
// //         // return
// //         await axios.post(`http://localhost:8080/assignments`, {
// //           teacher_id: assignmentFormData.teacherId,
// //           role_id: assignmentFormData.roleId,
// //           event_id: eventId
// //         });
        
// //         console.log("Role assigned");
// //       }
      
// //       // Refresh data
// //       fetchAllData();
// //       resetForm();
// //     } catch (error) {
// //       console.error("Error assigning/updating role:", error);
// //       alert(error.response?.data?.error || "An error occurred");
// //     }
// //   };

// //   const handleDeleteAssignment = async (assignmentId) => {
// //     alert(assignmentId)
// //     if (window.confirm("Are you sure you want to remove this assignment?")) {
// //       try {
// //         await axios.delete(`http://localhost:8080/delete-role-assignment`, {
// //           data: {
// //           assignment_id: assignmentId,
// //           deduct_points: true // Deduct points when removing assignment
// //         }
// //         });
        
// //         console.log("Assignment removed");
// //         fetchAllData();
// //       } catch (error) {
// //         console.error("Error removing assignment:", error);
// //         alert(error.response?.data?.error || "An error occurred");
// //       }
// //     }
// //   };

// //   const handleEditAssignment = (assignment) => {
// //     // Find the teacher and role in our lists
// //     // const teacher = facultyList.find(t => t._id === assignment.teacher_id);
    
// //     setAssignmentFormData({
// //       teacherId: assignment.teacher_id,
// //       roleId: assignment.role_id,
// //       eventId: eventId,
// //       assignmentId: assignment._id
// //     });
    
// //     setIsEditMode(true);
// //     setShowAssignForm(true);
// //   };

// //   // Function to create a new role
// //   const handleCreateRole = async () => {
// //     const roleName = prompt("Enter role name:");
// //     if (!roleName) return;
    
// //     const roleDescription = prompt("Enter role description:");
// //     const rolePoints = parseInt(prompt("Enter points for this role:")) || 0;
// //     const headCount = parseInt(prompt("Enter maximum number of teachers for this role:")) || 1;
    
// //     try {
// //       await axios.post(`http://localhost:8080/roles/${eventId}`, {
// //         name: roleName,
// //         description: roleDescription,
// //         point: rolePoints,
// //         head_count: headCount
// //       });
      
// //       console.log("Role created");
// //       fetchAllData();
// //     } catch (error) {
// //       console.error("Error creating role:", error);
// //       alert(error.response?.data?.error || "An error occurred");
// //     }
// //   };

// //   if (loading) {
// //     return <div>Loading event details...</div>;
// //   }

// //   return (
// //     <div>
// //       <div className="mb-6 flex items-center">
// //         <button
// //           onClick={() => navigate("/admin")}
// //           className="mr-4 text-blue-600 hover:text-blue-800"
// //         >
// //           ← Back to Dashboard
// //         </button>
// //         <h2 className="text-xl font-semibold">
// //           Event Dashboard: {eventDetails?.name || eventId}
// //         </h2>
// //       </div>

// //       {eventDetails && (
// //         <div className="bg-white shadow rounded p-4 mb-6">
// //           <h3 className="text-lg font-medium mb-2">Event Details</h3>
// //           <p><strong>Name:</strong> {eventDetails.name}</p>
// //           <p><strong>Description:</strong> {eventDetails.description}</p>
// //           <p>
// //             <strong>Duration:</strong> {new Date(eventDetails.start_date).toLocaleDateString()} - {new Date(eventDetails.end_date).toLocaleDateString()}
// //           </p>
// //         </div>
// //       )}

// //       {/* Roles Section */}
// //       <div className="bg-white shadow rounded p-4 mb-6">
// //         <div className="flex justify-between items-center mb-4">
// //           <h3 className="text-lg font-medium">Event Roles</h3>
// //           <button
// //             className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
// //             onClick={handleCreateRole}
// //           >
// //             Add New Role
// //           </button>
// //         </div>

// //         <div className="overflow-x-auto">
// //           <table className="min-w-full divide-y divide-gray-200">
// //             <thead className="bg-gray-50">
// //               <tr>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers Assigned</th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Teachers</th>
// //               </tr>
// //             </thead>
// //             <tbody className="bg-white divide-y divide-gray-200">
// //               {roles.map(role => {
// //                 const assignedCount = assignments.filter(a => a.role_id === role.id).length;
                
// //                 return (
// //                   <tr key={role._id}>
// //                     <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
// //                     <td className="px-6 py-4">{role.description}</td>
// //                     <td className="px-6 py-4 whitespace-nowrap">{role.point}</td>
// //                     <td className="px-6 py-4 whitespace-nowrap">{assignedCount} / {role.head_count}</td>
// //                     <td className="px-6 py-4 whitespace-nowrap">{role.head_count}</td>
// //                   </tr>
// //                 );
// //               })}
// //               {roles.length === 0 && (
// //                 <tr>
// //                   <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
// //                     No roles defined for this event yet.
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* Faculty Assignments Section */}
// //       <div className="bg-white shadow rounded p-4 mb-6">
// //         <div className="flex justify-between items-center mb-4">
// //           <h3 className="text-lg font-medium">Faculty Assignments</h3>
// //           <button
// //             className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
// //             onClick={() => {
// //               resetForm();
// //               setAssignmentFormData(prev => ({...prev, eventId}));
// //               setShowAssignForm(!showAssignForm);
// //             }}
// //           >
// //             {showAssignForm ? "Cancel" : "Assign Role"}
// //           </button>
// //         </div>

// //         {showAssignForm && (
// //           <div className="border rounded p-4 mb-4 bg-gray-50">
// //             <h4 className="font-medium mb-3">{isEditMode ? "Update Role Assignment" : "Assign Role to Faculty"}</h4>
// //             <form onSubmit={handleAssignRole} className="space-y-4">
// //               <div>
// //                 <label className="block mb-1">Faculty Member</label>
// //                 <select
// //                   name="teacherId"
// //                   value={assignmentFormData.teacherId}
// //                   onChange={handleAssignmentInputChange}
// //                   className="w-full px-3 py-2 border rounded"
// //                   required
// //                 >
// //                   <option value="">-- Select Faculty --</option>
// //                   {facultyList.map(faculty => (
// //                     <option key={faculty.id} value={faculty.id}>
// //                       {faculty.name}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>
              
// //               <div>
// //                 <label className="block mb-1">Role</label>
// //                 <select
// //                   name="roleId"
// //                   value={assignmentFormData.roleId}
// //                   onChange={handleAssignmentInputChange}
// //                   className="w-full px-3 py-2 border rounded"
// //                   required
// //                 >
// //                   <option value="">-- Select Role --</option>
// //                   {roles.map(role => {
// //                     const assignedCount = assignments.filter(a => a.role_id === role.id).length;
// //                     const isAtCapacity = assignedCount >= role.headCount;
// //                     const isSelected = role._id === assignmentFormData.roleId;
// //                     // Allow selection if editing or if role isn't at capacity
// //                     const isDisabled = isAtCapacity && !isSelected && !isEditMode;
                    
// //                     return (
// //                       <option key={role.id} value={role.id} disabled={isDisabled}>
// //                         {role.name} ({assignedCount}/{role.head_count}) - {role.point} points
// //                       </option>
// //                     );
// //                   })}
// //                 </select>
// //               </div>
              
// //               <div className="flex space-x-2">
// //                 <button
// //                   type="submit"
// //                   className={`px-4 py-2 text-white rounded ${
// //                     isEditMode ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
// //                   }`}
// //                 >
// //                   {isEditMode ? "Update Assignment" : "Assign Role"}
// //                 </button>
                
// //                 {isEditMode && (
// //                   <button
// //                     type="button"
// //                     onClick={resetForm}
// //                     className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
// //                   >
// //                     Cancel
// //                   </button>
// //                 )}
// //               </div>
// //             </form>
// //           </div>
// //         )}

// //         <div className="overflow-x-auto">
// //           <table className="min-w-full divide-y divide-gray-200">
// //             <thead className="bg-gray-50">
// //               <tr>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody className="bg-white divide-y divide-gray-200">
// //               {assignments.map(assignment => {
// //                 const role = roles.find(r => r._id === assignment.roleid);
                
// //                 return (
// //                   <tr key={assignment.id}>
// //                     <td className="px-6 py-4 whitespace-nowrap">{assignment.teachername}</td>
// //                     <td className="px-6 py-4 whitespace-nowrap">{assignment.teacheremail}</td>
// //                     <td className="px-6 py-4 whitespace-nowrap">{assignment.rolename}</td>
// //                     <td className="px-6 py-4 whitespace-nowrap">{role?.point || "N/A"}</td>
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <button 
// //                         className="text-blue-600 hover:text-blue-900 mr-2"
// //                         onClick={() => handleEditAssignment(assignment.id)}
// //                       >
// //                         Edit
// //                       </button>
// //                       <button 
// //                         className="text-red-600 hover:text-red-900"
// //                         onClick={() => handleDeleteAssignment(assignment.id)}
// //                       >
// //                         Remove
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //               {assignments.length === 0 && (
// //                 <tr>
// //                   <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
// //                     No faculty assignments for this event yet.
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default EventDashboard;
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import "./EventDashboard.css"; // Import the beautiful CSS

// const EventDashboard = () => {
//   const { eventId } = useParams();
//   const navigate = useNavigate();
//   const [eventDetails, setEventDetails] = useState(null);
//   const [facultyList, setFacultyList] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAssignForm, setShowAssignForm] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [assignmentFormData, setAssignmentFormData] = useState({
//     teacherId: "",
//     roleId: "",
//     eventId: "",
//     assignmentId: ""
//   });

//   useEffect(() => {
//     fetchAllData();
//   }, [eventId]);

//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       // Fetch event details
//       const eventResponse = await axios.get(`http://localhost:8080/eventid/${eventId}`);
//       setEventDetails(eventResponse.data);
      
//       // Fetch faculty/teachers list
//       const teachersResponse = await axios.get(`http://localhost:8080/teachers`);
//       setFacultyList(teachersResponse.data);
      
//       // Fetch roles for this event
//       const rolesResponse = await axios.get(`http://localhost:8080/event/${eventId}/roles`);
//       setRoles(rolesResponse.data);
      
//       // Fetch assignments for this event
//       const assignmentsResponse = await axios.get(`http://localhost:8080/events/assigned-teachers/${eventId}`);
//       setAssignments(assignmentsResponse.data);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAssignmentInputChange = (e) => {
//     const { name, value } = e.target;
//     setAssignmentFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const resetForm = () => {
//     setAssignmentFormData({
//       teacherId: "",
//       roleId: "",
//       eventId: eventId,
//       assignmentId: ""
//     });
//     setIsEditMode(false);
//     setShowAssignForm(false);
//   };

//   const handleAssignRole = async (e) => {
//     e.preventDefault();
    
//     try {
//       if (isEditMode) {
//         // Delete the old assignment
//         await axios.post(`http://localhost:8080/deleteAssignment`, {
//           assignment_id: assignmentFormData.assignmentId,
//           deduct_points: true // Deduct points when removing assignment
//         });
        
//         // Create new assignment with updated values
//         await axios.post(`http://localhost:8080/assignTeacher`, {
//           teacher_id: assignmentFormData.teacherId,
//           role_id: assignmentFormData.roleId,
//           event_id: eventId
//         });
        
//         console.log("Role assignment updated");
//       } else {
//         await axios.post(`http://localhost:8080/assignments`, {
//           teacher_id: assignmentFormData.teacherId,
//           role_id: assignmentFormData.roleId,
//           event_id: eventId
//         });
        
//         console.log("Role assigned");
//       }
      
//       // Refresh data
//       fetchAllData();
//       resetForm();
//     } catch (error) {
//       console.error("Error assigning/updating role:", error);
//       alert(error.response?.data?.error || "An error occurred");
//     }
//   };

//   const handleDeleteAssignment = async (assignmentId) => {
//     if (window.confirm("Are you sure you want to remove this assignment?")) {
//       try {
//         await axios.delete(`http://localhost:8080/delete-role-assignment`, {
//           data: {
//             assignment_id: assignmentId,
//             deduct_points: true // Deduct points when removing assignment
//           }
//         });
        
//         console.log("Assignment removed");
//         fetchAllData();
//       } catch (error) {
//         console.error("Error removing assignment:", error);
//         alert(error.response?.data?.error || "An error occurred");
//       }
//     }
//   };

//   const handleEditAssignment = (assignment) => {
//     setAssignmentFormData({
//       teacherId: assignment.teacher_id,
//       roleId: assignment.role_id,
//       eventId: eventId,
//       assignmentId: assignment._id
//     });
    
//     setIsEditMode(true);
//     setShowAssignForm(true);
//   };

//   // Function to create a new role
//   const handleCreateRole = async () => {
//     const roleName = prompt("Enter role name:");
//     if (!roleName) return;
    
//     const roleDescription = prompt("Enter role description:");
//     const rolePoints = parseInt(prompt("Enter points for this role:")) || 0;
//     const headCount = parseInt(prompt("Enter maximum number of teachers for this role:")) || 1;
    
//     try {
//       await axios.post(`http://localhost:8080/roles/${eventId}`, {
//         name: roleName,
//         description: roleDescription,
//         point: rolePoints,
//         head_count: headCount
//       });
      
//       console.log("Role created");
//       fetchAllData();
//     } catch (error) {
//       console.error("Error creating role:", error);
//       alert(error.response?.data?.error || "An error occurred");
//     }
//   };

//   const getProgressIndicatorClass = (assigned, total) => {
//     if (assigned === 0) return "progress-indicator available";
//     if (assigned >= total) return "progress-indicator full";
//     return "progress-indicator partial";
//   };

//   if (loading) {
//     return (
//       <div className="event-dashboard">
//         <div className="loading">Loading event details...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="event-dashboard">
//       {/* Header Section */}
//       <div className="dashboard-header fade-in-up">
//         <button
//           onClick={() => navigate("/admin")}
//           className="back-button"
//         >
//           ← Back to Dashboard
//         </button>
//         <h1 className="dashboard-title">
//           Event Dashboard: {eventDetails?.name || eventId}
//         </h1>
//       </div>

//       {/* Event Details Card */}
//       {eventDetails && (
//         <div className="card fade-in-up">
//           <div className="card-header">
//             <h2 className="card-title">Event Details</h2>
//           </div>
//           <div className="event-details">
//             <div className="event-detail-item">
//               <div className="event-detail-label">Event Name</div>
//               <div className="event-detail-value">{eventDetails.name}</div>
//             </div>
//             <div className="event-detail-item">
//               <div className="event-detail-label">Description</div>
//               <div className="event-detail-value">{eventDetails.description}</div>
//             </div>
//             <div className="event-detail-item">
//               <div className="event-detail-label">Duration</div>
//               <div className="event-detail-value">
//                 {new Date(eventDetails.start_date).toLocaleDateString()} - {new Date(eventDetails.end_date).toLocaleDateString()}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Roles Section */}
//       <div className="card fade-in-up">
//         <div className="card-header">
//           <h2 className="card-title">Event Roles</h2>
//           <button
//             className="btn btn-success"
//             onClick={handleCreateRole}
//           >
//             + Add New Role
//           </button>
//         </div>

//         <div className="table-container">
//           <table className="table">
//             <thead className="table-header">
//               <tr>
//                 <th>Role Name</th>
//                 <th>Description</th>
//                 <th>Points</th>
//                 <th>Assignment Status</th>
//                 <th>Capacity</th>
//               </tr>
//             </thead>
//             <tbody className="table-body">
//               {roles.map(role => {
//                 const assignedCount = assignments.filter(a => a.role_id === role.id).length;
                
//                 return (
//                   <tr key={role._id}>
//                     <td><strong>{role.name}</strong></td>
//                     <td>{role.description}</td>
//                     <td><strong>{role.point} pts</strong></td>
//                     <td>
//                       <span className={getProgressIndicatorClass(assignedCount, role.head_count)}>
//                         {assignedCount} / {role.head_count} assigned
//                       </span>
//                     </td>
//                     <td>{role.head_count}</td>
//                   </tr>
//                 );
//               })}
//               {roles.length === 0 && (
//                 <tr>
//                   <td colSpan="5" className="table-empty">
//                     No roles defined for this event yet. Click "Add New Role" to get started.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Faculty Assignments Section */}
//       <div className="card fade-in-up">
//         <div className="card-header">
//           <h2 className="card-title">Faculty Assignments</h2>
//           <button
//             className="btn btn-primary"
//             onClick={() => {
//               resetForm();
//               setAssignmentFormData(prev => ({...prev, eventId}));
//               setShowAssignForm(!showAssignForm);
//             }}
//           >
//             {showAssignForm ? "Cancel" : "Assign Role"}
//           </button>
//         </div>

//         {showAssignForm && (
//           <div className="form-container">
//             <h3 className="form-title">
//               {isEditMode ? "Update Role Assignment" : "Assign Role to Faculty"}
//             </h3>
//             <form onSubmit={handleAssignRole}>
//               <div className="form-group">
//                 <label className="form-label">Faculty Member</label>
//                 <select
//                   name="teacherId"
//                   value={assignmentFormData.teacherId}
//                   onChange={handleAssignmentInputChange}
//                   className="form-select"
//                   required
//                 >
//                   <option value="">-- Select Faculty --</option>
//                   {facultyList.map(faculty => (
//                     <option key={faculty.id} value={faculty.id}>
//                       {faculty.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="form-group">
//                 <label className="form-label">Role</label>
//                 <select
//                   name="roleId"
//                   value={assignmentFormData.roleId}
//                   onChange={handleAssignmentInputChange}
//                   className="form-select"
//                   required
//                 >
//                   <option value="">-- Select Role --</option>
//                   {roles.map(role => {
//                     const assignedCount = assignments.filter(a => a.role_id === role.id).length;
//                     const isAtCapacity = assignedCount >= role.head_count;
//                     const isSelected = role._id === assignmentFormData.roleId;
//                     const isDisabled = isAtCapacity && !isSelected && !isEditMode;
                    
//                     return (
//                       <option key={role.id} value={role.id} disabled={isDisabled}>
//                         {role.name} ({assignedCount}/{role.head_count}) - {role.point} points
//                         {isAtCapacity && !isSelected ? " - FULL" : ""}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
              
//               <div className="form-actions">
//                 <button
//                   type="submit"
//                   className={`btn ${isEditMode ? "btn-warning" : "btn-success"}`}
//                 >
//                   {isEditMode ? "Update Assignment" : "Assign Role"}
//                 </button>
                
//                 {isEditMode && (
//                   <button
//                     type="button"
//                     onClick={resetForm}
//                     className="btn btn-secondary"
//                   >
//                     Cancel
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>
//         )}

//         <div className="table-container">
//           <table className="table">
//             <thead className="table-header">
//               <tr>
//                 <th>Faculty</th>
//                 <th>Email</th>
//                 <th>Role</th>
//                 <th>Points</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody className="table-body">
//               {assignments.map(assignment => {
//                 const role = roles.find(r => r._id === assignment.roleid);
                
//                 return (
//                   <tr key={assignment.id}>
//                     <td><strong>{assignment.teachername}</strong></td>
//                     <td>{assignment.teacheremail}</td>
//                     <td><strong>{assignment.rolename}</strong></td>
//                     <td><strong>{role?.point || "N/A"} pts</strong></td>
//                     <td>
//                       <div className="table-actions">
//                         <button 
//                           className="action-btn action-btn-edit"
//                           onClick={() => handleEditAssignment(assignment.id)}
//                         >
//                           Edit
//                         </button>
//                         <button 
//                           className="action-btn action-btn-delete"
//                           onClick={() => handleDeleteAssignment(assignment.id)}
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {assignments.length === 0 && (
//                 <tr>
//                   <td colSpan="5" className="table-empty">
//                     No faculty assignments for this event yet. Click "Assign Role" to get started.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EventDashboard;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EventDashboard.css"; // Import the beautiful CSS

const EventDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({
    teacherId: "",
    roleId: "",
    eventId: "",
    assignmentId: ""
  });

  useEffect(() => {
    fetchAllData();
  }, [eventId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch event details
      const eventResponse = await axios.get(`http://localhost:8080/eventid/${eventId}`);
      setEventDetails(eventResponse.data);
      
      // Fetch faculty/teachers list
      const teachersResponse = await axios.get(`http://localhost:8080/teachers`);
      setFacultyList(Array.isArray(teachersResponse.data) ? teachersResponse.data : []);
      
      // Fetch roles for this event
      const rolesResponse = await axios.get(`http://localhost:8080/event/${eventId}/roles`);
      setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      
      // Fetch assignments for this event
      const assignmentsResponse = await axios.get(`http://localhost:8080/events/assigned-teachers/${eventId}`);
      setAssignments(Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      // Set arrays to empty arrays on error to prevent null reference errors
      setFacultyList([]);
      setRoles([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentInputChange = (e) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setAssignmentFormData({
      teacherId: "",
      roleId: "",
      eventId: eventId,
      assignmentId: ""
    });
    setIsEditMode(false);
    setShowAssignForm(false);
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        // Delete the old assignment
        await axios.post(`http://localhost:8080/deleteAssignment`, {
          assignment_id: assignmentFormData.assignmentId,
          deduct_points: true // Deduct points when removing assignment
        });
        
        // Create new assignment with updated values
        await axios.post(`http://localhost:8080/assignTeacher`, {
          teacher_id: assignmentFormData.teacherId,
          role_id: assignmentFormData.roleId,
          event_id: eventId
        });
        
        console.log("Role assignment updated");
      } else {
        await axios.post(`http://localhost:8080/assignments`, {
          teacher_id: assignmentFormData.teacherId,
          role_id: assignmentFormData.roleId,
          event_id: eventId
        });
        
        console.log("Role assigned");
      }
      
      // Refresh data
      fetchAllData();
      resetForm();
    } catch (error) {
      console.error("Error assigning/updating role:", error);
      alert(error.response?.data?.error || "An error occurred");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      try {
        await axios.delete(`http://localhost:8080/delete-role-assignment`, {
          data: {
            assignment_id: assignmentId,
            deduct_points: true // Deduct points when removing assignment
          }
        });
        
        console.log("Assignment removed");
        fetchAllData();
      } catch (error) {
        console.error("Error removing assignment:", error);
        alert(error.response?.data?.error || "An error occurred");
      }
    }
  };

  const handleEditAssignment = (assignment) => {
    setAssignmentFormData({
      teacherId: assignment.teacher_id,
      roleId: assignment.role_id,
      eventId: eventId,
      assignmentId: assignment._id
    });
    
    setIsEditMode(true);
    setShowAssignForm(true);
  };

  // Function to create a new role
  const handleCreateRole = async () => {
    const roleName = prompt("Enter role name:");
    if (!roleName) return;
    
    const roleDescription = prompt("Enter role description:");
    const rolePoints = parseInt(prompt("Enter points for this role:")) || 0;
    const headCount = parseInt(prompt("Enter maximum number of teachers for this role:")) || 1;
    
    try {
      await axios.post(`http://localhost:8080/roles/${eventId}`, {
        name: roleName,
        description: roleDescription,
        point: rolePoints,
        head_count: headCount
      });
      
      console.log("Role created");
      fetchAllData();
    } catch (error) {
      console.error("Error creating role:", error);
      alert(error.response?.data?.error || "An error occurred");
    }
  };

  const getProgressIndicatorClass = (assigned, total) => {
    if (assigned === 0) return "progress-indicator available";
    if (assigned >= total) return "progress-indicator full";
    return "progress-indicator partial";
  };

  if (loading) {
    return (
      <div className="event-dashboard">
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  return (
    <div className="event-dashboard">
      {/* Header Section */}
      <div className="dashboard-header fade-in-up">
        <button
          onClick={() => navigate("/admin")}
          className="back-button"
        >
          ← Back to Dashboard
        </button>
        <h1 className="dashboard-title">
          Event Dashboard: {eventDetails?.name || eventId}
        </h1>
      </div>

      {/* Event Details Card */}
      {eventDetails && (
        <div className="card fade-in-up">
          <div className="card-header">
            <h2 className="card-title">Event Details</h2>
          </div>
          <div className="event-details">
            <div className="event-detail-item">
              <div className="event-detail-label">Event Name</div>
              <div className="event-detail-value">{eventDetails.name}</div>
            </div>
            <div className="event-detail-item">
              <div className="event-detail-label">Description</div>
              <div className="event-detail-value">{eventDetails.description}</div>
            </div>
            <div className="event-detail-item">
              <div className="event-detail-label">Duration</div>
              <div className="event-detail-value">
                {new Date(eventDetails.start_date).toLocaleDateString()} - {new Date(eventDetails.end_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roles Section */}
      <div className="card fade-in-up">
        <div className="card-header">
          <h2 className="card-title">Event Roles</h2>
          <button
            className="btn btn-success"
            onClick={handleCreateRole}
          >
            + Add New Role
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Points</th>
                <th>Assignment Status</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {roles && roles.length > 0 ? roles.map(role => {
                const assignedCount = assignments ? assignments.filter(a => a.role_id === role.id).length : 0;
                
                return (
                  <tr key={role._id}>
                    <td><strong>{role.name}</strong></td>
                    <td>{role.description}</td>
                    <td><strong>{role.point} pts</strong></td>
                    <td>
                      <span className={getProgressIndicatorClass(assignedCount, role.head_count)}>
                        {assignedCount} / {role.head_count} assigned
                      </span>
                    </td>
                    <td>{role.head_count}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="table-empty">
                    No roles defined for this event yet. Click "Add New Role" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Assignments Section */}
      <div className="card fade-in-up">
        <div className="card-header">
          <h2 className="card-title">Faculty Assignments</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setAssignmentFormData(prev => ({...prev, eventId}));
              setShowAssignForm(!showAssignForm);
            }}
          >
            {showAssignForm ? "Cancel" : "Assign Role"}
          </button>
        </div>

        {showAssignForm && (
          <div className="form-container">
            <h3 className="form-title">
              {isEditMode ? "Update Role Assignment" : "Assign Role to Faculty"}
            </h3>
            <form onSubmit={handleAssignRole}>
              <div className="form-group">
                <label className="form-label">Faculty Member</label>
                <select
                  name="teacherId"
                  value={assignmentFormData.teacherId}
                  onChange={handleAssignmentInputChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Faculty --</option>
                  {facultyList && facultyList.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  name="roleId"
                  value={assignmentFormData.roleId}
                  onChange={handleAssignmentInputChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Role --</option>
                  {roles && roles.map(role => {
                    const assignedCount = assignments ? assignments.filter(a => a.role_id === role.id).length : 0;
                    const isAtCapacity = assignedCount >= role.head_count;
                    const isSelected = role._id === assignmentFormData.roleId;
                    const isDisabled = isAtCapacity && !isSelected && !isEditMode;
                    
                    return (
                      <option key={role.id} value={role.id} disabled={isDisabled}>
                        {role.name} ({assignedCount}/{role.head_count}) - {role.point} points
                        {isAtCapacity && !isSelected ? " - FULL" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className={`btn ${isEditMode ? "btn-warning" : "btn-success"}`}
                >
                  {isEditMode ? "Update Assignment" : "Assign Role"}
                </button>
                
                {isEditMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Faculty</th>
                <th>Email</th>
                <th>Role</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {assignments && assignments.length > 0 ? assignments.map(assignment => {
                const role = roles ? roles.find(r => r._id === assignment.roleid) : null;
                
                return (
                  <tr key={assignment.id}>
                    <td><strong>{assignment.teachername}</strong></td>
                    <td>{assignment.teacheremail}</td>
                    <td><strong>{assignment.rolename}</strong></td>
                    <td><strong>{role?.point || "N/A"} pts</strong></td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="action-btn action-btn-edit"
                          onClick={() => handleEditAssignment(assignment.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn action-btn-delete"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="table-empty">
                    No faculty assignments for this event yet. Click "Assign Role" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventDashboard;