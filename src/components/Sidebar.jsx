import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, onToggle }) => {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`bg-white border-end position-fixed top-0 start-0 vh-100 p-3
          ${isOpen ? "d-block" : "d-none"} d-md-block`}
        style={{ width: "250px", zIndex: 1040 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">💰 ExpenseNav</h5>
          {/* Close button only visible on mobile */}
          <button
            className="btn btn-sm btn-outline-secondary d-md-none"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link" to="/dashboard" onClick={onToggle}>
              <i className="bi bi-house-door-fill me-2"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/income" onClick={onToggle}>
              <i className="bi bi-cash-coin me-2"></i> Income
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/expenses" onClick={onToggle}>
              <i className="bi bi-cart-check-fill me-2"></i> Expenses
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/calendar" onClick={onToggle}>
              <i className="bi bi-calendar2-event-fill me-2"></i> Calendar
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/settings" onClick={onToggle}>
              <i className="bi bi-gear-fill me-2"></i> Settings
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/import-excel" onClick={onToggle}>
              <i className="bi bi-file-earmark-arrow-up-fill me-2"></i> Import Excel
            </Link>
          </li>
        </ul>
      </div>

      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-md-none"
          onClick={onToggle}
          style={{ zIndex: 1030 }}
        />
      )}
    </>
  );
};

export default Sidebar;
