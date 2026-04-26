import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LogCard from './LogCard';
import { Search, Moon, Sun, LogOut } from 'lucide-react';

function Dashboard({ onLogout }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
  const token = localStorage.getItem('adminToken');
  const apiKey = localStorage.getItem('apiKey'); // Make sure this matches your login storage name

    const url = selectedProject 
      ? `https://omnilog-ai-analyzer-production.up.railway.app/logs?projectId=${selectedProject}` 
      : `https://omnilog-ai-analyzer-production.up.railway.app/logs`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) onLogout();
        return res.json();
      })
      .then(data => {
        // --- SAFETY FIX: Check if data is actually an array ---
        if (Array.isArray(data)) {
          setLogs(data);
          if (!selectedProject) {
            const uniqueProjects = [...new Set(data.map(l => l.projectId))];
            setProjects(uniqueProjects);
          }
        } else {
          console.error("Server returned an error instead of logs:", data);
          setLogs([]); // Reset to empty array so .map() doesn't crash
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLogs([]); // Reset on network error too
      });
    
    // --- SOCKET LOGIC ---
    const socket = io("https://omnilog-ai-analyzer-production.up.railway.app", { auth: { token } });

    if (apiKey) {
      socket.emit('join_dashboard', apiKey);
      console.log("Joined room:", apiKey);
    }
    
    socket.on("new_log_ready", (newLog) => {
      if (!selectedProject || newLog.projectId === selectedProject) {
        setLogs(prev => [newLog, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [onLogout, selectedProject]);
  const filteredLogs = logs.filter(l => 
    (l.errorMessage || "").toLowerCase().includes(search.toLowerCase()) || // Changed from l.message to match your schema
    (l.projectId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-500">
              OmniLog <span className="text-gray-900 dark:text-white">AI</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm uppercase tracking-widest">Dashboard Active</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                placeholder="Search error messages..."
                className="bg-gray-100 dark:bg-gray-800 border-none pl-10 pr-4 py-2 rounded-xl w-full text-white outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Add this inside your header div, next to the Search input */}
<select 
  value={selectedProject}
  onChange={(e) => setSelectedProject(e.target.value)}
  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
>
  <option value="">All Projects</option>
  {projects.map(proj => (
    <option key={proj} value={proj}>{proj}</option>
  ))}
</select>
            
            <button onClick={() => setIsDark(!isDark)} className="p-2.5 bg-gray-200 dark:bg-gray-800 rounded-xl dark:text-white">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={onLogout} className="p-2.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl hover:bg-red-200 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => <LogCard key={log.id} log={log} />)
          ) : (
            <div className="text-center py-20 text-gray-500 italic">Listening for new logs...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;