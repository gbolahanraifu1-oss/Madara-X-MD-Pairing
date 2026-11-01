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
        @keyframes moonPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 60px rgba(255,20,20,0.8)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 0 90px rgba(255,0,0,1)); }
        }
        @keyframes tomoeSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ashDrift {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
      `}</style>

      {/* Ambient Background */}
      <div
        className={
          "absolute inset-0 transition-all duration-1000 " +
          (phase === "tsukuyomi" || phase === "tap1"
            ? "opacity-100 bg-[radial-gradient(circle_at_center,#6b0000_0%,#1a0000_55%,#000_100%)]"
            : phase === "susanoo" || phase === "tap2" || phase === "exit"
              ? "opacity-100 bg-black"
              : "opacity-95 bg-black")
        }
      />

      {/* Ash Particles */}
      {(phase === "tsukuyomi" || phase === "tap1" || showSusanoo) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className="absolute bg-red-500 rounded-full blur-[1px]"
              style={{
                top: `${Math.random() * 100}vh`,
                left: `${Math.random() * 100}vw`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                boxShadow: "0 0 6px #ff1a1a",
                animation: `ashDrift ${Math.random() * 4 + 4}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Realistic Infinite Tsukuyomi Blood Moon with Tomoe Overlay */}
      {(phase === "tsukuyomi" || phase === "tap1") && (
        <div className="absolute top-[8%] flex items-center justify-center pointer-events-none z-0">
          <div
            className="relative w-52 h-52 md:w-68 md:h-68 rounded-full overflow-hidden border border-red-500/40"
            style={{ animation: "moonPulse 4s ease-in-out infinite" }}
          >
            {/* Realistic Red Moon Texture Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}watermarked_img_11926420248946405452.jpg)`,
                filter: "contrast(1.2) saturate(1.4)"
              }}
            />
            {/* Dark vignette blending for celestial depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(40,0,0,0.85)_90%)] mix-blend-multiply" />

            {/* Rinne-Sharingan Tomoe Overlay Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-full h-full relative flex items-center justify-center opacity-85"
                style={{ animation: "tomoeSpin 20s linear infinite" }}
              >
                {/* Outer Ripple Ring */}
                <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full border border-black/60" />
                {/* Middle Ripple Ring */}
                <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border border-black/70" />
                {/* Inner Ripple Ring */}
                <div className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full border border-black/80" />
                
                {/* Tomoe Markers (Accurate placement along the rings) */}
                <div className="absolute top-6 w-3.5 h-3.5 bg-black rounded-full shadow-[0_0_6px_#ff0000]" />
                <div className="absolute bottom-8 right-12 w-3.5 h-3.5 bg-black rounded-full shadow-[0_0_6px_#ff0000]" />
                <div className="absolute bottom-8 left-12 w-3.5 h-3.5 bg-black rounded-full shadow-[0_0_6px_#ff0000]" />
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
            className="w-44 h-44 md:w-60 md:h-60 object-contain drop-shadow-[0_0_40px_#ff0000]"
            style={{ animation: "madaraSpin 5s linear infinite" }}
            draggable={false}
          />
        </div>
      )}

      {/* Susanoo Video - Full Screen Immersive Cover with Loop */}
      {showSusanoo && (
        <div className="absolute inset-0 z-10 w-full h-full overflow-hidden bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}susanoo.mp4`}
            className="absolute inset-0 w-full h-full object-cover scale-105"
            playsInline
            autoPlay
            loop
          />
          {/* Cinematic lighting vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50 pointer-events-none" />
          <div className="absolute bottom-24 left-0 right-0 text-center z-20 font-mono text-red-400 tracking-[0.3em] text-xs md:text-sm uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Susanoo · Manifesting
          </div>
        </div>
      )}

      {/* Prompts */}
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

      {/* Skip Button */}
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
