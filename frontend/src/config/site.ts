const getSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://abdian.my.id";
  }
  return "http://localhost:3000";
};

export const SITE_URL = getSiteUrl().replace(/\/$/, "");

export const siteConfig = {
  name: "Gilang Abdian",
  url: SITE_URL,
  ogImage: `${SITE_URL}/hide-tokyo-ghoul.png`,
  icon: `${SITE_URL}/icon.svg`,
  description:
    "Hello World from Gilang Abdian. He is a software engineer who loves to experiment. In his free time, he enjoys contributing to open-source projects.",
  keywords:
    "Gilang Abdian, Software Engineer, Gilang, Abdian, gilangabdian, gilang, abdian, personal website, Personal Website, gilang abdian, software engineer, Portfolio",
  authors: [{ name: "Gilang Abdian" }],
  links: {
    github: "https://github.com/gilangabdian",
  },
  verification: {
    google: "imoTslMebB5ymnOOV5_kyPf4iP_tG2fQWgZyNZDWocM",
  },
};
