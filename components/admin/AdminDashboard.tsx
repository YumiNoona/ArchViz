"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Eye, BarChart2, Download, LogOut,
  Search, ChevronDown, RefreshCw, ExternalLink,
  TrendingUp, Calendar, Layers, ArrowUpRight,
  Activity, Clock, Globe, ArrowRight, Settings,
  Type, Image as ImageIcon, Layout as LayoutIcon, Save, Mail
} from "lucide-react";
import { useSiteConfig } from "../SiteConfigProvider";
import { supabase, getProjects, type Project } from "@/lib/supabase";
import AdminBlogTab from "../AdminBlogTab";
import EmailTab from "./EmailTab";

interface Visitor {
  id: string; name: string; email: string;
  contact: string; project: string;
  project_id: string; timestamp: string;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [sortField, setSortField] = useState<"timestamp"|"name"|"project">("timestamp");
  const [sortDir, setSortDir] = useState<"desc"|"asc">("desc");
  const [tab, setTab] = useState<"overview"|"visitors"|"projects"|"blog"|"email"|"settings">("overview");
  const { config, saveConfig, layout, saveLayout, saving } = useSiteConfig();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, pRes] = await Promise.all([
        supabase.from("visitors").select("*").order("timestamp", { ascending: false }),
        getProjects()
      ]);
      if (vRes.data) setVisitors(vRes.data);
      if (pRes) setProjects(pRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = visitors
    .filter((v) => {
      const q = search.toLowerCase();
      return (!q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.project.toLowerCase().includes(q))
        && (filterProject === "all" || v.project_id === filterProject);
    })
    .sort((a, b) => {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const total = visitors.length;
  const unique = new Set(visitors.map(v => v.email)).size;
  const thisWeek = visitors.filter(v => new Date(v.timestamp) > new Date(Date.now() - 7 * 86400000)).length;
  const today = visitors.filter(v => new Date(v.timestamp).toDateString() === new Date().toDateString()).length;

  const projectStats = projects.map((p: Project) => ({
    ...p, count: visitors.filter(v => v.project_id === p.id).length,
  })).sort((a, b) => b.count - a.count);

  const exportCSV = () => {
    const rows = [["Name","Email","Contact","Project","Date"],
      ...filtered.map(v => [v.name, v.email, v.contact, v.project, new Date(v.timestamp).toLocaleDateString()])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `visitors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const toggleSort = (f: typeof sortField) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("desc"); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* ── Sidebar ───────────────────────────────────── */}
      <aside className="w-64 border-r border-border flex flex-col fixed inset-y-0 left-0 z-40 bg-background/50 backdrop-blur-xl">
        {/* Brand */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-lg leading-none">V</span>
            </div>
            <div>
              <span className="text-sm font-semibold block">VastuChitra</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-vastu-green animate-pulse" />
                <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "visitors", label: "Visitors", icon: Users },
            { id: "projects", label: "Projects", icon: Layers },
            { id: "blog", label: "Blog & Updates", icon: Type },
            { id: "email", label: "Campaigns", icon: Mail },
            { id: "settings", label: "Settings", icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button 
              key={id} 
              onClick={() => setTab(id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id 
                ? "bg-secondary text-foreground shadow-sm ring-1 ring-vastu-green/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon size={16} className={tab === id ? "text-vastu-green" : ""} />
              {label}
              {id === "visitors" && total > 0 && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-foreground/10 text-muted-foreground font-mono">
                  {total}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────── */}
      <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight capitalize group">
              <span className="group-hover:text-sweep transition-all duration-500">{tab}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, scale: 0.99 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Stats Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Visits", value: total, icon: Eye, trend: "+12.5%", color: "text-blue-400" },
                    { label: "Unique Users", value: unique, icon: Users, trend: "+5.2%", color: "text-vastu-green" },
                    { label: "Week Growth", value: thisWeek, icon: TrendingUp, trend: "+18%", color: "text-purple-400" },
                    { label: "Today", value: today, icon: Clock, trend: "+2", color: "text-orange-400" },
                  ].map(({ label, value, icon: Icon, trend, color }) => (
                    <div key={label} className="bevel-card p-6 bg-secondary/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                        <div className={`p-2 rounded-lg bg-background border border-border ${color}`}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-medium tracking-tighter">
                          {loading ? "—" : value}
                        </span>
                        <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-vastu-green' : 'text-red-400'}`}>
                          {trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Content Area Bento */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Analytic Chart Placeholder */}
                  <div className="lg:col-span-2 bevel-card p-8 bg-secondary/30 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-medium tracking-tighter">Project Traffic</h3>
                        <p className="text-sm text-muted-foreground font-light">Distribution of interest per project</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground opacity-50">
                        <BarChart2 size={20} />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {projectStats.slice(0, 5).map((p) => {
                        const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
                        return (
                          <div key={p.id} className="group">
                            <div className="flex justify-between text-sm mb-2 font-medium">
                              <span className="group-hover:text-vastu-green transition-colors">{p.title}</span>
                              <span className="text-muted-foreground">{p.count} <span className="text-[10px] opacity-50 ml-1">({pct}%)</span></span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary border border-border rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full bg-vastu-green rounded-full shadow-[0_0_8px_rgba(226,255,175,0.4)]"
                              />
                            </div>
                          </div>
                        );
                      })}
                      {total === 0 && !loading && <p className="text-center py-20 text-muted-foreground italic">No traffic data yet</p>}
                    </div>
                  </div>

                  {/* Recent Activity Mini List */}
                  <div className="bevel-card p-8 bg-secondary/50">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-medium tracking-tighter">Recent Activity</h3>
                      <button className="text-xs text-vastu-green font-bold hover:underline" onClick={() => setTab("visitors")}>
                        View All
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {visitors.filter((v: Visitor) => search ? v.name.toLowerCase().includes(search.toLowerCase()) : true).slice(0, 10).map((v: Visitor) => (
                        <div key={v.id} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold text-vastu-green">
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate leading-none">{v.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate mt-1">Interacted with {v.project}</p>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {new Date(v.timestamp).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      ))}
                      {visitors.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                          <Users size={40} className="mb-4" />
                          <p className="text-sm italic">Passive waiting area...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "visitors" && (
              <motion.div 
                key="visitors"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Modern Table Header / Filtering */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-vastu-green transition-colors" />
                    <input 
                      placeholder="Search across names, emails, projects..." 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-vastu-green/20 focus:border-vastu-green/50 transition-all text-sm"
                    />
                  </div>
                  <select 
                    value={filterProject} 
                    onChange={e => setFilterProject(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-vastu-green/20"
                  >
                    <option value="all">Every Project</option>
                    {projects.map((p: Project) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                  <button 
                    onClick={exportCSV}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-black/20"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>

                {/* Styled Table Surface */}
                <div className="bevel-card overflow-hidden bg-secondary/20">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                          {[["Client Name","name"],["Contact Details",null],["Target Project","project"],["Interaction Date","timestamp"]].map(([label, field]) => (
                            <th 
                              key={label as string}
                              className={`text-left px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ${field ? "cursor-pointer hover:text-foreground" : ""}`}
                              onClick={() => field && toggleSort(field as any)}
                            >
                              <div className="flex items-center gap-2">
                                {label as string}
                                {field && sortField === field && (
                                  <ChevronDown size={12} className={`transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loading ? (
                          [...Array(6)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              {[...Array(4)].map((_, j) => (
                                <td key={j} className="px-8 py-6">
                                  <div className="h-4 bg-secondary rounded w-2/3" />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : filtered.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-8 py-20 text-center">
                              <div className="text-muted-foreground italic flex flex-col items-center gap-3">
                                <Search size={24} className="opacity-20" />
                                <span>No matching lead records found</span>
                              </div>
                            </td>
                          </tr>
                        ) : filtered.map((v, i) => (
                          <tr key={v.id} className="hover:bg-secondary/30 transition-colors group">
                            <td className="px-8 py-5">
                              <span className="text-sm font-semibold block">{v.name}</span>
                              <span className="text-xs text-muted-foreground">{v.email}</span>
                            </td>
                            <td className="px-8 py-5 text-sm font-mono text-muted-foreground">{v.contact}</td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-bold px-3 py-1 bg-background border border-border rounded-full group-hover:border-vastu-green/30 transition-colors">
                                {v.project}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="text-sm font-medium">
                                {new Date(v.timestamp).toLocaleDateString("en-US", { day: "numeric", month: "long" })}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {new Date(v.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filtered.length > 0 && (
                    <div className="px-8 py-4 bg-secondary/30 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Sync status: active</span>
                      <span>{filtered.length} records in view</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {tab === "projects" && (
              <motion.div 
                key="projects"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {projectStats.map((p: any, i: number) => (
                  <div key={p.id} className="bevel-card p-6 bg-secondary/30 group hover:border-vastu-green/30 transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-background border border-border rounded inline-block uppercase tracking-wider text-muted-foreground">
                        {p.type}
                      </span>
                      <a 
                        href={p.stream_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-background border border-border text-muted-foreground hover:text-vastu-green hover:border-vastu-green transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <h3 className="text-lg font-medium mb-1 tracking-tight">{p.title}</h3>
                    <p className="text-sm text-muted-foreground font-light line-clamp-2 leading-relaxed mb-6">{p.description || "Experimental architectural visualization exploring new paradigms of space and light."}</p>
                    
                    <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Globe size={14} className="opacity-50" />
                        {p.location}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-medium text-foreground tracking-tighter leading-none">{p.count}</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">Visits</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State Card */}
                <div className="bevel-card p-6 bg-secondary/10 border-dashed flex flex-col items-center justify-center text-center opacity-40">
                  <Layers size={32} className="mb-4" />
                  <p className="text-xs font-medium max-w-[140px]">Projects are managed via the Supabase Dashboard</p>
                </div>
              </motion.div>
            )}

            {tab === "blog" && (
              <motion.div 
                key="blog"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <AdminBlogTab />
              </motion.div>
            )}

            {tab === "email" && (
              <motion.div 
                key="email"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <EmailTab visitors={visitors} />
              </motion.div>
            )}


            {tab === "settings" && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl space-y-8 pb-20"
              >
                {/* Brand & Hero */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-vastu-green">
                      <LayoutIcon size={18} />
                    </div>
                    <h2 className="text-xl font-medium tracking-tight">General Appearance</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand Name</label>
                      <input 
                        value={config.brand}
                        onChange={e => saveConfig({ ...config, brand: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-1 focus:ring-vastu-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carousel Style</label>
                      <select 
                        value={layout.carouselStyle}
                        onChange={e => saveLayout({ ...layout, carouselStyle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-1 focus:ring-vastu-green/20 outline-none"
                      >
                        <option value="fan-3d">3D Fan</option>
                        <option value="reveal">Reveal</option>
                        <option value="stack">Stack</option>
                        <option value="filmstrip">Filmstrip</option>
                        <option value="dynamic">Dynamic Grid</option>
                      </select>
                    </div>
                  </div>
                </section>

                <hr className="border-border" />

                {/* Hero Content */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-vastu-green">
                      <Type size={18} />
                    </div>
                    <h2 className="text-xl font-medium tracking-tight">Hero Section</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Eyebrow (Small text above heading)</label>
                      <input 
                        value={config.eyebrow}
                        onChange={e => saveConfig({ ...config, eyebrow: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {config.headline.map((line, idx) => (
                        <div key={idx} className="space-y-2">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Headline Line {idx + 1}</label>
                          <input 
                            value={line}
                            onChange={e => {
                              const newHeadline = [...config.headline] as [string, string, string];
                              newHeadline[idx] = e.target.value;
                              saveConfig({ ...config, headline: newHeadline });
                            }}
                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sub-headline Description</label>
                      <textarea 
                        value={config.sub}
                        rows={3}
                        onChange={e => saveConfig({ ...config, sub: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border resize-none"
                      />
                    </div>
                  </div>
                </section>

                <section className="pt-6 border-t border-border flex justify-between items-center">
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    Changes are saved automatically to the cloud and reflect on the live site instantly.
                  </p>
                  <button 
                    disabled={saving}
                    className="btn-vercel h-10 px-6 text-sm flex items-center gap-2"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? "Saving..." : "Settings Synced"}
                  </button>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
