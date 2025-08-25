// // import React, { useState } from 'react';

// // function AddTeacher() {
// //   const [teacher, setTeacher] = useState({
// //     teachername: '',
// //     email: '',
// //     department: '',
// //   });

// //   const [responseMessage, setResponseMessage] = useState('');
// //   const [errorMessage, setErrorMessage] = useState('');

// //   const handleChange = (e) => {
// //     setTeacher({ ...teacher, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     const res = await fetch('http://localhost:8080/teachers', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(teacher)
// //     });

// //     if (res.ok) {
// //       setResponseMessage('Teacher created successfully!');
// //       setTeacher({
// //         name: '',
// //         email: '',
// //         department: '',
// //       });
// //     } else {
// //       const errorData = await res.json();
// //       setResponseMessage(`Error: ${errorData.error}`);
// //     }
// // };


// //   return (
// //     <div className="p-4 max-w-md mx-auto">
// //       <h2 className="text-2xl font-bold mb-4">Create Teacher</h2>

// //       {/* Show success message */}
// //       {responseMessage && <div className="mb-4 text-green-600">{responseMessage}</div>}

// //       {/* Show error message */}
// //       {errorMessage && <div className="mb-4 text-red-600">{errorMessage}</div>}

// //       <form onSubmit={handleSubmit} className="space-y-4">
// //         <input
// //           type="text"
// //           name="name"
// //           placeholder="Name"
// //           value={teacher.name}
// //           onChange={handleChange}
// //           className="w-full border p-2 rounded"
// //           required
// //         />
// //         <input
// //           type="email"
// //           name="email"
// //           placeholder="Email"
// //           value={teacher.email}
// //           onChange={handleChange}
// //           className="w-full border p-2 rounded"
// //           required
// //         />
// //         <input
// //           type="text"
// //           name="department"
// //           placeholder="Department"
// //           value={teacher.department}
// //           onChange={handleChange}
// //           className="w-full border p-2 rounded"
// //         />
// //         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
// //           Create
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }

// // export default AddTeacher;
// import React, { useState } from 'react';

// function AddTeacher() {
//   const [teacher, setTeacher] = useState({
//     name: '',
//     email: '',
//     department: '',
//   });

//   const [responseMessage, setResponseMessage] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleChange = (e) => {
//     setTeacher({ ...teacher, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try { alert(teacher.department);
//       const res = await fetch('http://localhost:8080/teachers', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(teacher)
//       });

//       if (res.ok) {
//         setResponseMessage('Teacher created successfully!');
//         setErrorMessage('');
//         setTeacher({
//           name: '',
//           email: '',
//           department: '',
//         });
//       } else {
//         const errorData = await res.json();
//         setErrorMessage(`Error: ${errorData.error || 'Something went wrong.'}`);
//         setResponseMessage('');
//       }
//     } catch (error) {
//       setErrorMessage(`Error: ${error.message}`);
//       setResponseMessage('');
//     }
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Create Teacher</h2>

//       {/* Success message */}
//       {responseMessage && <div className="mb-4 text-green-600">{responseMessage}</div>}

//       {/* Error message */}
//       {errorMessage && <div className="mb-4 text-red-600">{errorMessage}</div>}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={teacher.name}
//           onChange={handleChange}
//           className="w-full border p-2 rounded"
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={teacher.email}
//           onChange={handleChange}
//           className="w-full border p-2 rounded"
//           required
//         />
//         <select
//           name="department"
//           value={teacher.department}
//           onChange={handleChange}
//           className="w-full border p-2 rounded"
//           required
//         >
//           <option value="">Select Department</option>
//           <option value="Computing">Computing</option>
//           <option value="Engineering">Engineering</option>
//           <option value="Maths">Maths</option>
//           <option value="Physics">Physics</option>
//           <option value="Biotech">Biotech</option>
//         </select>

//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//           Create
//         </button>
//       </form>
//     </div>
//   );
// }

// export default AddTeacher;

import React, { useState } from 'react';

function AddTeacher() {
  // --- FIX: Updated the state to use 'departmentname' to match the backend struct ---
  const [teacher, setTeacher] = useState({
    name: '',
    email: '',
    departmentname: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8080/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher)
      });

      if (res.ok) {
        setResponseMessage('Teacher created successfully!');
        setErrorMessage('');
        // --- FIX: Reset the state with the correct field name ---
        setTeacher({
          name: '',
          email: '',
          departmentname: '',
        });
      } else {
        const errorData = await res.json();
        setErrorMessage(`Error: ${errorData.error || 'Something went wrong.'}`);
        setResponseMessage('');
      }
    } catch (error) {
      setErrorMessage(`Error: An unexpected error occurred: ${error.message}`);
      setResponseMessage('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Create Teacher</h2>

      {/* Success message */}
      {responseMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
          {responseMessage}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="e.g., John Doe"
            value={teacher.name}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="e.g., john.doe@example.com"
            value={teacher.email}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="departmentname" className="block text-sm font-medium text-gray-600">Department</label>
          {/* --- FIX: Updated name and value attributes to 'departmentname' --- */}
          <select
            id="departmentname"
            name="departmentname"
            value={teacher.departmentname}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Department</option>
            <option value="Computing">Computing</option>
            <option value="Engineering">Engineering</option>
            <option value="Maths">Maths</option>
            <option value="Physics">Physics</option>
            <option value="Biotech">Biotech</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create
        </button>
      </form>
    </div>
  );
}

export default AddTeacher;
