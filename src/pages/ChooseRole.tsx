import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChooseRole = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] text-white">
      <h1 className="text-3xl font-bold mb-6">Select Your Role</h1>
      <div className="flex gap-8">
        <button
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg"
          onClick={() => navigate('/student-projects')}
        >
          Student
        </button>
        <button
          className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg"
          onClick={() => navigate('/mentorship')}
        >
          Mentor
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg"
          onClick={() => navigate('/research-projects')}
        >
          Faculty
        </button>
      </div>
    </div>
  );
};

export default ChooseRole;
