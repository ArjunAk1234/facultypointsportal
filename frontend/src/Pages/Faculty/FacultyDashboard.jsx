

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const TeacherDashboard = () => {
//   const [currentEvents, setCurrentEvents] = useState([]);
//   const [pastEvents, setPastEvents] = useState([]);
//   const [futureEvents, setFutureEvents] = useState([]);
//   const [teacherAssignments, setTeacherAssignments] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Get teacher ID from local storage
//         const user = JSON.parse(localStorage.getItem("user"));
//         const teacherId = user?.userid;  
//         // const teacherId = localStorage.getItem('teacherId');
//         if (!teacherId) {
//           setError('Teacher ID not found in local storage. Please login again.');
//           setLoading(false);
//           return;
//         }

//         // Fetch all required data
//         const [currentRes, pastRes, futureRes, assignmentsRes] = await Promise.all([
//           axios.get('http://localhost:8080/events/current'),
//           axios.get('http://localhost:8080/events/past'),
//           axios.get('http://localhost:8080/events/upcoming'),
//           axios.get(`http://localhost:8080/teacher-assignments/${teacherId}`)
//         ]);

//         setCurrentEvents(currentRes.data);
//         setPastEvents(pastRes.data);
//         setFutureEvents(futureRes.data);
//         setTeacherAssignments(assignmentsRes.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('Failed to fetch data. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//   };

//   const getTeacherRoleForEvent = (eventId) => {
//     const assignment = teacherAssignments.find(a => a.event_id === eventId);
//     return assignment ? assignment.rolename : null;
//   };

//   const renderEventList = (events, title) => (
//     <div className="mb-8">
//       <h2 className="text-2xl font-bold mb-4">{title}</h2>
//       {events.length === 0 ? (
//         <p className="text-gray-500">No {title.toLowerCase()} found.</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {events.map((event) => {
//             const isAssigned = teacherAssignments.some(a => a.event_id === event.event_id);
//             const cardClass = isAssigned 
//               ? "p-4 border rounded bg-blue-50 shadow hover:shadow-md cursor-pointer"
//               : "p-4 border rounded bg-white shadow hover:shadow-md cursor-pointer";

//             return (
//               <div 
//                 key={event.id || event.event_id} 
//                 className={cardClass}
//                 onClick={() => handleEventClick(event)}
//               >
//                 <h3 className="text-lg font-semibold">{event.name}</h3>
//                 <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
//                 <div className="text-xs text-gray-500 mt-2">
//                   <p>Starts: {event.start_date} {event.start_time}</p>
//                   <p>Ends: {event.end_date} {event.end_time}</p>
//                 </div>
//                 {isAssigned && (
//                   <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
//                     Assigned
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      
//       {selectedEvent ? (
//         <div className="mb-8">
//           <button 
//             className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
//             onClick={() => setSelectedEvent(null)}
//           >
//             <span className="mr-1">←</span> Back to Events
//           </button>
          
//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-2xl font-bold mb-2">{selectedEvent.name}</h2>
//             <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//               <div>
//                 <h3 className="font-semibold text-gray-700">Event Duration</h3>
//                 <p>From: {selectedEvent.start_date} {selectedEvent.start_time || ''}</p>
//                 <p>To: {selectedEvent.end_date} {selectedEvent.end_time || ''}</p>
//               </div>
              
//               {getTeacherRoleForEvent(selectedEvent.event_id || selectedEvent.id) && (
//                 <div className="bg-blue-50 p-4 rounded">
//                   <h3 className="font-semibold text-blue-700">Your Assignment</h3>
//                   <p className="text-blue-700">
//                     Role: {getTeacherRoleForEvent(selectedEvent.event_id || selectedEvent.id)}
//                   </p>
//                 </div>
//               )}
//             </div>
            
//             {selectedEvent.roles && selectedEvent.roles.length > 0 && (
//               <div>
//                 <h3 className="font-semibold text-gray-700 mb-2">Event Roles</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {selectedEvent.roles.map(role => (
//                     <span key={role.id} className="bg-gray-100 px-2 py-1 rounded text-sm">
//                       {role.name}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             {selectedEvent.assginedteachers && selectedEvent.assginedteachers.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="font-semibold text-gray-700 mb-2">Assigned Teachers</h3>
//                 <table className="min-w-full bg-white">
//                   <thead>
//                     <tr>
//                       <th className="text-left py-2 px-4 border-b">Teacher</th>
//                       <th className="text-left py-2 px-4 border-b">Role</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedEvent.assginedteachers.map(teacher => (
//                       <tr key={teacher.AssignmentID}>
//                         <td className="py-2 px-4 border-b">{teacher.teachername}</td>
//                         <td className="py-2 px-4 border-b">{teacher.rolename}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <>
//           {renderEventList(currentEvents, "Current Events")}
//           {renderEventList(futureEvents, "Upcoming Events")}
//           {renderEventList(pastEvents, "Past Events")}
//         </>
//       )}
//     </div>
//   );
// };

// export default TeacherDashboard;
import React, { useEffect, useState } from 'react';

const TeacherDashboard = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Get teacher ID from local storage
  //       const user = JSON.parse(localStorage.getItem("user"));
  //       const teacherId = user?.userid;
        
  //       if (!teacherId) {
  //         setError('Teacher ID not found in local storage. Please login again.');
  //         setLoading(false);
  //         return;
  //       }

  //       setCurrentTeacherId(teacherId);

  //       // Mock API calls - replace with actual axios calls
  //       const mockCurrentEvents = [
  //         {
  //           "id": "6827126d758f20f7be2b9bcb",
  //           "event_id": "6827126d758f20f7be2b9bcb",
  //           "name": "TechFest 2025",
  //           "start_date": "2025-05-16",
  //           "start_time": "10:00",
  //           "end_date": "2025-05-18",
  //           "end_time": "20:00",
  //           "description": "Annual technology festival featuring workshops, competitions, and exhibitions",
  //           "roles": [
  //             {
  //               "id": "68272cb3b423076e07515408",
  //               "name": "food"
  //             }
  //           ],
  //           "assginedteachers": [
  //             {
  //               "id": "68272feab423076e07515409",
  //               "rolename": "food",
  //               "teachername": "John Doe2",
  //               "AssignmentID": "682792227cac069a5f7d7dee"
  //             }
  //           ]
  //         }
  //       ];

  //       const mockTeacherAssignments = [
  //         {
  //           "id": "682792227cac069a5f7d7dee",
  //           "assignmentid": "000000000000000000000000",
  //           "event_id": "6827126d758f20f7be2b9bcb",
  //           "eventname": "TechFest 2025",
  //           "teacher_id": "6826ff18f144a2f42bfc3f05",
  //           "role_id": "68272feab423076e07515409",
  //           "rolename": "food",
  //           "teachername": "John Doe2",
  //           "teacheremail": "john@example.com"
  //         }
  //       ];

  //       // Replace these with actual API calls:
  //       /*
  //       const [currentRes, pastRes, futureRes, assignmentsRes] = await Promise.all([
  //         axios.get('http://localhost:8080/events/current'),
  //         axios.get('http://localhost:8080/events/past'),
  //         axios.get('http://localhost:8080/events/upcoming'),
  //         axios.get(`http://localhost:8080/teacher-assignments/${teacherId}`)
  //       ]);
  //       */

  //       setCurrentEvents(mockCurrentEvents);
  //       setPastEvents([]);
  //       setFutureEvents([]);
  //       setTeacherAssignments(mockTeacherAssignments);
  //       setLoading(false);
  //     } catch (err) {
  //       console.error('Error fetching data:', err);
  //       setError('Failed to fetch data. Please try again later.');
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get teacher ID from local storage
        const user = JSON.parse(localStorage.getItem("user"));
        const teacherId = user?.userid;
        
        if (!teacherId) {
          setError('Teacher ID not found in local storage. Please login again.');
          setLoading(false);
          return;
        }

        setCurrentTeacherId(teacherId);

        // Actual API calls
        const [currentRes, pastRes, futureRes, assignmentsRes] = await Promise.all([
          fetch('http://localhost:8080/events/current').then(res => res.json()),
          fetch('http://localhost:8080/events/past').then(res => res.json()),
          fetch('http://localhost:8080/events/upcoming').then(res => res.json()),
          fetch(`http://localhost:8080/teacher-assignments/${teacherId}`).then(res => res.json())
        ]);

        setCurrentEvents(currentRes);
        setPastEvents(pastRes);
        setFutureEvents(futureRes);
        setTeacherAssignments(assignmentsRes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const getTeacherRoleForEvent = (eventId) => {
    const assignment = teacherAssignments.find(a => a.event_id === eventId);
    return assignment ? assignment.rolename : null;
  };

  const getTeacherAssignmentsForEvent = (eventId) => {
    return teacherAssignments.filter(assignment => assignment.event_id === eventId);
  };

  const renderEventList = (events, title, titleColor = "text-gray-800") => (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <div className={`w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4`}></div>
        <h2 className={`text-3xl font-bold ${titleColor}`}>{title}</h2>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8a3 3 0 106 0v-3H8v3zM4 6h16v12a4 4 0 01-4 4H8a4 4 0 01-4-4V6z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No {title.toLowerCase()} found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isAssigned = teacherAssignments.some(a => a.event_id === event.event_id);
            
            return (
              <div 
                key={event.id || event.event_id} 
                className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                  isAssigned 
                    ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200" 
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleEventClick(event)}
              >
                {isAssigned && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[50px] border-b-[50px] border-l-transparent border-b-green-500">
                    <div className="absolute -top-6 -right-1 text-white text-xs font-bold transform rotate-45">
                      ✓
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-2 pr-2">{event.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8a3 3 0 106 0v-3H8v3zM4 6h16v12a4 4 0 01-4 4H8a4 4 0 01-4-4V6z" />
                      </svg>
                      <span>{event.start_date} {event.start_time}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{event.end_date} {event.end_time}</span>
                    </div>
                  </div>
                  
                  {isAssigned && (
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Assigned
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
        <div className="max-w-md w-full bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedEvent ? (
          <div className="mb-8">
            <button 
              className="mb-6 group flex items-center px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => setSelectedEvent(null)}
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium text-gray-700">Back to Events</span>
            </button>
            
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.name}</h2>
                <p className="text-blue-100 text-lg opacity-90">{selectedEvent.description}</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8a3 3 0 106 0v-3H8v3zM4 6h16v12a4 4 0 01-4 4H8a4 4 0 01-4-4V6z" />
                      </svg>
                      Event Duration
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-16">From:</span>
                        <span className="font-medium text-gray-800">{selectedEvent.start_date} {selectedEvent.start_time || ''}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-16">To:</span>
                        <span className="font-medium text-gray-800">{selectedEvent.end_date} {selectedEvent.end_time || ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  {getTeacherRoleForEvent(selectedEvent.event_id || selectedEvent.id) && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                      <h3 className="font-bold text-green-800 text-lg mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Your Assignment
                      </h3>
                      <p className="text-green-700 font-medium text-lg">
                        Role: {getTeacherRoleForEvent(selectedEvent.event_id || selectedEvent.id)}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedEvent.roles && selectedEvent.roles.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Available Roles
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedEvent.roles.map(role => (
                        <span key={role.id} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Show only current teacher's assignments for this event */}
                {getTeacherAssignmentsForEvent(selectedEvent.event_id || selectedEvent.id).length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Your Assignments
                    </h3>
                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getTeacherAssignmentsForEvent(selectedEvent.event_id || selectedEvent.id).map(assignment => (
                              <tr key={assignment.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                        {assignment.teachername.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{assignment.teachername}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                    {assignment.rolename}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {assignment.teacheremail}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Teacher Dashboard
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Manage your event assignments and stay updated with all school activities
              </p>
            </div>

            {renderEventList(currentEvents, "Current Events", "text-green-700")}
            {renderEventList(futureEvents, "Upcoming Events", "text-blue-700")}
            {renderEventList(pastEvents, "Past Events", "text-gray-600")}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;