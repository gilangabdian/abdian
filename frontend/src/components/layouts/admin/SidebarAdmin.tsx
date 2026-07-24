"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

export default function SidebarAdmin({
  isMobileOpen,
  onCloseMobile,
}: {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1000);

  const minWidth = 80;
  const maxWidth = 400;

  const menuItems = [
    { name: "Dashboard", icon: "lucide:layout-dashboard", route: "/admin/dashboard" },
    { name: "Profile", icon: "lucide:user", route: "/admin/profile" },
    { name: "Experiences", icon: "lucide:briefcase", route: "/admin/experiences" },
    { name: "Projects", icon: "lucide:folder-kanban", route: "/admin/projects" },
    { name: "Certificates", icon: "lucide:award", route: "/admin/certificates" },
    { name: "Skills", icon: "lucide:zap", route: "/admin/skills" },
    { name: "Artworks", icon: "lucide:palette", route: "/admin/artworks" },
    { name: "Photos", icon: "ri:camera-3-line", route: "/admin/photos" },
    { name: "Blogs", icon: "material-symbols-light:post-outline", route: "/admin/blogs" },
    { name: "Contacts", icon: "lucide:share-2", route: "/admin/contacts" },
  ];

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showContent = windowWidth < 768 || !isCollapsed;

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    if (windowWidth < 768) return;
    setIsResizing(true);
  };

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (isResizing) {
        let newWidth = e.clientX;
        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;
        setSidebarWidth(newWidth);
        setIsCollapsed(newWidth < 100);
      }
    };

    const stopResize = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", stopResize);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing]);

  const handleSidebarToggle = () => {
    if (windowWidth < 768) {
      onCloseMobile();
    } else {
      setIsCollapsed(!isCollapsed);
      setSidebarWidth(!isCollapsed ? minWidth : 260);
    }
  };

  const computedSidebarStyle = {
    width: isResizing || windowWidth >= 768 ? `${sidebarWidth}px` : "280px",
  };

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 z-50 bg-white border-r-4 border-black flex flex-col h-[100dvh] ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${
        isResizing ? "transition-none" : "transition-[width,transform] duration-300 ease-in-out"
      }`}
      style={computedSidebarStyle}
    >
      <div className="h-16 shrink-0 flex items-center justify-between md:justify-center px-4 md:px-0 border-b-4 border-black bg-white overflow-hidden whitespace-nowrap relative">
        {showContent ? (
          <h1 className="font-black text-xl tracking-tighter text-black">
            ADMIN <span className="bg-black text-white px-1">PANEL</span>
          </h1>
        ) : (
          <span className="font-black text-xl bg-black text-white px-2">A</span>
        )}

        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 border-2 border-black bg-black text-white hover:bg-gray-800 flex items-center justify-center"
        >
          <Icon icon="lucide:x" width="20" height="20" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <Link
              key={item.name}
              href={item.route}
              onClick={onCloseMobile}
              className={`flex items-center p-3 border-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(200,200,200,1)]"
                  : "border-transparent hover:border-black hover:bg-gray-100 text-black"
              } ${!showContent ? "justify-center" : ""}`}
            >
              <Icon icon={item.icon} className="text-2xl shrink-0" />
              {showContent && (
                <span className="ml-3 font-bold font-mono truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleSidebarToggle}
        className="flex p-2 border-t-4 border-black hover:bg-gray-100 hover:text-black justify-center items-center cursor-pointer w-full text-black shrink-0"
      >
        <Icon icon={!showContent ? "lucide:chevron-right" : "lucide:chevron-left"}
          width="24"
          height="24"
        />
      </button>

      <div
        onMouseDown={startResize}
        className="hidden md:block absolute top-0 -right-2 w-5 h-full cursor-col-resize hover:bg-black opacity-0 hover:opacity-[0.05] transition-opacity z-50"
        title="Drag to resize"
      />
    </aside>
  );
}
