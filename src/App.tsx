import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CollegeCommunity from './pages/CollegeCommunity';
import ResearchProjects from './pages/ResearchProjects';
import StudentProjects from './pages/StudentProjects';
import BuddyFinder from './pages/BuddyFinder';
import Mentorship from './pages/Mentorship';
import StartupProj from './pages/StartupProjects';
import EditProfile from './pages/EditProfile';

function App() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/college-community" element={<CollegeCommunity />} />
        <Route path="/research-projects" element={<ResearchProjects />} />
        <Route path="/student-projects" element={<StudentProjects />} />
        <Route path='/buddy-finder' element={<BuddyFinder/>}/>
        <Route path='/mentorship' element={<Mentorship/>}/>
        <Route path='/startup-proj' element={<StartupProj/>}/>
        <Route path='/edit-profile' element={<EditProfile/>}/>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;