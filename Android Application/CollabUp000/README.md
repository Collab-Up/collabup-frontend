# CollabUp - Collaborative Learning Platform

<div align="center">
  <img src="app/src/main/res/drawable/logo_collabup.png" alt="CollabUp Logo" width="200"/>
  
  **A comprehensive platform connecting students, mentors, and startups for collaborative projects and opportunities**
  
  [![Android](https://img.shields.io/badge/Android-26+-green.svg)](https://developer.android.com/)
  [![Kotlin](https://img.shields.io/badge/Kotlin-1.9+-blue.svg)](https://kotlinlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange.svg)](https://firebase.google.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📱 Overview

CollabUp is an Android application designed to bridge the gap between students, mentors, and startups. It provides a comprehensive platform for discovering opportunities, connecting with like-minded individuals, and participating in collaborative projects.

### ✨ Key Features

- **🔍 Intelligent Search**: AI-powered search across students, mentors, projects, and opportunities
- **👥 Community Building**: Connect with students and mentors in your area
- **📋 Project Management**: Create, discover, and collaborate on projects
- **🎓 Mentorship**: Find mentors and book sessions for guidance
- **🏆 Opportunities**: Discover hackathons, internships, and research opportunities
- **🤖 AI Assistant**: Built-in chatbot for guidance and support
- **📧 Email Integration**: Seamless communication between users
- **☁️ Cloud Storage**: Google Drive integration for profile images

## 🏗️ Architecture

### Tech Stack

- **Language**: Kotlin
- **Platform**: Android (API 26+)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **UI Framework**: Material Design 3
- **Image Loading**: Glide
- **Async Operations**: Kotlin Coroutines
- **Navigation**: Android Navigation Component
- **Animations**: Lottie

### Project Structure

```
app/src/main/java/com/princemaurya/collabup000/
├── activities/           # Main application activities
├── adapters/            # RecyclerView and ViewPager adapters
├── data/                # Sample data and models
├── fragments/           # Main UI fragments
├── models/              # Data models and classes
├── services/            # Business logic and API services
└── utils/               # Utility classes and helpers
```

## 🚀 Getting Started

### Prerequisites

- Android Studio Arctic Fox or later
- Android SDK API 26+
- Google Cloud Console account
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CollabUp.git
   cd CollabUp
   ```

2. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Download `google-services.json` and place it in the `app/` directory

3. **Configure Google Cloud**
   - Follow the [Google Drive Setup Guide](GOOGLE_DRIVE_SETUP.md)
   - Enable Google Sign-In API
   - Configure OAuth 2.0 credentials

4. **Build and Run**
   ```bash
   ./gradlew assembleDebug
   ```

## 🎯 Features in Detail

### 🏠 Home Fragment
- **Personal Projects Dashboard**: View and manage your created projects
- **Banner Carousel**: Featured opportunities and announcements
- **Quick Actions**: Add new projects, search functionality
- **Auto-scrolling Updates**: Dynamic content rotation

### 👥 Community Fragment
- **Top Achievements**: Showcase student and mentor accomplishments
- **Top Students**: Discover high-performing students
- **Area-based Connections**: Find people near you
- **Intelligent Search**: AI-powered student discovery

### 🎓 Mentors Fragment
- **Expert Achievements**: Highlight mentor accomplishments
- **Top Rated Mentors**: Browse highly-rated mentors
- **Session Booking**: Schedule mentorship sessions
- **Expertise-based Search**: Find mentors by skills and domain

### 💼 Opportunities Fragment
- **Featured Opportunities**: Curated hackathons and programs
- **Project Discovery**: Browse collaborative projects
- **Hackathon Listings**: Find upcoming competitions
- **Intelligent Matching**: AI-recommended opportunities

### 📋 Projects Fragment
- **Project Creation**: Build new collaborative projects
- **Project Discovery**: Find projects to join
- **Category Filtering**: Browse by domain and technology
- **Detailed Project View
