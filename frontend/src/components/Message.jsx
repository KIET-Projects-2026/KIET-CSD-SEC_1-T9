import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Message.css";

export default function Message({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`message ${isUser ? "message--user" : "message--ai"}`}>
      <div className="message__avatar">
        {isUser ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
            <path d="M6 10a6 6 0 0 0 12 0" />
            <rect x="9" y="14" width="6" height="6" rx="1" />
            <path d="M4 20h16" />
          </svg>
        )}
      </div>

      <div className="message__bubble">
        {isUser ? (
          <p className="message__user-text">{content}</p>
        ) : (
          <div className="message__markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
