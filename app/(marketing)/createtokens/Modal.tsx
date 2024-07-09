// Modal.tsx
import React from "react"

import styles from "./Modal.module.css"

interface ModalProps {
  show: boolean
  message: string
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({ show, message, onClose }) => {
  if (!show) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <p>{message}</p>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  )
}

export default Modal
