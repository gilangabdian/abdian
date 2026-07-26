"use client";

import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Link from "next/link";
import { Profile } from "@/types";

interface AboutClientProps {
  initialProfile: Profile | null;
}

export default function AboutClient({ initialProfile }: AboutClientProps) {
  const [profile] = useState<Profile | null>(initialProfile);

  useEffect(() => {
    NProgress.done();
  }, []);

  return (
    <div className="min-h-screen mb-40">
      <section className="-mt-20 md:-mt-12 min-h-screen flex justify-center py-24 px-4 sm:px-6 font-sans text-black dark:text-white">
        <div className="container max-w-[650px] w-full flex flex-col space-y-12 mt-10 mx-auto">
          {/* About Section */}
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-black dark:text-white">Gilang Abdian</h1>

            <div className="space-y-6 text-sm md:text-base text-neutral-700 dark:text-neutral-400 font-normal leading-relaxed">
              <p>
                Hi, I'm Gilang Abdian Anggara. While my background covers the full stack of web development, my true
                passion and current focus are deeply rooted in Frontend Development. I love the challenge of turning
                complex logic into something beautiful, intuitive, and easy for people to use.
              </p>
              <p>
                I am dedicated to crafting digital experiences that are not just visually stunning, but also fast,
                accessible, and seamless. For me, great frontend work is about more than just aesthetics; it's about
                writing clean, maintainable code and building interfaces that feel natural on any device. My goal is to
                transform complex ideas into smooth, high-performance web applications that stay relevant as technology
                evolves.
              </p>

              <p>
                Outside of programming, I write{" "}
                <Link
                  href="/blog"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  blogs
                </Link>{" "}
                about coding, technology, etc. Also trying to make{" "}
                <a
                  href="https://www.youtube.com/@jeezfay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  YouTube videos
                </a>{" "}
                and fill it with some of challenge coding, sometimes share I play guitar and singing, sometimes I also
                share my drawings. I post my{" "}
                <Link
                  href="/artworks"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  drawings on this page.
                </Link>{" "}
                Also, I am constantly finding new ways to blend technology with creativity to stay inspired.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
