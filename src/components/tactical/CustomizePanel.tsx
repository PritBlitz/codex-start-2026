import type { Dispatch, SetStateAction } from "react";
import { defaultConfig, type Config } from "./types";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span
        className="mb-1 block text-[8px] tracking-wider text-muted-foreground"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card px-2 py-2 text-xs text-foreground outline-none"
        style={{ boxShadow: "inset 0 0 0 2px var(--border)" }}
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span
        className="text-[8px] tracking-wider text-muted-foreground"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        {label}
      </span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-12 cursor-pointer bg-transparent"
        aria-label={label}
      />
    </label>
  );
}

export default function CustomizePanel({
  config,
  setConfig,
  onResetMarkers,
  onRandomizeMarkers,
}: {
  config: Config;
  setConfig: Dispatch<SetStateAction<Config>>;
  onResetMarkers: () => void;
  onRandomizeMarkers: () => void;
}) {
  const set = <K extends keyof Config>(k: K, v: Config[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  return (
    <aside
      className="h-fit space-y-4 overflow-hidden rounded-md border-2 border-hud-frame bg-card p-4"
      style={{ boxShadow: "0 0 0 4px var(--console-edge)" }}
    >
      <h2 className="text-[10px] tracking-widest" style={{ fontFamily: "var(--font-pixel)" }}>
        CUSTOMIZE
      </h2>

      <div className="space-y-2">
        <Field label="ALERT" value={config.alertText} onChange={(v) => set("alertText", v)} />
        <Field
          label="MESSAGE LINE 1"
          value={config.messageTitle}
          onChange={(v) => set("messageTitle", v)}
        />
        <Field
          label="MESSAGE LINE 2"
          value={config.messageBody}
          onChange={(v) => set("messageBody", v)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field label="TIME L" value={config.timeLeft} onChange={(v) => set("timeLeft", v)} />
          <Field label="TIME R" value={config.timeRight} onChange={(v) => set("timeRight", v)} />
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <ColorField label="ACCENT" value={config.accent} onChange={(v) => set("accent", v)} />
        <ColorField label="HOSTILE" value={config.hostile} onChange={(v) => set("hostile", v)} />
        <ColorField label="FRIENDLY" value={config.friendly} onChange={(v) => set("friendly", v)} />
        <ColorField label="NEUTRAL" value={config.neutral} onChange={(v) => set("neutral", v)} />
        <ColorField label="GRID" value={config.gridColor} onChange={(v) => set("gridColor", v)} />
      </div>

      <div
        className="space-y-2 border-t border-border pt-3 text-[8px]"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.radarOn}
            onChange={(e) => set("radarOn", e.target.checked)}
          />
          RADAR
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.scanlines}
            onChange={(e) => set("scanlines", e.target.checked)}
          />
          SCANLINES
        </label>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <Field
          label="PROFILE BUTTONS (COMMA)"
          value={config.profiles.join(",")}
          onChange={(v) => set("profiles", v.split(",").map((s) => s.trim()).filter(Boolean))}
        />
        <Field
          label="ACTION BUTTONS (COMMA)"
          value={config.actions.join(",")}
          onChange={(v) => set("actions", v.split(",").map((s) => s.trim()).filter(Boolean))}
        />
      </div>

      <div
        className="flex flex-wrap gap-2 border-t border-border pt-3 text-[8px]"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        <button
          type="button"
          onClick={onRandomizeMarkers}
          className="bg-primary px-3 py-2 text-primary-foreground"
        >
          SHUFFLE MARKERS
        </button>
        <button
          type="button"
          onClick={onResetMarkers}
          className="bg-secondary px-3 py-2 text-secondary-foreground"
        >
          RESET MARKERS
        </button>
        <button
          type="button"
          onClick={() => setConfig(defaultConfig)}
          className="bg-secondary px-3 py-2 text-secondary-foreground"
        >
          RESET ALL
        </button>
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Tip: click any marker on the map to cycle its state.
      </p>
    </aside>
  );
}
