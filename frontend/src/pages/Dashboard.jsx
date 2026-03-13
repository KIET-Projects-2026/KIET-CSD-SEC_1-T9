import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import QuizCard from "../components/QuizCard";
import PdfUpload from "../components/PdfUpload";
import ThemeToggle from "../components/ThemeToggle";
import { MessageSquare, FileText, CheckCircle, FileUp, Send, PanelLeftOpen } from "lucide-react";

import {
  getSessions,
  getSessionMessages,
  sendMessage,
  generateNotes,
  generateQuiz,
  uploadPdf,
  deleteSession,
} from "../services/api";

import "./Dashboard.css";

const MODES = ["Chat", "Notes", "Quiz", "PDF"];

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || "User";

  // ── Session state ──────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [mode, setMode] = useState("Chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── Notes state ────────────────────────────────────────────────────────────
  const [notesResult, setNotesResult] = useState(null);

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [quizResult, setQuizResult] = useState(null);

  // ── PDF state ──────────────────────────────────────────────────────────────
  const [pdfResult, setPdfResult] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("api_key")) navigate("/login");
  }, [navigate]);

  // ── Load sessions ──────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const res = await getSessions();
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // ── Select a session ───────────────────────────────────────────────────────
  const handleSelectSession = async (sessionId) => {
    try {
      setActiveSessionId(sessionId);
      setMode("Chat");
      const res = await getSessionMessages(sessionId);
      setMessages(res.data.map((m) => ({ role: m.role, content: m.content })));
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  // ── New Chat ───────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setNotesResult(null);
    setQuizResult(null);
    setPdfResult(null);
    setMode("Chat");
  };

  // ── Delete Chat ────────────────────────────────────────────────────────────
  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
      alert("Failed to delete chat. Please try again.");
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("api_key");
    localStorage.removeItem("user_name");
    navigate("/login");
  };

  // ── Send Chat Message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await sendMessage(question, activeSessionId);
      const { session_id, ai_reply } = res.data;

      setActiveSessionId(session_id);
      setMessages((prev) => [...prev, { role: "assistant", content: ai_reply }]);
      await fetchSessions(); // refresh sidebar
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Generate Notes ─────────────────────────────────────────────────────────
  const handleGenerateNotes = async () => {
    const topic = input.trim();
    if (!topic || loading) return;
    setLoading(true);
    setInput("");
    setNotesResult(null);
    try {
      const res = await generateNotes(topic);
      setNotesResult(res.data);
    } catch (err) {
      setNotesResult({ topic, notes: `⚠️ ${err.response?.data?.detail || "Failed to generate notes."}` });
    } finally {
      setLoading(false);
    }
  };

  // ── Generate Quiz ──────────────────────────────────────────────────────────
  const handleGenerateQuiz = async () => {
    const topic = input.trim();
    if (!topic || loading) return;
    setLoading(true);
    setInput("");
    setQuizResult(null);
    try {
      const res = await generateQuiz(topic);
      setQuizResult(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  // ── Upload PDF ─────────────────────────────────────────────────────────────
  const handlePdfUpload = async (file) => {
    setPdfLoading(true);
    setPdfResult(null);
    try {
      const res = await uploadPdf(file);
      setPdfResult(res.data);
    } catch (err) {
      setPdfResult({ summary: `⚠️ ${err.response?.data?.detail || "Failed to analyze PDF."}`, key_points: "", questions: "" });
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Input placeholder ──────────────────────────────────────────────────────
  const inputPlaceholder = {
    Chat: "Ask a study question…",
    Notes: "Enter a topic to generate notes (e.g. Machine Learning)…",
    Quiz: "Enter a topic to generate a quiz (e.g. Python Lists)…",
    PDF: "",
  }[mode];

  const handleSubmit = {
    Chat: handleSend,
    Notes: handleGenerateNotes,
    Quiz: handleGenerateQuiz,
    PDF: null,
  }[mode];

  const btnLabel = {
    Chat: null,  // send icon
    Notes: "Generate",
    Quiz: "Generate",
    PDF: null,
  }[mode];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        userName={userName}
        onLogout={handleLogout}
      />

      <main className="dashboard__main">
        {/* Header / Tabs */}
        <header className="dashboard__header">
          <div className="dashboard__tabs">
            {!isSidebarOpen && (
              <button 
                className="dashboard__sidebar-toggle" 
                onClick={() => setIsSidebarOpen(true)}
                title="Open Sidebar"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            {MODES.map((m) => (
              <button
                key={m}
                className={`dashboard__tab ${mode === m ? "dashboard__tab--active" : ""}`}
                onClick={() => { setMode(m); setInput(""); }}
                id={`tab-${m.toLowerCase()}`}
              >
                {m === "Chat" && <MessageSquare size={16} />}
                {m === "Notes" && <FileText size={16} />}
                {m === "Quiz" && <CheckCircle size={16} />}
                {m === "PDF" && <FileUp size={16} />}
                {m}
              </button>
            ))}
          </div>
          <ThemeToggle />
        </header>

        {/* Content area */}
        <div className="dashboard__content">

          {/* ── CHAT ── */}
          {mode === "Chat" && (
            <ChatWindow messages={messages} loading={loading} />
          )}

          {/* ── NOTES ── */}
          {mode === "Notes" && (
            <div className="dashboard__scroll-area">
              {loading && (
                <div className="dashboard__generating">
                  <div className="dashboard__spinner" />
                  <p>Generating notes on <strong>{input || "your topic"}</strong>…</p>
                </div>
              )}
              {notesResult && (
                <div className="dashboard__notes-output">
                  <div className="notes-header">
                    <span className="notes-badge">📚 Study Notes</span>
                    <h2 className="notes-title">{notesResult.topic}</h2>
                  </div>
                  <div className="notes-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{notesResult.notes}</ReactMarkdown>
                  </div>
                </div>
              )}
              {!loading && !notesResult && (
                <div className="dashboard__mode-empty">
                  <div className="dashboard__mode-icon">📚</div>
                  <h3>Notes Generator</h3>
                  <p>Enter a topic below and get comprehensive, structured study notes instantly.</p>
                </div>
              )}
            </div>
          )}

          {/* ── QUIZ ── */}
          {mode === "Quiz" && (
            <div className="dashboard__scroll-area">
              {loading && (
                <div className="dashboard__generating">
                  <div className="dashboard__spinner" />
                  <p>Generating quiz…</p>
                </div>
              )}
              {quizResult && (
                <div className="dashboard__quiz-output">
                  <div className="quiz-header">
                    <span className="notes-badge">🧠 Quiz</span>
                    <h2 className="notes-title">{quizResult.topic}</h2>
                  </div>
                  {quizResult.questions.map((q, i) => (
                    <QuizCard
                      key={i}
                      questionNumber={i + 1}
                      question={q.question}
                      options={q.options}
                      answer={q.answer}
                    />
                  ))}
                </div>
              )}
              {!loading && !quizResult && (
                <div className="dashboard__mode-empty">
                  <div className="dashboard__mode-icon">🧠</div>
                  <h3>Quiz Generator</h3>
                  <p>Enter a topic below to generate an interactive multiple-choice quiz.</p>
                </div>
              )}
            </div>
          )}

          {/* ── PDF ── */}
          {mode === "PDF" && (
            <div className="dashboard__scroll-area dashboard__pdf-area">
              <PdfUpload onUpload={handlePdfUpload} loading={pdfLoading} />
              {pdfResult && (
                <div className="dashboard__pdf-result">
                  <div className="pdf-section">
                    <h3>📋 Summary</h3>
                    <p>{pdfResult.summary}</p>
                  </div>
                  {pdfResult.key_points && (
                    <div className="pdf-section">
                      <h3>🔑 Key Points</h3>
                      <div className="notes-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{pdfResult.key_points}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  {pdfResult.questions && (
                    <div className="pdf-section">
                      <h3>❓ Practice Questions</h3>
                      <div className="notes-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{pdfResult.questions}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input bar — only for Chat, Notes, Quiz */}
        {mode !== "PDF" && (
          <div className="dashboard__input-bar">
            <div className="dashboard__input-wrapper">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={mode === "Chat" ? handleKeyDown : undefined}
                placeholder={inputPlaceholder}
                disabled={loading}
                autoComplete="off"
              />
              <button
                className="dashboard__send"
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                title={btnLabel || "Send"}
                id="send-btn"
              >
                {btnLabel ? (
                  <span className="dashboard__send-label">{btnLabel}</span>
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <p className="dashboard__disclaimer">
              AI Study Buddy can make mistakes. Verify important information.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
