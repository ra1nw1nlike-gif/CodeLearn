import React from "react";
import "./progress.css";

function ProgressBar({ value = 0 }) {
  return (
    <div className="progress-wrapper">
      <div className="progress-info">
        <span>Прогрес курсу</span>
        <span>{value}%</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
