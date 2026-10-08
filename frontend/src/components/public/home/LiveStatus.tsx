"use client";

import { useEffect, useState, useRef } from "react";

interface LiveStatusProps {
  statusMessage?: string;
  lastUpdatedAt?: string;
  locationTimezone?: string;
  isStatusScheduleEnabled?: boolean;
  statusScheduleDays?: number[];
  statusScheduleStartTime?: string;
  statusScheduleEndTime?: string;
  statusMessageActive?: string;
  statusMessageInactive?: string;
}

function timeAgoCustom(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 0) return "just now";

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval >= 1) {
    const days = Math.floor(interval);
    return days === 1 ? "1 day ago" : days + " days ago";
  }

  interval = seconds / 3600;
  if (interval >= 1) {
    const hours = Math.floor(interval);
    return hours === 1 ? "1 hour ago" : hours + " hours ago";
  }

  interval = seconds / 60;
  if (interval >= 1) {
    const minutes = Math.floor(interval);
    return minutes === 1 ? "1 minute ago" : minutes + " minutes ago";
  }

  return Math.floor(seconds) < 10 ? "just now" : Math.floor(seconds) + " seconds ago";
}

export default function LiveStatus({
  statusMessage,
  lastUpdatedAt,
  locationTimezone = "Asia/Jakarta",
  isStatusScheduleEnabled,
  statusScheduleDays,
  statusScheduleStartTime,
  statusScheduleEndTime,
  statusMessageActive,
  statusMessageInactive,
}: LiveStatusProps) {
  const [localTime, setLocalTime] = useState("");
  const [effectiveStatus, setEffectiveStatus] = useState<string>("");
  const [effectiveLastUpdated, setEffectiveLastUpdated] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [hue, setHue] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHue(Math.floor(Math.random() * 360));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const pulseColor = `hsl(${hue}, 80%, 60%)`;
  const borderColor = `hsl(${hue}, 80%, 40%)`;

  useEffect(() => {
    setMounted(true);
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);

    function updateTime() {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: locationTimezone,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "shortOffset",
          hour12: true,
        });
        setLocalTime(formatter.format(now));

        if (isStatusScheduleEnabled) {
          const formatterTZ = new Intl.DateTimeFormat("en-US", {
            timeZone: locationTimezone,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
          });
          const tzString = formatterTZ.format(now);
          const tzDate = new Date(tzString);
          
          const currentDay = tzDate.getDay();
          const currentHour = tzDate.getHours();
          const currentMinute = tzDate.getMinutes();
          const currentSecs = tzDate.getSeconds();

          const startParts = (statusScheduleStartTime || "00:00").split(':').map(Number);
          const endParts = (statusScheduleEndTime || "00:00").split(':').map(Number);
          
          const startTotalSecs = startParts[0] * 3600 + startParts[1] * 60;
          const endTotalSecs = endParts[0] * 3600 + endParts[1] * 60;
          const currentTotalSecs = currentHour * 3600 + currentMinute * 60 + currentSecs;

          const activeDays = (statusScheduleDays || []).map(Number);
          const isActive = activeDays.includes(currentDay) && currentTotalSecs >= startTotalSecs && currentTotalSecs < endTotalSecs;

          if (isActive) {
            setEffectiveStatus(statusMessageActive || "Active");
            const diffSecs = currentTotalSecs - startTotalSecs;
            const realFlipTime = new Date(now.getTime() - (diffSecs * 1000));
            setEffectiveLastUpdated(realFlipTime.toISOString());
          } else {
            setEffectiveStatus(statusMessageInactive || "Inactive");
            
            let lastEndDiffSecs = 0;
            if (activeDays.includes(currentDay) && currentTotalSecs >= endTotalSecs) {
               lastEndDiffSecs = currentTotalSecs - endTotalSecs;
            } else {
               let daysBack = 1;
               while (daysBack <= 7) {
                 const checkDay = (currentDay - daysBack + 7) % 7;
                 if (activeDays.includes(checkDay)) break;
                 daysBack++;
               }
               if (daysBack <= 7) {
                  const secondsPassedToday = currentTotalSecs;
                  const secondsInPreviousDays = (daysBack - 1) * 86400;
                  const secondsFromEndToMidnight = 86400 - endTotalSecs;
                  lastEndDiffSecs = secondsPassedToday + secondsInPreviousDays + secondsFromEndToMidnight;
               }
            }
            const realFlipTime = new Date(now.getTime() - (lastEndDiffSecs * 1000));
            setEffectiveLastUpdated(realFlipTime.toISOString());
          }
        } else {
           setEffectiveStatus(statusMessage || "");
           setEffectiveLastUpdated(lastUpdatedAt || "");
        }
      } catch {
        setLocalTime("Time unavailable");
      }
    }
  }, [locationTimezone, isStatusScheduleEnabled, statusScheduleDays, statusScheduleStartTime, statusScheduleEndTime, statusMessageActive, statusMessageInactive, statusMessage, lastUpdatedAt]);

  if (!mounted || !effectiveStatus) return null;

  const timeAgo = effectiveLastUpdated ? timeAgoCustom(effectiveLastUpdated) : "recently";

  return (
    <div
      ref={containerRef}
      className="relative inline-block font-sans"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}>
      <div className="flex items-center justify-center p-1.5">
        <div className="relative flex h-2.5 w-2.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: pulseColor }}></span>
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: pulseColor }}></span>
        </div>
      </div>

      {/* Popup */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 pb-2 w-max min-w-[140px] transition-all duration-300 z-50 ${isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1"}`}>
        <div
          className="bg-white dark:bg-dark-bg text-black dark:text-white border rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.05)] p-2 flex flex-col gap-0.5 relative"
          style={{ borderColor: borderColor }}>
          <div className="font-bold text-xs">{effectiveStatus}</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{timeAgo}</div>

          <hr className="my-1 border-t" style={{ borderColor: borderColor }} />

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500">Local Time</span>
            <span className="text-[10px] font-mono font-bold">{localTime}</span>
          </div>

          {/* Triangle arrow */}
          <div
            className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-dark-bg border-b border-r rotate-45"
            style={{ borderColor: borderColor }}></div>
        </div>
      </div>
    </div>
  );
}
