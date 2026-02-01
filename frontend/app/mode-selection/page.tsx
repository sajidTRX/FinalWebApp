"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HistoryIcon,
  Settings,
  Bell,
  User,
  HelpCircle,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

// Animated Star Component using React state - Blinking effect
const AnimatedStar = ({ 
  className, 
  style, 
  group = "a" 
}: { 
  className?: string; 
  style?: React.CSSProperties; 
  group?: "a" | "b" 
}) => {
  const [opacity, setOpacity] = useState(group === "a" ? 0.4 : 0.9);
  const [scale, setScale] = useState(1);
  
  React.useEffect(() => {
    const duration = 1800; // 1.8 seconds for animation cycle
    const steps = 60;
    const interval = duration / steps;
    let step = group === "a" ? 0 : steps / 2; // Group B starts opposite for alternating effect
    
    const timer = setInterval(() => {
      step = (step + 1) % steps;
      const progress = Math.sin((step / steps) * Math.PI * 2);
      setOpacity(0.3 + (progress + 1) * 0.35); // 0.3 to 1.0 for visible blink
      setScale(1 + (progress + 1) * 0.1); // 1.0 to 1.2 for noticeable pulse
    }, interval);
    
    return () => clearInterval(timer);
  }, [group]);
  
  return (
    <span 
      className={className} 
      style={{ 
        ...style, 
        opacity, 
        transform: `scale(${scale})`,
        transition: 'opacity 50ms linear, transform 50ms linear',
        display: 'inline-block',
        textShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 4px rgba(0,0,0,0.3)'
      }}
    >
      ✦
    </span>
  );
};

const writingModes = [
  { value: "novel", label: "Novel", path: "/novel/documents" },
  { value: "note", label: "Note", path: "/note/documents" },
  { value: "journal", label: "Journal", path: "/journal" },
];

export default function ModeSelectionPage() {
  const router = useRouter();

  const handleModeClick = (path: string) => {
    router.push(path);
  };

  return (
    <div 
      className="h-screen w-screen fixed inset-0"
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundImage: 'url(/tagore-theme.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '100% 100%',
        overflowX: 'hidden',
      }}
    >
      
      {/* Animated Blinking Stars Overlay */}
      {/* Top area stars */}
      <AnimatedStar 
        className="absolute text-[#e8ddd0] z-20" 
        style={{ top: '8%', left: '8%', fontSize: '24px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#e8ddd0] z-20" 
        style={{ top: '8%', right: '8%', fontSize: '24px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#d4c4a8] z-20" 
        style={{ top: '15%', left: '18%', fontSize: '18px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#d4c4a8] z-20" 
        style={{ top: '15%', right: '18%', fontSize: '18px' }} 
        group="b" 
      />
      
      {/* Middle area stars - near the title */}
      <AnimatedStar 
        className="absolute text-[#c9b896] z-20" 
        style={{ top: '22%', left: '25%', fontSize: '20px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#c9b896] z-20" 
        style={{ top: '22%', right: '25%', fontSize: '20px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#e8ddd0] z-20" 
        style={{ top: '30%', left: '12%', fontSize: '16px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#e8ddd0] z-20" 
        style={{ top: '30%', right: '12%', fontSize: '16px' }} 
        group="b" 
      />
      
      {/* Side stars */}
      <AnimatedStar 
        className="absolute text-[#8b7d6b] z-20" 
        style={{ top: '45%', left: '5%', fontSize: '14px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#8b7d6b] z-20" 
        style={{ top: '45%', right: '5%', fontSize: '14px' }} 
        group="a" 
      />
      
      {/* Bottom area stars */}
      <AnimatedStar 
        className="absolute text-[#6b5d4d] z-20" 
        style={{ bottom: '15%', left: '10%', fontSize: '18px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#6b5d4d] z-20" 
        style={{ bottom: '15%', right: '10%', fontSize: '18px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#4a3f32] z-20" 
        style={{ bottom: '8%', left: '20%', fontSize: '22px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#4a3f32] z-20" 
        style={{ bottom: '8%', right: '20%', fontSize: '22px' }} 
        group="a" 
      />
      
      {/* Corner stars */}
      <AnimatedStar 
        className="absolute text-[#5a4a3a] z-20" 
        style={{ top: '4%', left: '4%', fontSize: '28px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#5a4a3a] z-20" 
        style={{ top: '4%', right: '4%', fontSize: '28px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#5a4a3a] z-20" 
        style={{ bottom: '4%', left: '4%', fontSize: '28px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#5a4a3a] z-20" 
        style={{ bottom: '4%', right: '4%', fontSize: '28px' }} 
        group="a" 
      />

      {/* Back button - top left */}
      <div className="absolute top-4 left-4 z-30">
        <BackButton href="/landing" className="bg-[#e8e2d8]/90 hover:bg-[#f0ebe3] text-[#2d2820] border-2 border-[#4a4540]" />
      </div>

      {/* Main Content Card */}
      <div 
        className="absolute z-30"
        style={{
          top: '33%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '500px',
        }}
      >
        <div 
          className="rounded-lg p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,246,242,0.95) 50%, rgba(240,236,228,0.95) 100%)',
            border: '2px solid #4a4540',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          <h2 
            className="text-center mb-8 font-bold"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '28px',
              color: '#2d2820',
              letterSpacing: '0.05em',
            }}
          >
            Start Writing
          </h2>
          
          {/* Mode Selection Buttons */}
          <div className="flex flex-col gap-4">
            {writingModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => handleModeClick(mode.path)}
                className="w-full px-6 py-4 rounded-md text-lg font-medium transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a4540] focus-visible:ring-offset-2"
                style={{
                  backgroundColor: '#e8e2d8',
                  color: '#2d2820',
                  border: '2px solid #4a4540',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0ebe3';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e2d8';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Center Settings Bar - Oval Style */}
      <div 
        className="absolute bottom-8 left-1/2 flex flex-row items-center justify-center space-x-3 rounded-full bg-[#e8e2d8] border-2 border-[#4a4540] px-6 py-3 shadow-md hover:shadow-lg transition-all duration-150"
        style={{ 
          zIndex: 9999,
          transform: 'translateX(-50%)',
          fontFamily: "'Playfair Display', Georgia, serif",
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        }}
      >
        <button
          onClick={() => router.push("/history")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="History"
        >
          <HistoryIcon className="h-5 w-5 text-[#4a3f32]" />
        </button>
        <button
          onClick={() => router.push("/device-settings")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Settings"
        >
          <Settings className="h-5 w-5 text-[#4a3f32]" />
        </button>
        <button
          onClick={() => router.push("/notifications")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Notifications"
        >
          <Bell className="h-5 w-5 text-[#4a3f32]" />
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Profile"
        >
          <User className="h-5 w-5 text-[#4a3f32]" />
        </button>
        <button
          onClick={() => router.push("/help")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Help"
        >
          <HelpCircle className="h-5 w-5 text-[#4a3f32]" />
        </button>
      </div>
    </div>
  );
}
