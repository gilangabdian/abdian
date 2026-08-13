"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getToken } from "@/utils/auth";
import { getAllProjects, checkProjectsHealth } from "@/lib/api/project";
import { getAllArtworks } from "@/lib/api/artwork";
import { getAllCertificates } from "@/lib/api/certificate";
import { getSkills } from "@/lib/api/skill";
import { getAllContacts } from "@/lib/api/contact";
import { getAllPhotos } from "@/lib/api/photo";
import { getAllBlogs } from "@/lib/api/blog";
import {
  getVisitorCount,
  adminGetVisitors,
  adminDeleteVisitor,
  adminClearAllVisitors,
} from "@/lib/api/visitor";
import { alertConfirmVisitor, alertConfirmClearAllVisitors, alertSuccessVisitor } from "@/lib/alert";

export default function DashboardClient() {
  const [stats, setStats] = useState({
    projects: 0,
    artworks: 0,
    certificates: 0,
    skills: 0,
    contacts: 0,
    visitors: 0,
    photos: 0,
    blogs: 0,
  });

  const [visitorsList, setVisitorsList] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === "mobile") return "lucide:smartphone";
    if (deviceType === "tablet") return "lucide:tablet";
    if (deviceType === "robot") return "lucide:bot";
    return "lucide:monitor";
  };

  const updateTime = () => {
    setCurrentTime(
      new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const fetchVisitorsList = async (page = 1) => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await adminGetVisitors(token, page);
      if (response.status === 200) {
        const responseBody = await response.json();
        setVisitorsList(responseBody.data || []);
        setPagination({
          current_page: responseBody.current_page,
          last_page: responseBody.last_page,
          total: responseBody.total,
        });
      }
    } catch (e) {
      console.error("Error fetching visitors list:", e);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    const token = getToken();
    
    try {
      const [
        projects,
        artworks,
        certificates,
        skills,
        contacts,
        photos,
        blogs,
      ] = await Promise.all([
        getAllProjects(),
        getAllArtworks(),
        getAllCertificates(),
        getSkills(),
        getAllContacts(),
        getAllPhotos(),
        getAllBlogs(),
      ]);

      let visitorsCount = 0;
      if (token) {
        const visRes = await getVisitorCount(token);
        if (visRes.ok) {
          const visJson = await visRes.json();
          visitorsCount = visJson.data?.total_visitors || visJson.total_visitors || 0;
        }
      }

      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        artworks: Array.isArray(artworks) ? artworks.length : 0,
        certificates: Array.isArray(certificates) ? certificates.length : 0,
        skills: Array.isArray(skills) ? skills.length : 0,
        contacts: Array.isArray(contacts) ? contacts.length : 0,
        photos: Array.isArray(photos) ? photos.length : 0,
        blogs: Array.isArray(blogs) ? blogs.length : 0,
        visitors: visitorsCount,
      });

      setIsDbConnected(true);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setIsDbConnected(false);
    }

    if (token) {
      await fetchVisitorsList(1);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    
    setIsMounted(true);
    loadAllData();

    const statusInterval = setInterval(async () => {
      try {
        const response = await checkProjectsHealth();
        if (response.ok) {
          setIsDbConnected(true);
        } else {
          setIsDbConnected(false);
        }
      } catch (e) {
        console.error(e);
        setIsDbConnected(false);
      }
    }, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(statusInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteVisitor = async (id: number | string) => {
    const confirmed = await alertConfirmVisitor("You won't be able to revert this!");
    if (confirmed) {
      const token = getToken();
      if (!token) return;
      try {
        const response = await adminDeleteVisitor(token, id);
        if (response.status === 200) {
          await alertSuccessVisitor("Deleted!", "Visitor record has been deleted.");
          fetchVisitorsList(pagination.current_page);
          loadAllData(); // reload counts
        }
      } catch (e) {
        console.error("Error deleting visitor:", e);
      }
    }
  };

  const clearAllVisitors = async () => {
    const confirmed = await alertConfirmClearAllVisitors("This will permanently delete ALL visitor records. Are you sure?");
    if (confirmed) {
      const token = getToken();
      if (!token) return;
      try {
        const response = await adminClearAllVisitors(token);
        if (response.status === 200) {
          await alertSuccessVisitor("Cleared!", "All visitor records have been deleted.");
          fetchVisitorsList(1);
          loadAllData();
        }
      } catch (e) {
        console.error("Error clearing visitors:", e);
      }
    }
  };

  return (
    <div className="space-y-8 font-sans text-black">
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
            Dashboard
            <span className="bg-black text-white px-2 py-1 inline-block -skew-x-6 ml-2">Overview</span>
          </h1>
          <p className="font-bold font-mono text-gray-700 mt-2">Welcome back, Admin! Here is your portfolio report.</p>
        </div>
        <div className="hidden md:flex bg-white border-2 border-black p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
          {isMounted && <Icon icon="lucide:layout-dashboard" className="text-4xl" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Projects */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all cursor-default relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {isMounted && <Icon icon="lucide:folder-kanban" className="text-9xl" />}
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-black text-sm uppercase mb-1 tracking-wide bg-black text-white inline-block px-1">
                Total Projects
              </p>
              <h3 className="text-5xl font-black mt-2">{isLoading ? "..." : stats.projects}</h3>
            </div>
            <div className="bg-black text-white p-2 border-2 border-black rotate-3 group-hover:-rotate-3 transition-transform">
              {isMounted && <Icon icon="lucide:folder-kanban" className="text-3xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs font-bold font-mono flex items-center gap-2 relative z-10">
            {isMounted && <Icon icon="lucide:history" />}
            Updated recently
          </div>
        </div>

        {/* Artworks */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all cursor-default relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {isMounted && <Icon icon="lucide:palette" className="text-9xl" />}
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-black text-sm uppercase mb-1 tracking-wide bg-black text-white inline-block px-1">
                Artworks
              </p>
              <h3 className="text-5xl font-black mt-2">{isLoading ? "..." : stats.artworks}</h3>
            </div>
            <div className="bg-black text-white p-2 border-2 border-black rotate-2 group-hover:-rotate-3 transition-transform">
              {isMounted && <Icon icon="lucide:palette" className="text-3xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs font-bold font-mono flex items-center gap-2 relative z-10">
            {isMounted && <Icon icon="lucide:image" />}
            Gallery items
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all cursor-default relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {isMounted && <Icon icon="lucide:award" className="text-9xl" />}
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-black text-sm uppercase mb-1 tracking-wide bg-black text-white inline-block px-1">
                Certificates
              </p>
              <h3 className="text-5xl font-black mt-2">{isLoading ? "..." : stats.certificates}</h3>
            </div>
            <div className="bg-black text-white p-2 border-2 border-black rotate-6 group-hover:-rotate-3 transition-transform">
              {isMounted && <Icon icon="lucide:award" className="text-3xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs font-bold font-mono flex items-center gap-2 relative z-10">
            {isMounted && <Icon icon="lucide:check-circle" />}
            Valid credentials
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all cursor-default relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {isMounted && <Icon icon="ri:camera-3-line" className="text-9xl" />}
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-black text-sm uppercase mb-1 tracking-wide bg-black text-white inline-block px-1">Photos</p>
              <h3 className="text-5xl font-black mt-2">{isLoading ? "..." : stats.photos}</h3>
            </div>
            <div className="bg-black text-white p-2 border-2 border-black rotate-2 group-hover:rotate-6 transition-transform">
              {isMounted && <Icon icon="ri:camera-3-line" className="text-3xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs font-bold font-mono flex items-center gap-2 relative z-10">
            {isMounted && <Icon icon="lucide:image" />}
            Photographic memories
          </div>
        </div>

        {/* Blogs */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all cursor-default relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {isMounted && <Icon icon="material-symbols-light:post-outline" className="text-9xl" />}
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-black text-sm uppercase mb-1 tracking-wide bg-black text-white inline-block px-1">Blogs</p>
              <h3 className="text-5xl font-black mt-2">{isLoading ? "..." : stats.blogs}</h3>
            </div>
            <div className="bg-black text-white p-2 border-2 border-black -rotate-3 group-hover:-rotate-6 transition-transform">
              {isMounted && <Icon icon="material-symbols-light:post-outline" className="text-3xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs font-bold font-mono flex items-center gap-2 relative z-10">
            {isMounted && <Icon icon="lucide:file-text" />}
            Articles & Stories
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all cursor-default relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {isMounted && <Icon icon="lucide:zap" className="text-9xl" />}
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-black text-sm uppercase mb-1 tracking-wide bg-black text-white inline-block px-1">
                Tech Stack
              </p>
              <h3 className="text-5xl font-black mt-2">{isLoading ? "..." : stats.skills}</h3>
            </div>
            <div className="bg-black text-white p-2 border-2 border-black -rotate-6 group-hover:rotate-3 transition-transform">
              {isMounted && <Icon icon="lucide:zap" className="text-3xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs font-bold font-mono flex items-center gap-2 relative z-10">
            {isMounted && <Icon icon="lucide:code" />}
            Active skills
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all cursor-default relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {isMounted && <Icon icon="lucide:share-2" className="text-9xl" />}
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-black text-sm uppercase mb-1 tracking-wide bg-black text-white inline-block px-1">
                Social Links
              </p>
              <h3 className="text-5xl font-black mt-2">{isLoading ? "..." : stats.contacts}</h3>
            </div>
            <div className="bg-black text-white p-2 border-2 border-black rotate-3 group-hover:-rotate-3 transition-transform">
              {isMounted && <Icon icon="lucide:share-2" className="text-3xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs font-bold font-mono flex items-center gap-2 relative z-10">
            {isMounted && <Icon icon="lucide:globe" />}
            Active platforms
          </div>
        </div>

        {/* Total Visitors */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all cursor-default relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {isMounted && <Icon icon="lucide:users" className="text-9xl" />}
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-black text-sm uppercase mb-1 tracking-wide bg-black text-white inline-block px-1">
                Total Visitors
              </p>
              <h3 className="text-5xl font-black mt-2">{isLoading ? "..." : stats.visitors}</h3>
            </div>
            <div className="bg-black text-white p-2 border-2 border-black -rotate-3 group-hover:rotate-6 transition-transform">
              {isMounted && <Icon icon="lucide:users" className="text-3xl" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-4 border-black text-xs font-bold font-mono flex items-center gap-2 relative z-10">
            {isMounted && <Icon icon="lucide:activity" />}
            Unique Homepage Visits
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
          <h3 className="font-black text-xl mb-4 border-b-4 border-black pb-2 flex items-center gap-2 uppercase">
            <span className="bg-black text-white px-2 py-1 inline-block -skew-x-6">SYSTEM STATUS</span>
          </h3>
          <ul className="space-y-4 font-mono text-sm font-bold mt-6">
            <li className="flex justify-between items-center p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-transform bg-white">
              <span className="uppercase tracking-widest text-xs">Backend Connection</span>
              {isDbConnected ? (
                <span className="text-black flex items-center gap-2 transition-all duration-500">
                  <span className="w-3 h-3 bg-black rounded-full animate-pulse"></span>
                  ONLINE (Laravel)
                </span>
              ) : (
                <span className="text-black flex items-center gap-2 animate-pulse transition-all duration-500">
                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                  OFFLINE
                </span>
              )}
            </li>

            <li className="flex justify-between items-center p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-transform bg-white">
              <span className="uppercase tracking-widest text-xs">Database Status</span>
              {isDbConnected ? (
                <span className="text-black flex items-center gap-2 transition-all duration-500">
                  {isMounted && <Icon icon="lucide:database" className="text-lg" />}
                  CONNECTED
                </span>
              ) : (
                <span className="text-black flex items-center gap-2 animate-pulse transition-all duration-500">
                  {isMounted && <Icon icon="lucide:database-zap" className="text-lg" />}
                  DISCONNECTED
                </span>
              )}
            </li>

            <li className="flex justify-between items-center p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-transform bg-black text-white">
              <span className="uppercase tracking-widest text-xs">Server Time</span>
              <span className="font-bold font-mono tracking-widest">{currentTime}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Visitors List Section */}
      <div className="w-full mt-8">
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
          <h3 className="font-black text-xl mb-4 border-b-4 border-black pb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 uppercase">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white px-2 py-1 inline-block -skew-x-6">VISITOR HISTORY</span>
              <span className="text-sm font-mono lowercase opacity-60">({pagination.total} records)</span>
            </div>
            <button
              onClick={clearAllVisitors}
              className="bg-red-500 text-white border-2 border-black px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
            >
              {isMounted && <Icon icon="lucide:trash-2" />}
              CLEAR ALL LOGS
            </button>
          </h3>

          {visitorsList.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-400 mt-6">
              {isMounted && <Icon icon="lucide:ghost" className="text-4xl mx-auto mb-2 text-gray-400" />}
              <p className="font-mono font-bold text-gray-500">No visitors logged yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left font-mono text-sm border-2 border-black">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-3 border-r-2 border-black max-w-[50px]">LATEST</th>
                    <th className="p-3 border-r-2 border-black text-center">DEVICE</th>
                    <th className="p-3 border-r-2 border-black">OS & BROWSER</th>
                    <th className="p-3 border-r-2 border-black">LOCATION</th>
                    <th className="p-3 border-r-2 border-black hidden md:table-cell">NETWORK</th>
                    <th className="p-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {visitorsList.map((visitor, index) => (
                    <tr
                      key={visitor.id}
                      className={`border-t-2 border-black hover:bg-yellow-100 transition-colors ${
                        index % 2 === 0 ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="p-3 border-r-2 border-black font-bold whitespace-nowrap">
                        {new Date(visitor.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 border-r-2 border-black" title={visitor.device_id}>
                        <div className="flex justify-center items-center gap-2 font-bold uppercase">
                          {isMounted && <Icon icon={getDeviceIcon(visitor.device_type)} className="text-xl" />}
                          <span className="hidden md:inline">{visitor.device_type || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="p-3 border-r-2 border-black">
                        <div className="font-bold">{visitor.os || "Unknown OS"}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]" title={visitor.browser}>
                          {visitor.browser || "-"}
                        </div>
                      </td>
                      <td className="p-3 border-r-2 border-black">
                        <div
                          className="font-bold break-words max-w-[120px] lg:max-w-[180px]"
                          title={`${visitor.city}, ${visitor.country}`}
                        >
                          {visitor.city ? `${visitor.city}, ${visitor.country}` : "Unknown"}
                        </div>
                      </td>
                      <td className="p-3 border-r-2 border-black hidden md:table-cell text-xs font-mono">
                        <div className="font-bold text-gray-700 break-words max-w-[200px]" title={visitor.isp}>
                          {visitor.isp || "N/A"}
                        </div>
                        <div className="text-gray-400">{visitor.ip_address || "hidden"}</div>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => deleteVisitor(visitor.id)}
                          className="bg-white text-red-500 border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 active:translate-y-[1px] active:shadow-none transition-all"
                        >
                          {isMounted && <Icon icon="lucide:trash-2" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs font-mono font-bold opacity-60 italic">
                  * Page {pagination.current_page} of {pagination.last_page}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => fetchVisitorsList(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="bg-white border-2 border-black px-4 py-2 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:translate-y-0 disabled:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                  >
                    {isMounted && <Icon icon="lucide:chevron-left" />}
                    PREV
                  </button>

                  <button
                    onClick={() => fetchVisitorsList(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="bg-black text-white border-2 border-black px-4 py-2 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:translate-y-0 disabled:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 font-mono"
                  >
                    NEXT
                    {isMounted && <Icon icon="lucide:chevron-right" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
