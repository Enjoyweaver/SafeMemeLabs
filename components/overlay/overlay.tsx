import { FC } from "react";
import styles from "./overlay.module.css";

interface OverlayProps {
    onClick: undefined | (() => void);
  }

export const Overlay: FC<OverlayProps> = ({ onClick }) => {
    return (
        <div onClick={onClick} className={styles.overlay}></div>
    )
}