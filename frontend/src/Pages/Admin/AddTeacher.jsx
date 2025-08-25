// import React, { useState } from 'react';

// function AddTeacher() {
//   const [teacher, setTeacher] = useState({
//     teachername: '',
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

//     const res = await fetch('https://facultypointsportal.onrender.com/teachers', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(teacher)
//     });

//     if (res.ok) {
//       setResponseMessage('Teacher created successfully!');
//       setTeacher({
//         name: '',
//         email: '',
//         department: '',
//       });
//     } else {
//       const errorData = await res.json();
//       setResponseMessage(`Error: ${errorData.error}`);
//     }
// };


//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Create Teacher</h2>

//       {/* Show success message */}
//       {responseMessage && <div className="mb-4 text-green-600">{responseMessage}</div>}

//       {/* Show error message */}
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
//         <input
//           type="text"
//           name="department"
//           placeholder="Department"
//           value={teacher.department}
//           onChange={handleChange}
//           className="w-full border p-2 rounded"
//         />
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
  const [teacher, setTeacher] = useState({
    name: '',
    email: '',
    department: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('https://facultypointsportal.onrender.com/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher)
      });

      if (res.ok) {
        setResponseMessage('Teacher created successfully!');
        setErrorMessage('');
        setTeacher({
          name: '',
          email: '',
          department: '',
        });
      } else {
        const errorData = await res.json();
        setErrorMessage(`Error: ${errorData.error || 'Something went wrong.'}`);
        setResponseMessage('');
      }
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      setResponseMessage('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Teacher</h2>

      {/* Success message */}
      {responseMessage && <div className="mb-4 text-green-600">{responseMessage}</div>}

      {/* Error message */}
      {errorMessage && <div className="mb-4 text-red-600">{errorMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={teacher.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={teacher.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <select
          name="department"
          value={teacher.department}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Department</option>
          <option value="Computing">Computing</option>
          <option value="Engineering">Engineering</option>
          <option value="Maths">Maths</option>
          <option value="Physics">Physics</option>
          <option value="Biotech">Biotech</option>
        </select>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>
    </div>
  );
}

export default AddTeacher;
