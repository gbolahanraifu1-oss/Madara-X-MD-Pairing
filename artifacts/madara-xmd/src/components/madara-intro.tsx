import { useEffect, useState, useCallback, useRef } from "react";

type Phase =
  | "sharingan"
  | "tsukuyomi"
  | "tap1"
  | "susanoo"
  | "tap2"
  | "exit"
  | "done";

const SKIP_KEY = "madara_intro_done";

export function shouldPlayIntro() {
  try {
    return sessionStorage.getItem(SKIP_KEY) !== "1";
  } catch {
    return true;
  }
}

export function MadaraIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("sharingan");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (phase === "sharingan") {
      const t = setTimeout(() => setPhase("tsukuyomi"), 3000);
      return () => clearTimeout(t);
    }
    if (phase === "tsukuyomi") {
      const t = setTimeout(() => setPhase("tap1"), 2500);
      return () => clearTimeout(t);
    }
    if (phase === "susanoo") {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.muted = false;
        v.play().catch(() => {});
      }
      const t = setTimeout(() => setPhase("tap2"), 3500);
      return () => clearTimeout(t);
    }
    if (phase === "exit") {
      const t = setTimeout(() => {
        try {
          sessionStorage.setItem(SKIP_KEY, "1");
        } catch {}
        setPhase("done");
        onDone();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SKIP_KEY, "1");
    } catch {}
    onDone();
  }, [onDone]);

  const onTap = useCallback(() => {
    if (phase === "tap1") setPhase("susanoo");
    else if (phase === "susanoo" || phase === "tap2") setPhase("exit");
  }, [phase]);

  if (phase === "done") return null;

  const showEye =
    phase === "sharingan" || phase === "tsukuyomi" || phase === "tap1";
  const showSusanoo =
    phase === "susanoo" || phase === "tap2" || phase === "exit";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black select-none cursor-pointer"
      onClick={onTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onTap();
      }}
    >
      <style>{`
        @keyframes madaraBlink {
          0%, 100% {
            opacity: 0.35;
            filter: drop-shadow(0 0 4px #ff0000);
            text-shadow: 0 0 8px rgba(255, 0, 0, 0.4);
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 18px #ff2222) drop-shadow(0 0 32px #ff0000);
            text-shadow: 0 0 20px rgba(255, 50, 50, 0.95), 0 0 40px rgba(255, 0, 0, 0.6);
          }
        }
        @keyframes madaraSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes floatRings {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.03); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes ashDrift {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-110vh) translateX(40px); opacity: 0; }
        }
      `}</style>

      {/* Rich Ambient Background with Crimson Lighting */}
      <div
        className={
          "absolute inset-0 transition-all duration-1000 " +
          (phase === "tsukuyomi" || phase === "tap1"
            ? "opacity-100 bg-[radial-gradient(circle_at_center,#6b0202_0%,#1f0000_50%,#050000_100%)]"
            : phase === "susanoo" || phase === "tap2" || phase === "exit"
              ? "opacity-100 bg-black"
              : "opacity-95 bg-black")
        }
      />

      {/* Floating Ember / Ash Particles */}
      {(phase === "tsukuyomi" || phase === "tap1" || showSusanoo) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(18)].map((_, i) => (
            <span
              key={i}
              className="absolute bg-red-500 rounded-full blur-[1px]"
              style={{
                top: `${Math.random() * 100}vh`,
                left: `${Math.random() * 100}vw`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                boxShadow: "0 0 8px #ff1a1a, 0 0 12px #ff4d4d",
                animation: `ashDrift ${Math.random() * 4 + 3}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Realistic Infinite Tsukuyomi Blood Moon */}
      {(phase === "tsukuyomi" || phase === "tap1") && (
        <div className="absolute top-[8%] flex items-center justify-center pointer-events-none z-0">
          {/* Outer Ring / Chakra Aura */}
          <div
            className="absolute w-52 h-52 md:w-72 md:h-72 rounded-full border border-red-500/30 opacity-70"
            style={{ animation: "floatRings 12s linear infinite" }}
          />
          <div
            className="absolute w-44 h-44 md:w-64 md:h-64 rounded-full border border-red-400/40 opacity-50"
            style={{ animation: "floatRings 8s linear infinite reverse" }}
          />

          {/* The Realistic Moon Body */}
          <div
            className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden shadow-[0_0_100px_#ff1a1a,inset_-25px_-25px_40px_rgba(0,0,0,0.9),inset_10px_10px_30px_rgba(255,100,100,0.3)]"
            style={{ animation: "pulseGlow 4s ease-in-out infinite" }}
          >
            {/* Texture overlay for realistic crater/swirl details */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,120,120,0.4)_0%,rgba(130,0,0,0.8)_60%,rgba(20,0,0,1)_100%)] mix-blend-overlay" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_70%,rgba(80,0,0,0.9)_0%,transparent_70%)]" />

            {/* Tomoe Pattern Rings embedded in the Moon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-75">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-2 border-black/80 flex items-center justify-center shadow-[0_0_15px_#ff0000]">
                <div className="w-12 h-12 md:w-18 md:h-18 rounded-full border border-black/90" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sharingan Eye */}
      {showEye && (
        <div
          className={
            "relative z-10 transition-all duration-1000 " +
            (phase === "sharingan"
              ? "scale-100 opacity-100"
              : "scale-[1.35] opacity-40 blur-[1px]")
          }
        >
          <img
            src={`${import.meta.env.BASE_URL}sharingan.jpg`}
            alt="Sharingan"
            className="w-48 h-48 md:w-68 md:h-68 object-contain drop-shadow-[0_0_50px_#ff0000]"
            style={{ animation: "madaraSpin 5s linear infinite" }}
            draggable={false}
          />
        </div>
      )}

      {/* Susanoo Video - Fullscreen immersive cover */}
      {showSusanoo && (
        <div className="absolute inset-0 z-10 w-full h-full overflow-hidden bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}susanoo.mp4`}
            className="absolute inset-0 w-full h-full object-cover scale-105"
            playsInline
            autoPlay
          />
          {/* Cinematic lighting vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50 pointer-events-none" />
          <div className="absolute bottom-24 left-0 right-0 text-center z-20 font-mono text-red-400 tracking-[0.3em] text-xs md:text-sm uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Susanoo · Manifesting
          </div>
        </div>
      )}

      {/* Interactive Prompts */}
      <div className="absolute bottom-16 left-0 right-0 text-center z-20 px-6 pointer-events-none">
        {phase === "sharingan" && (
          <p className="font-mono text-red-500/70 text-xs tracking-[0.4em]">
            SHARINGAN
          </p>
        )}
        {phase === "tsukuyomi" && (
          <p className="font-mono text-red-400/80 text-xs tracking-[0.35em]">
            INFINITE TSUKUYOMI
          </p>
        )}
        {phase === "tap1" && (
          <p className="font-mono text-red-300 text-sm md:text-base tracking-widest animate-pulse drop-shadow-[0_0_12px_#ff3333]">
            TAP SCREEN TO CONTINUE
          </p>
        )}
        {(phase === "susanoo" || phase === "tap2") && (
          <p
            className="font-mono text-red-200 text-sm md:text-base tracking-[0.35em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            style={{ animation: "madaraBlink 1.1s ease-in-out infinite" }}
          >
            TAP TO SKIP
          </p>
        )}
      </div>

      {/* Exit Fade */}
      {phase === "exit" && (
        <div className="absolute inset-0 z-30 bg-black animate-in fade-in duration-700" />
      )}

      {/* Top Right Skip Button */}
      <button
        type="button"
        className="absolute top-4 right-4 z-40 text-[10px] font-mono text-white/50 hover:text-white tracking-widest bg-black/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-sm transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
      >
        SKIP
      </button>
    </div>
  );
}
