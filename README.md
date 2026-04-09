# TaskFlow UI

## Overview
A modern, AI-augmented task management dashboard built with **React**, **Vite**, and **Tailwind CSS/CSS3**. This application serves as the primary frontend client for the TaskFlow backend system, providing users with an intuitive, glassmorphic interface to manage their daily workflows, analyze task priorities, and seamlessly integrate with Google Gemini AI for automated task insights.

## 🌐 Live Deployments & Cross-Repository Links

This project is built as a fully decoupled microservice architecture.

- **Frontend Application (Live):** [https://taskflow-ui-two.vercel.app/](https://taskflow-ui-two.vercel.app/)
- **Frontend Source Code:** [https://github.com/Kushan-shah/TaskFlow-UI](https://github.com/Kushan-shah/TaskFlow-UI)
- **Primary Backend API (AWS EC2):** [http://65.2.191.152:8080/swagger-ui/index.html#/](http://65.2.191.152:8080/swagger-ui/index.html#/)
- **Fallback Backend API (Render):** [https://task-manager-api-live.onrender.com/swagger-ui/index.html#/](https://task-manager-api-live.onrender.com/swagger-ui/index.html#/)
- **Backend Source Code:** [https://github.com/Kushan-shah/TaskFlow-AI](https://github.com/Kushan-shah/TaskFlow-AI)

## Key Features
- **Context API State Management:** Seamless global state handling for Authentication (`AuthContext`) and Toast Notifications (`ToastContext`), minimizing prop drilling.
- **Stateless JWT Authentication:** Secure frontend routing with protected components. Tokens are securely stored and automatically injected into Axios interceptors.
- **Glassmorphism UI:** Premium dark-mode aesthetics using backdrop-filters, subtle gradients, and CSS grid/flexbox layouts.
- **AI Analytics Dashboard:** Real-time data visualization of task completion states using `Recharts`.
- **Dynamic AI Insights:** Seamless integration with the TaskFlow AI endpoints, featuring custom Shimmer loading states while waiting for LLM inference.
- **Optimized Network Layer:** Centralized API request handling using `Axios` interceptors with automatic 401 unauthenticated redirect handling.

## System Architecture

The frontend strictly follows a modular, component-driven design:
- **`src/api/`**: Centralized Axios configurations and endpoint abstractions (`tasks.js`).
- **`src/context/`**: Global state providers for authentication and UI feedback.
- **`src/components/`**: Reusable UI components (Sidebar, Task Cards, Modals).
- **`src/pages/`**: Primary routing views (Dashboard, Tasks, Login, Register).

## Quick Start & Build

### 1. Installation
Ensure you have Node.js installed, then install the dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file at the root of the project and point it to the Spring Boot backend:
```env
VITE_API_BASE_URL=http://localhost:8080
```
*(In production, set this to the Render API URL).*

### 3. Local Development Server
Launch the ultra-fast Vite development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 4. Production Build
To generate static assets for deployment (Vercel/Netlify):
```bash
npm run build
```

## UI/UX Engineering Decisions
- **Micro-Animations:** Implemented pure CSS keyframe animations for modals and shimmer effects to eliminate heavy JS library dependencies.
- **Progressive Disclosure:** AI summaries and extra details are hidden behind "Analyze" boundaries to prevent overwhelming the user interface.
- **Error Boundaries:** Unified toast notification system provides immediate, non-blocking feedback for asynchronous API failures.
