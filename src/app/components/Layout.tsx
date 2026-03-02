import { Outlet, Link, useLocation } from "react-router";
import { Scan, Home, Users, Activity, UserPlus, Video } from "lucide-react";
import { NeuralBackground } from "./NeuralBackground";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Accueil", icon: Home },
    { path: "/live", label: "Reconnaissance Live", icon: Scan },
    { path: "/video", label: "Analyse Vidéo", icon: Video },
    { path: "/persons", label: "Gestion Personnes", icon: UserPlus },
    { path: "/attendance", label: "Présences", icon: Users },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      <NeuralBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <Activity className="w-8 h-8 text-blue-400 relative" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  MPresence IA
                </span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Status indicator */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Système actif</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-140px)]">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 backdrop-blur-xl bg-slate-950/50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <p className="text-sm text-gray-400 text-center md:text-left">
                © 2026 MPresence IA
              </p>
              <p className="text-sm text-gray-400 text-center md:text-right">
                Created with ❤️ and tea 🍵 by Essoufi Hassan
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}