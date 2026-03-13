import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Attach API key to every request
API.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem("api_key");
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

// ─── Auth ───────────────────────────────────────────────────────────────────
export const signup = (name, email, password) =>
  API.post("/signup", { name, email, password });

export const login = (email, password) =>
  API.post("/login", { email, password });

// ─── Sessions ────────────────────────────────────────────────────────────────
export const getSessions = () => API.get("/sessions");

export const createSession = () => API.post("/sessions");

export const getSessionMessages = (sessionId) =>
  API.get(`/sessions/${sessionId}/messages`);

// ─── Chat ────────────────────────────────────────────────────────────────────
// session_id is optional (null → backend creates new session)
export const sendMessage = (message, sessionId = null) =>
  API.post("/chat", { message, session_id: sessionId });

export const deleteSession = (sessionId) => API.delete(`/chat/${sessionId}`);

// ─── Notes ────────────────────────────────────────────────────────────────────
export const generateNotes = (topic) => API.post("/notes", { topic });

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export const generateQuiz = (topic) => API.post("/quiz", { topic });

// ─── PDF ──────────────────────────────────────────────────────────────────────
export const uploadPdf = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/pdf", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default API;
