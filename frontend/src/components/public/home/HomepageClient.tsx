"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import NProgress from "nprogress";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { logVisitor } from "@/lib/api/visitor";

import Hero from "./Hero";
import Tech from "./Tech";
import FeaturedProject from "./FeaturedProject";
import FeaturedCertificate from "./FeaturedCertificate";
import Experience from "./Experience";
import InitialLoadingScreen from "@/components/global/InitialLoadingScreen";
import { Profile, Skill, Project, Certificate, Experience as ExperienceType } from "@/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface HomepageClientProps {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  experiences: ExperienceType[];
}

export default function HomepageClient({
  profile,
  skills,
  projects,
  certificates,
  experiences,
}: HomepageClientProps) {
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const projectSectionRef = useRef<HTMLDivElement>(null);
  const certificateSectionRef = useRef<HTMLDivElement>(null);

  // Initialize Visitor Tracking
  useEffect(() => {
    async function initVisitorTracking() {
      try {
        let deviceId = localStorage.getItem("device_id");

        if (!deviceId) {
          const fp = await fpPromise.load();
          const result = await fp.get();
          deviceId = result.visitorId;
          localStorage.setItem("device_id", deviceId);
        }

        let locationData = {};
        try {
          const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
          const geoData = await geoRes.json();
          if (geoData.ip) {
            locationData = {
              ip_address: geoData.ip,
              city: geoData.city,
              region: geoData.region,
              country: geoData.country,
              isp: geoData.organization_name || geoData.organization,
            };
          }
        } catch (geoErr) {
          console.warn("Failed to fetch GeoIP from client", geoErr);
        }

        logVisitor(deviceId as string, locationData).catch((err) =>
          console.error("Failed to log visitor", err)
        );
      } catch (err) {
        console.error("Failed to initialize FingerprintJS", err);
        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("device_id", deviceId);
        }
        logVisitor(deviceId as string).catch((err) => console.error("Failed to log visitor", err));
      }
    }

    initVisitorTracking();
  }, []);

  // Handle Intro Screen Logic
  useEffect(() => {
    const isReturningVisitor = sessionStorage.getItem("has_seen_intro") === "true";
    
    // Jika sudah pernah melihat di tab ini, langsung hilangkan dari React DOM
    if (isReturningVisitor) {
      setHasSeenIntro(true);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent("content-loaded"));
      return;
    }

    let percent = 0;
    
    // Animasi selalu pelan (300ms) untuk mensimulasikan Vue behavior di tab baru
    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 3) + 1;
      if (percent > 95) percent = 95;
      setLoadingPercent(percent);
    }, 300);

    const preloadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        if (!url) {
          resolve();
          return;
        }
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    };

    const finalizeLoading = () => {
      clearInterval(interval);
      setLoadingPercent(100);
      NProgress.done();
      
      setTimeout(() => {
        setIsFadingOut(true); 
        setTimeout(() => {
          setIsLoading(false);
          setHasSeenIntro(true);
          sessionStorage.setItem("has_seen_intro", "true");
          window.dispatchEvent(new CustomEvent("content-loaded"));
        }, 500); 
      }, 850); 
    };

    // Simulasi pengambilan API (1500ms) seperti Vue agar loadingnya jalan
    setTimeout(() => {
      if (profile?.about?.photo_url) {
        preloadImage(profile.about.photo_url).then(() => {
          finalizeLoading();
        });
      } else {
        finalizeLoading();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [profile?.about?.photo_url]);

  // Setup GSAP Stacking Animation
  useGSAP(
    () => {
      if (isLoading) return; 

      const projectEl = projectSectionRef.current;
      const certEl = certificateSectionRef.current;

      if (projectEl && certEl) {
        gsap.set([projectEl, certEl], {
          willChange: "transform, position",
        });

        gsap.set(certEl, {
          position: "relative",
          zIndex: 10,
        });

        gsap.to(projectEl, {
          opacity: 0.4,
          scale: 0.97,
          ease: "none",
          scrollTrigger: {
            trigger: projectEl,
            start: "bottom bottom",
            end: "bottom 30%",
            scrub: 0.6,
          },
        });

        ScrollTrigger.create({
          trigger: projectEl,
          start: () => (window.innerWidth < 768 ? "bottom bottom-=120px" : "bottom bottom"),
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          pinType: "fixed",
          fastScrollEnd: true,
        });

        // Trigger refresh after setting up
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }
    },
    { dependencies: [isLoading], scope: containerRef }
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-x-hidden flex flex-col pb-24 md:pb-0" ref={containerRef}>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (sessionStorage.getItem('has_seen_intro') === 'true') {
              document.documentElement.classList.add('skip-intro');
            }
          `,
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .skip-intro #initial-loader-overlay {
              display: none !important;
            }
            .skip-intro #main-content-wrapper {
              opacity: 1 !important;
              height: auto !important;
              overflow: visible !important;
              animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
            }
          `,
        }}
      />

      {/* Overlay Animasi 0-100% Selalu Render dari SSR (tapi disembunyikan CSS jika refresh) */}
      {!hasSeenIntro && (
        <div id="initial-loader-overlay">
          <InitialLoadingScreen percent={loadingPercent} isFadingOut={isFadingOut} />
        </div>
      )}

      {/* Konten Web */}
      <div 
        id="main-content-wrapper"
        className={`transition-opacity duration-500 ${hasSeenIntro || isFadingOut ? "opacity-100 animate-in" : "opacity-0 h-screen overflow-hidden"}`}
      >
        <Hero profile={profile} />
        <Tech skills={skills} profile={profile} />

        <div ref={projectSectionRef} className="relative z-0">
          <FeaturedProject projects={projects} />
        </div>

        <div ref={certificateSectionRef} className="relative z-10 bg-white">
          <FeaturedCertificate certificates={certificates} />
        </div>

        {experiences && experiences.length > 0 && (
          <div className="relative z-20 bg-white">
            <Experience experiences={experiences} />
          </div>
        )}
      </div>
    </div>
  );
}
