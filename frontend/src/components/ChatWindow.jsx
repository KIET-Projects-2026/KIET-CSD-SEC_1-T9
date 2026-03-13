import React, { useRef, useEffect } from "react";
import Message from "./Message";
import "./ChatWindow.css";

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chatwindow">
      {messages.length === 0 && !loading && (
        <div className="chatwindow__empty">
          <div className="chatwindow__empty-icon">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 7h6" />
              <path d="M8 11h8" />
            </svg>
          </div>
          <h2>AI Study Buddy</h2>
          <p>Ask me anything about your studies — concepts, problems, explanations, and more!</p>
          <div className="chatwindow__empty-hints">
            <span className="chatwindow__hint">"Explain recursion in Python"</span>
            <span className="chatwindow__hint">"What is Big-O notation?"</span>
            <span className="chatwindow__hint">"Solve this algebra problem…"</span>
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <Message key={i} role={msg.role} content={msg.content} />
      ))}

      {loading && (
        <div className="chatwindow__loading">
          <div className="chatwindow__loading-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M6 10a6 6 0 0 0 12 0" />
              <rect x="9" y="14" width="6" height="6" rx="1" />
              <path d="M4 20h16" />
            </svg>
          </div>
          <div className="chatwindow__loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
