# Study-Huub

![Study Hub](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-8.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.12-yellow)

Study-Huub is a modern, minimalist web application designed to help students organize their personal notes, files, and study materials efficiently. Built with a focus on productivity, it features a sleek black-and-white interface, powerful rich-text editing, and seamless cloud synchronization.

🌐 **Live Demo:** [studyhuub.web.app](https://studyhuub.web.app)

## ✨ Key Features

*   **Hierarchical Organization System:**
    *   Organize your study materials seamlessly with a deep hierarchy: Subjects > Folders > Files/Notes.
*   **Google Classroom Integration:**
    *   Import functionality that maps Google Classroom Courses to Subjects, Topics to Folders, and Materials/PDFs to Files.
*   **Advanced Rich Text Editor:**
    *   Powered by Tiptap, the editor supports rich formatting, code blocks (with syntax highlighting via lowlight), text alignment, and more for comprehensive note-taking.
*   **File Management & Storage:**
    *   Upload and manage files (including PDFs) with an intuitive drag-and-drop interface. Cloud storage powered by Firebase.
*   **Tag-Based Organization:**
    *   Easily categorize and search through your notes and files using a flexible tagging system.
*   **Recent Activity Tracker:**
    *   Quickly jump back into your work with a dashboard that tracks your recently accessed and modified materials.
*   **Modern & Minimalist UI/UX:**
    *   A clean, distraction-free black-and-white aesthetic.
    *   Full support for Light and Dark modes.
    *   Smooth micro-animations and interactive backgrounds powered by Framer Motion and Three.js.
*   **Progressive Web App (PWA):**
    *   Install Study-Huub on your desktop or mobile device for a native-like experience and offline accessibility.
*   **Secure Authentication:**
    *   Robust user authentication backed by Firebase Auth.

## 🛠️ Technology Stack

*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend as a Service (BaaS):** Firebase (Authentication, Firestore, Storage, Hosting)
*   **Routing:** React Router DOM
*   **Icons:** Lucide React
*   **Editor:** Tiptap
*   **Animations/Graphics:** Framer Motion, Three.js
*   **PWA:** vite-plugin-pwa

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   A Firebase project setup with Firestore, Storage, and Authentication enabled.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/study-hub.git
    cd study-hub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:5173`.

## 📦 Deployment

This project is configured for deployment on Firebase Hosting.

1.  **Build the project:**
    ```bash
    npm run build
    ```

2.  **Deploy to Firebase:**
    ```bash
    npm run deploy
    ```

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
