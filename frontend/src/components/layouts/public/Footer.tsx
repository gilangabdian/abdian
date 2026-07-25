"use client";

export default function Footer() {
  return (
    <footer className="bg-transparent text-black dark:text-white relative pt-16 pb-8 lg:pb-8 px-8 flex flex-col items-center justify-end z-50 transition-colors duration-300">
      <div className="text-sm font-sans text-neutral-500 dark:text-neutral-400">&copy; {new Date().getFullYear()} Gilang Abdian</div>
    </footer>
  );
}
