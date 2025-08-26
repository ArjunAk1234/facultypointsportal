import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Replace with the actual URL of your Go backend
const API_BASE_URL = 'http://localhost:8080';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);

  // Pagination State
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Get the current user's ID to highlight them in the list
        const user = JSON.parse(localStorage.getItem("user"));
        // Using user_id as per the Go backend LoginResponse struct
        setCurrentTeacherId(user?.user_id); 

        const response = await axios.get(`${API_BASE_URL}/dashboard/faculty`);
        // The dashboard response contains the leaderboard array
        setLeaderboard(response.data.leaderboard || []);

      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load the leaderboard. Please check the server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
  const paginatedLeaderboard = leaderboard.slice(
    (leaderboardPage - 1) * itemsPerPage,
    leaderboardPage * itemsPerPage
  );

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex justify-center items-center p-4">
        <p className="text-red-700 font-semibold text-center">{error}</p>
      </div>
    );
  }

  // --- Render Main Component ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Faculty Leaderboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Faculty rankings based on total points awarded for event participation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <ul className="space-y-4">
            {paginatedLeaderboard.map((teacher, index) => {
              // The user_id in your leaderboard data is named 'teacher_id'
              const isCurrentUser = teacher.teacher_id === currentTeacherId;
              const rank = (leaderboardPage - 1) * itemsPerPage + index + 1;

              return (
                <li 
                  key={teacher.teacher_id || index} 
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    isCurrentUser 
                      ? 'bg-blue-100 border-l-4 border-blue-500 transform scale-105 shadow-md' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`text-xl font-bold w-10 text-center ${rank <= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
                      {rank}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg ml-4 shadow-sm">
                      {(teacher.teacher_name && typeof teacher.teacher_name === 'string') ? teacher.teacher_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="ml-4 font-medium text-gray-800 text-lg">{teacher.teacher_name || 'Unknown User'}</span>
                  </div>
                  <span className="font-bold text-xl text-green-600">{teacher.points || 0} pts</span>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center pt-4 border-t">
              <button
                onClick={() => setLeaderboardPage(prev => Math.max(prev - 1, 1))}
                disabled={leaderboardPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {leaderboardPage} of {totalPages}
              </span>
              <button
                onClick={() => setLeaderboardPage(prev => Math.min(prev + 1, totalPages))}
                disabled={leaderboardPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
