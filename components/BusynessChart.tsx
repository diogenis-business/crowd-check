
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
        {data.map((item, index) => {
          const isCurrent = item.hour === currentHour;
          const height = `${Math.max(item.historical * 100, 2)}%`;
          const liveHeight = item.live !== undefined ? `${Math.max(item.live * 100, 3)}%` : null;
          
          // Staggered delay based on index for a wave effect
          const staggerDelay = `${index * 20}ms`;

          return (
            <div key={item.hour} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Historical Bar */}
              <div 
                className={`w-full rounded-sm chart-bar origin-bottom
                  ${isCurrent 
                    ? 'bg-[var(--chart-current)]' 
                    : 'bg-[var(--chart-historical)] group-hover:bg-[var(--chart-hover)]'
                  }`}
                style={{ height, transitionDelay: staggerDelay }}
              />

              {/* Live Overlay Bar - Solid Foreground color */}
              {isCurrent && liveHeight && (
                <div 
                  className="absolute bottom-0 w-full rounded-sm bg-foreground z-[1] origin-bottom shadow-lg shadow-black/10 transition-all duration-700 ease-out"
                  style={{ height: liveHeight, transitionDelay: staggerDelay }}
                />
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {(item.historical * 100).toFixed(0)}%
              </div>
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
