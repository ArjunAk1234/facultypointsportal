
// import React, { useEffect, useState } from 'react';

// const TeacherDashboard = () => {
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [currentEvents, setCurrentEvents] = useState([]);
//   const [teacherAssignments, setTeacherAssignments] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [allAssignmentsForSelectedEvent, setAllAssignmentsForSelectedEvent] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentTeacherId, setCurrentTeacherId] = useState(null);
//   const [userName, setUserName] = useState('');

//   // Leaderboard Pagination State
//   const [leaderboardPage, setLeaderboardPage] = useState(1);
//   const itemsPerPage = 10;


//   // Notification states
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notificationCount, setNotificationCount] = useState({ total_count: 0, unread_count: 0 });
//   const [notificationLoading, setNotificationLoading] = useState(false);
//   const [showUnreadOnly, setShowUnreadOnly] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const teacherId = user?.userid; 
//         const name = user?.name;

//         if (!teacherId) {
//           setError('Teacher ID not found in local storage. Please login again.');
//           setLoading(false);
//           return;
//         }

//         setCurrentTeacherId(teacherId);
//         setUserName(name);

//         const [dashboardRes, assignmentsRes] = await Promise.all([
//           fetch('https://facultypointsportal.onrender.com/dashboard/faculty').then(res => res.json()),
//           fetch(`https://facultypointsportal.onrender.com/teacher-assignments/${teacherId}`).then(res => res.json())
//         ]);

//         setLeaderboard(dashboardRes.leaderboard || []);
//         setCurrentEvents(dashboardRes.current_events || []);
//         setTeacherAssignments(assignmentsRes || []);

//         await fetchNotificationCount(teacherId);

//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('Failed to fetch data. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const fetchNotificationCount = async (teacherId) => {
//     try {
//       const response = await fetch(`https://facultypointsportal.onrender.com/teachers/${teacherId}/notifications/count`);
//       const data = await response.json();
//       setNotificationCount(data);
//     } catch (err)     { console.error('Error fetching notification count:', err);
//     }
//   };

//   const fetchNotifications = async (showAll = true) => {
//     if (!currentTeacherId) return;

//     setNotificationLoading(true);
//     try {
//       const response = await fetch(
//         `https://facultypointsportal.onrender.com/teachers/${currentTeacherId}/notifications?show_read=${showAll}`
//       );
//       const data = await response.json();
//       setNotifications(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching notifications:', err);
//       setNotifications([]);
//     }
//     setNotificationLoading(false);
//   };

//   const markAsRead = async (notificationId) => {
//     try {
//       await fetch(`https://facultypointsportal.onrender.com/notifications/${notificationId}/read`, {
//         method: 'PUT'
//       });

//       setNotifications(notifications.map(notif =>
//         notif.id === notificationId 
//           ? { ...notif, is_read: true }
//           : notif
//       ));

//       await fetchNotificationCount(currentTeacherId);
//     } catch (err) {
//       console.error('Error marking notification as read:', err);
//     }
//   };

//   const deleteNotification = async (notificationId) => {
//     try {
//       await fetch(`https://facultypointsportal.onrender.com/notifications/${notificationId}`, {
//         method: 'DELETE'
//       });

//       setNotifications(notifications.filter(notif => notif.id !== notificationId)); 
//       await fetchNotificationCount(currentTeacherId);
//     } catch (err) {
//       console.error('Error deleting notification:', err);
//     }
//   };

//   const markAllAsRead = async () => {
//     if (!currentTeacherId) return;

//     try {
//       await fetch(`https://facultypointsportal.onrender.com/teachers/${currentTeacherId}/notifications/read-all`, {
//         method: 'PUT'
//       });

//       setNotifications(notifications.map(notif => ({
//         ...notif,
//         is_read: true,
//       })));
      
//       await fetchNotificationCount(currentTeacherId);

//     } catch (err) {
//       console.error('Error marking all notifications as read:', err);
//     }
//   };

//   const handleNotificationClick = async () => {
//     const willShow = !showNotifications;
//     setShowNotifications(willShow);
//     if (willShow) {
//       await fetchNotifications(!showUnreadOnly);
//     }
//   };
  
//   const handleFilterChange = async (unreadOnly) => {
//     setShowUnreadOnly(unreadOnly);
//     await fetchNotifications(!unreadOnly); 
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = (now - date) / (1000 * 60 * 60);

//     if (diffInHours < 1) {
//       return 'Just now';
//     } else if (diffInHours < 24) {
//       return `${Math.floor(diffInHours)}h ago`;
//     } else if (diffInHours < 48) {
//       return 'Yesterday';
//     } else {
//       return date.toLocaleDateString();
//     }
//   };

//   const handleEventClick = async (event) => {
//     setSelectedEvent(event);
//     try {
//       const response = await fetch(`https://facultypointsportal.onrender.com/events/assigned-teachers/${event.event_id}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch assigned teachers');
//       }
//       const data = await response.json();
//       setAllAssignmentsForSelectedEvent(data || []);
//     } catch (err) {
//       console.error('Error fetching assigned teachers:', err);
//     }
//   };

//   const getTeacherAssignmentsForEvent = (eventId) => {
//     return teacherAssignments.filter(assignment => assignment.event_id === eventId);
//   };

//   // =================================================================
//   // S T A R T   O F   F I X
//   // =================================================================
//   const renderLeaderboard = () => {
//     const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
//     const paginatedLeaderboard = leaderboard.slice(
//       (leaderboardPage - 1) * itemsPerPage,
//       leaderboardPage * itemsPerPage
//     );
  
//     return (
//       <div className="mb-12">
//         <div className="flex items-center mb-6">
//           <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-4"></div>
//           <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
//         </div>
//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <ul className="space-y-4">
//             {paginatedLeaderboard.map((teacher, index) => (
//               <li key={teacher.user_id || index} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-50">
//                 <div className="flex items-center">
//                   <span className={`text-lg font-bold w-8 text-center ${index < 3 && leaderboardPage === 1 ? 'text-orange-500' : 'text-gray-500'}`}>
//                     {(leaderboardPage - 1) * itemsPerPage + index + 1}
//                   </span>
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm ml-4">
//                     {/* THE FIX IS HERE: Check if teacher.name is a valid string before calling charAt */}
//                     {(teacher.name && typeof teacher.name === 'string') ? teacher.name.charAt(0).toUpperCase() : '?'}
//                   </div>
//                   <span className="ml-4 font-medium text-gray-700">{teacher.teacher_name || 'Unknown User'}</span>
//                 </div>
//                 <span className="font-bold text-lg text-green-600">{teacher.points || 0} pts</span>
//               </li>
//             ))}
//           </ul>
//           {totalPages > 1 && (
//             <div className="mt-6 flex justify-between items-center">
//               <button
//                 onClick={() => setLeaderboardPage(prev => Math.max(prev - 1, 1))}
//                 disabled={leaderboardPage === 1}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Previous
//               </button>
//               <span className="text-sm text-gray-600">
//                 Page {leaderboardPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => setLeaderboardPage(prev => Math.min(prev + 1, totalPages))}
//                 disabled={leaderboardPage === totalPages}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };
//   // =================================================================
//   // E N D   O F   F I X
//   // =================================================================
  
//   const renderEventList = (events, title, titleColor = "text-gray-800") => (
//     <div className="mb-12">
//       <div className="flex items-center mb-6">
//         <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
//         <h2 className={`text-3xl font-bold ${titleColor}`}>{title}</h2>
//       </div>
//       {events.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
//           <p className="text-gray-500 text-lg">No {title.toLowerCase()} found.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {events.map((event) => {
//             const isAssigned = teacherAssignments.some(a => a.event_id === event.event_id);
            
//             return (
//               <div 
//                 key={event.event_id}
//                 className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
//                   isAssigned 
//                     ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200" 
//                     : "bg-white border border-gray-200 hover:border-gray-300"
//                 }`}
//                 onClick={() => handleEventClick(event)}
//               >
//                 <div className="p-6">
//                   <h3 className="text-xl font-bold text-gray-800 line-clamp-2 pr-2 mb-3">{event.name}</h3>
//                   <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{event.description}</p>
                  
//                   <div className="space-y-2 text-sm">
//                     <div className="flex items-center text-gray-500">
//                       <span>Starts: {event.start_date} {event.start_time}</span>
//                     </div>
//                     <div className="flex items-center text-gray-500">
//                       <span>Ends: {event.end_date} {event.end_time}</span>
//                     </div>
//                   </div>
                  
//                   {isAssigned && (
//                     <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       Assigned to you
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center p-4">
//         <p className="text-red-700 font-medium">{error}</p>
//       </div>
//     );
//   }

//   const assignedCurrentEvents = currentEvents.filter(event => 
//     teacherAssignments.some(a => a.event_id === event.event_id)
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//        <div className="fixed top-6 right-6 z-50">
//         <div className="relative">
//           <button
//             onClick={handleNotificationClick}
//             className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200"
//           >
//             <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
//             {notificationCount.unread_count > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
//                 {notificationCount.unread_count > 99 ? '99+' : notificationCount.unread_count}
//               </span>
//             )}
//           </button>
//         </div>

//         {showNotifications && (
//           <div className="absolute top-16 right-0 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden flex flex-col">
//             <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
//                <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">Notifications</h3>
//                 <button onClick={() => setShowNotifications(false)} className="hover:text-gray-200">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//                 </button>
//               </div>
//               <div className="flex items-center justify-between mt-2 text-sm">
//                 <span>{notificationCount.unread_count} unread of {notificationCount.total_count} total</span>
//                 {notificationCount.unread_count > 0 && (
//                   <button onClick={markAllAsRead} className="hover:text-white underline">
//                     Mark all read
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="p-3 bg-gray-50 border-b border-gray-200">
//                 <div className="flex space-x-2">
//                     <button onClick={() => handleFilterChange(true)} className={`px-3 py-1 text-sm rounded-full transition-colors ${!showUnreadOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>All</button>
//                     <button onClick={() => handleFilterChange(false)} className={`px-3 py-1 text-sm rounded-full transition-colors ${showUnreadOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Unread</button>
//                 </div>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//               {notificationLoading ? (
//                 <div className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>
//               ) : notifications.length === 0 ? (
//                 <div className="p-6 text-center text-gray-500"><p>No notifications found</p></div>
//               ) : (
//                 notifications.map((notification) => (
//                   <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''}`}>
//                       <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
//                       <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
//                       <div className="flex items-center justify-between">
//                           <span className="text-xs text-gray-400">{formatDate(notification.created_at)}</span>
//                           <div className="flex space-x-2">
//                               {!notification.is_read && <button onClick={() => markAsRead(notification.id)} className="text-xs text-blue-600 hover:text-blue-800">Mark read</button>}
//                               <button onClick={() => deleteNotification(notification.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
//                           </div>
//                       </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {selectedEvent ? (
//           <div className="mb-8">
//             <button 
//               className="mb-6 group flex items-center px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
//               onClick={() => setSelectedEvent(null)}
//             >
//               Back to Events
//             </button>
            
//             <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
//                 <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.name}</h2>
//                 <p className="text-blue-100 text-lg opacity-90">{selectedEvent.description}</p>
//               </div>
//               <div className="p-8">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <h3 className="font-bold text-gray-800 text-lg mb-4">Event Duration</h3>
//                     <p>From: {selectedEvent.start_date} {selectedEvent.start_time}</p>
//                     <p>To: {selectedEvent.end_date} {selectedEvent.end_time}</p>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="font-bold text-gray-800 text-lg mb-4">All Assigned Faculty</h3>
//                   <div className="bg-gray-50 rounded-xl overflow-hidden">
//                      <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-100">
//                           <tr>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {allAssignmentsForSelectedEvent.map(assignment => (
//                             <tr key={assignment.assignment_id}>
//                               <td className="px-6 py-4 whitespace-nowrap">{assignment.teachername}</td>
//                               <td className="px-6 py-4 whitespace-nowrap">{assignment.rolename}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                   </div>
//                 </div>
                
//                 {getTeacherAssignmentsForEvent(selectedEvent.event_id).length > 0 && (
//                   <div className="mt-8">
//                     <h3 className="font-bold text-gray-800 text-lg mb-4">Your Assignments</h3>
//                     <div className="bg-gray-50 rounded-xl overflow-hidden">
//                        <table className="min-w-full divide-y divide-gray-200">
//                           <thead className="bg-gray-100">
//                             <tr>
//                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
//                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
//                             </tr>
//                           </thead>
//                           <tbody className="bg-white divide-y divide-gray-200">
//                             {getTeacherAssignmentsForEvent(selectedEvent.event_id).map(assignment => (
//                               <tr key={assignment.assignment_id}>
//                                 <td className="px-6 py-4 whitespace-nowrap">{assignment.rolename}</td>
//                                 <td className="px-6 py-4 whitespace-nowrap">{assignment.eventname}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="text-center mb-12">
//               <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
//                 Faculty Dashboard
//               </h1>
//               <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//                 Welcome, {userName}! Here's an overview of points and events.
//               </p>
//             </div>
//             {renderLeaderboard()}
//             {renderEventList(assignedCurrentEvents, "My Assigned Events", "text-blue-700")}
//             {renderEventList(currentEvents, "All Current Events", "text-green-700")}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TeacherDashboard;

import React, { useEffect, useState } from 'react';

const TeacherDashboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allAssignmentsForSelectedEvent, setAllAssignmentsForSelectedEvent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [userName, setUserName] = useState('');

  // Leaderboard Pagination State
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const itemsPerPage = 10;


  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState({ total_count: 0, unread_count: 0 });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        // Corrected: use user_id as per the Go struct
        const teacherId = user?.userid; 
        const name = user?.name;

        if (!teacherId) {
          setError('Teacher ID not found in local storage. Please login again.');
          setLoading(false);
          return;
        }

        setCurrentTeacherId(teacherId);
        setUserName(name);

        const [dashboardRes, assignmentsRes] = await Promise.all([
          fetch('https://facultypointsportal.onrender.com/dashboard/faculty').then(res => res.json()),
          fetch(`https://facultypointsportal.onrender.com/teacher-assignments/${teacherId}`).then(res => res.json())
        ]);

        setLeaderboard(dashboardRes.leaderboard || []);
        setCurrentEvents(dashboardRes.current_events || []);
        setTeacherAssignments(assignmentsRes || []);

        await fetchNotificationCount(teacherId);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchNotificationCount = async (teacherId) => {
    try {
      const response = await fetch(`https://facultypointsportal.onrender.com/teachers/${teacherId}/notifications/count`);
      const data = await response.json();
      setNotificationCount(data);
    } catch (err)     { console.error('Error fetching notification count:', err);
    }
  };

  const fetchNotifications = async (showAll = true) => {
    if (!currentTeacherId) return;

    setNotificationLoading(true);
    try {
      const response = await fetch(
        `https://facultypointsportal.onrender.com/teachers/${currentTeacherId}/notifications?show_read=${showAll}`
      );
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    }
    setNotificationLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`https://facultypointsportal.onrender.com/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      setNotifications(notifications.map(notif =>
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      ));

      await fetchNotificationCount(currentTeacherId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`https://facultypointsportal.onrender.com/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      setNotifications(notifications.filter(notif => notif.id !== notificationId)); 
      await fetchNotificationCount(currentTeacherId);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentTeacherId) return;

    try {
      await fetch(`https://facultypointsportal.onrender.com/teachers/${currentTeacherId}/notifications/read-all`, {
        method: 'PUT'
      });

      setNotifications(notifications.map(notif => ({
        ...notif,
        is_read: true,
      })));
      
      await fetchNotificationCount(currentTeacherId);

    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = async () => {
    const willShow = !showNotifications;
    setShowNotifications(willShow);
    if (willShow) {
      await fetchNotifications(!showUnreadOnly);
    }
  };
  
  const handleFilterChange = async (unreadOnly) => {
    setShowUnreadOnly(unreadOnly);
    await fetchNotifications(!unreadOnly); 
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    try {
      const response = await fetch(`https://facultypointsportal.onrender.com/events/assigned-teachers/${event.event_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assigned teachers');
      }
      const data = await response.json();
      setAllAssignmentsForSelectedEvent(data || []);
    } catch (err) {
      console.error('Error fetching assigned teachers:', err);
    }
  };

  const getTeacherAssignmentsForEvent = (eventId) => {
    return teacherAssignments.filter(assignment => assignment.event_id === eventId);
  };

  const renderLeaderboard = () => {
    const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
    const paginatedLeaderboard = leaderboard.slice(
      (leaderboardPage - 1) * itemsPerPage,
      leaderboardPage * itemsPerPage
    );
  
    return (
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-4"></div>
          <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <ul className="space-y-4">
            {paginatedLeaderboard.map((teacher, index) => {
              // Check if the current teacher is the logged-in user
              const isCurrentUser = teacher.user_id === currentTeacherId;
              return (
                <li 
                  key={teacher.user_id || index} 
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    isCurrentUser 
                      ? 'bg-blue-100 border-l-4 border-blue-500 scale-105' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`text-lg font-bold w-8 text-center ${index < 3 && leaderboardPage === 1 ? 'text-orange-500' : 'text-gray-500'}`}>
                      {(leaderboardPage - 1) * itemsPerPage + index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm ml-4">
                      {(teacher.name && typeof teacher.name === 'string') ? teacher.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="ml-4 font-medium text-gray-700">{teacher.teacher_name || 'Unknown User'}</span>
                  </div>
                  <span className="font-bold text-lg text-green-600">{teacher.points || 0} pts</span>
                </li>
              );
            })}
          </ul>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setLeaderboardPage(prev => Math.max(prev - 1, 1))}
                disabled={leaderboardPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {leaderboardPage} of {totalPages}
              </span>
              <button
                onClick={() => setLeaderboardPage(prev => Math.min(prev + 1, totalPages))}
                disabled={leaderboardPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderEventList = (events, title, titleColor = "text-gray-800") => (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
        <h2 className={`text-3xl font-bold ${titleColor}`}>{title}</h2>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No {title.toLowerCase()} found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isAssigned = teacherAssignments.some(a => a.event_id === event.event_id);
            
            return (
              <div 
                key={event.event_id}
                className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                  isAssigned 
                    ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200" 
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleEventClick(event)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-2 pr-2 mb-3">{event.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <span>Starts: {event.start_date} {event.start_time}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <span>Ends: {event.end_date} {event.end_time}</span>
                    </div>
                  </div>
                  
                  {isAssigned && (
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Assigned to you
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center p-4">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  const assignedCurrentEvents = currentEvents.filter(event => 
    teacherAssignments.some(a => a.event_id === event.event_id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
       <div className="fixed top-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {notificationCount.unread_count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {notificationCount.unread_count > 99 ? '99+' : notificationCount.unread_count}
              </span>
            )}
          </button>
        </div>

        {showNotifications && (
          <div className="absolute top-16 right-0 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
               <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="hover:text-gray-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span>{notificationCount.unread_count} unread of {notificationCount.total_count} total</span>
                {notificationCount.unread_count > 0 && (
                  <button onClick={markAllAsRead} className="hover:text-white underline">
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex space-x-2">
                    <button onClick={() => handleFilterChange(true)} className={`px-3 py-1 text-sm rounded-full transition-colors ${!showUnreadOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>All</button>
                    <button onClick={() => handleFilterChange(false)} className={`px-3 py-1 text-sm rounded-full transition-colors ${showUnreadOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Unread</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notificationLoading ? (
                <div className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500"><p>No notifications found</p></div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{formatDate(notification.created_at)}</span>
                          <div className="flex space-x-2">
                              {!notification.is_read && <button onClick={() => markAsRead(notification.id)} className="text-xs text-blue-600 hover:text-blue-800">Mark read</button>}
                              <button onClick={() => deleteNotification(notification.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                          </div>
                      </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Persistent Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Faculty Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome, <span className="font-semibold">{userName}</span>! Here's an overview of points and events.
          </p>
        </div>

        {selectedEvent ? (
          <div className="mb-8">
            <button 
              className="mb-6 group flex items-center px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => setSelectedEvent(null)}
            >
              Back to Dashboard
            </button>
            
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.name}</h2>
                <p className="text-blue-100 text-lg opacity-90">{selectedEvent.description}</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Event Duration</h3>
                    <p>From: {selectedEvent.start_date} {selectedEvent.start_time}</p>
                    <p>To: {selectedEvent.end_date} {selectedEvent.end_time}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-4">All Assigned Faculty</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allAssignmentsForSelectedEvent.map(assignment => {
                            // Check if the assignment belongs to the current user
                            const isCurrentUser = assignment.teacher_id === currentTeacherId;
                            return (
                              <tr 
                                key={assignment.assignment_id} 
                                className={isCurrentUser ? 'bg-blue-100' : ''}
                              >
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{assignment.teachername}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{assignment.rolename}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                  </div>
                </div>
                
                {getTeacherAssignmentsForEvent(selectedEvent.event_id).length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Your Assignments</h3>
                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                       <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getTeacherAssignmentsForEvent(selectedEvent.event_id).map(assignment => (
                              <tr key={assignment.assignment_id}>
                                <td className="px-6 py-4 whitespace-nowrap">{assignment.rolename}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{assignment.eventname}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {renderLeaderboard()}
            {renderEventList(assignedCurrentEvents, "My Assigned Events", "text-blue-700")}
            {renderEventList(currentEvents, "All Current Events", "text-green-700")}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
