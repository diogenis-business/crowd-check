
import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, ArrowRight } from 'lucide-react';
import { Location, PopularityData } from './types';
import { searchLocations, getBusynessData } from './services/dataService';
import { BusynessChart } from './components/BusynessChart';
import { PLACE_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [busynessData, setBusynessData] = useState<PopularityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentHour = new Date().getHours();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        const data = await searchLocations(searchQuery);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 200); // Faster search response
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-12 pb-24 max-w-2xl mx-auto overflow-x-hidden bg-white text-black">
      
      {/* Top Nav */}
      <nav className="w-full flex justify-between items-center mb-16 md:mb-24">
        <div className="flex items-center gap-3">
          <div className="pulse-dot"></div>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Pulse Live</span>
        </div>
      </nav>

      <main className="w-full space-y-16">
        {/* Search Input Area */}
        {!selectedLocation && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                CROWD <br/> CHECK.
              </h1>
              <p className="text-slate-600 text-sm font-medium max-w-xs leading-relaxed">
                Check the pulse of any venue instantly. Real-time patterns, monochrome design.
              </p>
            </div>

            <div className="relative z-[100]">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-500 group-focus-within:text-black transition-colors" />
                </div>
                <input
                  type="text"
                  autoFocus
                  className="w-full pl-16 pr-14 py-8 bg-transparent border-b-2 border-slate-200 focus:border-black outline-none text-2xl font-bold transition-all placeholder:text-slate-300 text-black"
                  placeholder="Where to?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isLoading && (
                  <div className="absolute inset-y-0 right-5 flex items-center">
                    <div className="w-5 h-5 border-2 border-slate-200 border-t-black rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Results Dropdown - Solid Opaque Background */}
              {results.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-4 bg-white rounded-2xl overflow-hidden z-[100] shadow-2xl animate-in fade-in slide-in-from-top-2 border border-slate-200">
                  {results.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="w-full px-6 py-6 text-left hover:bg-slate-100 flex items-center justify-between group transition-colors border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <MapPin size={18} className="text-slate-500" />
                        <div>
                          <div className="font-black text-sm uppercase tracking-tight">{loc.name}</div>
                          <div className="text-[10px] text-slate-600 uppercase tracking-widest mt-1 truncate max-w-[200px] md:max-w-md">{loc.address}</div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-black" />
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
                  className="px-5 py-3 rounded-full border border-slate-200 text-slate-500 hover:border-black hover:bg-black hover:text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all"
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
                className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-black transition-colors flex items-center gap-2"
              >
                <X size={14} /> Back to Search
              </button>
              
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  {selectedLocation.category}
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                  {selectedLocation.name}
                </h2>
                <p className="text-base text-slate-600 font-medium max-w-md">
                  {selectedLocation.address}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-10 rounded-[40px] flex flex-col justify-between min-h-[180px]">
                <div className="flex items-center gap-3">
                  <div className="pulse-dot"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Traffic</span>
                </div>
                <div className="text-4xl font-black tracking-tighter">
                  {busynessData.find(d => d.hour === currentHour)?.live ? (
                    <span>~{(busynessData.find(d => d.hour === currentHour)!.live! * 100).toFixed(0)}%</span>
                  ) : 'Calm'}
                </div>
              </div>
              <div className="glass-card p-10 rounded-[40px] flex flex-col justify-between min-h-[180px]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Typical Peak</span>
                <div className="text-4xl font-black tracking-tighter uppercase">
                  {formatHour(dataToPeakHour(busynessData))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Activity Graph</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live</span>
                  </div>
                </div>
              </div>
              <BusynessChart data={busynessData} currentHour={currentHour} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto pt-32 opacity-20">
        {/* Footer text removed as requested */}
      </footer>
    </div>
  );
};

const dataToPeakHour = (data: PopularityData[]) => {
  if (!data.length) return 0;
  return data.reduce((prev, current) => (prev.historical > current.historical) ? prev : current).hour;
};

export default App;
