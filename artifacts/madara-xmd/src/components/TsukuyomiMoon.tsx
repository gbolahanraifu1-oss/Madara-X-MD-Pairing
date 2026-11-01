export function TsukuyomiMoon() {
  return (
    <div className="relative flex items-center justify-center pointer-events-none">
      <style>{`
        @keyframes moonPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 50px rgba(255,20,20,0.7)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 0 90px rgba(255,0,0,1)); }
        }
        @keyframes tomoeSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Moon Container */}
      <div
        className="relative w-52 h-52 md:w-68 md:h-68 rounded-full overflow-hidden border border-red-500/40 bg-black"
        style={{ animation: "moonPulse 4s ease-in-out infinite" }}
      >
        {/* Realistic Red Moon Image Texture */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}watermarked_img_11926420248946405452.jpg)`,
            filter: "contrast(1.25) saturate(1.5)",
          }}
        />

        {/* Cinematic Vignette Shadow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(30,0,0,0.85)_85%)] mix-blend-multiply" />

        {/* Rinne-Sharingan Tomoe & Ripple Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-full h-full relative flex items-center justify-center opacity-90"
            style={{ animation: "tomoeSpin 25s linear infinite" }}
          >
            {/* Concentric Ripple Rings */}
            <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full border border-black/60" />
            <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border border-black/70" />
            <div className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full border border-black/80" />

            {/* Tomoe Markers */}
            <div className="absolute top-6 w-3.5 h-3.5 bg-black rounded-full shadow-[0_0_8px_#ff0000]" />
            <div className="absolute bottom-8 right-12 w-3.5 h-3.5 bg-black rounded-full shadow-[0_0_8px_#ff0000]" />
            <div className="absolute bottom-8 left-12 w-3.5 h-3.5 bg-black rounded-full shadow-[0_0_8px_#ff0000]" />
          </div>
        </div>
      </div>
    </div>
  );
}
