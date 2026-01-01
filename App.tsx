
import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, X, ArrowRight, Loader2, TrendingUp, TrendingDown, Minus, Clock, Sun, Moon } from 'lucide-react';
import { Location, PopularityData } from './types';
import { searchLocations, getBusynessData } from './services/dataService';
import { BusynessChart } from './components/BusynessChart';
import { PLACE_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse-theme');
      return (saved as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [busynessData, setBusynessData] = useState<PopularityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const currentHour = new Date().getHours();

  // Get user location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  // Sync theme with document class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pulse-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        const data = await searchLocations(searchQuery, userCoords?.lat, userCoords?.lng);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, userCoords]);

  const handleSelect = (loc: Location) => {
    setSelectedLocation(loc);
    setBusynessData(getBusynessData(loc.category));
    setSearchQuery('');
    setResults([]);
  };

  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour} ${period}`;
  };

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return '';
    if (dist < 0.1) return `${(dist * 5280).toFixed(0)} ft`;
    return `${dist.toFixed(1)} mi`;
  };

  // Derived Stats
  const stats = useMemo(() => {
    if (!busynessData.length) return null;
    
    const current = busynessData.find(d => d.hour === currentHour);
    const prev = busynessData.find(d => d.hour === (currentHour - 1 + 24) % 24);
    
    // 1. Trend Calculation
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (current?.live && prev) {
      const diff = current.live - prev.historical;
      if (diff > 0.1) trend = 'up';
      else if (diff < -0.1) trend = 'down';
    }

    // 2. Best upcoming time (next 8 hours)
    let bestHour = currentHour;
    let minBusy = 1.1;
    for (let i = 1; i <= 8; i++) {
      const h = (currentHour + i) % 24;
      const d = busynessData.find(data => data.hour === h);
      if (d && d.historical < minBusy) {
        minBusy = d.historical;
        bestHour = h;
      }
    }

    // 3. Peak hour
    const peak = busynessData.reduce((prev, curr) => (prev.historical > curr.historical) ? prev : curr).hour;

    return { trend, bestHour, peak, currentLive: current?.live };
  }, [busynessData, currentHour]);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-12 pb-24 max-w-2xl mx-auto overflow-x-hidden text-foreground bg-background">
      
      {/* Top Nav */}
      <nav className="w-full flex justify-between items-center mb-16 md:mb-24">
        <div className="flex items-center gap-3">
          <div className="pulse-dot"></div>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Pulse Live</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90 border border-border"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </nav>

      <main className="w-full space-y-16">
        {/* Search Input Area */}
        {!selectedLocation && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                CROWD <br/> CHECK.
              </h1>
              <p className="text-slate-500 dark:text-slate-300 text-sm font-medium max-w-xs leading-relaxed">
                Check the pulse of any venue instantly. Biased towards your current location.
              </p>
            </div>

            <div className="relative z-[100]">
              <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search size={22} className="text-slate-400 dark:text-slate-500 group-focus-within:text-foreground transition-colors" />
                </div>
                <input
                  type="text"
                  autoFocus
                  className="w-full pl-16 pr-14 py-7 bg-slate-50 dark:bg-[#111111] border border-border focus:border-foreground focus:bg-white dark:focus:bg-[#181818] rounded-full outline-none text-xl font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 text-foreground shadow-sm"
                  placeholder="Where to?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-7 flex items-center gap-2">
                  {isLoading && (
                    <Loader2 size={20} className="animate-spin text-slate-400 dark:text-slate-500" />
                  )}
                  {searchQuery && !isLoading && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-foreground transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Results Dropdown */}
              {results.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-3 bg-background rounded-[40px] overflow-hidden z-[100] shadow-none dark:shadow-2xl animate-in fade-in slide-in-from-top-2 border border-border">
                  {results.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="w-full px-8 py-5 text-left hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between group transition-colors border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">
                          <MapPin size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-black text-sm uppercase tracking-tight text-foreground truncate">{loc.name}</div>
                            {loc.distance !== undefined && (
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-300 shrink-0">
                                · {formatDistance(loc.distance)}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 truncate">{loc.address}</div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Categories */}
            <div className="flex flex-wrap gap-2 pt-4">
              {PLACE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSearchQuery(cat.label)}
                  className="px-5 py-3 rounded-full border border-border bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:border-foreground hover:bg-foreground hover:text-background dark:hover:bg-foreground dark:hover:text-background text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Venue View */}
        {selectedLocation && (
          <div className="animate-in zoom-in-95 fade-in duration-500 space-y-16">
            <div className="space-y-8">
              <button 
                onClick={() => setSelectedLocation(null)}
                className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-300 hover:text-foreground transition-colors flex items-center gap-2"
              >
                <ArrowRight size={14} className="rotate-180" /> Back to Search
              </button>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="inline-block px-3 py-1 bg-foreground text-background text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    {selectedLocation.category}
                  </div>
                  {selectedLocation.distance !== undefined && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">
                      {formatDistance(selectedLocation.distance)} away
                    </span>
                  )}
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                  {selectedLocation.name}
                </h2>
                <div className="flex items-start gap-2 text-slate-500 dark:text-slate-300">
                   <MapPin size={16} className="mt-1 shrink-0 opacity-50" />
                   <p className="text-base font-medium max-w-md">{selectedLocation.address}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="glass-card p-6 md:p-8 rounded-[32px] flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center gap-2">
                  <div className="pulse-dot"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Live Traffic</span>
                </div>
                <div className="text-3xl font-black tracking-tighter">
                  {stats?.currentLive ? (
                    <span>~{(stats.currentLive * 100).toFixed(0)}%</span>
                  ) : 'Calm'}
                </div>
              </div>

              <div className="glass-card p-6 md:p-8 rounded-[32px] flex flex-col justify-between min-h-[140px]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Trend</span>
                <div className="flex items-center gap-2">
                  {stats?.trend === 'up' && <TrendingUp size={24} className="text-foreground" />}
                  {stats?.trend === 'down' && <TrendingDown size={24} className="text-slate-400 dark:text-slate-300" />}
                  {stats?.trend === 'stable' && <Minus size={24} className="text-slate-300 dark:text-slate-500" />}
                  <span className="text-2xl font-black uppercase tracking-tighter">
                    {stats?.trend || 'Stable'}
                  </span>
                </div>
              </div>

              <div className="glass-card p-6 md:p-8 rounded-[32px] flex flex-col justify-between min-h-[140px]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Best Time</span>
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-slate-400 dark:text-slate-300" />
                  <div className="text-2xl font-black tracking-tighter uppercase">
                    {stats ? formatHour(stats.bestHour) : '--'}
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 md:p-8 rounded-[32px] flex flex-col justify-between min-h-[140px]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Typical Peak</span>
                <div className="text-2xl font-black tracking-tighter uppercase">
                  {stats ? formatHour(stats.peak) : '--'}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-300">Activity Graph</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-foreground"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">Live</span>
                  </div>
                </div>
              </div>
              <BusynessChart data={busynessData} currentHour={currentHour} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto pt-32 opacity-20">
      </footer>
    </div>
  );
};

export default App;
