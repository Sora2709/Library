// src/app/(auth)/layout.tsx
"use client";
import { useEffect, useState, useRef } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [particles, setParticles] = useState<Array<{ 
    id: number; 
    left: string; 
    top: string; 
    delay: string; 
    duration: string;
    tx: string;
    ty: string;
    tx2: string;
    ty2: string;
  }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Generate particles only on client side
  useEffect(() => {
    setMounted(true);
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${10 + Math.random() * 20}s`,
      tx: `${(Math.random() - 0.5) * 200}px`,
      ty: `${(Math.random() - 0.5) * 200}px`,
      tx2: `${(Math.random() - 0.5) * 200}px`,
      ty2: `${(Math.random() - 0.5) * 200}px`,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Prevent hydration mismatch by not rendering particles on server
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary Gradient Orbs */}
          <div className="absolute -top-[40%] -right-[20%] w-[70%] h-[70%] bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/10 rounded-full blur-3xl animate-float-orb-1" />
          <div className="absolute -bottom-[40%] -left-[20%] w-[70%] h-[70%] bg-gradient-to-tr from-purple-400/15 via-pink-400/10 to-blue-400/15 rounded-full blur-3xl animate-float-orb-2" />
          
          {/* Secondary Gradient Orbs */}
          <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-[15%] right-[5%] w-[35%] h-[35%] bg-indigo-400/10 rounded-full blur-3xl animate-pulse-slower" />
          
          {/* Animated Grid Lines */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Mouse Follow Glow */}
        <div
          className="absolute pointer-events-none w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-400/5 via-indigo-400/5 to-purple-400/5 blur-3xl transition-all duration-300 ease-out"
          style={{
            left: `calc(50% + ${mousePosition.x * 100}px)`,
            top: `calc(50% + ${mousePosition.y * 100}px)`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Glassmorphism Overlay Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl animate-float-glass-1" />
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl animate-float-glass-2" />
          <div className="absolute top-20 right-20 w-20 h-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float-glass-3" />
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float-glass-4" />
        </div>

        {/* Center Glass Ring */}
        <div 
          className="absolute pointer-events-none w-[500px] h-[500px] rounded-full border border-white/10 backdrop-blur-3xl animate-pulse-ring"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Main Content */}
        <div className="relative w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none animate-in fade-in duration-1000 delay-500">
          <p className="text-xs text-slate-400/60">
            Secure Authentication • {new Date().getFullYear()}
          </p>
        </div>

        <style jsx global>{`
          @keyframes float-orb-1 {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(30px, -20px); }
            50% { transform: translate(0, -30px); }
            75% { transform: translate(-20px, -10px); }
          }

          @keyframes float-orb-2 {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(-25px, 15px); }
            66% { transform: translate(15px, 25px); }
          }

          @keyframes float-glass-1 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }

          @keyframes float-glass-2 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(10px) rotate(-5deg); }
          }

          @keyframes float-glass-3 {
            0%, 100% { transform: translateY(0px) rotate(12deg) scale(1); }
            50% { transform: translateY(-8px) rotate(22deg) scale(1.05); }
          }

          @keyframes float-glass-4 {
            0%, 100% { transform: translateY(0px) rotate(-6deg) scale(1); }
            50% { transform: translateY(8px) rotate(4deg) scale(1.08); }
          }

          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }

          @keyframes pulse-slower {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.15); }
          }

          @keyframes pulse-ring {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
          }

          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slide-in-from-bottom-4 {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-in {
            animation-fill-mode: both;
          }

          .fade-in {
            animation: fade-in 0.7s ease-out;
          }

          .slide-in-from-bottom-4 {
            animation: slide-in-from-bottom-4 0.7s ease-out;
          }

          .delay-500 {
            animation-delay: 0.5s;
          }

          .duration-1000 {
            animation-duration: 1s;
          }

          .animate-float-orb-1 {
            animation: float-orb-1 25s ease-in-out infinite;
          }

          .animate-float-orb-2 {
            animation: float-orb-2 30s ease-in-out infinite 2s;
          }

          .animate-float-glass-1 {
            animation: float-glass-1 6s ease-in-out infinite;
          }

          .animate-float-glass-2 {
            animation: float-glass-2 7s ease-in-out infinite 1s;
          }

          .animate-float-glass-3 {
            animation: float-glass-3 8s ease-in-out infinite 0.5s;
          }

          .animate-float-glass-4 {
            animation: float-glass-4 9s ease-in-out infinite 1.5s;
          }

          .animate-pulse-slow {
            animation: pulse-slow 8s ease-in-out infinite;
          }

          .animate-pulse-slower {
            animation: pulse-slower 10s ease-in-out infinite 2s;
          }

          .animate-pulse-ring {
            animation: pulse-ring 12s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-50 relative overflow-hidden"
    >
      {/* Animated Background Meshes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Gradient Orbs */}
        <div 
          className="absolute -top-[40%] -right-[20%] w-[70%] h-[70%] bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/10 rounded-full blur-3xl animate-float-orb-1"
        />
        
        <div 
          className="absolute -bottom-[40%] -left-[20%] w-[70%] h-[70%] bg-gradient-to-tr from-purple-400/15 via-pink-400/10 to-blue-400/15 rounded-full blur-3xl animate-float-orb-2"
        />

        {/* Secondary Gradient Orbs */}
        <div 
          className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-3xl animate-pulse-slow"
        />

        <div 
          className="absolute bottom-[15%] right-[5%] w-[35%] h-[35%] bg-indigo-400/10 rounded-full blur-3xl animate-pulse-slower"
        />

        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating Particles - Only rendered on client */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full animate-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              '--tx': particle.tx,
              '--ty': particle.ty,
              '--tx2': particle.tx2,
              '--ty2': particle.ty2,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Mouse Follow Glow */}
      <div
        className="absolute pointer-events-none w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-400/5 via-indigo-400/5 to-purple-400/5 blur-3xl transition-all duration-300 ease-out"
        style={{
          left: `calc(50% + ${mousePosition.x * 100}px)`,
          top: `calc(50% + ${mousePosition.y * 100}px)`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Glassmorphism Overlay Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left Glass Blob */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl animate-float-glass-1" />

        {/* Bottom Right Glass Blob */}
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl animate-float-glass-2" />

        {/* Top Right Glass Square */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float-glass-3" />

        {/* Bottom Left Glass Square */}
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float-glass-4" />
      </div>

      {/* Center Glass Ring */}
      <div 
        className="absolute pointer-events-none w-[500px] h-[500px] rounded-full border border-white/10 backdrop-blur-3xl animate-pulse-ring"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Main Content with Entrance Animation */}
      <div className="relative w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </div>

      {/* Footer with Animation */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none animate-in fade-in duration-1000 delay-500">
        <p className="text-xs text-slate-400/60">
          Secure Authentication • {new Date().getFullYear()}
        </p>
      </div>

      {/* Scroll Progress Indicator */}
      {scrolled && (
        <div 
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-50 transition-all duration-100"
          style={{ 
            width: `${(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%` 
          }}
        />
      )}

      <style jsx global>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -20px); }
          50% { transform: translate(0, -30px); }
          75% { transform: translate(-20px, -10px); }
        }

        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-25px, 15px); }
          66% { transform: translate(15px, 25px); }
        }

        @keyframes float-glass-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes float-glass-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(10px) rotate(-5deg); }
        }

        @keyframes float-glass-3 {
          0%, 100% { transform: translateY(0px) rotate(12deg) scale(1); }
          50% { transform: translateY(-8px) rotate(22deg) scale(1.05); }
        }

        @keyframes float-glass-4 {
          0%, 100% { transform: translateY(0px) rotate(-6deg) scale(1); }
          50% { transform: translateY(8px) rotate(4deg) scale(1.08); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }

        @keyframes pulse-ring {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
        }

        @keyframes particle-float {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          20% { opacity: 0.5; }
          50% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translate(var(--tx2), var(--ty2)) scale(0); opacity: 0; }
        }

        .animate-float-orb-1 {
          animation: float-orb-1 25s ease-in-out infinite;
        }

        .animate-float-orb-2 {
          animation: float-orb-2 30s ease-in-out infinite 2s;
        }

        .animate-float-glass-1 {
          animation: float-glass-1 6s ease-in-out infinite;
        }

        .animate-float-glass-2 {
          animation: float-glass-2 7s ease-in-out infinite 1s;
        }

        .animate-float-glass-3 {
          animation: float-glass-3 8s ease-in-out infinite 0.5s;
        }

        .animate-float-glass-4 {
          animation: float-glass-4 9s ease-in-out infinite 1.5s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite 2s;
        }

        .animate-pulse-ring {
          animation: pulse-ring 12s ease-in-out infinite;
        }

        .animate-particle {
          animation: particle-float var(--duration, 15s) ease-in-out infinite;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in-from-bottom-4 {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fade-in 0.7s ease-out;
        }

        .slide-in-from-bottom-4 {
          animation: slide-in-from-bottom-4 0.7s ease-out;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .duration-1000 {
          animation-duration: 1s;
        }
      `}</style>
    </div>
  );
}