export const API_BASE =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000" // local FastAPI server
    : "https://your-render-app.onrender.com"; // deployed server
