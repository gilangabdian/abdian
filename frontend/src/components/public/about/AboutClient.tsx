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

  // Static date — this content is hardcoded, so the date should not auto-update
  const formattedDate: string = "July 27, 2026";

  useEffect(() => {
    NProgress.done();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="-mt-12 md:-mt-2 min-h-screen flex justify-center py-24 px-4 sm:px-6 font-sans text-black dark:text-white">
        <div className="container max-w-[650px] w-full flex flex-col space-y-12 mt-10 mx-auto">
          {/* About Section */}
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide text-black dark:text-white">
              Please introduce yourself
            </h1>
            <span className="text-sm md:text-base text-neutral-500 dark:text-neutral-500">
              Last updated on {formattedDate}
            </span>
            <span className="flex my-6 items-center border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 py-1 text-sm md:text-base text-neutral-400 dark:text-neutral-500">
              Please note, this is going to be very long, so I wouldn't be surprised if you get bored. Feel free to move
              on to another page if you wish.
            </span>

            <div className="space-y-6 mt-4 text-sm md:text-base text-neutral-700 dark:text-neutral-400 font-normal leading-relaxed">
              <p>
                Hello, I am Gilang Abdian, based in Indonesia. I began learning programming by enrolling in the
                Informatics Engineering Diploma program at Universitas Sebelas Maret in 2024, and I am currently in my
                final year (time flies so fast). I've been to college before, but I decided to change majors because I
                felt like I'd chosen the wrong major in the past and decided to pursue a field I found interesting. (I
                hope I'll be more careful in making decisions in the future). Since then, I’ve met many new friends who
                are younger than me—something that doesn't bother me, even though people say I started late (I ignore
                such comments because I’m the one living my life, not them). What does bother me, however, is feeling a
                bit envious of friends who began learning programming back in vocational or high school, whereas I’m
                just getting started. Therefore, I felt I needed to study programming harder and not just rely on the
                lecturer's material. I had to step out of my comfort zone and start learning independently, learning
                various things, from algorithms and computational thinking to various programming languages, and so on.
                While still studying the material provided by the lecturer.
              </p>
              <p>
                At first, I felt overwhelmed by all the new concepts. To make matters more challenging, most
                documentation was in English; this meant that alongside programming, I had to learn English as well
                (though I can currently understand the meaning, I’m not yet fluent enough to speak it). It took quite a
                while for me to adapt and find enjoyment in the process. I discovered that something which seemed
                exciting—under the assumption that "if it's exciting, it must be easy"—was actually far more challenging
                than I had imagined. Eventually, I had to rethink my approach to avoid feeling burdened and to start
                enjoying the journey.{" "}
              </p>
              <p>
                I realized that mastering every aspect of programming was impossible, so I decided to focus on the
                specific areas that truly aligned with my passion. I had previously experimented with a wide range of
                topics—coding basics, web design, languages ​​like Java, PHP, JavaScript, Go, and C#, as well as backend
                and frontend development. After weighing my options, I decided to specialize in frontend development
                (focusing on the application's visual interface).
              </p>
              <p>
                I chose this path because I experience genuine joy when bringing ideas to life and seeing the results
                firsthand. This sense of satisfaction motivates me to continue exploring the vast world of frontend
                development—a field teeming with various libraries and frameworks. Among the most prominent are{" "}
                <a
                  href="https://react.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  React
                </a>{" "}
                and{" "}
                <a
                  href="https://vuejs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  Vue.js
                </a>
                , both of which I have studied. There are also other technologies—such as{" "}
                <a
                  href="https://angular.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  Angular
                </a>{" "}
                and{" "}
                <a
                  href="https://svelte.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  Svelte
                </a>
                —that I am currently only familiar with by name, and this list will likely keep growing in the future.
              </p>
              <p>
                To avoid confusion and feeling overwhelmed by the vast scope of frontend development—as I mentioned
                earlier—I decided to narrow my focus to just three things:{" "}
                <a
                  href="https://react.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  React
                </a>{" "}
                (a collection of JavaScript code),{" "}
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  Next.js
                </a>{" "}
                (built on top of React), and{" "}
                <a
                  href="https://www.typescriptlang.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  TypeScript
                </a>{" "}
                (statically typed JavaScript that helps catch errors before the program runs). Don't misunderstand me by
                assuming that if I focus on front-end development, I won't learn anything else. That's not true. I'll
                also keep up with developments in other technology fields, though not as deeply as front-end
                development.
              </p>
              <p></p>
              <p>
                In case you are interested, here are some{" "}
                <Link
                  href="/projects/simple"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  simple projects or experiment I worked on when I first started learning programming
                </Link>{" "}
                (mostly using HTML, CSS, and JavaScript, although some also used the React and Vue.js frameworks).
              </p>
              <p>
                Outside of programming, I also often draw, but lately my hobby has started to fade. I used to feel
                relaxed doodling and drawing, both on paper and digitally, but that feeling has faded. However, I used
                to create some unique characters of my own and some are just redraws of anime characters that you may
                have watched as a child or are still watching them now.I post some of{" "}
                <Link
                  href="/artworks"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  my artwork on this page
                </Link>{" "}
                . Since I often took pictures of my drawings after finishing my drawings, I think I indirectly learned a
                new skill, namely photography. That motivated me to start photographing other subjects as well, and I{" "}
                <Link
                  href="/photos"
                  className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300">
                  post those photos
                </Link>{" "}
                here.
              </p>

              <p>Besides that, I can play the guitar a little.</p>

              <p className="mt-24">Thank you for reading this boring introduction of mine!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
