import React, { useState } from "react";
import { Send, Phone, Mail } from "lucide-react";

const Footer = () => {
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  
  //   try {
  //     const response = await fetch("http://localhost:5173/send-feedback", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(feedbackForm),
  //     });
  
  //     if (response.ok) {
  //       alert("Feedback sent successfully!");
  //       setFeedbackForm({ name: "", email: "", message: "" });
  //     } else {
  //       alert("Failed to send feedback. Try again later.");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("An error occurred. Please try again.");
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5050/send-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackForm),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Feedback sent successfully!");
      setFeedbackForm({ name: "", email: "", message: "" });
    } else {
      alert(result.error || "Failed to send feedback. Try again later.");
    }
  } catch (error) {
    console.error("Error sending feedback:", error);
    alert("An unexpected error occurred. Please try again later.");
  }
};

  
  

  return (
    <footer className="bg-[#1E293B] text-gray-300 py-12 mt-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-4">
        <div className="feedback-form">
          <h3 className="text-xl font-semibold mb-6">Share Your Feedback</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full bg-[#0F172A] p-3 rounded-lg"
              value={feedbackForm.name}
              onChange={(e) =>
                setFeedbackForm({ ...feedbackForm, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full bg-[#0F172A] p-3 rounded-lg"
              value={feedbackForm.email}
              onChange={(e) =>
                setFeedbackForm({ ...feedbackForm, email: e.target.value })
              }
              required
            />
            <textarea
              placeholder="Your Message"
              className="w-full bg-[#0F172A] p-3 rounded-lg h-32"
              value={feedbackForm.message}
              onChange={(e) =>
                setFeedbackForm({ ...feedbackForm, message: e.target.value })
              }
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Send Feedback
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="get-in-touch">
          <h3 className="text-xl font-semibold mb-6">Get in Touch</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <span>+918306629224</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <span>collabup4@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
