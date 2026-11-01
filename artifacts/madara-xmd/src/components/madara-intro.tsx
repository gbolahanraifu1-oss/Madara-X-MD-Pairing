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
      const t = setTimeout(() => setPhase("tsukuyomi"), 2800);
      return () => clearTimeout(t);
    }
    if (phase === "tsukuyomi") {
      const t = setTimeout(() => setPhase("tap1"), 2200);
      return () => clearTimeout(t);
    }
    if (phase === "susanoo") {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.muted = false;
        v.play().catch(() => {});
      }
      // Show skip prompt early — don't wait full 15s
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
    // Tap anytime during susanoo or tap2 to skip
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
      `}</style>

      {/* Ambient */}
      <div
        className={
          "absolute inset-0 transition-opacity duration-1000 " +
          (phase === "tsukuyomi" || phase === "tap1"
            ? "opacity-100 bg-[radial-gradient(circle_at_center,#5c0000_0%,#1a0000_55%,#000_100%)]"
            : phase === "susanoo" || phase === "tap2" || phase === "exit"
              ? "opacity-100 bg-[radial-gradient(circle_at_center,#3b0a0a_0%,#0a0000_60%,#000_100%)]"
              : "opacity-95 bg-black")
        }
      />

      {/* Infinite Tsukuyomi moon */}
      {(phase === "tsukuyomi" || phase === "tap1") && (
        <div className="absolute top-[10%] w-36 h-36 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-red-500 via-red-700 to-red-950 shadow-[0_0_80px_#ff1a1a] animate-pulse" />
      )}

      {/* Sharingan.jpg */}
      {showEye && (
        <div
          className={
            "relative z-10 transition-all duration-1000 " +
            (phase === "sharingan"
              ? "scale-100 opacity-100"
              : "scale-[1.35] opacity-45 blur-[2px]")
          }
        >
          <img
            src={`${import.meta.env.BASE_URL}sharingan.jpg`}
            alt="Sharingan"
            className="w-44 h-44 md:w-64 md:h-64 object-contain drop-shadow-[0_0_40px_#ff0000]"
            style={{ animation: "madaraSpin 5s linear infinite" }}
            draggable={false}
          />
        </div>
      )}

      {/* Susanoo.mp4 */}
      {showSusanoo && (
        <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-4">
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}susanoo.mp4`}
            className="w-full max-h-[55vh] object-contain drop-shadow-[0_0_50px_#ff2222aa]"
            
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

      {/* Exit fade */}
      {phase === "exit" && (
        <div className="absolute inset-0 z-30 bg-black animate-in fade-in duration-700" />
      )}

      {/* Always-on skip */}
      <button
        type="button"
        className="absolute top-4 right-4 z-40 text-[10px] font-mono text-white/30 hover:text-white/70 tracking-widest"
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