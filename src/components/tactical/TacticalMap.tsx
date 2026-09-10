import { useMemo, useState } from "react";
import { PixelButton } from "./PixelBits";
const spideyAsset = { url: "/spidey-figure.svg" };
const maskAsset = { url: "/spidey-figure.svg" };
const spideyFigureAsset = { url: "/spidey-figure.svg" };
const hudContainerAsset = { url: "/profile-container.svg" };
const profileContainerAsset = { url: "/hud-container.svg" };
const controlButtonAsset = { url: "/control-button.svg" };
const cityMapAsset = { url: "/city-map.png" };
import {
  defaultConfig,
  initialMarkers,
  type Config,
  type Marker,
  type MarkerState,
} from "./types";

const markerFilter = (s: MarkerState) =>
  s === "friendly"
    ? "hue-rotate(105deg) saturate(1.2)"
    : s === "neutral"
      ? "grayscale(1) brightness(1.1)"
      : s === "target"
        ? "hue-rotate(-25deg) saturate(1.4)"
        : "none";

const stateOrder: MarkerState[] = ["neutral", "friendly", "hostile", "target"];

export default function TacticalMap() {
  const [config] = useState<Config>(defaultConfig);
  const [markers, setMarkers] = useState<Marker[]>(initialMarkers);
  const [activeProfile, setActiveProfile] = useState(config.profiles[0]);
  const [activeAction, setActiveAction] = useState<string | null>("TERRAIN");

  const colorFor = (s: MarkerState) =>
    s === "hostile"
      ? config.hostile
      : s === "friendly"
        ? config.friendly
        : s === "target"
          ? config.accent
          : config.neutral;

  const cycleMarker = (id: string) =>
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              state:
                stateOrder[(stateOrder.indexOf(m.state) + 1) % stateOrder.length] ?? "neutral",
            }
          : m,
      ),
    );

  const counts = useMemo(() => {
    const c: Record<string, number> = { hostile: 0, friendly: 0, neutral: 0, target: 0 };
    markers.forEach((m) => (c[m.state] = (c[m.state] ?? 0) + 1));
    return c;
  }, [markers]);

  const px = { fontFamily: "var(--font-pixel)" } as const;

  return (
    <div className="mx-auto flex w-full max-w-4xl justify-center gap-6">
      {/* Console */}
      <section
        className="relative overflow-hidden rounded-md p-2 sm:p-4"
        style={{
          background: "var(--console-shell)",
          boxShadow:
            "0 -6px 0 0 var(--console-edge), 0 6px 0 0 var(--console-edge), -6px 0 0 0 var(--console-edge), 6px 0 0 0 var(--console-edge)",
        }}
        aria-label="Tactical console"
      >
        {/* Map viewport */}
        <div
          className="relative aspect-[4/3] w-full overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, var(--map-deep) 0%, var(--map-base) 55%, var(--map-deep) 100%)",
            boxShadow: "inset 0 0 0 4px var(--console-edge)",
          }}
        >
          {/* grid */}
          <img
            src={cityMapAsset.url}
            alt="Blue city street map"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            style={{ imageRendering: "auto" }}
          />
          <div className="absolute inset-0 bg-background/20 mix-blend-multiply" />
          <div
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage: `linear-gradient(${config.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${config.gridColor} 1px, transparent 1px)`,
              backgroundSize: "6.25% 8.33%",
            }}
          />
          {/* river band */}
          <div
            className="absolute -left-1/4 top-0 h-[160%] w-[38%] -rotate-[28deg] opacity-70"
            style={{ background: "var(--map-deep)" }}
          />
          {/* crosshair axes */}
          <div
            className="absolute left-0 right-0 top-1/2 h-[2px] opacity-70"
            style={{ background: config.gridColor }}
          />
          <div
            className="absolute bottom-0 top-0 left-[82%] w-[2px] opacity-70"
            style={{ background: config.gridColor }}
          />

          {/* counters + message */}
          <div className="absolute left-1/2 top-[10%] z-10 w-[56%] max-w-[400px] -translate-x-1/2">
            <div
              className="flex items-center justify-center gap-3 text-[12px] text-white sm:text-[18px]"
              style={px}
            >
              <span>{config.timeLeft}</span>
              <span className="inline-block h-10 w-10 overflow-hidden rounded-sm bg-hud-highlight p-[3px] shadow-pixel-sm sm:h-12 sm:w-12">
                <img
                  src={maskAsset.url}
                  alt="Player beacon"
                  className="h-full w-full object-cover"
                  style={{ imageRendering: "pixelated", mixBlendMode: "multiply" }}
                />
              </span>
              <span>{config.timeRight}</span>
            </div>
            <div
              className="mt-2 overflow-hidden rounded-sm border-2 border-hud-frame bg-hud-panel px-3 py-3 text-[10px] leading-[1.6] shadow-pixel-sm sm:text-[13px]"
              style={{
                ...px,
                color: config.friendly,
              }}
            >
              <div className="animate-[pulse_2s_ease-in-out_infinite]">{config.messageTitle}</div>
              <div className="flex items-center mt-0.5">
                <span className="animate-[pulse_1.5s_ease-in-out_infinite]">{config.messageBody}</span>
                <span className="inline-block w-[0.6em] h-[1.1em] ml-1 bg-current animate-[pulse_1s_step-end_infinite] opacity-80"></span>
              </div>
            </div>
          </div>

          {/* alert module */}
          <div className="absolute right-[2%] top-[3%] z-10 w-[38%] max-w-[280px] shadow-pixel-sm">
            <div
              className="overflow-hidden rounded-sm border-2 border-accent px-3 py-2 text-center text-[12px] tracking-[0.35em] sm:text-[20px]"
              style={{
                ...px,
                background: "var(--hud-panel)",
                color: config.hostile,
              }}
            >
              {config.alertText}
            </div>
          </div>

          {/* markers */}
          {markers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => cycleMarker(m.id)}
              title={`Marker ${m.id} — ${m.state} (click to change)`}
              className="absolute h-[5%] w-[3.8%] min-h-[18px] min-w-[18px] transition-transform hover:scale-125"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                background: colorFor(m.state),
                boxShadow: `0 0 0 2px #0b1a2b`,
              }}
            >
              <img
                src={m.state === "target" ? hudContainerAsset.url : spideyAsset.url}
                alt={`${m.state} marker`}
                className="h-full w-full"
                style={{
                  imageRendering: "pixelated",
                  mixBlendMode: "multiply",
                  filter: markerFilter(m.state),
                }}
              />
            </button>
          ))}

          {/* radar */}
          {config.radarOn && (
            <div className="absolute bottom-[2%] right-[2%] h-[31%] w-[27%] min-h-[76px] min-w-[82px] flex items-center justify-center">
              <style>{`
                @keyframes sweep {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes blip {
                  0% { opacity: 0; transform: scale(0.5); }
                  50% { opacity: 1; transform: scale(1.2); }
                  100% { opacity: 0; transform: scale(0.5); }
                }
                .animate-radar-sweep {
                  animation: sweep 3s linear infinite;
                }
                .animate-radar-blip {
                  animation: blip 3s ease-out infinite;
                }
              `}</style>
              <img
                src={profileContainerAsset.url}
                alt="Tactical radar"
                className="absolute inset-0 h-full w-full object-contain pointer-events-none z-10"
                style={{ imageRendering: "pixelated" }}
              />
              <div 
                className="relative w-[65%] h-[65%] rounded-full overflow-hidden border"
                style={{ backgroundColor: "rgba(11, 26, 43, 0.8)", borderColor: "var(--hud-frame)" }}
              >
                <div className="absolute inset-[20%] rounded-full border border-accent/20" />
                <div className="absolute inset-[40%] rounded-full border border-accent/20" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-accent/20 -translate-x-1/2" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-accent/20 -translate-y-1/2" />
                <div 
                  className="absolute inset-0 rounded-full animate-radar-sweep origin-center"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 70%, ${config.accent} 100%)`,
                    opacity: 0.6
                  }}
                />
                {markers.filter(m => m.state !== "neutral").map((m, i) => (
                   <div key={m.id} className="absolute w-2 h-2 rounded-full animate-radar-blip shadow-[0_0_4px_currentColor]"
                        style={{
                           left: `${20 + (i * 25) % 60}%`, 
                           top: `${20 + (i * 35) % 60}%`,
                           backgroundColor: colorFor(m.state),
                           color: colorFor(m.state),
                           animationDelay: `${i * 0.7}s`
                        }}
                   />
                ))}
              </div>
            </div>
          )}

          {config.scanlines && (
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
              }}
            />
          )}
        </div>

        {/* status strip */}
        <div
          className="mt-3 flex flex-wrap items-center gap-3 px-1 text-[9px] sm:text-[10px]"
          style={{ ...px, color: "#0f172a" }}
        >
          {(["hostile", "friendly", "neutral", "target"] as MarkerState[]).map((s) => (
            <span key={s} className="flex items-center gap-2">
              <span className="h-3 w-3" style={{ background: colorFor(s) }} />
              {s.toUpperCase()} {String(counts[s]).padStart(2, "0")}
            </span>
          ))}
        </div>

        {/* player dock + controls */}
        <div className="mt-3 grid grid-cols-[58px_minmax(0,1fr)] items-end gap-3 sm:grid-cols-[76px_minmax(0,1fr)]">
          <div className="flex min-h-[112px] items-end justify-center overflow-hidden rounded-sm border-4 border-slate-900 bg-white px-1 pt-2 shadow-pixel-sm sm:min-h-[132px]">
            <img
              src={spideyFigureAsset.url}
              alt="Standing Spidey player avatar"
              className="h-[104px] w-auto max-w-full object-contain sm:h-[124px]"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {config.profiles.map((p) => (
              <PixelButton
                key={p}
                label={p}
                color={"#ffffff"}
                active={activeProfile === p}
                onClick={() => setActiveProfile(p)}
              />
            ))}
            {config.actions.map((a) => (
              <PixelButton
                key={a}
                label={a}
                color={"#C4DFED"}
                active={activeAction === a}
                onClick={() => setActiveAction(activeAction === a ? null : a)}
                iconSrc={controlButtonAsset.url}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
