import { MessageSquare, Plus, Trash2, LogOut, PanelLeftClose } from "lucide-react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  userName,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <Link to="/dashboard" className="sidebar__brand-left">
          <div className="sidebar__logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <span className="sidebar__title">Study Buddy</span>
        </Link>
        <button className="sidebar__close-btn" onClick={onToggle} title="Close Sidebar">
          <PanelLeftClose size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="sidebar__new-chat">
        <button className="sidebar__new-btn" onClick={onNewChat} id="new-chat-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Session History */}
      <div className="sidebar__history">
        <h4 className="sidebar__section-title">Chat History</h4>

        {sessions.length === 0 && (
          <p className="sidebar__empty">No conversations yet</p>
        )}

        {sessions.map((session) => (
          <div
            key={session.id}
            className={`sidebar__item ${session.id === activeSessionId ? "sidebar__item--active" : ""}`}
            onClick={() => onSelectSession(session.id)}
            id={`session-${session.id}`}
          >
            <div className="sidebar__item-content">
              <MessageSquare size={16} style={{ flexShrink: 0 }} />
              <span className="sidebar__question" title={session.title}>
                {session.title}
              </span>
            </div>
            <button
              className="sidebar__delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              title="Delete Chat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="sidebar__user-name">{userName || "User"}</span>
        </div>
        <button className="sidebar__logout" onClick={onLogout} title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
