import React from 'react';

export const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      {/* 1. Subtle SVG Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="campus-grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#3F3F46"
              strokeWidth="0.75"
              strokeDasharray="2 2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#campus-grid-pattern)" />
      </svg>

      {/* 2. Floating Ambient Light Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#A3E635]/10 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse"
        style={{ animationDuration: '6s' }}
      />
      <div
        className="absolute top-[40%] left-[-10%] w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[130px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />

      {/* 3. Subtle Animated Network Graph Nodes (Campus Route Emulation) */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        {/* Node Points & Connecting Paths */}
        <line
          x1="15%"
          y1="25%"
          x2="35%"
          y2="15%"
          stroke="#A3E635"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        <line
          x1="35%"
          y1="15%"
          x2="60%"
          y2="30%"
          stroke="#A3E635"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
        <line
          x1="60%"
          y1="30%"
          x2="85%"
          y2="20%"
          stroke="#A3E635"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="animate-pulse"
        />
        <line
          x1="35%"
          y1="15%"
          x2="45%"
          y2="65%"
          stroke="#3F3F46"
          strokeWidth="1"
        />
        <line
          x1="60%"
          y1="30%"
          x2="75%"
          y2="70%"
          stroke="#A3E635"
          strokeWidth="1"
          strokeDasharray="5 5"
        />

        {/* Pulsing Nodes */}
        <circle cx="15%" cy="25%" r="4" fill="#A3E635" className="animate-ping" />
        <circle cx="15%" cy="25%" r="3" fill="#A3E635" />

        <circle cx="35%" cy="15%" r="4" fill="#A3E635" />

        <circle cx="60%" cy="30%" r="5" fill="#A3E635" className="animate-ping" />
        <circle cx="60%" cy="30%" r="4" fill="#A3E635" />

        <circle cx="85%" cy="20%" r="3.5" fill="#A3E635" />
        <circle cx="45%" cy="65%" r="3" fill="#A1A1AA" />
        <circle cx="75%" cy="70%" r="4" fill="#A3E635" className="animate-ping" />
      </svg>
    </div>
  );
};
