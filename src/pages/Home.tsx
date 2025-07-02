import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Handshake, Lightbulb, Rocket, GraduationCap, FlaskConical } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, link, color }: any) => (
  <Link to={link} className="bg-[#1E293B] p-6 rounded-xl transform hover:scale-105 hover:bg-[#2D3B4E] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
    <div className="flex flex-col h-full">
      <Icon className={`w-8 h-8 ${color}`} />
      <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
      <p className="text-gray-400 flex-grow">{description}</p>
    </div>
  </Link>
);

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold text-blue-400 mb-16">Collab to Grow</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <FeatureCard
          icon={Users}
          title="Student Project"
          description="Connect with fellow students on exciting projects and build something amazing together."
          link="/student-projects"
          color="text-blue-400"  
        />
        <FeatureCard
          icon={Handshake}
          title="Buddy Finder"
          description="Find your perfect study or project partner."
          link="/buddy-finder"
          color="text-green-400"
        />
        <FeatureCard
          icon={Lightbulb}
          title="Mentorship"
          description="Learn from experienced mentors in your field."
          link="/mentorship"
          color="text-yellow-400"
        />
        <FeatureCard
          icon={Rocket}
          title="Startup Proj"
          description="Turn your innovative ideas into reality with a dedicated team."
          link="/startup-proj"
          color="text-purple-400"
        />
      </div>

      <div className="bg-[#1E293B] rounded-xl p-8 mb-8 transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
        <h2 className="text-2xl font-semibold mb-4">Join a talented student community</h2>
        <p className="text-gray-400 mb-6">
          Connect with passionate students, find project partners, get mentorship, and turn your ideas
          into reality. Our platform provides the perfect environment for collaboration and growth.
        </p>
        <div className="flex">
          <Link to="/college-community" className="btn-primary px-4 py-2">
            <GraduationCap className="w-5 h-5" />
            College Community
          </Link>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-xl p-8 mb-8 transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
        <h2 className="text-2xl font-semibold mb-4">Research Opportunities</h2>
        <p className="text-gray-400 mb-6">
          Connect with faculty members from your college for cutting-edge research projects. Gain
          valuable experience working on academic research while contributing to your field of study.
        </p>
        <div className="flex">
          <Link to="/research-projects" className="btn-orange px-4 py-2">
            <FlaskConical className="w-5 h-5" />
            Research Projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
