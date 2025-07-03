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
      <h1 className="text-5xl font-bold text-center mb-6">
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent inline-block transition-transform duration-500 hover:scale-110">
          C&lt;&gt;llab
        </span>
        <span className="text-blue-400"> to Grow</span>
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 text-center">
        Connect, collaborate, and build amazing projects together with students from around the world
      </p>
      
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

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle w-8 h-8 text-white"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
          <h2 className="text-2xl font-semibold text-white">Need Help?</h2>
        </div>
        <p className="text-indigo-100 mb-6">Our AI assistant is here to help! Get instant answers to your questions about mentorship, projects, community features, and more. Click the chat icon in the navbar or use the button below.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Quick Questions</h3>
            <ul className="text-indigo-100 text-sm space-y-1">
              <li>• How to book a mentor?</li>
              <li>• What are research projects?</li>
              <li>• How to enroll in startup projects?</li>
              <li>• Tell me about the community</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Platform Features</h3>
            <ul className="text-indigo-100 text-sm space-y-1">
              <li>• Mentorship booking & pricing</li>
              <li>• Research project applications</li>
              <li>• Startup project enrollments</li>
              <li>• College community & events</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-5 h-5 text-white"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
          <span className="text-indigo-100 text-sm">Click the chat icon in the navbar or bottom right corner of this page to start chatting with our assistant!</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
