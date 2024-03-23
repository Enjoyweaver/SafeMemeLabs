import { DocsConfig } from "types"

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Guides",
      href: "/guides",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Welcome",
          href: "/docs",
        },
      ],
    },

    {
      title: "Safe Memes",
      href: "/docs/documentation/centralized",
      items: [
        {
          title: "Introduction",
          href: "/docs/documentation",
        },
      ],
    },
  ],
}
