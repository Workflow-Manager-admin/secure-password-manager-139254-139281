import React from "react";
import "./Modal.css";

/**
 * Minimal modal alert for error/info confirmations
 * PUBLIC_INTERFACE
 */
export default function Modal({ show, title, message, onConfirm }) {
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3 className="modal-title">{title}</h3>
        <div className="modal-message">{message}</div>
        <button className="modal-ok" onClick={onConfirm || (() => {})}>
          OK
        </button>
      </div>
    </div>
  );
}
