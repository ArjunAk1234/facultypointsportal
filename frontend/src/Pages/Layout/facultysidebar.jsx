// // // Sidebar.jsx
// // import React from "react";
// // import { Home, History } from "lucide-react";
// // import { useNavigate } from "react-router-dom";

// // const Sidebar = () => {
// //   const navigate = useNavigate();

// //   const menuItems = [
// //     { icon: <Home size={20} />, label: "Home", path: "/faculty" },
// //     { icon: <History size={20} />, label: "Past Events", path: "/faculty/event-historyfaculty" },
// //   ];

// //   return (
// //     <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
// //       <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
// //       <nav className="space-y-2">
// //         {menuItems.map((item, index) => (
// //           <button
// //             key={index}
// //             onClick={() => navigate(item.path)}
// //             className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-700 w-full text-left"
// //           >
// //             {item.icon}
// //             <span>{item.label}</span>
// //           </button>
// //         ))}
// //       </nav>
// //     </div>
// //   );
// // };

// // export default Sidebar;
// import React, { useState } from "react";
// import { Home, History, ChevronsLeft, ChevronsRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const menuItems = [
//     { icon: <Home size={20} />, label: "Home", path: "/faculty" },
//     { icon: <History size={20} />, label: "Past Events", path: "/faculty/event-historyfaculty" },
//   ];

//   const handleToggle = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   return (
//     <div
//       className={`h-screen text-white bg-gray-900 flex flex-col transition-all duration-300 ease-in-out ${
//         isCollapsed ? "w-20" : "w-64"
//       }`}
//     >
//       {/* Header with Title and Toggle Button */}
//       <div className="flex items-center justify-between p-4 border-b border-gray-700">
//         <h1
//           className={`text-2xl font-bold whitespace-nowrap overflow-hidden transition-opacity duration-300 ${
//             isCollapsed ? "opacity-0" : "opacity-100"
//           }`}
//         >
//           Dashboard
//         </h1>
//         <button
//           onClick={handleToggle}
//           className="p-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//         >
//           {isCollapsed ? <ChevronsRight size={24} /> : <ChevronsLeft size={24} />}
//         </button>
//       </div>

//       {/* Navigation Menu */}
//       <nav className="flex-1 p-4 space-y-2">
//         {menuItems.map((item, index) => (
//           <button
//             key={index}
//             onClick={() => navigate(item.path)}
//             className={`flex items-center w-full p-3 rounded-xl hover:bg-gray-700 text-left transition-all duration-300 ${
//               isCollapsed ? "justify-center" : ""
//             }`}
//             title={isCollapsed ? item.label : ""}
//           >
//             {item.icon}
//             <span
//               className={`ml-4 whitespace-nowrap transition-all duration-300 ${
//                 isCollapsed ? "opacity-0 w-0" : "opacity-100"
//               }`}
//             >
//               {item.label}
//             </span>
//           </button>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState, useEffect } from "react";
import { Home, History, Users, LogOut, ChevronFirst, ChevronLast } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext"; // use the hook, not the context

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // State to manage sidebar expansion
  const [isExpanded, setIsExpanded] = useState(true);

  // Effect to handle automatic collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    // Set initial state based on window size
    handleResize(); 

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const menuItems = [
  //   { icon: <Home size={20} />, label: "Home", path: "/admin" },
  //   { icon: <History size={20} />, label: "Past Events", path: "/admin/event-history" },
  //   { icon: <Users size={20} />, label: "Users", path: "/admin/add-teacher" },
  //   { icon: <Users size={20} />, label: "Teachers", path: "/admin/faculty-list" },
  // ];
  const menuItems = [
    { icon: <Home size={20} />, label: "Home", path: "/faculty" },
    { icon: <History size={20} />, label: "Past Events", path: "/faculty/event-historyfaculty" },
  ];

  const handleLogout = () => {
    logout();             // calls logout from context
    navigate("/login");   // redirects to login page
  };

  return (
    <div 
      className={`h-screen bg-gray-900 text-white flex flex-col p-4 fixed top-0 left-0 transition-all duration-300 ease-in-out ${isExpanded ? "w-64" : "w-20"}`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-gray-700">
        <h1 className={`text-2xl font-bold overflow-hidden transition-all ${isExpanded ? "w-auto" : "w-0"}`}>
          Dashboard
        </h1>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600"
        >
          {isExpanded ? <ChevronFirst /> : <ChevronLast />}
        </button>
      </div>

      <nav className="space-y-2 flex-1 mt-6">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-700 w-full text-left"
          >
            {item.icon}
            <span className={`overflow-hidden transition-all ${isExpanded ? "w-auto ml-3" : "w-0"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-red-600 bg-red-500 text-white mt-auto"
      >
        <LogOut size={20} />
        <span className={`overflow-hidden transition-all ${isExpanded ? "w-auto ml-3" : "w-0"}`}>
          Logout
        </span>
      </button>
    </div>
  );
};

export default Sidebar;