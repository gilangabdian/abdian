interface Project {
  id: number;
  name: string;
  url: string;
  desc: string;
}

export default function SimpleProjectPage() {
  const projects: Project[] = [
    {
      id: 1,
      name: "What time is it?",
      url: "https://gilangabdian.github.io/what-time-is-it/",
      desc: "get time based on your timezone ",
    },
    {
      id: 2,
      name: "Etch-a-Sketch",
      url: "https://gilangabdian.github.io/etch-a-sketch/",
      desc: "etch-a-sketch but in web",
    },
    {
      id: 3,
      name: "Calculator",
      url: "https://gilangabdian.github.io/simple-calculator/",
      desc: "just support basic math operation",
    },
    {
      id: 4,
      name: "Library",
      url: "https://gilangabdian.github.io/library/",
      desc: "simple app library",
    },
    {
      id: 5,
      name: "Rock Paper Scissors",
      url: "https://gilangabdian.github.io/rock-paper-scissors/",
      desc: "play rock paper scissors with your computer",
    },
  ];
  return (
    <div className="min-h-screen mb-40">
      <section className="-mt-20 md:-mt-2 min-h-screen flex justify-center py-24 px-8 sm:px-6 font-sans text-black dark:text-white">
        <div className="container max-w-[650px] w-full flex flex-col space-y-12 mt-10 mx-auto">
          {projects.map((project) => (
            <div key={project.id}>
              <a
                className="underline text-black dark:text-white decoration-black/20 hover:decoration-black dark:decoration-white/20 dark:hover:decoration-white underline-offset-4 transition-all duration-300"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer">
                {project.name}
              </a>
              <p className="text-sm pd-4 md:pt-1  md:text-base text-neutral-700 dark:text-neutral-400 font-normal leading-relaxed">
                {project.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
