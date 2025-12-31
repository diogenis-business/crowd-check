
import React from 'react';
import { PopularityData } from '../types';

interface BusynessChartProps {
  data: PopularityData[];
  currentHour: number;
}

export const BusynessChart: React.FC<BusynessChartProps> = ({ data, currentHour }) => {
  return (
    <div className="w-full select-none">
      <div className="flex items-end justify-between h-40 gap-[3px] md:gap-1.5 px-1 relative">
        {data.map((item) => {
          const isCurrent = item.hour === currentHour;
          const height = `${Math.max(item.historical * 100, 2)}%`;
          const liveHeight = item.live !== undefined ? `${Math.max(item.live * 100, 3)}%` : null;

          return (
            <div key={item.hour} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Historical Bar - Darkened from slate-100/200 to slate-200/300 */}
              <div 
                className={`w-full rounded-sm chart-bar origin-bottom transition-all duration-300
                  ${isCurrent 
                    ? 'bg-slate-300' 
                    : 'bg-slate-200 group-hover:bg-slate-400'
                  }`}
                style={{ height }}
              />

              {/* Live Overlay Bar - Solid Black */}
              {isCurrent && liveHeight && (
                <div 
                  className="absolute bottom-0 w-full rounded-sm bg-black z-[1] origin-bottom shadow-lg shadow-black/10"
                  style={{ height: liveHeight }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-6 px-1 text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
};
