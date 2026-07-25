"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
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

  useLayoutEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('has_seen_intro') === 'true') {
      document.documentElement.classList.add('skip-intro');
      setHasSeenIntro(true);
    }
  }, []);

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
      setTimeout(() => ScrollTrigger.refresh(), 200);
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
          setTimeout(() => ScrollTrigger.refresh(), 200);
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

  // Removed GSAP Stacking Animation per user request because it caused visual bugs in Next.js

  return (
    <div className="min-h-screen bg-transparent font-sans overflow-x-hidden flex flex-col pb-24 md:pb-0" ref={containerRef}>
      
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

        {profile?.about?.show_tech_on_home !== false && (
          <Tech skills={skills} profile={profile} />
        )}

        {profile?.about?.show_featured_projects_on_home !== false && (
          <div className="relative z-0">
            <FeaturedProject projects={projects} />
          </div>
        )}

        {profile?.about?.show_featured_certificates_on_home !== false && (
          <div className="relative z-10">
            <FeaturedCertificate certificates={certificates} />
          </div>
        )}

        {profile?.about?.show_experiences_on_home !== false && experiences && experiences.length > 0 && (
          <div className="relative z-20">
            <Experience experiences={experiences} />
          </div>
        )}
      </div>
    </div>
  );
}
