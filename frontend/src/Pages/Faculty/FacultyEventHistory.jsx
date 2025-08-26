import React, { useEffect, useState, useMemo } from 'react';

const TeacherDashboard = () => {
  // State for raw data from the API
  const [allEvents, setAllEvents] = useState([]); // <-- MODIFIED: Holds all events
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  // State for UI interaction
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allAssignmentsForSelectedEvent, setAllAssignmentsForSelectedEvent] = useState([]);
  const [myRolesForSelectedEvent, setMyRolesForSelectedEvent] = useState([]);
  
  // General UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [userName, setUserName] = useState('');

  // Notification states (no changes)
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState({ total_count: 0, unread_count: 0 });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const teacherId = user?.userid;
        const name = user?.name;

        if (!teacherId) {
          setError('Teacher ID not found in local storage. Please login again.');
          setLoading(false);
          return;
        }

        setCurrentTeacherId(teacherId);
        setUserName(name);

        // --- MODIFIED: Fetch all events, not just from the dashboard endpoint ---
        const [eventsRes, assignmentsRes] = await Promise.all([
          fetch('https://facultypointsportal.onrender.com/events').then(res => res.json()), // Fetch all events
          fetch(`https://facultypointsportal.onrender.com/teacher-assignments/${teacherId}`).then(res => res.json())
        ]);

        setAllEvents(eventsRes || []); // Store all events
        setTeacherAssignments(assignmentsRes || []);

        await fetchNotificationCount(teacherId);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- NEW: Memoized hook to categorize all events into upcoming, current, and past ---
  const categorizedEvents = useMemo(() => {
    const categories = {
      upcoming: [],
      current: [],
      past: [],
    };
    const now = new Date();

    allEvents.forEach(event => {
      const startDate = new Date(`${event.start_date}T${event.start_time || '00:00:00'}`);
      const endDate = new Date(`${event.end_date}T${event.end_time || '23:59:59'}`);

      if (now < startDate) {
        categories.upcoming.push(event);
      } else if (now >= startDate && now <= endDate) {
        categories.current.push(event);
      } else {
        categories.past.push(event);
      }
    });
    
    // Sort for better UX
    categories.upcoming.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    categories.current.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    categories.past.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

    return categories;
  }, [allEvents]);

  // --- NEW: Memoized hook to get a list of the user's assigned events that are active ---
  const assignedActiveEvents = useMemo(() => {
    const activeEvents = [...categorizedEvents.current, ...categorizedEvents.upcoming];
    return activeEvents.filter(event => 
      teacherAssignments.some(a => a.event_id === event.event_id)
    );
  }, [categorizedEvents, teacherAssignments]);


  // All notification functions remain unchanged.
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
        notif.id === notificationId ? { ...notif, is_read: true } : notif
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
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
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
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setAllAssignmentsForSelectedEvent([]);
    setMyRolesForSelectedEvent([]);

    try {
      const [allAssignmentsResponse, myRolesResponse] = await Promise.all([
        fetch(`https://facultypointsportal.onrender.com/events/assigned-teachers/${event.event_id}`),
        fetch(`https://facultypointsportal.onrender.com/teacher/${currentTeacherId}/event/${event.event_id}/roles`)
      ]);
      
      if (!allAssignmentsResponse.ok || !myRolesResponse.ok) {
        throw new Error('Failed to fetch event details');
      }

      const allAssignmentsData = await allAssignmentsResponse.json();
      const myRolesData = await myRolesResponse.json();

      setAllAssignmentsForSelectedEvent(allAssignmentsData || []);
      setMyRolesForSelectedEvent(myRolesData || []);

    } catch (err) {
      console.error('Error fetching assigned teachers or roles:', err);
    }
  };
  
  const renderEventList = (events, title, titleColor = "text-gray-800") => (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <div className={`w-1 h-8 bg-gradient-to-b from-${titleColor.split('-')[1]}-500 to-${titleColor.split('-')[1]}-600 rounded-full mr-4`}></div>
        <h2 className={`text-3xl font-bold ${titleColor}`}>{title}</h2>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No events found in this category.</p>
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

  if (loading) { /* ... Loading UI remains the same ... */ }
  if (error) { /* ... Error UI remains the same ... */ }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Notification UI remains exactly the same */}
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Faculty Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome, <span className="font-semibold">{userName}</span>! Here's an overview of your events.
          </p>
        </div>

        {selectedEvent ? (
          <div className="mb-8">
            <button 
              className="mb-6 group flex items-center px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl shadow-sm"
              onClick={() => setSelectedEvent(null)}
            >
              &larr; Back to Dashboard
            </button>
            
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.name}</h2>
                <p className="text-blue-100 text-lg opacity-90">{selectedEvent.description}</p>
              </div>
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="font-bold text-gray-800 text-xl mb-4">Your Assigned Roles & Duties</h3>
                  {myRolesForSelectedEvent.length > 0 ? (
                    <div className="space-y-4">
                      {myRolesForSelectedEvent.map(role => (
                        <div key={role.role_id} className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                          <h4 className="font-bold text-blue-800 text-lg">{role.role_name}</h4>
                          <p className="text-sm text-gray-700 mt-2">{role.role_description}</p>
                          <p className="text-sm font-bold text-green-600 mt-3">{role.role_point} Points</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No roles assigned</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 text-xl mb-4">All Faculty in This Event</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden border">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allAssignmentsForSelectedEvent.map(assignment => {
                            const isCurrentUser = assignment.teacher_id === currentTeacherId;
                            return (
                              <tr key={assignment.assignment_id} className={isCurrentUser ? 'bg-blue-100' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{assignment.teachername}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{assignment.rolename}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- MODIFIED: Main view now shows all categorized events ---
          <>
          
            {renderEventList(assignedActiveEvents, "My Active Assignments", "text-blue-700")}
            {renderEventList(categorizedEvents.current, "All Current Events", "text-green-700")}
            {renderEventList(categorizedEvents.upcoming, "All Upcoming Events", "text-purple-700")}
            
            {renderEventList(categorizedEvents.past, "Past Events", "text-gray-600")}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
