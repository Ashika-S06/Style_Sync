# Fashion Lookbook + Style Sync (MERN Full Stack)

This is a complete full-stack web application designed for managing fashion lookbooks, personal wardrobes, and curated outfit collections. It features an **AI-Powered Lookbook Generator** using Google Gemini, a comprehensive interactive feedback system, and a modern, responsive React frontend.

## 🚀 Features Highlights
- **AI Lookbook Generator**: Automatically curate outfits from your wardrobe using Google Gemini AI.
- **Interactive Feedback System**: Rate lookbooks with a 5-star system and vote in "Would You Wear This?" intent polls.
- **Digital Mini Wardrobe**: Upload logic, categorize by top/bottom/shoes, and track colors/brands.
- **Outfit Collections**: Mix and match your uploaded wardrobe items into named collections.
- **Profile Statistics**: Track how many lookbooks, wardrobe items, and outfits you own.
- **Premium UI**: Soft, feminine, and high-end fashion aesthetic with smooth transitions and glassmorphism.

## 📁 Project Structure
The repository is structured as a Monorepo:
- `/backend`: Node.js, Express, MongoDB, Google GenAI SDK, JWT Auth.
- `/frontend`: React, Vite, Axios, React Router, Context API.

## 🛠️ Installation & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/cloud/atlas) account (or local MongoDB)
- [Google AI Studio API Key](https://aistudio.google.com/) (for Gemini AI features)

### 1. Setup Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## 👥 Team & Collaboration

This project is optimized for collaborative development:
- **Frontend**: Focus on `frontend/src/pages` and `frontend/src/components`. Uses Vanilla CSS for styling.
- **Backend/AI**: Focus on `backend/controllers/aiController.js` and `backend/routes/aiRoutes.js`.
- **Database**: Schemas are located in `backend/models`.

### Branching Strategy
- `main`: Stable production-ready code.
- `feature/*`: For new features (e.g., `feature/ai-integration`).

## 🎁 Sample User Flow
1. **Sign Up**: Create an account to start your digital wardrobe.
2. **Wardrobe**: Upload images of your clothes (Tops, Bottoms, Shoes).
3. **AI Lookbook**: Visit the **Lookbook** page and click **Generate AI Lookbook** to see recommended outfits based on your wardrobe!
4. **Interact**: Rate AI suggestions and vote on whether you'd wear the generated styles.
5. **Feed**: Share your favorite lookbooks with the community.
