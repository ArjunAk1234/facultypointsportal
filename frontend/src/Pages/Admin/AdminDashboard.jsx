

// // export default AdminDashboard;
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./AdminDashboard.css"; // Assuming you have this CSS file for styling
// // NEW: Import the xlsx library to generate the Excel template
// import * as XLSX from "xlsx";

// const AdminDashboard = () => {
//   const [events, setEvents] = useState([]);
//   const [activeTab, setActiveTab] = useState("current");
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     start_date: "",
//     end_date: "",
//     start_time: "",
//     end_time: "",
//   });

//   // State for report generation
//   const [reportStartDate, setReportStartDate] = useState("");
//   const [reportEndDate, setReportEndDate] = useState("");

//   // NEW: State for the Excel file upload
//   const [excelFile, setExcelFile] = useState(null);

//   useEffect(() => {
//     fetchEvents(activeTab);
//   }, [activeTab]);

//   const fetchEvents = (tab) => {
//     setLoading(true);
//     const endpoint = `https://facultypointsportal.onrender.com/events/${tab}`;
//     axios
//       .get(endpoint)
//       .then((res) => setEvents(res.data || []))
//       .catch((err) => {
//         console.error(`Error fetching ${tab} events:`, err);
//         setEvents([]);
//       })
//       .finally(() => setLoading(false));
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // const handleFormSubmit = (e) => {
//   //   e.preventDefault();
//   //   axios
//   //     .post("https://facultypointsportal.onrender.com/events", formData)
//   //     .then(() => {
//   //       setFormData({ name: "", description: "", start_date: "", end_date: "", start_time: "", end_time: "" });
//   //       setShowCreateForm(false);
//   //       fetchEvents(activeTab);
//   //       alert("Event created successfully!");
//   //     })
//   //     .catch((error) => {
//   //       console.error("Error creating event:", error);
//   //       alert(error.response?.data?.error || "Failed to create event. Please try again.");
//   //     });
//   // };
//   const handleFormSubmit = (e) => {
//     e.preventDefault();
  
//     // Ensure start_time and end_time have default values
//     const updatedFormData = {
//       ...formData,
//       start_time: formData.start_time || "00:00",
//       end_time: formData.end_time || "00:00",
//     };
  
//     axios
//       .post("https://facultypointsportal.onrender.com/events", updatedFormData)
//       .then(() => {
//         setFormData({
//           name: "",
//           description: "",
//           start_date: "",
//           end_date: "",
//           start_time: "",
//           end_time: "",
//         });
//         setShowCreateForm(false);
//         fetchEvents(activeTab);
//         alert("Event created successfully!");
//       })
//       .catch((error) => {
//         console.error("Error creating event:", error);
//         alert(error.response?.data?.error || "Failed to create event. Please try again.");
//       });
//   };
  
//   // NEW: Handler for selecting the Excel file
//   const handleFileChange = (e) => {
//     setExcelFile(e.target.files[0]);
//   };

//   const handleDeleteEvent = async (eventId, eventName) => {
//     const confirmDelete = window.confirm(
//       `Are you sure you want to delete the event "${eventName}"?\n\nDo you also want to deduct points from teachers?`
//     );
  
//     if (!confirmDelete) return;
  
//     // Ask about point deduction
//     const deductPoints = window.confirm("Deduct points from teachers assigned to this event?");
  
//     try {
//       await axios.delete("https://facultypointsportal.onrender.com/event", {
//         data: { event_id: eventId, deduct_points: deductPoints }
//       });
//       alert(`Event "${eventName}" deleted successfully.`);
//       fetchEvents(activeTab);
     
//     } catch (error) {
//       console.error("Error deleting event:", error);
//       alert(error.response?.data?.error || "Failed to delete event.");
//     }
//   };
  

//   // NEW: Handler for submitting the Excel file to the backend
//   const handleExcelSubmit = (e) => {
//     e.preventDefault();
//     if (!excelFile) {
//       alert("Please select an Excel file to upload.");
//       return;
//     }

//     const uploadData = new FormData();
//     // The key 'excel_file' must match what the backend Go function expects
//     uploadData.append("excel_file", excelFile);

//     axios
//       .post("https://facultypointsportal.onrender.com/events/create-from-excel", uploadData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       .then((res) => {
//         alert("Event and roles processed successfully from Excel file!");
//         console.log("Server Response:", res.data); // Log the detailed server response
//         setExcelFile(null); // Clear the file input
//         document.getElementById("excel-file-input").value = ""; // Reset the input field
//         fetchEvents(activeTab); // Refresh the events list
//       })
//       .catch((error) => {
//         console.error("Error uploading Excel file:", error);
//         alert(error.response?.data?.error || "Failed to process Excel file. Please check the format and try again.");
//       });
//   };

//   // NEW: Function to generate and download the sample Excel template
//   const handleDownloadTemplate = () => {
//     // Data for the 'EventDetails' sheet
//     const eventDetailsData = [
//       ["Event Name", "Annual Faculty Conference 2025"],
//       ["Start Date", "2025-11-15"],
//       ["End Date", "2025-11-16"],
//       ["Description", "A two-day conference for all faculty members."],
//     ];

//     // Data for the 'Roles' sheet
//     const rolesData = [
//       ["Role Name", "Description", "Head Count", "Points", "Assigned Teacher Name", "Assigned Teacher Department"],
//       ["Event Coordinator", "Oversees the entire event logistics.", 100, "Dr. Evelyn Reed", "Administration"],
//       ["Session Moderator", "Manages Q&A for the morning session.", 50, "Prof. Samuel Chen", "Computer Science"],
//       ["Workshop Facilitator", "Leads the workshop on AI.",75, "", ""],
//       ["Registration Desk", "Manages attendee check-in.", 20, "", ""],
//       ["Technical Support", "Handles AV and technical issues.", 30, "Mr. David Lee", "IT Services"],
//     ];

//     // Create worksheets
//     const eventDetailsSheet = XLSX.utils.aoa_to_sheet(eventDetailsData);
//     const rolesSheet = XLSX.utils.aoa_to_sheet(rolesData);

//     // Create a new workbook
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, eventDetailsSheet, "EventDetails");
//     eventDetailsSheet["B2"].t = "s"; // Start Date
//     eventDetailsSheet["B4"].t = "s"; // End Date
//     XLSX.utils.book_append_sheet(wb, rolesSheet, "Roles");

//     // Trigger the download
//     XLSX.writeFile(wb, "Event_Creation_Template.xlsx");
//   };

//   const handleDownload = (url, filename) => {
//     axios
//       .get(url, { responseType: "blob" })
//       .then((response) => {
//         const blob = new Blob([response.data], { type: "text/csv" });
//         const link = document.createElement("a");
//         link.href = window.URL.createObjectURL(blob);
//         link.download = filename;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       })
//       .catch((error) => {
//         console.error("Error downloading file:", error);
//         alert("Failed to download report. The report may be empty or an error occurred.");
//       });
//   };

//   const handleDateRangeReport = () => {
//     if (!reportStartDate || !reportEndDate) {
//       alert("Please select both a start and end date for the report.");
//       return;
//     }
//     const url = `https://facultypointsportal.onrender.com/reports/daterange?start_date=${reportStartDate}&end_date=${reportEndDate}`;
//     handleDownload(url, `report_${reportStartDate}_to_${reportEndDate}.csv`);
//   };

//   const handleEventReport = (eventId, eventName) => {
//     if (!eventId) return;
//     const url = `https://facultypointsportal.onrender.com/reports/event/${eventId}`;
//     handleDownload(url, `event_report_${eventName.replace(/\s+/g, "_")}.csv`);
//   };

//   return (
//     <div className="admin-dashboard">
//       <div className="dashboard-container">
//         <h2 className="dashboard-title">Admin Dashboard</h2>

//         {/* --- Create Event Section --- */}
//         <div className="creation-section">
//           {/* Manual Creation */}
//           <button className="btn btn-primary mb-6" onClick={() => setShowCreateForm(!showCreateForm)}>
//             {showCreateForm ? "Cancel Manual Creation" : "Create Program Manually"}
//           </button>
          
//           {/* NEW: Excel Creation Form */}
//           <div className="excel-upload-form">
//             <h3 className="form-title">Create Program from Excel</h3>
//             <p>Upload a formatted Excel file to create an event and assign roles automatically.</p>
//             <form onSubmit={handleExcelSubmit} className="form-group-inline">
//               <input 
//                 id="excel-file-input"
//                 type="file" 
//                 onChange={handleFileChange} 
//                 className="form-input" 
//                 accept=".xlsx, .xls" 
//               />
//               <button type="submit" className="btn btn-success">Upload & Create</button>
//             </form>
//             <button onClick={handleDownloadTemplate} className="btn-link">
//               Download Sample Template
//             </button>
//           </div>
//         </div>

//         {showCreateForm && (
//           <div className="create-form">
//             <h3 className="form-title">Create New Program Manually</h3>
//             <form onSubmit={handleFormSubmit}>
//               {/* ... form fields for manual creation remain the same ... */}
//                <div className="form-group">
//                 <label className="form-label">Name</label>
//                 <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Description</label>
//                 <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-textarea" rows="3" />
//               </div>
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label className="form-label">Start Date</label>
//                   <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="form-input" required />
//                 </div>
              
//                 <div className="form-group">
//                   <label className="form-label">End Date</label>
//                   <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="form-input" required />
//                 </div>
                
//               </div>
//               <div className="form-actions">
//                 <button type="submit" className="btn btn-success">Create Event</button>
//                 <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* --- Reports Section --- */}
//         <div className="reports-section">
//           {/* ... reports section remains the same ... */}
//           <h3 className="section-title">Generate Reports</h3>
//           <div className="report-generator">
//             <h4>Report by Date Range</h4>
//             <div className="form-group-inline">
//               <input type="date" className="form-input" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} />
//               <span>to</span>
//               <input type="date" className="form-input" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} />
//               <button className="btn btn-info" onClick={handleDateRangeReport}>Download Date Range Report</button>
//             </div>
//           </div>
//         </div>
        
//         {/* --- Events List Section --- */}
//         <div className="tabs">
//             {/* ... tabs remain the same ... */}
//             <button className={activeTab === 'current' ? 'active' : ''} onClick={() => setActiveTab('current')}>Current</button>
//             <button className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
//             <button className={activeTab === 'past' ? 'active' : ''} onClick={() => setActiveTab('past')}>Past</button>
//         </div>

//         <div>
//             {/* ... events list remains the same ... */}
//             <h1 className="section-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Programs</h1>
//           {loading ? <div className="loading">Loading...</div> : events.length === 0 ? (
//             <div className="empty-state">
//               <div className="empty-state-text">No {activeTab} programs found.</div>
//             </div>
//           ) : (
//             <div className="events-list">
//               {events.map((event) => (
//                 <div key={event.event_id} className="event-card fade-in">
//                   <div className="event-card-main" onClick={() => navigate(`/admin/event/${event.event_id}`)}>
//                     <h2 className="event-title">{event.name}</h2>
//                     <p className="event-description">{event.description}</p>
//                     <div className="event-footer">
//                       <span className="event-dates">
//                         {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                    <div className="event-card-actions">
//                       <button className="btn btn-outline-secondary" onClick={() => handleEventReport(event.event_id, event.name)}>
//                         Event Report
//                       </button>
//                       <button
//                         className="btn-icon btn-delete"
//                         onClick={() => handleDeleteEvent(event.event_id, event.name)}
//                         title="Delete Event"
//                       >
//                       Delete
//                       </button>
//                    </div>

//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css"; // Assuming you have this CSS file for styling
import * as XLSX from "xlsx";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
  });

  // State for report generation
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");

  // NEW: State for the Excel file upload
  const [excelFile, setExcelFile] = useState(null);

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const fetchEvents = (tab) => {
    setLoading(true);
    const endpoint = `https://facultypointsportal.onrender.com/events/${tab}`;
    axios
      .get(endpoint)
      .then((res) => setEvents(res.data || []))
      .catch((err) => {
        console.error(`Error fetching ${tab} events:`, err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Ensure start_time and end_time have default values
    const updatedFormData = {
      ...formData,
      start_time: formData.start_time || "00:00",
      end_time: formData.end_time || "00:00",
    };

    axios
      .post("https://facultypointsportal.onrender.com/events", updatedFormData)
      .then(() => {
        setFormData({
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          start_time: "",
          end_time: "",
        });
        setShowCreateForm(false);
        fetchEvents(activeTab);
        alert("Event created successfully!");
      })
      .catch((error) => {
        console.error("Error creating event:", error);
        alert(error.response?.data?.error || "Failed to create event. Please try again.");
      });
  };

  // NEW: Handler for selecting the Excel file
  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the event "${eventName}"?\n\nDo you also want to deduct points from teachers?`
    );

    if (!confirmDelete) return;

    // Ask about point deduction
    const deductPoints = window.confirm("Deduct points from teachers assigned to this event?");

    try {
      await axios.delete("https://facultypointsportal.onrender.com/event", {
        data: { event_id: eventId, deduct_points: deductPoints }
      });
      alert(`Event "${eventName}" deleted successfully.`);
      fetchEvents(activeTab);

    } catch (error) {
      console.error("Error deleting event:", error);
      alert(error.response?.data?.error || "Failed to delete event.");
    }
  };


  // NEW: Handler for submitting the Excel file to the backend
  const handleExcelSubmit = (e) => {
    e.preventDefault();
    if (!excelFile) {
      alert("Please select an Excel file to upload.");
      return;
    }

    const uploadData = new FormData();
    // The key 'excel_file' must match what the backend Go function expects
    uploadData.append("excel_file", excelFile);

    axios
      .post("https://facultypointsportal.onrender.com/events/create-from-excel", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        alert("Event and roles processed successfully from Excel file!");
        console.log("Server Response:", res.data); // Log the detailed server response
        setExcelFile(null); // Clear the file input
        document.getElementById("excel-file-input").value = ""; // Reset the input field
        fetchEvents(activeTab); // Refresh the events list
      })
      .catch((error) => {
        console.error("Error uploading Excel file:", error);
        alert(error.response?.data?.error || "Failed to process Excel file. Please check the format and try again.");
      });
  };

  // NEW: Function to generate and download the sample Excel template
  const handleDownloadTemplate = async () => { // Make this function async
    // Data for the 'EventDetails' sheet
    const eventDetailsData = [
      ["Event Name", "Annual Faculty Conference 2025"],
      ["Start Date", "2025-11-15"],
      ["End Date", "2025-11-16"],
      ["Description", "A two-day conference for all faculty members."],
    ];

    // Data for the 'Roles' sheet
    const rolesData = [
      ["Role Name", "Description", "Head Count", "Points", "Assigned Teacher Name", "Assigned Teacher Department"],
      ["Event Coordinator", "Oversees the entire event logistics.", 1, 100, "Dr. Evelyn Reed", "Administration"],
      ["Session Moderator", "Manages Q&A for the morning session.", 1, 50, "Prof. Samuel Chen", "Computer Science"],
      ["Workshop Facilitator", "Leads the workshop on AI.", 1, 75, "", ""],
      ["Registration Desk", "Manages attendee check-in.", 1, 20, "", ""],
      ["Technical Support", "Handles AV and technical issues.", 1, 30, "Mr. David Lee", "IT Services"],
    ];

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add 'EventDetails' sheet
    const eventDetailsSheet = XLSX.utils.aoa_to_sheet(eventDetailsData);
    XLSX.utils.book_append_sheet(wb, eventDetailsSheet, "EventDetails");
    // Set cell types to string for dates to ensure proper display in Excel
    eventDetailsSheet["B2"].t = "s"; // Start Date
    eventDetailsSheet["B3"].t = "s"; // End Date


    // Add 'Roles' sheet
    const rolesSheet = XLSX.utils.aoa_to_sheet(rolesData);
    XLSX.utils.book_append_sheet(wb, rolesSheet, "Roles");

    // NEW: Fetch and add Teachers sheet
    try {
      const teachersResponse = await axios.get("https://facultypointsportal.onrender.com/teachers");
      const teachers = teachersResponse.data;

      if (teachers && teachers.length > 0) {
        const teacherSheetData = [["Teacher Name", "Email"]]; // Header row
        teachers.forEach(teacher => {
          teacherSheetData.push([teacher.name, teacher.email]);
        });
        const teacherSheet = XLSX.utils.aoa_to_sheet(teacherSheetData);
        XLSX.utils.book_append_sheet(wb, teacherSheet, "Teachers");
      } else {
        console.warn("No teacher data found to add to the template.");
      }
    } catch (error) {
      console.error("Error fetching teacher data for template:", error);
      alert("Failed to fetch teacher data for the Excel template. Please try again later.");
    }

    // Trigger the download
    XLSX.writeFile(wb, "Event_Creation_Template.xlsx");
  };

  const handleDownload = (url, filename) => {
    axios
      .get(url, { responseType: "blob" })
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
        console.error("Error downloading file:", error);
        alert("Failed to download report. The report may be empty or an error occurred.");
      });
  };

  const handleDateRangeReport = () => {
    if (!reportStartDate || !reportEndDate) {
      alert("Please select both a start and end date for the report.");
      return;
    }
    const url = `https://facultypointsportal.onrender.com/reports/daterange?start_date=${reportStartDate}&end_date=${reportEndDate}`;
    handleDownload(url, `report_${reportStartDate}_to_${reportEndDate}.csv`);
  };

  const handleEventReport = (eventId, eventName) => {
    if (!eventId) return;
    const url = `https://facultypointsportal.onrender.com/reports/event/${eventId}`;
    handleDownload(url, `event_report_${eventName.replace(/\s+/g, "_")}.csv`);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Admin Dashboard</h2>

        {/* --- Create Event Section --- */}
        <div className="creation-section">
          {/* Manual Creation */}
          <button className="btn btn-primary mb-6" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel Manual Creation" : "Create Program Manually"}
          </button>

          {/* NEW: Excel Creation Form */}
          <div className="excel-upload-form">
            <h3 className="form-title">Create Program from Excel</h3>
            <p>Upload a formatted Excel file to create an event and assign roles automatically.</p>
            <form onSubmit={handleExcelSubmit} className="form-group-inline">
              <input
                id="excel-file-input"
                type="file"
                onChange={handleFileChange}
                className="form-input"
                accept=".xlsx, .xls"
              />
              <button type="submit" className="btn btn-success">Upload & Create</button>
            </form>
            <button onClick={handleDownloadTemplate} className="btn-link">
              Download Sample Template
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="create-form">
            <h3 className="form-title">Create New Program Manually</h3>
            <form onSubmit={handleFormSubmit}>
              {/* ... form fields for manual creation remain the same ... */}
               <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-textarea" rows="3" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="form-input" required />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="form-input" required />
                </div>

              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Create Event</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* --- Reports Section --- */}
        <div className="reports-section">
          {/* ... reports section remains the same ... */}
          <h3 className="section-title">Generate Reports</h3>
          <div className="report-generator">
            <h4>Report by Date Range</h4>
            <div className="form-group-inline">
              <input type="date" className="form-input" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} />
              <span>to</span>
              <input type="date" className="form-input" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} />
              <button className="btn btn-info" onClick={handleDateRangeReport}>Download Date Range Report</button>
            </div>
          </div>
        </div>

        {/* --- Events List Section --- */}
        <div className="tabs">
            {/* ... tabs remain the same ... */}
            <button className={activeTab === 'current' ? 'active' : ''} onClick={() => setActiveTab('current')}>Current</button>
            <button className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
            <button className={activeTab === 'past' ? 'active' : ''} onClick={() => setActiveTab('past')}>Past</button>
        </div>

        <div>
            {/* ... events list remains the same ... */}
            <h1 className="section-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Programs</h1>
          {loading ? <div className="loading">Loading...</div> : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">No {activeTab} programs found.</div>
            </div>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.event_id} className="event-card fade-in">
                  <div className="event-card-main" onClick={() => navigate(`/admin/event/${event.event_id}`)}>
                    <h2 className="event-title">{event.name}</h2>
                    <p className="event-description">{event.description}</p>
                    <div className="event-footer">
                      <span className="event-dates">
                        {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                   <div className="event-card-actions">
                      <button className="btn btn-outline-secondary" onClick={() => handleEventReport(event.event_id, event.name)}>
                        Event Report
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteEvent(event.event_id, event.name)}
                        title="Delete Event"
                      >
                      Delete
                      </button>
                   </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
