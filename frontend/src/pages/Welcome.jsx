import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, BookOpen, CheckCircle, FileText } from "lucide-react";
import "./Welcome.css";

export default function Welcome() {
  return (
    <div className="welcome">
      <div className="welcome__container">
        {/* Left Left - Copy */}
        <div className="welcome__content">
          <div className="welcome__brand">
            <BrainCircuit size={48} className="welcome__icon" />
            <h1>AI Study Buddy</h1>
          </div>
          
          <h2 className="welcome__slogan">
            Your intelligent learning companion.
          </h2>
          
          <p className="welcome__description">
            Understand complex concepts, generate study notes, practice with AI generated quizzes, and boost your knowledge seamlessly.
          </p>

          <div className="welcome__features">
            <div className="welcome__feature">
              <BookOpen size={20} />
              <span>Interactive Learning</span>
            </div>
            <div className="welcome__feature">
              <FileText size={20} />
              <span>Smart Notes Gen</span>
            </div>
            <div className="welcome__feature">
              <CheckCircle size={20} />
              <span>Auto Quizzes</span>
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="welcome__actions-container">
          <div className="welcome__actions-card">
            <h3>Get Started</h3>
            <p>Join thousands of students learning smarter, not harder.</p>
            
            <Link to="/register" className="welcome__btn welcome__btn--primary">
              Sign Up
            </Link>
            
            <Link to="/login" className="welcome__btn welcome__btn--secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
