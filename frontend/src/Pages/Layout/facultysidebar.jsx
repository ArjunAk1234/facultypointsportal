
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
    { icon: <History size={20} />, label: "Events", path: "/faculty/event-historyfaculty" },
    { icon: <History size={20} />, label: "leaderboard", path: "/faculty/facultyleaderboard" }
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
