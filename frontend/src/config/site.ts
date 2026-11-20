export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://abdian.my.id"
).replace(/\/$/, "");

export const siteConfig = {
  name: "Gilang Abdian",
  url: SITE_URL,
  ogImage: `${SITE_URL}/hide-tokyo-ghoul.png`,
  icon: `${SITE_URL}/icon.svg`,
  description:
    "Hello, World!",
  keywords:
    "Gilang Abdian, Software Engineer, Gilang, Abdian, gilangabdian, gilang, abdian, personal website, Personal Website, gilang abdian, software engineer, open-source",
  authors: [{ name: "Gilang Abdian" }],
  links: {
    github: "https://github.com/gilangabdian",
  },
  verification: {
    google: [
      "imoTslMebB5ymnOOV5_kyPf4iP_tG2fQWgZyNZDWocM",  // abdian.my.id
      "FnSR5V_A9QHTGt_cKUdziQtpTBvFqG4_aBz5-m-iHGc", // abdian.vercel.app (selama Change of Address aktif)
    ]
  },
};
