'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Skill, Profile } from '@/types';
import { Icon } from '@iconify/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TechProps {
  skills: Skill[];
  profile: Profile | null;
}

export default function Tech({ skills = [], profile = null }: TechProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const hiddenCategories = profile?.about?.hidden_skill_categories || [];
  const customOrder = profile?.about?.skill_categories_order || [];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isUserChanged, setIsUserChanged] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category || 'Frontend'));
    const uniqueCats = Array.from(cats);
    const visibleCats = uniqueCats.filter((cat) => !hiddenCategories.includes(cat));

    visibleCats.sort((a, b) => {
      const indexA = customOrder.indexOf(a);
      const indexB = customOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return visibleCats;
  }, [skills, hiddenCategories, customOrder]);

  useEffect(() => {
    if (profile && !isUserChanged) {
      if (profile.about?.default_skill_category) {
        setActiveCategory(profile.about.default_skill_category);
      } else if (categories.length > 0) {
        setActiveCategory(categories[0]);
      }
    }
  }, [profile, isUserChanged, categories]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setIsUserChanged(true);
  };

  const filteredSkills = useMemo(() => {
    const activeSkills = skills.filter((s) => s.is_active_on_home !== 0 && s.is_active_on_home !== false);
    if (!activeCategory) return activeSkills;
    return activeSkills.filter((s) => (s.category || 'Frontend') === activeCategory);
  }, [skills, activeCategory]);

  const getRotationClass = (index: number) => {
    const rotations = ['rotate-2', '-rotate-1', 'rotate-3', '-rotate-2', 'rotate-1', '-rotate-3', 'rotate-0'];
    return rotations[index % rotations.length];
  };

  const getTranslateClass = (index: number) => {
    const translates = ['translate-y-0', 'translate-y-2', 'translate-y-0', '-translate-y-2'];
    return translates[index % translates.length];
  };

  useGSAP(() => {
    // Header Animation
    gsap.set(".header-animate", { y: 50, opacity: 0 });
    gsap.to(".header-animate", {
      scrollTrigger: {
        trigger: ".header-section",
        start: "top 80%",
        once: true,
      },
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
    });

    // Tabs Animation
    gsap.set(".tab-pill", { scale: 0.8, opacity: 0 });
    gsap.to(".tab-pill", {
      scrollTrigger: {
        trigger: ".tabs-section",
        start: "top 85%",
        once: true,
      },
      scale: 1,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.5)",
    });

    // Cards render trigger
    ScrollTrigger.create({
      trigger: ".cards-section",
      start: "top 85%",
      once: true,
      onEnter: () => {
        setIsVisible(true);
      },
    });
  }, { scope: containerRef });

  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  // Handle entry animation for cards
  const prevSkillsCountRef = useRef(0);
  useEffect(() => {
    if (!isVisible) return;
    
    // We animate all currently rendered cards when filteredSkills changes
    const cards = gsap.utils.toArray('.polaroid-card') as HTMLElement[];
    if (cards.length > 0) {
       gsap.fromTo(cards, 
         { opacity: 0, y: 100, scale: 0.8 },
         {
           opacity: 1, y: 0, scale: 1,
           duration: 1.2,
           ease: "elastic.out(1, 0.75)",
           stagger: 0.05,
           overwrite: "auto"
         }
       );
    }
  }, [filteredSkills, isVisible]);

  return (
    <section ref={containerRef} className="py-24 px-4 md:px-10 bg-white dark:bg-dark-bg overflow-hidden min-h-screen relative">
      <style>{`
        .header-animate, .tab-pill { will-change: transform, opacity; }
        .polaroid-card { will-change: transform, opacity; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="header-section text-center mb-10 max-w-3xl mx-auto">
          <h2 className="header-animate text-4xl font-black text-black dark:text-white mb-6 font-[Playfair_Display] tracking-wider inline-block relative border-b border-black/20 dark:border-white/20 pb-2">
            <span className="relative z-10">Tech Stack</span>
          </h2>
        </div>

        {/* FILTER TABS */}
        <div className="tabs-section flex md:flex-wrap overflow-x-auto hide-scrollbar justify-center md:justify-center gap-3 mb-16 pt-16 pb-2 snap-x -mt-16">
          {categories.map((cat) => (
            <div key={cat} className="shrink-0 snap-center flex items-center justify-center relative hover:z-50">
              <button
                onClick={() => handleCategoryClick(cat)}
                className={`tab-pill px-5 py-2 rounded-full font-mono text-xs md:text-sm uppercase font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-black dark:bg-neutral-800 dark:text-neutral-100/50 dark:hover:bg-neutral-700 dark:hover:text-white'
                }`}
              >
                {cat}
                <div className="relative group flex items-center justify-center hidden md:flex">
                  <Icon icon="lucide:info" className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  {profile?.about?.skill_categories_info && profile.about.skill_categories_info[cat] && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-neutral-700 dark:bg-neutral-400 text-white dark:text-black text-[10px] md:text-xs px-3 py-1.5 rounded-md font-sans opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-50 shadow-xl text-center leading-tight normal-case cursor-default">
                      {profile.about.skill_categories_info[cat]}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-700 dark:bg-neutral-400 rotate-45"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* CARDS LIST */}
        <div className="cards-section min-h-[400px] relative">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16 p-4">
            {isVisible && filteredSkills.map((skill, index) => (
              <div
                key={skill.id}
                data-index={index}
                className={`polaroid-card relative group w-[45%] md:w-[28%] lg:w-[16%] max-w-[180px] ${getRotationClass(index)} ${getTranslateClass(index)}`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-100 dark:bg-neutral-300 rounded-full z-20 shadow-sm border border-gray-600 dark:border-neutral-500"></div>

                <div className="bg-white dark:bg-[#1a1a1a] p-3 pb-8 border border-black/20 dark:border-white/10 shadow-sm transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-md hover:rotate-0 cursor-default rounded-sm relative">
                  <div className="aspect-square bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/5 mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-white dark:group-hover:bg-[#222222] transition-colors rounded-sm">
                    <Icon icon={skill.identifier} className="text-5xl md:text-[56px] text-black dark:text-white relative z-10" />

                    {skill.note && (
                      <div className="absolute bottom-1 right-1 z-20">
                        <span className="text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700/90 border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm text-[8px] md:text-[9px] font-mono px-1.5 py-0.5 rounded-sm">
                          {skill.note}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="font-serif font-bold text-black dark:text-white text-xs md:text-sm uppercase tracking-widest border-b border-transparent group-hover:border-black/20 dark:group-hover:border-white/20 transition-all pb-1">
                      {skill.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isVisible && filteredSkills.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-mono text-gray-400 font-bold uppercase">No skills found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
