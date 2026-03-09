"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Eye, BarChart2, Download, LogOut,
  Search, ChevronDown, RefreshCw, ExternalLink,
  TrendingUp, Calendar, Layers, ArrowUpRight,
  Activity, Clock, Globe
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { projects } from "@/data/projects";

interface Visitor {
  id: string; name: string; email: string;
  contact: string; project: string;
  project_id: string; timestamp: string;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [sortField, setSortField] = useState<"timestamp"|"name"|"project">("timestamp");
  const [sortDir, setSortDir] = useState<"desc"|"asc">("desc");
  const [tab, setTab] = useState<"overview"|"visitors"|"projects">("overview");

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("visitors").select("*").order("timestamp", { ascending: false });
      if (data) setVisitors(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

  const filtered = visitors
    .filter((v) => {
      const q = search.toLowerCase();
      return (!q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.project.toLowerCase().includes(q))
        && (filterProject === "all" || v.project_id === filterProject);
    })
    .sort((a, b) => sortDir === "asc" ? a[sortField].localeCompare(b[sortField]) : b[sortField].localeCompare(a[sortField]));

  const total = visitors.length;
  const unique = new Set(visitors.map(v => v.email)).size;
  const thisWeek = visitors.filter(v => new Date(v.timestamp) > new Date(Date.now() - 7 * 86400000)).length;
  const today = visitors.filter(v => new Date(v.timestamp).toDateString() === new Date().toDateString()).length;

  const projectStats = projects.map(p => ({
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
    <div className="min-h-screen" style={{ background: "hsl(0 0% 3%)", color: "hsl(0 0% 93%)", fontFamily: "var(--font-body)" }}>

      {/* ── Sidebar ───────────────────────────────────── */}
      <div className="fixed left-0 top-0 bottom-0 w-[220px] border-r z-40 flex flex-col"
        style={{ borderColor: "hsl(0 0% 11%)", background: "hsl(0 0% 3%)" }}>
        {/* Brand */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "hsl(0 0% 11%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <Layers size={12} className="text-black" />
            </div>
            <span className="text-sm font-medium text-white">IV Studio</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px]" style={{ color: "hsl(0 0% 40%)" }}>Admin Dashboard</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "visitors", label: "Visitors", icon: Users },
            { id: "projects", label: "Projects", icon: Layers },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5"
              style={{
                background: tab === id ? "hsl(0 0% 9%)" : "transparent",
                color: tab === id ? "hsl(0 0% 93%)" : "hsl(0 0% 45%)",
              }}
            >
              <Icon size={14} />
              {label}
              {id === "visitors" && total > 0 && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                  style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 55%)" }}>
                  {total}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t" style={{ borderColor: "hsl(0 0% 11%)" }}>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={{ color: "hsl(0 0% 45%)" }}
            onMouseOver={e => (e.currentTarget.style.color = "hsl(0 0% 80%)")}
            onMouseOut={e => (e.currentTarget.style.color = "hsl(0 0% 45%)")}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────── */}
      <div className="ml-[220px]">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b backdrop-blur-xl"
          style={{ borderColor: "hsl(0 0% 11%)", background: "hsl(0 0% 3% / 0.85)" }}>
          <div>
            <h1 className="text-base font-medium text-white capitalize">{tab}</h1>
            <p className="text-xs mt-0.5" style={{ color: "hsl(0 0% 40%)" }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button onClick={fetchVisitors}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all"
            style={{ borderColor: "hsl(0 0% 14%)", color: "hsl(0 0% 50%)" }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div key="overview"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}>
                {/* Stat grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Visits", value: total, icon: Eye, delta: "+12% this month" },
                    { label: "Unique Visitors", value: unique, icon: Users, delta: `${Math.round(unique/Math.max(total,1)*100)}% unique rate` },
                    { label: "This Week", value: thisWeek, icon: TrendingUp, delta: "last 7 days" },
                    { label: "Today", value: today, icon: Clock, delta: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"}) },
                  ].map(({ label, value, icon: Icon, delta }) => (
                    <div key={label} className="rounded-xl border p-5"
                      style={{ background: "hsl(0 0% 6%)", borderColor: "hsl(0 0% 11%)" }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs" style={{ color: "hsl(0 0% 45%)" }}>{label}</span>
                        <Icon size={14} style={{ color: "hsl(0 0% 40%)" }} />
                      </div>
                      <div className="text-3xl font-light text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
                        {loading ? "—" : value}
                      </div>
                      <div className="text-[11px]" style={{ color: "hsl(0 0% 38%)" }}>{delta}</div>
                    </div>
                  ))}
                </div>

                {/* Top projects + recent visitors */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Project bar chart */}
                  <div className="rounded-xl border p-6"
                    style={{ background: "hsl(0 0% 6%)", borderColor: "hsl(0 0% 11%)" }}>
                    <h3 className="text-sm font-medium text-white mb-5">Visits by Project</h3>
                    <div className="space-y-4">
                      {projectStats.slice(0, 5).map((p) => {
                        const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
                        return (
                          <div key={p.id}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-medium" style={{ color: "hsl(0 0% 80%)" }}>{p.title}</span>
                              <span style={{ color: "hsl(0 0% 40%)" }}>{p.count} · {pct}%</span>
                            </div>
                            <div className="h-1 rounded-full" style={{ background: "hsl(0 0% 12%)" }}>
                              <motion.div className="h-full rounded-full" style={{ background: "hsl(0 0% 75%)" }}
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }} />
                            </div>
                          </div>
                        );
                      })}
                      {total === 0 && <p className="text-xs" style={{ color: "hsl(0 0% 40%)" }}>No data yet.</p>}
                    </div>
                  </div>

                  {/* Recent activity */}
                  <div className="rounded-xl border p-6"
                    style={{ background: "hsl(0 0% 6%)", borderColor: "hsl(0 0% 11%)" }}>
                    <h3 className="text-sm font-medium text-white mb-5">Recent Activity</h3>
                    <div className="space-y-3">
                      {visitors.slice(0, 6).map((v) => (
                        <div key={v.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0"
                            style={{ borderColor: "hsl(0 0% 16%)", background: "hsl(0 0% 10%)", color: "hsl(0 0% 70%)" }}>
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "hsl(0 0% 85%)" }}>{v.name}</p>
                            <p className="text-[11px] truncate" style={{ color: "hsl(0 0% 40%)" }}>{v.project}</p>
                          </div>
                          <span className="text-[10px] font-mono whitespace-nowrap" style={{ color: "hsl(0 0% 35%)" }}>
                            {new Date(v.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                      ))}
                      {visitors.length === 0 && !loading && <p className="text-xs" style={{ color: "hsl(0 0% 40%)" }}>No visitors yet.</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "visitors" && (
              <motion.div key="visitors"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}>
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(0 0% 40%)" }} />
                    <input placeholder="Search name, email, project..." value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 transition-all"
                      style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)", color: "hsl(0 0% 85%)" }} />
                  </div>
                  <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
                    className="px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)", color: "hsl(0 0% 55%)" }}>
                    <option value="all">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                  <button onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all"
                    style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)", color: "hsl(0 0% 55%)" }}>
                    <Download size={13} /> Export CSV
                  </button>
                </div>

                {/* Table */}
                <div className="rounded-xl border overflow-hidden"
                  style={{ borderColor: "hsl(0 0% 11%)" }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid hsl(0 0% 11%)", background: "hsl(0 0% 6%)" }}>
                        {[["Name","name"],["Email",null],["Contact",null],["Project","project"],["Date","timestamp"]].map(([label, field]) => (
                          <th key={label as string}
                            className={`text-left px-5 py-3.5 text-xs font-medium ${field ? "cursor-pointer select-none" : ""}`}
                            style={{ color: "hsl(0 0% 40%)" }}
                            onClick={() => field && toggleSort(field as any)}>
                            <span className="flex items-center gap-1">
                              {label as string}
                              {field && sortField === field && (
                                <ChevronDown size={10} style={{ transform: sortDir === "asc" ? "rotate(180deg)" : "none" }} />
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(6)].map((_,i) => (
                          <tr key={i} style={{ borderBottom: "1px solid hsl(0 0% 9%)" }}>
                            {[...Array(5)].map((_,j) => (
                              <td key={j} className="px-5 py-4">
                                <div className="h-3 rounded animate-pulse" style={{ background: "hsl(0 0% 12%)", width: `${55+j*10}%` }} />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : filtered.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-16 text-center text-sm" style={{ color: "hsl(0 0% 35%)" }}>
                          {visitors.length === 0 ? "No visitors yet — share your projects to get started." : "No results match your search."}
                        </td></tr>
                      ) : filtered.map((v, i) => (
                        <motion.tr key={v.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className="transition-colors"
                          style={{ borderBottom: "1px solid hsl(0 0% 9%)" }}
                          onMouseOver={e => (e.currentTarget.style.background = "hsl(0 0% 6%)")}
                          onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "hsl(0 0% 88%)" }}>{v.name}</td>
                          <td className="px-5 py-3.5 text-sm" style={{ color: "hsl(0 0% 55%)" }}>{v.email}</td>
                          <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: "hsl(0 0% 55%)" }}>{v.contact}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                              style={{ background: "hsl(0 0% 10%)", color: "hsl(0 0% 65%)", border: "1px solid hsl(0 0% 16%)" }}>
                              {v.project}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-mono whitespace-nowrap" style={{ color: "hsl(0 0% 40%)" }}>
                            {new Date(v.timestamp).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                            <span className="ml-2" style={{ color: "hsl(0 0% 28%)" }}>
                              {new Date(v.timestamp).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t text-xs" style={{ borderColor: "hsl(0 0% 11%)", color: "hsl(0 0% 38%)" }}>
                      {filtered.length} of {visitors.length} entries
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "projects" && (
              <motion.div key="projects"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectStats.map((p, i) => (
                    <motion.div key={p.id}
                      className="rounded-xl border p-5 group"
                      style={{ background: "hsl(0 0% 6%)", borderColor: "hsl(0 0% 11%)" }}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ borderColor: "hsl(0 0% 20%)" }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "hsl(0 0% 10%)", color: "hsl(0 0% 50%)", border: "1px solid hsl(0 0% 15%)" }}>
                          {p.type}
                        </span>
                        <a href={p.streamURL} target="_blank" rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "hsl(0 0% 50%)" }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <h3 className="text-sm font-medium mb-0.5" style={{ color: "hsl(0 0% 88%)" }}>{p.title}</h3>
                      <p className="text-[11px] mb-4 line-clamp-2" style={{ color: "hsl(0 0% 42%)" }}>{p.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "hsl(0 0% 38%)" }}>
                          <Globe size={10} />{p.location}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-light" style={{ color: "hsl(0 0% 80%)", fontFamily: "var(--font-display)" }}>{p.count}</div>
                          <div className="text-[9px]" style={{ color: "hsl(0 0% 35%)" }}>visits</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs mt-6" style={{ color: "hsl(0 0% 30%)" }}>
                  To add or edit projects, modify <code className="font-mono px-1.5 py-0.5 rounded text-[11px]"
                    style={{ background: "hsl(0 0% 10%)" }}>data/projects.ts</code>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
