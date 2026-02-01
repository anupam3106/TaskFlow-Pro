
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3 px-1">
        <span className="text-xs font-black uppercase tracking-widest text-white/60">Completion</span>
        <span className="text-4xl font-black leading-none">{percentage}%</span>
      </div>
      <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-3 text-[10px] font-bold text-white/50 uppercase tracking-widest">
        {current} of {total} milestones reached
      </p>
    </div>
  );
};

export default ProgressBar;
