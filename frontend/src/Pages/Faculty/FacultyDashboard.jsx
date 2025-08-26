import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- CONFIGURATION ---
// Replace this with the actual base URL of your Go backend API
const API_BASE_URL = 'https://facultypointsportal.onrender.com';


// --- HELPER COMPONENTS ---

/**
 * A reusable pagination component for navigating through pages.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null; // Don't render pagination if there's only one page
    }

    return (
        <div className="mt-auto flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
                onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Previous
            </button>
            <span className="text-base text-gray-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Next
            </button>
        </div>
    );
};

/**
 * A modal component to display detailed information about a selected event.
 */
const EventDetailModal = ({ event, assignments, currentTeacherId, onClose }) => {
    if (!event) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 animate-scale-in">
                <header className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-5 flex justify-between items-center z-10 rounded-t-2xl">
                    <h2 className="text-3xl font-bold text-white">{event.name}</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-4xl font-light">&times;</button>
                </header>
                <main className="p-8 overflow-y-auto">
                    <p className="text-gray-700 mb-8 text-lg">{event.description}</p>
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                        <h3 className="font-bold text-gray-800 text-xl mb-3">Event Duration</h3>
                        <p className="text-base text-gray-600">From: {event.start_date} at {event.start_time}</p>
                        <p className="text-base text-gray-600">To: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{event.end_date} at {event.end_time}</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-800 text-2xl mb-5">All Assigned Faculty</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assignments.length > 0 ? assignments.map(a => (
                                        <tr key={a.assignment_id} className={a.teacher_id === currentTeacherId ? 'bg-blue-100' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 text-base">{a.teachername}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-base">{a.rolename}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="2" className="text-center py-8 text-gray-500 text-base">No faculty assigned to this event yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

/**
 * A reusable table component for displaying lists of events.
 */
const EventTable = ({ events, onEventClick }) => (
    <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
                <tr>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {events.length > 0 ? events.map(event => (
                    <tr key={event.event_id} onClick={() => onEventClick(event)} className="hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                        <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-gray-900">{event.name}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-base text-gray-600">{event.start_date}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-base text-gray-600">{event.end_date}</td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="3" className="text-center py-12 text-gray-500 text-base">No events in this category.</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);


/**
 * The main analytical dashboard component.
 */
const FacultyDashboard = () => {
    // State for data fetched from the API
    const [teachers, setTeachers] = useState([]);
    const [events, setEvents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    
    // State for UI management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('current');
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    // State for logged-in user
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    const [userName, setUserName] = useState('');

    // --- PAGINATION STATES ---
    const [leaderboardPage, setLeaderboardPage] = useState(1);
    const [eventsPage, setEventsPage] = useState(1);
    const [dutyRosterPage, setDutyRosterPage] = useState(1);
    const LEADERBOARD_ITEMS_PER_PAGE = 10;
    const EVENTS_ITEMS_PER_PAGE = 10;
    const ROSTER_ITEMS_PER_PAGE = 15;

    // Notification states
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState({ total_count: 0, unread_count: 0 });
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [showUnreadOnly, setShowUnreadOnly] = useState(true); // Default to 'All'

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                const teacherId = user?.userid; 
                const name = user?.name;

                if (!teacherId) {
                    setError('Your session has expired. Please login again.');
                    setLoading(false);
                    return;
                }
                setCurrentTeacherId(teacherId);
                setUserName(name);

                const [teachersRes, eventsRes, assignmentsRes, dashboardRes, notificationsCountRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/teachers`),
                    axios.get(`${API_BASE_URL}/events`),
                    axios.get(`${API_BASE_URL}/assignments`),
                    axios.get(`${API_BASE_URL}/dashboard/faculty`),
                    axios.get(`${API_BASE_URL}/teachers/${teacherId}/notifications/count`)
                ]);

                setTeachers(teachersRes.data || []);
                setEvents(eventsRes.data || []);
                setAssignments(assignmentsRes.data || []);
                setLeaderboard(dashboardRes.data.leaderboard || []);
                setNotificationCount(notificationsCountRes.data || { total_count: 0, unread_count: 0 });

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load data from the server. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // --- Notification Handlers ---
    const fetchNotifications = async (showAll) => {
        if (!currentTeacherId) return;
        setNotificationLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/teachers/${currentTeacherId}/notifications?show_read=${showAll}`);
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setNotifications([]);
        } finally {
            setNotificationLoading(false);
        }
    };

    const handleNotificationClick = () => {
        const willShow = !showNotifications;
        setShowNotifications(willShow);
        if (willShow) {
            fetchNotifications(showUnreadOnly);
        }
    };
    
    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`);
            setNotifications(notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
            setNotificationCount(prev => ({ ...prev, unread_count: Math.max(0, prev.unread_count - 1) }));
        } catch (err) { console.error("Failed to mark notification as read", err); }
    };
    
    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);
            const deletedNotif = notifications.find(n => n.id === notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            setNotificationCount(prev => ({
                total_count: prev.total_count - 1,
                unread_count: deletedNotif && !deletedNotif.is_read ? prev.unread_count - 1 : prev.unread_count,
            }));
        } catch(err) { console.error("Failed to delete notification", err); }
    };

    const handleFilterChange = (showAll) => {
        setShowUnreadOnly(showAll);
        fetchNotifications(showAll);
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    // --- Memoized Data Processing ---
    const dutyRosterData = useMemo(() => {
        if (teachers.length === 0) return [];
        const assignmentsMap = assignments.reduce((acc, assignment) => {
            if (!acc[assignment.teacher_id]) acc[assignment.teacher_id] = {};
            acc[assignment.teacher_id][assignment.event_id] = {
                roleName: assignment.rolename,
                points: assignment.points_awarded ?? assignment.point ?? 0
            };
            return acc;
        }, {});
        return teachers.map(teacher => ({
            teacherName: teacher.name,
            totalPoints: teacher.point,
            assignmentsByEvent: events.reduce((acc, event) => {
                acc[event.event_id] = assignmentsMap[teacher._id]?.[event.event_id] || null;
                return acc;
            }, {})
        }));
    }, [teachers, events, assignments]);
    
    const categorizedEvents = useMemo(() => {
        const now = new Date();
        const cats = { current: [], upcoming: [], past: [] };
        events.forEach(event => {
            const startDate = new Date(`${event.start_date}T${event.start_time || '00:00'}:00`);
            const endDate = new Date(`${event.end_date}T${event.end_time || '23:59'}:00`);
            if (now >= startDate && now <= endDate) cats.current.push(event);
            else if (now < startDate) cats.upcoming.push(event);
            else cats.past.push(event);
        });
        return cats;
    }, [events]);

    const assignmentsForSelectedEvent = useMemo(() => {
        if (!selectedEvent) return [];
        return assignments.filter(a => a.event_id === selectedEvent.event_id);
    }, [selectedEvent, assignments]);
    
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setEventsPage(1); 
    };

    // --- UI Render Logic ---
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-5 text-xl text-gray-700 font-semibold">Loading Dashboard...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
            <div className="text-center bg-white p-12 rounded-lg shadow-xl border border-red-200">
                <h2 className="text-3xl font-bold text-red-700">An Error Occurred</h2>
                <p className="mt-3 text-lg text-gray-600">{error}</p>
            </div>
        </div>
    );

    // --- PAGINATION DATA SLICING ---
    const totalLeaderboardPages = Math.ceil(leaderboard.length / LEADERBOARD_ITEMS_PER_PAGE);
    const paginatedLeaderboard = leaderboard.slice(
        (leaderboardPage - 1) * LEADERBOARD_ITEMS_PER_PAGE,
        leaderboardPage * LEADERBOARD_ITEMS_PER_PAGE
    );

    const activeEventList = categorizedEvents[activeTab];
    const totalEventPages = Math.ceil(activeEventList.length / EVENTS_ITEMS_PER_PAGE);
    const paginatedEvents = activeEventList.slice(
        (eventsPage - 1) * EVENTS_ITEMS_PER_PAGE,
        eventsPage * EVENTS_ITEMS_PER_PAGE
    );

    const totalDutyRosterPages = Math.ceil(dutyRosterData.length / ROSTER_ITEMS_PER_PAGE);
    const paginatedDutyRosterData = dutyRosterData.slice(
        (dutyRosterPage - 1) * ROSTER_ITEMS_PER_PAGE,
        dutyRosterPage * ROSTER_ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Notification Bell & Dropdown */}
            <div className="fixed top-6 right-6 z-50">
                <button onClick={handleNotificationClick} className="relative bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition">
                    <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 00-5-5.9V5a2 2 0 10-4 0v.1A6 6 0 004 11v3.2c0 .5-.2 1-.6 1.4L2 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {notificationCount.unread_count > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center animate-pulse">
                            {notificationCount.unread_count}
                        </span>
                    )}
                </button>
                {showNotifications && (
                     <div className="absolute top-16 right-0 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
                             <div className="flex space-x-2 mt-2">
                                <button onClick={() => handleFilterChange(true)} className={`px-4 py-1 text-base rounded-full transition-colors ${showUnreadOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>All</button>
                                <button onClick={() => handleFilterChange(false)} className={`px-4 py-1 text-base rounded-full transition-colors ${!showUnreadOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Unread</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                           {notificationLoading ? <p className="p-6 text-center text-gray-500">Loading...</p> : notifications.length === 0 ? <p className="p-6 text-center text-gray-500">No notifications found.</p> : notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50' : ''}`}>
                                    <h4 className="font-semibold text-gray-900 text-lg">{n.title}</h4>
                                    <p className="text-base text-gray-600">{n.message}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-gray-400">{formatDate(n.created_at)}</span>
                                        <div className="flex items-center space-x-4">
                                            {!n.is_read && <button onClick={() => markAsRead(n.id)} className="text-sm font-semibold text-blue-600 hover:underline">Mark read</button>}
                                            <button onClick={() => deleteNotification(n.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                                        </div>
                                    </div>
                                </div>
                           ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-screen-2xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800">Faculty Analytical Dashboard</h1>
                    <p className="mt-3 text-xl text-gray-500">Welcome, <span className="font-semibold">{userName}</span>! Here is the comprehensive overview.</p>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                    <div className="bg-white rounded-2xl shadow-lg flex flex-col">
                        <div className="p-7 flex-1">
                            <h2 className="text-3xl font-bold text-gray-800 mb-5">Leaderboard</h2>
                            <ul className="space-y-4">
                                {paginatedLeaderboard.map((teacher, index) => (
                                    <li key={teacher.teacher_id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center">
                                            <span className={`text-xl font-bold w-10 text-center ${index < 3 ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {(leaderboardPage - 1) * LEADERBOARD_ITEMS_PER_PAGE + index + 1}
                                            </span>
                                            <span className="ml-5 font-medium text-gray-800 text-lg">{teacher.teacher_name}</span>
                                        </div>
                                        <span className="font-bold text-xl text-green-600">{teacher.points} pts</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Pagination currentPage={leaderboardPage} totalPages={totalLeaderboardPages} onPageChange={setLeaderboardPage} />
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg flex flex-col">
                        <div className="p-7 flex-1">
                            <h2 className="text-3xl font-bold text-gray-800 mb-5">Events Overview</h2>
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button onClick={() => handleTabClick('current')} className={`${activeTab === 'current' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-lg`}>Current ({categorizedEvents.current.length})</button>
                                    <button onClick={() => handleTabClick('upcoming')} className={`${activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-lg`}>Upcoming ({categorizedEvents.upcoming.length})</button>
                                    <button onClick={() => handleTabClick('past')} className={`${activeTab === 'past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-lg`}>Past ({categorizedEvents.past.length})</button>
                                </nav>
                            </div>
                            <div className="mt-5">
                                <EventTable events={paginatedEvents} onEventClick={setSelectedEvent} />
                            </div>
                        </div>
                        <Pagination currentPage={eventsPage} totalPages={totalEventPages} onPageChange={setEventsPage} />
                    </div>
                </section>
                
                <section className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
                    <div className="p-7 border-b border-gray-200">
                        <h2 className="text-3xl font-bold text-gray-800">Faculty Duty & Points Matrix</h2>
                        <p className="text-base text-gray-500 mt-2">Scroll horizontally to view all events.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="sticky left-0 bg-gray-100 px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider z-10" style={{minWidth: '220px'}}>Faculty Name</th>
                                    <th className="sticky left-[220px] bg-gray-100 px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider z-10">Total Points</th>
                                    {events.map(event => (
                                        <th key={event.event_id} className="px-6 py-4 text-center text-sm font-bold text-gray-600 uppercase tracking-wider" style={{minWidth: '185px'}}>{event.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedDutyRosterData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="sticky left-0 bg-white hover:bg-gray-50 px-6 py-5 whitespace-nowrap font-medium text-gray-800 text-base z-10">{row.teacherName}</td>
                                        <td className="sticky left-[220px] bg-white hover:bg-gray-50 px-6 py-5 whitespace-nowrap font-bold text-gray-800 text-base z-10">{row.totalPoints}</td>
                                        {events.map(event => {
                                            const assignment = row.assignmentsByEvent[event.event_id];
                                            return (
                                                <td key={event.event_id} className="px-6 py-5 whitespace-nowrap text-center">
                                                    {assignment ? (
                                                        <div>
                                                            <p className="text-base font-semibold text-blue-700">{assignment.roleName}</p>
                                                            <p className="text-sm font-medium text-green-700">{assignment.points} pts</p>
                                                        </div>
                                                    ) : <span className="text-gray-400 text-base">-</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <Pagination currentPage={dutyRosterPage} totalPages={totalDutyRosterPages} onPageChange={setDutyRosterPage} />
                </section>
            </div>

            <EventDetailModal
                event={selectedEvent}
                assignments={assignmentsForSelectedEvent}
                currentTeacherId={currentTeacherId}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
};

export default FacultyDashboard;
