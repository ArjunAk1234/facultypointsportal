
// import { useState, useEffect } from "react";
// import { Trash2, Edit, X, Check, AlertCircle, Download } from "lucide-react";
// import './facultylist.css';

// export default function TeachersList() {
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editingTeacher, setEditingTeacher] = useState(null); // This will now store the _id
//   const [editFormData, setEditFormData] = useState({
//     name: "",
//     email: "",
//     departmentname: "",
//   });
//   const [notification, setNotification] = useState(null);

//   useEffect(() => {
//     const fetchTeachers = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch("https://facultypointsportal.onrender.com/teachers");
  
//         if (!response.ok) {
//           throw new Error(`Error fetching teachers: ${response.status}`);
//         }
  
//         const data = await response.json();
  
//         // If data is null, fallback to empty array
//         setTeachers(Array.isArray(data) ? data : []);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchTeachers();
//   }, []);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   const handleEditClick = (teacher) => {
//     // Use teacher._id instead of teacher.id
//     setEditingTeacher(teacher._id);
//     setEditFormData({
//       name: teacher.name,
//       email: teacher.email,
//       departmentname: teacher.department_name,
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditingTeacher(null);
//   };

//   const handleEditFormChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData({
//       ...editFormData,
//       [name]: value,
//     });
//   };

//   const handleSaveEdit = async (teacherId) => { // teacherId is now the _id
//     try {
//       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(editFormData),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update teacher");
//       }

//       const updatedTeacherData = {
//           ...teachers.find(t => t._id === teacherId), // Find by _id
//           name: editFormData.name,
//           email: editFormData.email,
//           department_name: editFormData.departmentname
//       };

//       setTeachers(
//         teachers.map((teacher) =>
//           // Compare with _id
//           teacher._id === teacherId ? updatedTeacherData : teacher
//         )
//       );

//       setEditingTeacher(null);
//       showNotification("Teacher updated successfully");
//     } catch (err) {
//       showNotification(err.message, "error");
//     }
//   };

//   const confirmDelete = (message) => {
//     return window.confirm(message);
//   };

//   const handleDeleteTeacher = async (teacherId) => { // teacherId is now the _id
//     const shouldDelete = confirmDelete(
//       "Are you sure you want to delete this teacher? This will also remove all associated assignments and references."
//     );

//     if (!shouldDelete) return;

//     try {
//       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         throw new Error("Failed to delete teacher");
//       }

//       // Filter using _id
//       setTeachers(teachers.filter((teacher) => teacher._id !== teacherId));
//       showNotification("Teacher deleted successfully");
//     } catch (err) {
//       showNotification(err.message, "error");
//     }
//   };

//   const handleDownloadReport = async (teacherId, teacherName) => { // teacherId is now the _id
//       showNotification("Generating report...", "info");
//       try {
//           const response = await fetch(`https://facultypointsportal.onrender.com/reports/teacher/${teacherId}`);

//           if (!response.ok) {
//               throw new Error(`Failed to download report: ${response.statusText}`);
//           }

//           const blob = await response.blob();
//           const url = window.URL.createObjectURL(blob);
          
//           const a = document.createElement('a');
//           a.style.display = 'none';
//           a.href = url;
//           const safeName = teacherName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
//           a.download = `report_${safeName}.csv`;
          
//           document.body.appendChild(a);
//           a.click();
          
//           window.URL.revokeObjectURL(url);
//           document.body.removeChild(a);

//           showNotification("Report downloaded successfully.", "success");

//       } catch (err) {
//           showNotification(err.message, "error");
//       }
//   };


//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <div className="loading-text">Loading teachers...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <div className="error-content">
//           <AlertCircle className="error-icon" />
//           <div>
//             <h3 className="error-title">Error loading teachers</h3>
//             <div className="error-message">{error}</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="teachers-container">
//       {notification && (
//         <div className={`notification ${notification.type}`}>
//           {notification.message}
//         </div>
//       )}

//       <div className="teachers-header">
//         <div>
//           <h1 className="teachers-title">Teachers</h1>
//           <p className="teachers-description">
//             A list of all teachers including their name, email, department, and points.
//           </p>
//         </div>
//       </div>

//       <div className="table-wrapper">
//         <div className="table-container">
//           <table className="teachers-table">
//             <thead className="table-header">
//               <tr>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Department</th>
//                 <th>Points</th>
//                 <th>
//                   <span className="sr-only">Actions</span>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="table-body">
//               {teachers.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="empty-state">
//                     <div className="empty-state-text">No teachers found</div>
//                   </td>
//                 </tr>
//               ) : (
//                 teachers.map((teacher) => (
//                   // Use _id for the key prop
//                   <tr key={teacher._id} className="table-row">
//                     <td className="table-cell">
//                       {/* Compare with _id */}
//                       {editingTeacher === teacher._id ? (
//                         <input
//                           type="text"
//                           name="name"
//                           value={editFormData.name}
//                           onChange={handleEditFormChange}
//                           className="edit-input"
//                         />
//                       ) : (
//                         <div className="teacher-name">{teacher.name}</div>
//                       )}
//                     </td>
//                     <td className="table-cell">
//                       {editingTeacher === teacher._id ? (
//                         <input
//                           type="email"
//                           name="email"
//                           value={editFormData.email}
//                           onChange={handleEditFormChange}
//                           className="edit-input"
//                         />
//                       ) : (
//                         <div className="teacher-email">{teacher.email}</div>
//                       )}
//                     </td>
//                     <td className="table-cell">
//                       {editingTeacher === teacher._id ? (
//                         <input
//                           type="text"
//                           name="departmentname"
//                           value={editFormData.departmentname}
//                           onChange={handleEditFormChange}
//                           className="edit-input"
//                         />
//                       ) : (
//                         <div className="teacher-department">
//                           {teacher.department_name || "N/A"}
//                         </div>
//                       )}
//                     </td>
//                     <td className="table-cell">
//                       <div className="teacher-points">{teacher.point}</div>
//                     </td>
//                     <td className="table-cell">
//                       {editingTeacher === teacher._id ? (
//                         <div className="actions-container">
//                           <button
//                             // Pass _id to the handler
//                             onClick={() => handleSaveEdit(teacher._id)}
//                             className="action-button save-button"
//                             title="Save changes"
//                           >
//                             <Check className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={handleCancelEdit}
//                             className="action-button cancel-button"
//                             title="Cancel editing"
//                           >
//                             <X className="w-5 h-5" />
//                           </button>
//                         </div>
//                       ) : (
//                         <div className="actions-container">
//                            <button
//                             // Pass _id to the handler
//                             onClick={() => handleDownloadReport(teacher._id, teacher.name)}
//                             className="action-button download-button"
//                             title="Download report"
//                           >
//                             <Download className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={() => handleEditClick(teacher)}
//                             className="action-button edit-button"
//                             title="Edit teacher"
//                           >
//                             <Edit className="w-5 h-5" />
//                           </button>
//                           <button
//                             // Pass _id to the handler
//                             onClick={() => handleDeleteTeacher(teacher._id)}
//                             className="action-button delete-button"
//                             title="Delete teacher"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


// // // // import { useState, useEffect } from "react";
// // // // import { Trash2, Edit, X, Check, AlertCircle } from "lucide-react";
// // // // import './facultylist.css';
// // // // export default function TeachersList() {
// // // //   const [teachers, setTeachers] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError] = useState(null);
// // // //   const [editingTeacher, setEditingTeacher] = useState(null);
// // // //   const [editFormData, setEditFormData] = useState({
// // // //     name: "",
// // // //     email: "",
// // // //     departmentname:"",
// // // //   });
// // // //   const [notification, setNotification] = useState(null);

// // // //   useEffect(() => {
// // // //     const fetchTeachers = async () => {
// // // //       try {
// // // //         setLoading(true);
// // // //         const response = await fetch("https://facultypointsportal.onrender.com/teachers");

// // // //         if (!response.ok) {
// // // //           throw new Error(`Error fetching teachers: ${response.status}`);
// // // //         }

// // // //         const data = await response.json();
// // // //         setTeachers(data);
// // // //         setLoading(false);
// // // //       } catch (err) {
// // // //         setError(err.message);
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchTeachers();
// // // //   }, []);

// // // //   const showNotification = (message, type = "success") => {
// // // //     setNotification({ message, type });
// // // //     setTimeout(() => setNotification(null), 3000);
// // // //   };

// // // //   const handleEditClick = (teacher) => {
// // // //     setEditingTeacher(teacher.id);
// // // //     setEditFormData({
// // // //       name: teacher.name,
// // // //       email: teacher.email,
// // // //       departmentname:teacher.department_name,
// // // //     });
// // // //   };

// // // //   const handleCancelEdit = () => {
// // // //     setEditingTeacher(null);
// // // //   };

// // // //   const handleEditFormChange = (e) => {
// // // //     const { name, value } = e.target;
// // // //     setEditFormData({
// // // //       ...editFormData,
// // // //       [name]: value,
// // // //     });
// // // //   };

// // // //   const handleSaveEdit = async (teacherId) => {
// // // //     try {
// // // //       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
// // // //         method: "PUT",
// // // //         headers: {
// // // //           "Content-Type": "application/json",
// // // //         },
// // // //         body: JSON.stringify(editFormData),
// // // //       });

// // // //       if (!response.ok) {
// // // //         throw new Error("Failed to update teacher");
// // // //       }

// // // //       setTeachers(
// // // //         teachers.map((teacher) =>
// // // //           teacher.id === teacherId ? { ...teacher, ...editFormData } : teacher
// // // //         )
// // // //       );

// // // //       setEditingTeacher(null);
// // // //       showNotification("Teacher updated successfully");
// // // //     } catch (err) {
// // // //       showNotification(err.message, "error");
// // // //     }
// // // //   };

// // // //   const confirmDelete = (message) => {
// // // //     return window.confirm(message);
// // // //   };

// // // //   const handleDeleteTeacher = async (teacherId) => {
// // // //     const shouldDelete = confirmDelete(
// // // //       "Are you sure you want to delete this teacher? This will also remove all associated assignments and references."
// // // //     );

// // // //     if (!shouldDelete) return;

// // // //     try {
// // // //       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
// // // //         method: "DELETE",
// // // //       });

// // // //       if (!response.ok) {
// // // //         throw new Error("Failed to delete teacher");
// // // //       }

// // // //       setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
// // // //       showNotification("Teacher deleted successfully");
// // // //     } catch (err) {
// // // //       showNotification(err.message, "error");
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="flex items-center justify-center h-64">
// // // //         <div className="text-lg font-medium text-gray-500">Loading teachers...</div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (error) {
// // // //     return (
// // // //       <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
// // // //         <div className="flex">
// // // //           <AlertCircle className="h-5 w-5 text-red-400" />
// // // //           <div className="ml-3">
// // // //             <h3 className="text-sm font-medium text-red-800">Error loading teachers</h3>
// // // //             <div className="mt-2 text-sm text-red-700">{error}</div>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="px-4 sm:px-6 lg:px-8 py-8">
// // // //       {notification && (
// // // //         <div
// // // //           className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
// // // //             notification.type === "error"
// // // //               ? "bg-red-50 text-red-800"
// // // //               : "bg-green-50 text-green-800"
// // // //           }`}
// // // //         >
// // // //           {notification.message}
// // // //         </div>
// // // //       )}

// // // //       <div className="sm:flex sm:items-center">
// // // //         <div className="sm:flex-auto">
// // // //           <h1 className="text-2xl font-semibold text-gray-900">Teachers</h1>
// // // //           <p className="mt-2 text-sm text-gray-700">
// // // //             A list of all teachers including their name, email, department, and points.
// // // //           </p>
// // // //         </div>
// // // //       </div>

// // // //       <div className="mt-8 flex flex-col">
// // // //         <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
// // // //           <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
// // // //             <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
// // // //               <table className="min-w-full divide-y divide-gray-300">
// // // //                 <thead className="bg-gray-50">
// // // //                   <tr>
// // // //                     <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
// // // //                       Name
// // // //                     </th>
// // // //                     <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
// // // //                       Email
// // // //                     </th>
// // // //                     <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
// // // //                       Department
// // // //                     </th>
// // // //                     <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
// // // //                       Points
// // // //                     </th>
// // // //                     <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
// // // //                       <span className="sr-only">Actions</span>
// // // //                     </th>
// // // //                   </tr>
// // // //                 </thead>
// // // //                 <tbody className="divide-y divide-gray-200 bg-white">
// // // //                   {teachers.length === 0 ? (
// // // //                     <tr>
// // // //                       <td colSpan="5" className="py-4 text-center text-sm text-gray-500">
// // // //                         No teachers found
// // // //                       </td>
// // // //                     </tr>
// // // //                   ) : (
// // // //                     teachers.map((teacher) => (
// // // //                       <tr key={teacher.id}>
// // // //                         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
// // // //                           {editingTeacher === teacher.id ? (
// // // //                             <input
// // // //                               type="text"
// // // //                               name="name"
// // // //                               value={editFormData.name}
// // // //                               onChange={handleEditFormChange}
// // // //                               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
// // // //                             />
// // // //                           ) : (
// // // //                             <div className="font-medium text-gray-900">{teacher.name}</div>
// // // //                           )}
// // // //                         </td>
// // // //                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
// // // //                           {editingTeacher === teacher.id ? (
// // // //                             <input
// // // //                               type="email"
// // // //                               name="email"
// // // //                               value={editFormData.email}
// // // //                               onChange={handleEditFormChange}
// // // //                               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
// // // //                             />
// // // //                           ) : (
// // // //                             teacher.email
// // // //                           )}
// // // //                         </td>
// // // //                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
// // // //                           {/* {teacher.department_name || "N/A"} */}
// // // //                           {editingTeacher === teacher.id ? (
// // // //                             <input
// // // //                               type="text"
// // // //                               name="departmentname"
// // // //                               value={editFormData.departmentname}
// // // //                               onChange={handleEditFormChange}
// // // //                               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
// // // //                             />
// // // //                           ) : (
// // // //                             teacher.department_name
// // // //                           )}
// // // //                         </td>
// // // //                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
// // // //                           {teacher.point}
// // // //                         </td>
// // // //                         <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
// // // //                           {editingTeacher === teacher.id ? (
// // // //                             <div className="flex space-x-2 justify-end">
// // // //                               <button
// // // //                                 onClick={() => handleSaveEdit(teacher.id)}
// // // //                                 className="text-green-600 hover:text-green-900"
// // // //                               >
// // // //                                 <Check className="w-5 h-5" />
// // // //                               </button>
// // // //                               <button
// // // //                                 onClick={handleCancelEdit}
// // // //                                 className="text-gray-600 hover:text-gray-900"
// // // //                               >
// // // //                                 <X className="w-5 h-5" />
// // // //                               </button>
// // // //                             </div>
// // // //                           ) : (
// // // //                             <div className="flex space-x-2 justify-end">
// // // //                               <button
// // // //                                 onClick={() => handleEditClick(teacher)}
// // // //                                 className="text-indigo-600 hover:text-indigo-900"
// // // //                               >
// // // //                                 <Edit className="w-5 h-5" />
// // // //                               </button>
// // // //                               <button
// // // //                                 onClick={() => handleDeleteTeacher(teacher.id)}
// // // //                                 className="text-red-600 hover:text-red-900"
// // // //                               >
// // // //                                 <Trash2 className="w-5 h-5" />
// // // //                               </button>
// // // //                             </div>
// // // //                           )}
// // // //                         </td>
// // // //                       </tr>
// // // //                     ))
// // // //                   )}
// // // //                 </tbody>
// // // //               </table>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }


// // // import { useState, useEffect } from "react";
// // // import { Trash2, Edit, X, Check, AlertCircle } from "lucide-react";
// // // import './facultylist.css';

// // // export default function TeachersList() {
// // //   const [teachers, setTeachers] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState(null);
// // //   const [editingTeacher, setEditingTeacher] = useState(null);
// // //   const [editFormData, setEditFormData] = useState({
// // //     name: "",
// // //     email: "",
// // //     departmentname: "",
// // //   });
// // //   const [notification, setNotification] = useState(null);

// // //   useEffect(() => {
// // //     const fetchTeachers = async () => {
// // //       try {
// // //         setLoading(true);
// // //         const response = await fetch("https://facultypointsportal.onrender.com/teachers");

// // //         if (!response.ok) {
// // //           throw new Error(`Error fetching teachers: ${response.status}`);
// // //         }

// // //         const data = await response.json();
// // //         setTeachers(data);
// // //         setLoading(false);
// // //       } catch (err) {
// // //         setError(err.message);
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchTeachers();
// // //   }, []);

// // //   const showNotification = (message, type = "success") => {
// // //     setNotification({ message, type });
// // //     setTimeout(() => setNotification(null), 3000);
// // //   };

// // //   const handleEditClick = (teacher) => {
// // //     setEditingTeacher(teacher.id);
// // //     setEditFormData({
// // //       name: teacher.name,
// // //       email: teacher.email,
// // //       departmentname: teacher.department_name,
// // //     });
// // //   };

// // //   const handleCancelEdit = () => {
// // //     setEditingTeacher(null);
// // //   };

// // //   const handleEditFormChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setEditFormData({
// // //       ...editFormData,
// // //       [name]: value,
// // //     });
// // //   };

// // //   const handleSaveEdit = async (teacherId) => {
// // //     try {
// // //       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
// // //         method: "PUT",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },
// // //         body: JSON.stringify(editFormData),
// // //       });

// // //       if (!response.ok) {
// // //         throw new Error("Failed to update teacher");
// // //       }

// // //       setTeachers(
// // //         teachers.map((teacher) =>
// // //           teacher.id === teacherId ? { ...teacher, ...editFormData } : teacher
// // //         )
// // //       );

// // //       setEditingTeacher(null);
// // //       showNotification("Teacher updated successfully");
// // //     } catch (err) {
// // //       showNotification(err.message, "error");
// // //     }
// // //   };

// // //   const confirmDelete = (message) => {
// // //     return window.confirm(message);
// // //   };

// // //   const handleDeleteTeacher = async (teacherId) => {
// // //     const shouldDelete = confirmDelete(
// // //       "Are you sure you want to delete this teacher? This will also remove all associated assignments and references."
// // //     );

// // //     if (!shouldDelete) return;

// // //     try {
// // //       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
// // //         method: "DELETE",
// // //       });

// // //       if (!response.ok) {
// // //         throw new Error("Failed to delete teacher");
// // //       }

// // //       setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
// // //       showNotification("Teacher deleted successfully");
// // //     } catch (err) {
// // //       showNotification(err.message, "error");
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="loading-container">
// // //         <div className="loading-spinner"></div>
// // //         <div className="loading-text">Loading teachers...</div>
// // //       </div>
// // //     );
// // //   }

// // //   if (error) {
// // //     return (
// // //       <div className="error-container">
// // //         <div className="error-content">
// // //           <AlertCircle className="error-icon" />
// // //           <div>
// // //             <h3 className="error-title">Error loading teachers</h3>
// // //             <div className="error-message">{error}</div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="teachers-container">
// // //       {notification && (
// // //         <div className={`notification ${notification.type}`}>
// // //           {notification.message}
// // //         </div>
// // //       )}

// // //       <div className="teachers-header">
// // //         <div>
// // //           <h1 className="teachers-title">Teachers</h1>
// // //           <p className="teachers-description">
// // //             A list of all teachers including their name, email, department, and points.
// // //           </p>
// // //         </div>
// // //       </div>

// // //       <div className="table-wrapper">
// // //         <div className="table-container">
// // //           <table className="teachers-table">
// // //             <thead className="table-header">
// // //               <tr>
// // //                 <th>Name</th>
// // //                 <th>Email</th>
// // //                 <th>Department</th>
// // //                 <th>Points</th>
// // //                 <th>
// // //                   <span className="sr-only">Actions</span>
// // //                 </th>
// // //               </tr>
// // //             </thead>
// // //             <tbody className="table-body">
// // //               {teachers.length === 0 ? (
// // //                 <tr>
// // //                   <td colSpan="5" className="empty-state">
// // //                     <div className="empty-state-text">No teachers found</div>
// // //                   </td>
// // //                 </tr>
// // //               ) : (
// // //                 teachers.map((teacher) => (
// // //                   <tr key={teacher.id} className="table-row">
// // //                     <td className="table-cell">
// // //                       {editingTeacher === teacher.id ? (
// // //                         <input
// // //                           type="text"
// // //                           name="name"
// // //                           value={editFormData.name}
// // //                           onChange={handleEditFormChange}
// // //                           className="edit-input"
// // //                         />
// // //                       ) : (
// // //                         <div className="teacher-name">{teacher.name}</div>
// // //                       )}
// // //                     </td>
// // //                     <td className="table-cell">
// // //                       {editingTeacher === teacher.id ? (
// // //                         <input
// // //                           type="email"
// // //                           name="email"
// // //                           value={editFormData.email}
// // //                           onChange={handleEditFormChange}
// // //                           className="edit-input"
// // //                         />
// // //                       ) : (
// // //                         <div className="teacher-email">{teacher.email}</div>
// // //                       )}
// // //                     </td>
// // //                     <td className="table-cell">
// // //                       {editingTeacher === teacher.id ? (
// // //                         <input
// // //                           type="text"
// // //                           name="departmentname"
// // //                           value={editFormData.departmentname}
// // //                           onChange={handleEditFormChange}
// // //                           className="edit-input"
// // //                         />
// // //                       ) : (
// // //                         <div className="teacher-department">
// // //                           {teacher.department_name || "N/A"}
// // //                         </div>
// // //                       )}
// // //                     </td>
// // //                     <td className="table-cell">
// // //                       <div className="teacher-points">{teacher.point}</div>
// // //                     </td>
// // //                     <td className="table-cell">
// // //                       {editingTeacher === teacher.id ? (
// // //                         <div className="actions-container">
// // //                           <button
// // //                             onClick={() => handleSaveEdit(teacher.id)}
// // //                             className="action-button save-button"
// // //                             title="Save changes"
// // //                           >
// // //                             <Check className="w-5 h-5" />
// // //                           </button>
// // //                           <button
// // //                             onClick={handleCancelEdit}
// // //                             className="action-button cancel-button"
// // //                             title="Cancel editing"
// // //                           >
// // //                             <X className="w-5 h-5" />
// // //                           </button>
// // //                         </div>
// // //                       ) : (
// // //                         <div className="actions-container">
// // //                           <button
// // //                             onClick={() => handleEditClick(teacher)}
// // //                             className="action-button edit-button"
// // //                             title="Edit teacher"
// // //                           >
// // //                             <Edit className="w-5 h-5" />
// // //                           </button>
// // //                           <button
// // //                             onClick={() => handleDeleteTeacher(teacher.id)}
// // //                             className="action-button delete-button"
// // //                             title="Delete teacher"
// // //                           >
// // //                             <Trash2 className="w-5 h-5" />
// // //                           </button>
// // //                         </div>
// // //                       )}
// // //                     </td>
// // //                   </tr>
// // //                 ))
// // //               )}
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { useState, useEffect } from "react";
// // import { Trash2, Edit, X, Check, AlertCircle, Download } from "lucide-react"; // 1. Import Download icon
// // import './facultylist.css';

// // export default function TeachersList() {
// //   const [teachers, setTeachers] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [editingTeacher, setEditingTeacher] = useState(null);
// //   const [editFormData, setEditFormData] = useState({
// //     name: "",
// //     email: "",
// //     departmentname: "",
// //   });
// //   const [notification, setNotification] = useState(null);

// //   useEffect(() => {
// //     const fetchTeachers = async () => {
// //       try {
// //         setLoading(true);
// //         const response = await fetch("https://facultypointsportal.onrender.com/teachers");

// //         if (!response.ok) {
// //           throw new Error(`Error fetching teachers: ${response.status}`);
// //         }

// //         const data = await response.json();
// //         setTeachers(data);
// //         setLoading(false);
// //       } catch (err) {
// //         setError(err.message);
// //         setLoading(false);
// //       }
// //     };

// //     fetchTeachers();
// //   }, []);

// //   const showNotification = (message, type = "success") => {
// //     setNotification({ message, type });
// //     setTimeout(() => setNotification(null), 3000);
// //   };

// //   const handleEditClick = (teacher) => {
// //     setEditingTeacher(teacher.id);
// //     setEditFormData({
// //       name: teacher.name,
// //       email: teacher.email,
// //       departmentname: teacher.department_name,
// //     });
// //   };

// //   const handleCancelEdit = () => {
// //     setEditingTeacher(null);
// //   };

// //   const handleEditFormChange = (e) => {
// //     const { name, value } = e.target;
// //     setEditFormData({
// //       ...editFormData,
// //       [name]: value,
// //     });
// //   };

// //   const handleSaveEdit = async (teacherId) => {
// //     try {
// //       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
// //         method: "PUT",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(editFormData),
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to update teacher");
// //       }
      
// //       // To correctly update the teacher's data, especially the department name,
// //       // we need to create a new object that maps the form data back to the teacher object structure.
// //       const updatedTeacherData = {
// //           ...teachers.find(t => t.id === teacherId), // get existing data
// //           name: editFormData.name,
// //           email: editFormData.email,
// //           department_name: editFormData.departmentname // map form field to object field
// //       };

// //       setTeachers(
// //         teachers.map((teacher) =>
// //           teacher.id === teacherId ? updatedTeacherData : teacher
// //         )
// //       );

// //       setEditingTeacher(null);
// //       showNotification("Teacher updated successfully");
// //     } catch (err) {
// //       showNotification(err.message, "error");
// //     }
// //   };

// //   const confirmDelete = (message) => {
// //     return window.confirm(message);
// //   };

// //   const handleDeleteTeacher = async (teacherId) => {
// //     const shouldDelete = confirmDelete(
// //       "Are you sure you want to delete this teacher? This will also remove all associated assignments and references."
// //     );

// //     if (!shouldDelete) return;

// //     try {
// //       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
// //         method: "DELETE",
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to delete teacher");
// //       }

// //       setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
// //       showNotification("Teacher deleted successfully");
// //     } catch (err) {
// //       showNotification(err.message, "error");
// //     }
// //   };

// //   // 2. New function to handle downloading the CSV report
// //   const handleDownloadReport = async (teacherId, teacherName) => {
// //       showNotification("Generating report...", "info");
// //       try {
// //           const response = await fetch(`https://facultypointsportal.onrender.com/reports/teacher/${teacherId}`);

// //           if (!response.ok) {
// //               throw new Error(`Failed to download report: ${response.statusText}`);
// //           }

// //           const blob = await response.blob(); // Get the response data as a Blob
// //           const url = window.URL.createObjectURL(blob); // Create a temporary URL for the blob
          
// //           const a = document.createElement('a'); // Create a temporary link element
// //           a.style.display = 'none';
// //           a.href = url;
// //           // Sanitize the teacher's name for the filename
// //           const safeName = teacherName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
// //           a.download = `report_${safeName}.csv`; // Set the download filename
          
// //           document.body.appendChild(a);
// //           a.click(); // Programmatically click the link to trigger the download
          
// //           window.URL.revokeObjectURL(url); // Clean up the temporary URL
// //           document.body.removeChild(a); // Clean up the link element

// //           showNotification("Report downloaded successfully.", "success");

// //       } catch (err) {
// //           showNotification(err.message, "error");
// //       }
// //   };


// //   if (loading) {
// //     return (
// //       <div className="loading-container">
// //         <div className="loading-spinner"></div>
// //         <div className="loading-text">Loading teachers...</div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="error-container">
// //         <div className="error-content">
// //           <AlertCircle className="error-icon" />
// //           <div>
// //             <h3 className="error-title">Error loading teachers</h3>
// //             <div className="error-message">{error}</div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="teachers-container">
// //       {notification && (
// //         <div className={`notification ${notification.type}`}>
// //           {notification.message}
// //         </div>
// //       )}

// //       <div className="teachers-header">
// //         <div>
// //           <h1 className="teachers-title">Teachers</h1>
// //           <p className="teachers-description">
// //             A list of all teachers including their name, email, department, and points.
// //           </p>
// //         </div>
// //       </div>

// //       <div className="table-wrapper">
// //         <div className="table-container">
// //           <table className="teachers-table">
// //             <thead className="table-header">
// //               <tr>
// //                 <th>Name</th>
// //                 <th>Email</th>
// //                 <th>Department</th>
// //                 <th>Points</th>
// //                 <th>
// //                   <span className="sr-only">Actions</span>
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody className="table-body">
// //               {teachers.length === 0 ? (
// //                 <tr>
// //                   <td colSpan="5" className="empty-state">
// //                     <div className="empty-state-text">No teachers found</div>
// //                   </td>
// //                 </tr>
// //               ) : (
// //                 teachers.map((teacher) => (
// //                   <tr key={teacher.id} className="table-row">
// //                     <td className="table-cell">
// //                       {editingTeacher === teacher.id ? (
// //                         <input
// //                           type="text"
// //                           name="name"
// //                           value={editFormData.name}
// //                           onChange={handleEditFormChange}
// //                           className="edit-input"
// //                         />
// //                       ) : (
// //                         <div className="teacher-name">{teacher.name}</div>
// //                       )}
// //                     </td>
// //                     <td className="table-cell">
// //                       {editingTeacher === teacher.id ? (
// //                         <input
// //                           type="email"
// //                           name="email"
// //                           value={editFormData.email}
// //                           onChange={handleEditFormChange}
// //                           className="edit-input"
// //                         />
// //                       ) : (
// //                         <div className="teacher-email">{teacher.email}</div>
// //                       )}
// //                     </td>
// //                     <td className="table-cell">
// //                       {editingTeacher === teacher.id ? (
// //                         <input
// //                           type="text"
// //                           name="departmentname"
// //                           value={editFormData.departmentname}
// //                           onChange={handleEditFormChange}
// //                           className="edit-input"
// //                         />
// //                       ) : (
// //                         <div className="teacher-department">
// //                           {teacher.department_name || "N/A"}
// //                         </div>
// //                       )}
// //                     </td>
// //                     <td className="table-cell">
// //                       {/* Note: The teacher object has `point`, not `points` based on the original code */}
// //                       <div className="teacher-points">{teacher.point}</div>
// //                     </td>
// //                     <td className="table-cell">
// //                       {editingTeacher === teacher.id ? (
// //                         <div className="actions-container">
// //                           <button
// //                             onClick={() => handleSaveEdit(teacher.id)}
// //                             className="action-button save-button"
// //                             title="Save changes"
// //                           >
// //                             <Check className="w-5 h-5" />
// //                           </button>
// //                           <button
// //                             onClick={handleCancelEdit}
// //                             className="action-button cancel-button"
// //                             title="Cancel editing"
// //                           >
// //                             <X className="w-5 h-5" />
// //                           </button>
// //                         </div>
// //                       ) : (
// //                         <div className="actions-container">
// //                            {/* 3. Add the new download button */}
// //                            <button
// //                             onClick={() => handleDownloadReport(teacher.id, teacher.name)}
// //                             className="action-button download-button"
// //                             title="Download report"
// //                           >
// //                             <Download className="w-5 h-5" />
// //                           </button>
// //                           <button
// //                             onClick={() => handleEditClick(teacher)}
// //                             className="action-button edit-button"
// //                             title="Edit teacher"
// //                           >
// //                             <Edit className="w-5 h-5" />
// //                           </button>
// //                           <button
// //                             onClick={() => handleDeleteTeacher(teacher.id)}
// //                             className="action-button delete-button"
// //                             title="Delete teacher"
// //                           >
// //                             <Trash2 className="w-5 h-5" />
// //                           </button>
// //                         </div>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import { useState, useEffect } from "react";
// import { Trash2, Edit, X, Check, AlertCircle, Download } from "lucide-react";
// import './facultylist.css';

// export default function TeachersList() {
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editingTeacher, setEditingTeacher] = useState(null); // This will now store the _id
//   const [editFormData, setEditFormData] = useState({
//     name: "",
//     email: "",
//     departmentname: "",
//   });
//   const [notification, setNotification] = useState(null);

//   // useEffect(() => {
//   //   const fetchTeachers = async () => {
//   //     try {
//   //       setLoading(true);
//   //       const response = await fetch("https://facultypointsportal.onrender.com/teachers");

//   //       if (!response.ok) {
//   //         throw new Error(`Error fetching teachers: ${response.status}`);
//   //       }

//   //       const data = await response.json();
//   //       setTeachers(data);
//   //       setLoading(false);
//   //     } catch (err) {
//   //       setError(err.message);
//   //       setLoading(false);
//   //     }
//   //   };
//   useEffect(() => {
//     const fetchTeachers = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch("https://facultypointsportal.onrender.com/teachers");
  
//         if (!response.ok) {
//           throw new Error(`Error fetching teachers: ${response.status}`);
//         }
  
//         const data = await response.json();
  
//         // If data is null, fallback to empty array
//         setTeachers(Array.isArray(data) ? data : []);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };
  


//     fetchTeachers();
//   }, []);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   const handleEditClick = (teacher) => {
//     // Use teacher._id instead of teacher.id
//     setEditingTeacher(teacher._id);
//     setEditFormData({
//       name: teacher.name,
//       email: teacher.email,
//       departmentname: teacher.department_name,
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditingTeacher(null);
//   };

//   const handleEditFormChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData({
//       ...editFormData,
//       [name]: value,
//     });
//   };

//   const handleSaveEdit = async (teacherId) => { // teacherId is now the _id
//     try {
//       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(editFormData),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update teacher");
//       }

//       const updatedTeacherData = {
//           ...teachers.find(t => t._id === teacherId), // Find by _id
//           name: editFormData.name,
//           email: editFormData.email,
//           department_name: editFormData.departmentname
//       };

//       setTeachers(
//         teachers.map((teacher) =>
//           // Compare with _id
//           teacher._id === teacherId ? updatedTeacherData : teacher
//         )
//       );

//       setEditingTeacher(null);
//       showNotification("Teacher updated successfully");
//     } catch (err) {
//       showNotification(err.message, "error");
//     }
//   };

//   const confirmDelete = (message) => {
//     return window.confirm(message);
//   };

//   const handleDeleteTeacher = async (teacherId) => { // teacherId is now the _id
//     const shouldDelete = confirmDelete(
//       "Are you sure you want to delete this teacher? This will also remove all associated assignments and references."
//     );

//     if (!shouldDelete) return;

//     try {
//       const response = await fetch(`https://facultypointsportal.onrender.com/teacher/${teacherId}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         throw new Error("Failed to delete teacher");
//       }

//       // Filter using _id
//       setTeachers(teachers.filter((teacher) => teacher._id !== teacherId));
//       showNotification("Teacher deleted successfully");
//     } catch (err) {
//       showNotification(err.message, "error");
//     }
//   };

//   const handleDownloadReport = async (teacherId, teacherName) => { // teacherId is now the _id
//       showNotification("Generating report...", "info");
//       try {
//           const response = await fetch(`https://facultypointsportal.onrender.com/reports/teacher/${teacherId}`);

//           if (!response.ok) {
//               throw new Error(`Failed to download report: ${response.statusText}`);
//           }

//           const blob = await response.blob();
//           const url = window.URL.createObjectURL(blob);
          
//           const a = document.createElement('a');
//           a.style.display = 'none';
//           a.href = url;
//           const safeName = teacherName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
//           a.download = `report_${safeName}.csv`;
          
//           document.body.appendChild(a);
//           a.click();
          
//           window.URL.revokeObjectURL(url);
//           document.body.removeChild(a);

//           showNotification("Report downloaded successfully.", "success");

//       } catch (err) {
//           showNotification(err.message, "error");
//       }
//   };


//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <div className="loading-text">Loading teachers...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <div className="error-content">
//           <AlertCircle className="error-icon" />
//           <div>
//             <h3 className="error-title">Error loading teachers</h3>
//             <div className="error-message">{error}</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="teachers-container">
//       {notification && (
//         <div className={`notification ${notification.type}`}>
//           {notification.message}
//         </div>
//       )}

//       <div className="teachers-header">
//         <div>
//           <h1 className="teachers-title">Teachers</h1>
//           <p className="teachers-description">
//             A list of all teachers including their name, email, department, and points.
//           </p>
//         </div>
//       </div>

//       <div className="table-wrapper">
//         <div className="table-container">
//           <table className="teachers-table">
//             <thead className="table-header">
//               <tr>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Department</th>
//                 <th>Points</th>
//                 <th>
//                   <span className="sr-only">Actions</span>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="table-body">
//               {teachers.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="empty-state">
//                     <div className="empty-state-text">No teachers found</div>
//                   </td>
//                 </tr>
//               ) : (
//                 teachers.map((teacher) => (
//                   // Use _id for the key prop
//                   <tr key={teacher._id} className="table-row">
//                     <td className="table-cell">
//                       {/* Compare with _id */}
//                       {editingTeacher === teacher._id ? (
//                         <input
//                           type="text"
//                           name="name"
//                           value={editFormData.name}
//                           onChange={handleEditFormChange}
//                           className="edit-input"
//                         />
//                       ) : (
//                         <div className="teacher-name">{teacher.name}</div>
//                       )}
//                     </td>
//                     <td className="table-cell">
//                       {editingTeacher === teacher._id ? (
//                         <input
//                           type="email"
//                           name="email"
//                           value={editFormData.email}
//                           onChange={handleEditFormChange}
//                           className="edit-input"
//                         />
//                       ) : (
//                         <div className="teacher-email">{teacher.email}</div>
//                       )}
//                     </td>
//                     <td className="table-cell">
//                       {editingTeacher === teacher._id ? (
//                         <input
//                           type="text"
//                           name="departmentname"
//                           value={editFormData.departmentname}
//                           onChange={handleEditFormChange}
//                           className="edit-input"
//                         />
//                       ) : (
//                         <div className="teacher-department">
//                           {teacher.department_name || "N/A"}
//                         </div>
//                       )}
//                     </td>
//                     <td className="table-cell">
//                       <div className="teacher-points">{teacher.point}</div>
//                     </td>
//                     <td className="table-cell">
//                       {editingTeacher === teacher._id ? (
//                         <div className="actions-container">
//                           <button
//                             // Pass _id to the handler
//                             onClick={() => handleSaveEdit(teacher._id)}
//                             className="action-button save-button"
//                             title="Save changes"
//                           >
//                             <Check className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={handleCancelEdit}
//                             className="action-button cancel-button"
//                             title="Cancel editing"
//                           >
//                             <X className="w-5 h-5" />
//                           </button>
//                         </div>
//                       ) : (
//                         <div className="actions-container">
//                            <button
//                             // Pass _id to the handler
//                             onClick={() => handleDownloadReport(teacher._id, teacher.name)}
//                             className="action-button download-button"
//                             title="Download report"
//                           >
//                             <Download className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={() => handleEditClick(teacher)}
//                             className="action-button edit-button"
//                             title="Edit teacher"
//                           >
//                             <Edit className="w-5 h-5" />
//                           </button>
//                           <button
//                             // Pass _id to the handler
//                             onClick={() => handleDeleteTeacher(teacher._id)}
//                             className="action-button delete-button"
//                             title="Delete teacher"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useMemo } from "react";
import { Trash2, Edit, X, Check, AlertCircle, Download, ChevronLeft, ChevronRight, Search } from "lucide-react";
import './facultylist.css';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    departmentname: "",
  });
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage] = useState(15); // Number of teachers to display per page

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://facultypointsportal.onrender.com/teachers");

        if (!response.ok) {
          throw new Error(`Error fetching teachers: ${response.status}`);
        }

        const data = await response.json();
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

  const handleSaveEdit = async (teacherId) => {
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
          ...teachers.find(t => t._id === teacherId),
          name: editFormData.name,
          email: editFormData.email,
          department_name: editFormData.departmentname
      };

      setTeachers(
        teachers.map((teacher) =>
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

  const handleDeleteTeacher = async (teacherId) => {
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

      setTeachers(teachers.filter((teacher) => teacher._id !== teacherId));
      showNotification("Teacher deleted successfully");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDownloadReport = async (teacherId, teacherName) => {
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

  // Filtered teachers based on search term
  const filteredTeachers = useMemo(() => {
    if (!searchTerm) {
      return teachers;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        teacher.email.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [teachers, searchTerm]);

  // Pagination logic (now applies to filteredTeachers)
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);

  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page when search term changes
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
        {/* Search Bar */}
        <div className="search-bar-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
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
              {currentTeachers.length === 0 && filteredTeachers.length > 0 ? (
                 <tr>
                    <td colSpan="5" className="empty-state">
                        <div className="empty-state-text">No teachers found on this page matching your search.</div>
                    </td>
                 </tr>
              ) : filteredTeachers.length === 0 && searchTerm !== "" ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-state-text">No teachers found matching your search term.</div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-state-text">No teachers found</div>
                  </td>
                </tr>
              ) : (
                currentTeachers.map((teacher) => (
                  <tr key={teacher._id} className="table-row">
                    <td className="table-cell">
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

      {/* Pagination Controls */}
      {filteredTeachers.length > teachersPerPage && ( // Only show pagination if filtered results exceed one page
        <nav className="pagination-container">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      )}
    </div>
  );
}
