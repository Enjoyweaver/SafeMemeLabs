import styles from "./navbar.module.css";

import Link from "next/link";

import { useState } from "react";

const menuItems = [
  {
    label: "Degenerator",
    links: [
      { text: "Degenerator", href: "/app/factory" },
      { text: "My Tokens", href: "/app/mytokens" },
    ],
  },
  {
    label: "Multisender",
    links: [{ text: "Token Multisender", href: "/app/multisender" }],
  },
];

export const MobileNav = () => {
  const [menusOpen, setMenusOpen] = useState<boolean[]>([false, false]);

  const toggleMenu = (index: number) => {
    if (!menusOpen[index]) {
      const updatedMenusOpen: boolean[] = [];
      updatedMenusOpen[index] = !updatedMenusOpen[index];
      setMenusOpen(updatedMenusOpen);
    } else {
      const updatedMenusOpen: boolean[] = [];
      setMenusOpen(updatedMenusOpen);
    }
  };

  return (
    <div className={styles.navbar}>
      {menuItems.map((item, index) => (
        <div key={index} className={styles.navbarOptionsContainer}>
          <div
            className={`${styles.navLeft} ${styles.navbarLi} ${styles.active}`}
            onClick={() => toggleMenu(index)}
          >
            <p className={`${styles.connectText} ${styles.toHide}`}>
              {item.label}
            </p>
          </div>
          <div
            className={`${styles.dropdown} ${
              menusOpen[index]
                ? styles.connectMenuOpen
                : styles.connectMenuClosed
            }`}
          >
            {item.links.map((link, linkIndex) => (
              <Link key={linkIndex} href={link.href}>
                <p className={styles.dropdownOption}>{link.text}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
