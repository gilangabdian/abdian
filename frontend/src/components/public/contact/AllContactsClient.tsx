"use client";

import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import gsap from "gsap";

interface SocialMedia {
  id: string | number;
  platform_name: string;
  url: string;
  icon: string;
}

interface AllContactsClientProps {
  initialContacts: SocialMedia[];
}

export default function AllContactsClient({ initialContacts }: AllContactsClientProps) {
  const [contacts] = useState<SocialMedia[]>(initialContacts);

  useEffect(() => {
    NProgress.done();
    const timer = setTimeout(() => {
      animateEntrance();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const animateEntrance = () => {
    const tl = gsap.timeline();

    tl.fromTo(
      ".comic-title",
      { y: 20, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.6,
        ease: "back.out(1.5)",
      }
    );

    if (contacts.length > 0) {
      tl.fromTo(
        ".comic-panel",
        {
          y: 20,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.05,
          clearProps: "all",
        },
        "-=0.3"
      );
    }
  };

  return (
    <div className="-mt-16 mb-40 md:-mt-5 comic-container min-h-screen relative overflow-x-hidden text-black dark:text-white font-sans pb-60 md:pb-30">
      <style>{`
        .fade-enter-active,
        .fade-leave-active {
          transition: opacity 0.6s ease;
        }
        .fade-enter-from,
        .fade-leave-to {
          opacity: 0;
        }
      `}</style>
      
        <div className="container mx-auto px-6 py-20 md:py-28 relative z-10 max-w-2xl">
          <div className="mb-12 text-center comic-title" style={{ opacity: 0, visibility: "hidden" }}>
            <h1 className="anim-text text-2xl md:text-3xl font-bold tracking-wide text-black dark:text-white">Contacts</h1>
            <p className="mt-4 font-sans text-gray-700 dark:text-gray-300 text-sm md:text-base max-w-xl mx-auto italic">
              "Find me on"
            </p>
          </div>

          <div className="flex flex-wrap justify-center mt-8 gap-4 md:gap-6">
            {contacts.map((contact) => (
              <a
                key={contact.id}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="comic-panel group flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-300"
                style={{ opacity: 0, visibility: "hidden" }}
              >
                {contact.icon && (
                  <iconify-icon icon={contact.icon} className="w-4 h-4 md:w-5 md:h-5" />
                )}
                <span className="text-sm md:text-base capitalize">
                  {contact.platform_name}
                </span>
                <iconify-icon                  icon="mdi:arrow-top-right"
                  className="w-3 h-3 md:w-4 md:h-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                />
              </a>
            ))}
          </div>

          {contacts.length === 0 && (
            <div className="text-center py-10 bg-gray-50 dark:bg-zinc-900 border border-black/20 dark:border-white/20 border-dashed mt-8 rounded-lg shadow-sm">
              <iconify-icon icon="mdi:signal-off" className="text-4xl mx-auto mb-2 text-black dark:text-white" />
              <p className="text-lg font-bold uppercase tracking-wide text-black dark:text-white">NO SIGNAL DETECTED.</p>
            </div>
          )}
        </div>
    </div>
  );
}
