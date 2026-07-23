'use client';

import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence, Variants } from 'motion/react';

import { Skill, Profile } from '@/types';

interface TechProps {
  skills: Skill[];
  profile: Profile | null;
}

export default function Tech({ skills = [], profile = null }: TechProps) {
  const hiddenCategories = profile?.about?.hidden_skill_categories || [];
  const customOrder = profile?.about?.skill_categories_order || [];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isUserChanged, setIsUserChanged] = useState(false);

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

  const headerVariants: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 1, ease: 'easeOut' } }
  };

  const tabVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        type: 'spring',
        bounce: 0.5
      }
    })
  };

  return (
    <section className="py-24 px-4 md:px-10 bg-white dark:bg-[#121212] overflow-hidden min-h-screen relative">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20%' }}
          variants={headerVariants}
          className="header-section text-center mb-10 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-black text-black dark:text-white mb-6 font-[Playfair_Display] tracking-wider inline-block relative border-b border-black/20 dark:border-white/20 pb-2">
            <span className="relative z-10">Tech Stack</span>
          </h2>
        </motion.div>

        {/* FILTER TABS */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-15%' }}
          className="tabs-section flex md:flex-wrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-center md:justify-center gap-3 mb-16 pt-16 pb-2 snap-x -mt-16"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat}
              custom={i}
              variants={tabVariants}
              className="shrink-0 snap-center flex items-center justify-center relative hover:z-50"
            >
              <button
                onClick={() => handleCategoryClick(cat)}
                className={`px-5 py-2 rounded-full font-mono text-xs md:text-sm uppercase font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-black dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`}
              >
                {cat}

                <div className="relative group hidden md:flex items-center justify-center">
                  <Icon icon="lucide:info" className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  
                  {profile?.about?.skill_categories_info && profile.about.skill_categories_info[cat] && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-neutral-700 dark:bg-neutral-200 text-white dark:text-black text-[10px] md:text-xs px-3 py-1.5 rounded-md font-sans opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-50 shadow-xl text-center leading-tight normal-case cursor-default">
                      {profile.about.skill_categories_info[cat]}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-700 dark:bg-neutral-200 rotate-45"></div>
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* CARDS LIST */}
        <motion.div 
          className="cards-section min-h-[400px] relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-15%' }}
        >
          <motion.div className="flex flex-wrap justify-center gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16 p-4">
            <AnimatePresence mode="popLayout">
              {filteredSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, y: -50, transition: { duration: 0.3 } }}
                  transition={{ 
                    duration: 0.8, 
                    type: 'spring', 
                    bounce: 0.4,
                    delay: index * 0.05
                  }}
                  className={`relative group w-[45%] md:w-[28%] lg:w-[16%] max-w-[180px] ${getRotationClass(index)} ${getTranslateClass(index)}`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-100 dark:bg-neutral-300 rounded-full z-20 shadow-sm border border-gray-600 dark:border-neutral-500"></div>

                  <div className="bg-white dark:bg-[#1a1a1a] p-3 pb-8 border border-black/20 dark:border-white/10 shadow-sm transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-md hover:rotate-0 cursor-default rounded-sm relative">
                    <div className="aspect-square bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/5 mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-white dark:group-hover:bg-[#222222] transition-colors rounded-sm">
                      <Icon icon={skill.identifier} className="w-12 h-12 md:w-14 md:h-14 text-black dark:text-white relative z-10" />

                      {skill.note && (
                        <div className="absolute bottom-1 right-1 z-20">
                          <span className="text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm text-[8px] md:text-[9px] font-mono px-1.5 py-0.5 rounded-sm">
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
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {filteredSkills.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <p className="font-mono text-gray-400 font-bold uppercase">No skills found in this category.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
