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
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 40px rgba(255,0,0,0.6)); }
          50% { transform: scale(1.02); filter: drop-shadow(0 0 70px rgba(255,0,0,0.9)); }
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
            ? "opacity-100 bg-[radial-gradient(circle_at_center,#5c0000_0%,#140000_60%,#000_100%)]"
            : phase === "susanoo" || phase === "tap2" || phase === "exit"
              ? "opacity-100 bg-black"
              : "opacity-95 bg-black")
        }
      />

      {/* Ash Particles */}
      {(phase === "tsukuyomi" || phase === "tap1" || showSusanoo) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(12)].map((_, i) => (
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

      {/* Accurate Rinne-Sharingan Blood Moon */}
      {(phase === "tsukuyomi" || phase === "tap1") && (
        <div className="absolute top-[12%] flex flex-col items-center justify-center pointer-events-none z-0">
          <div
            className="relative w-44 h-44 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-[#3a0000] via-[#8B0000] to-[#ff1a1a] flex items-center justify-center border-2 border-red-600/60"
            style={{ animation: "moonPulse 4s ease-in-out infinite" }}
          >
            {/* Rinnegan Ripple Circles */}
            <div className="absolute inset-2 rounded-full border border-black/50 flex items-center justify-center">
              <div className="absolute inset-3 rounded-full border border-black/40 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full border border-black/40 flex items-center justify-center">
                  <div className="absolute inset-4 rounded-full border border-black/60 flex items-center justify-center">
                    {/* Inner core tomoe dots */}
                    <div className="w-3 h-3 bg-black rounded-full shadow-[0_0_8px_#ff0000]" />
                  </div>
                </div>
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

      {/* Susanoo Video - Fixed to fit screen cleanly without over-zooming */}
      {showSusanoo && (
        <div className="absolute inset-0 z-10 w-full h-full flex flex-col items-center justify-center bg-black px-4">
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}susanoo.mp4`}
            className="w-full max-w-2xl max-h-[65vh] object-contain drop-shadow-[0_0_30px_#ff1a1a55]"
            playsInline
            autoPlay
          />
          <div className="mt-4 font-mono text-red-400 tracking-[0.3em] text-xs md:text-sm uppercase">
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
            className="font-mono text-red-200 text-sm md:text-base tracking-[0.35em] uppercase"
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
