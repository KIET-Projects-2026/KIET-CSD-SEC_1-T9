import React, { useState } from "react";
import "./QuizCard.css";

export default function QuizCard({ question, options, answer, questionNumber }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (key) => {
    if (selected) return; // already answered
    setSelected(key);
  };

  const getOptionClass = (key) => {
    if (!selected) return "quiz-option";
    if (key === answer) return "quiz-option quiz-option--correct";
    if (key === selected) return "quiz-option quiz-option--wrong";
    return "quiz-option quiz-option--dimmed";
  };

  return (
    <div className="quiz-card">
      <div className="quiz-card__header">
        <span className="quiz-card__number">Q{questionNumber}</span>
        <p className="quiz-card__question">{question}</p>
      </div>
      <div className="quiz-card__options">
        {options.map((opt) => (
          <button
            key={opt.key}
            className={getOptionClass(opt.key)}
            onClick={() => handleSelect(opt.key)}
            disabled={!!selected}
            id={`quiz-opt-${questionNumber}-${opt.key}`}
          >
            <span className="quiz-option__key">{opt.key}</span>
            <span className="quiz-option__text">{opt.text}</span>
            {selected && opt.key === answer && (
              <span className="quiz-option__badge">✓ Correct</span>
            )}
            {selected && opt.key === selected && opt.key !== answer && (
              <span className="quiz-option__badge quiz-option__badge--wrong">✗ Wrong</span>
            )}
          </button>
        ))}
      </div>
      {selected && (
        <div className={`quiz-card__feedback ${selected === answer ? "quiz-card__feedback--correct" : "quiz-card__feedback--wrong"}`}>
          {selected === answer
            ? "🎉 Correct! Well done."
            : `❌ Incorrect. The correct answer is ${answer}.`}
        </div>
      )}
    </div>
  );
}
