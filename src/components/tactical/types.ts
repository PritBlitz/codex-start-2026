export type MarkerState = "hostile" | "friendly" | "neutral" | "target";

export type Marker = {
  id: string;
  x: number; // percent
  y: number; // percent
  state: MarkerState;
};

export type Config = {
  alertText: string;
  messageTitle: string;
  messageBody: string;
  timeLeft: string;
  timeRight: string;
  accent: string;
  hostile: string;
  friendly: string;
  neutral: string;
  gridColor: string;
  radarOn: boolean;
  scanlines: boolean;
  profiles: string[];
  actions: string[];
};

export const defaultConfig: Config = {
  alertText: "ALERT",
  messageTitle: "> NEW CLUB",
  messageBody: "MEMBER FOUND",
  timeLeft: "00.00",
  timeRight: "00.00",
  accent: "#f5a524",
  hostile: "#f2542d",
  friendly: "#4ad66d",
  neutral: "#9fb3c8",
  gridColor: "#2a7fb8",
  radarOn: true,
  scanlines: true,
  profiles: ["PROF 1", "PROF 2", "PROF 3", "PROF 4", "PROF 5", "R.1", "R.2"],
  actions: ["TERRAIN", "CHAT", "2D VIEW", "ARCHIVE", "CENTER LOG", "SHARE"],
};

export const initialMarkers: Marker[] = [
  { id: "m1", x: 8, y: 14, state: "neutral" },
  { id: "m2", x: 14, y: 76, state: "neutral" },
  { id: "m3", x: 66, y: 55, state: "neutral" },
  { id: "m4", x: 30, y: 44, state: "neutral" },
  { id: "m5", x: 50, y: 40, state: "hostile" },
  { id: "m6", x: 57, y: 38, state: "hostile" },
  { id: "m7", x: 50, y: 45, state: "hostile" },
  { id: "m8", x: 61, y: 44, state: "hostile" },
  { id: "m9", x: 47, y: 47, state: "friendly" },
  { id: "m10", x: 58, y: 46, state: "target" },
  { id: "m11", x: 64, y: 48, state: "friendly" },
  { id: "m12", x: 54, y: 51, state: "hostile" },
  { id: "m13", x: 46, y: 54, state: "hostile" },
  { id: "m14", x: 51, y: 58, state: "friendly" },
  { id: "m15", x: 42, y: 62, state: "friendly" },
  { id: "m16", x: 55, y: 62, state: "friendly" },
  { id: "m17", x: 35, y: 54, state: "neutral" },
  { id: "m18", x: 70, y: 58, state: "neutral" },
  { id: "m19", x: 27, y: 68, state: "hostile" },
  { id: "m20", x: 23, y: 71, state: "neutral" },
  { id: "m21", x: 46, y: 69, state: "neutral" },
  { id: "m22", x: 49, y: 67, state: "hostile" },
  { id: "m23", x: 59, y: 69, state: "friendly" },
  { id: "m24", x: 76, y: 75, state: "neutral" },
];
