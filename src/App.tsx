import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { TuningSetup, LapTimeLog, FavoriteCar, NotificationMessage } from "./types";
import { CAR_PRESETS, getBaselineTuning } from "./constants";
import TuningDetails from "./components/TuningDetails";
import SetupComparer from "./components/SetupComparer";
import LapTimeDashboard from "./components/LapTimeDashboard";
import CommunitySharing from "./components/CommunitySharing";
import RaceEngineerChat from "./components/RaceEngineerChat";
import OAuthAndSync from "./components/OAuthAndSync";
import {
  Car,
  Compass,
  Users,
  Timer,
  Scale,
  Sparkles,
  Award,
  Bell,
  Trash,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookmarkCheck,
  Wrench,
  MessageSquare
} from "lucide-react";

export interface TestSegment {
  id: string;
  issueKey: string;
  issueLabel: string;
  trackName: string;
  segmentName: string;
  tuningFocus: string[];
  description: string;
  hotLapTip: string;
}

export const TEST_SEGMENTS: TestSegment[] = [
  {
    id: "seg_understeer_spa",
    issueKey: "understeer",
    issueLabel: "Corner Entry Understeer",
    trackName: "Spa-Francorchamps",
    segmentName: "Les Combes (Turns 5-6)",
    tuningFocus: ["Front Camber", "Front ARB", "Front Natural Frequency"],
    description: "Downhill heavy braking followed by a quick right-left transition.",
    hotLapTip: "Trail-brake deep into Turn 5. If front washes out, soften front anti-roll bar or increase front camber."
  },
  {
    id: "seg_understeer_nurb_gp",
    issueKey: "understeer",
    issueLabel: "Slow-Speed Understeer",
    trackName: "Nürburgring GP",
    segmentName: "Haug-Haken (Turns 1-2)",
    tuningFocus: ["LSD Initial Torque", "Brake Balance", "Front Natural Frequency"],
    description: "Tight, low-gear downhill hairpin where cars push wide easily.",
    hotLapTip: "Move brake balance to -1 or -2 (rear bias) to help the car rotate, and reduce LSD Initial Torque."
  },
  {
    id: "seg_oversteer_suzuka",
    issueKey: "oversteer",
    issueLabel: "High-Speed Oversteer",
    trackName: "Suzuka Circuit",
    segmentName: "Degner Curves (Turns 8-9)",
    tuningFocus: ["Rear Toe-in", "Rear Downforce", "Front ARB"],
    description: "Narrow, high-speed right hander with high lateral G-forces.",
    hotLapTip: "Stiffen front anti-roll bar to prevent excessive body roll, and add +0.05 to +0.10 rear toe-in to stabilize the rear."
  },
  {
    id: "seg_oversteer_nordschleife",
    issueKey: "oversteer",
    issueLabel: "Snap Oversteer",
    trackName: "Nürburgring Nordschleife",
    segmentName: "Schwedenkreuz",
    tuningFocus: ["Rear Downforce", "Rear Natural Frequency", "Rear Camber"],
    description: "Ultra-high speed blind left-hand crest where the rear goes light.",
    hotLapTip: "Maximize rear downforce and slightly soften rear springs (Natural Frequency) to keep tires glued under load transfer."
  },
  {
    id: "seg_bounce_nordschleife",
    issueKey: "bounce",
    issueLabel: "Suspension Bounciness",
    trackName: "Nürburgring Nordschleife",
    segmentName: "Fuchsröhre (Foxhole)",
    tuningFocus: ["Ride Height", "Spring Natural Frequency", "Damper Compression"],
    description: "Steep downhill compression at 250+ km/h followed by an uphill crest.",
    hotLapTip: "If the chassis bottoms out, raise ride height by 3-5mm. Soften spring Natural Frequency to absorb high-speed compressions."
  },
  {
    id: "seg_bounce_trial",
    issueKey: "bounce",
    issueLabel: "Curb-Strike Instability",
    trackName: "Trial Mountain Circuit",
    segmentName: "Final Chicane",
    tuningFocus: ["Anti-Roll Bars", "Damper Expansion", "Ride Height"],
    description: "High curbs where hitting them can launch the car into a spin.",
    hotLapTip: "Soften anti-roll bars (ARB) to 3 or 4, and increase damper expansion (rebound) relative to compression to settle the car quickly."
  },
  {
    id: "seg_exit_bathurst",
    issueKey: "exit",
    issueLabel: "Corner Exit Traction Loss",
    trackName: "Mount Panorama (Bathurst)",
    segmentName: "Forrest's Elbow (Turn 18)",
    tuningFocus: ["LSD Acceleration Sensitivity", "Rear Springs", "Rear Dampers"],
    description: "Declinational slow left-hand turn leading directly onto the Conrod Straight.",
    hotLapTip: "Reduce LSD Acceleration Sensitivity to 10-15 to stop the inside tire from spinning up, and soften rear compression damping."
  },
  {
    id: "seg_exit_nurb_gp",
    issueKey: "exit",
    issueLabel: "Power-On Wheelspin",
    trackName: "Nürburgring GP",
    segmentName: "Dunlop-Kehre",
    tuningFocus: ["LSD Acceleration Sensitivity", "Rear Toe-in", "Rear Camber"],
    description: "Slow uphill right-hand hairpin where heavy throttle snaps traction.",
    hotLapTip: "Slightly reduce rear camber to -1.2 to increase the straight-line tire contact patch, improving acceleration grip."
  },
  {
    id: "seg_brake_monza",
    issueKey: "brake",
    issueLabel: "High-Speed Braking Instability",
    trackName: "Autodromo Nazionale Monza",
    segmentName: "Rettifilo Chicane (Turn 1)",
    tuningFocus: ["Brake Balance", "LSD Braking Sensitivity", "Rear Toe-in"],
    description: "Heavy braking zone from 300+ km/h down to 70 km/h.",
    hotLapTip: "Increase LSD Braking Sensitivity by 5 to lock the diff under deceleration, and keep brake balance neutral (0)."
  },
  {
    id: "seg_brake_spa",
    issueKey: "brake",
    issueLabel: "Braking Rotation / Tail-Wag",
    trackName: "Spa-Francorchamps",
    segmentName: "Bus Stop Chicane (Turns 19-20)",
    tuningFocus: ["Rear Dampers Expansion", "Brake Balance", "Rear Camber"],
    description: "Uphill braking zone into a tight right-left transition.",
    hotLapTip: "Stiffen rear damper expansion (rebound) to slow down forward weight transfer, keeping pressure and grip on the rear tires."
  },
  {
    id: "seg_gear_lemans",
    issueKey: "gear",
    issueLabel: "Gear Ratio Calibration",
    trackName: "Circuit de la Sarthe (Le Mans)",
    segmentName: "Mulsanne Straight",
    tuningFocus: ["Gear Ratios", "Final Drive", "Top Speed"],
    description: "A 6-kilometer straightaway for testing top-end aerodynamics and gearing.",
    hotLapTip: "Set your Top Speed setting so that 6th gear revs out exactly before the first chicane braking zone."
  }
];

export function detectIssuesFromMessages(messages: { role: string; text: string }[]): string[] {
  const detected = new Set<string>();
  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.text.toLowerCase());

  for (const text of userMessages) {
    if (text.includes("understeer") || text.includes("under-steer") || text.includes("won't turn") || text.includes("tight") || text.includes("pushing") || text.includes("front slip") || text.includes("plow") || text.includes("turn in") || text.includes("turn-in")) {
      detected.add("understeer");
    }
    if (text.includes("oversteer") || text.includes("over-steer") || text.includes("slide") || text.includes("sliding") || text.includes("loose") || text.includes("spin") || text.includes("spinning") || text.includes("drift") || text.includes("snap")) {
      detected.add("oversteer");
    }
    if (text.includes("bounce") || text.includes("bouncy") || text.includes("bumping") || text.includes("stiff") || text.includes("jump") || text.includes("curb") || text.includes("kerb") || text.includes("harsh") || text.includes("bump")) {
      detected.add("bounce");
    }
    if (text.includes("traction") || text.includes("wheelspin") || text.includes("wheel-spin") || text.includes("exit slide") || text.includes("power out") || text.includes("power-on") || text.includes("accelerat") || text.includes("exit")) {
      detected.add("exit");
    }
    if (text.includes("brake") || text.includes("braking") || text.includes("stopping") || text.includes("unstable brake") || text.includes("wiggle") || text.includes("squirm")) {
      detected.add("brake");
    }
    if (text.includes("gear") || text.includes("gears") || text.includes("ratio") || text.includes("top speed") || text.includes("transmission") || text.includes("shifting") || text.includes("speed")) {
      detected.add("gear");
    }
  }
  return Array.from(detected);
}

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"garage" | "comparer" | "laps" | "community" | "engineer">("garage");

  // State Lists
  const [setups, setSetups] = useState<TuningSetup[]>([]);
  const [lapLogs, setLapLogs] = useState<LapTimeLog[]>([]);
  const [favorites, setFavorites] = useState<FavoriteCar[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  // Editing state
  const [editingSetup, setEditingSetup] = useState<TuningSetup | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // PB Alert state (for glowing modal)
  const [pbToast, setPbToast] = useState<{ car: string; track: string; time: string } | null>(null);

  // Chat state & message trigger state for Track Segment Suggester
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    {
      role: "model",
      text: "Hello! I am your **Race Engineer Assistant**. I have complete knowledge of the *Gran Turismo 7 Tuning Cheat Sheet* by Flux89.\n\nWhether you need help diagnosing handling problems, setting up gears, or finding the perfect rake for Nürburgring, I'm here. \n\nSelect a reasoning mode below to get started!",
    },
  ]);
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  // Google OAuth Session
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Local storage keys
  const STORAGE_KEY_SETUPS = "gt7_tuning_setups";
  const STORAGE_KEY_LAPS = "gt7_lap_logs";
  const STORAGE_KEY_FAVS = "gt7_favorite_cars";
  const STORAGE_KEY_NOTIFS = "gt7_notifications";
  const STORAGE_KEY_CHAT = "gt7_engineer_chat";

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const storedSetups = localStorage.getItem(STORAGE_KEY_SETUPS);
      const storedLaps = localStorage.getItem(STORAGE_KEY_LAPS);
      const storedFavs = localStorage.getItem(STORAGE_KEY_FAVS);
      const storedNotifs = localStorage.getItem(STORAGE_KEY_NOTIFS);
      const storedChat = localStorage.getItem(STORAGE_KEY_CHAT);

      if (storedSetups) setSetups(JSON.parse(storedSetups));
      if (storedLaps) setLapLogs(JSON.parse(storedLaps));
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      if (storedChat) setChatMessages(JSON.parse(storedChat));
    } catch (error) {
      console.error("Failed to load setups from local storage", error);
    }
  }, []);

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETUPS, JSON.stringify(setups));
  }, [setups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAPS, JSON.stringify(lapLogs));
  }, [lapLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Check for new community builds periodically (Simulation of real-time polling to trigger notifications)
  useEffect(() => {
    if (favorites.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/community/setups");
        if (res.ok) {
          const community = await res.json();
          // Filter setups that match user's favorites, are not added in notifications already
          community.forEach((setup: TuningSetup) => {
            const isFav = favorites.some((f) => f.model === setup.carModel);
            const alreadyNotified = notifications.some((n) => n.setupId === setup.id);

            if (isFav && !alreadyNotified) {
              const newNotif: NotificationMessage = {
                id: "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                title: `🔥 New Tune: ${setup.carModel}`,
                message: `Setup by @${setup.creator || "pro_driver"} is now available for ${setup.track} [${setup.weather.toUpperCase()}].`,
                timestamp: new Date().toISOString(),
                read: false,
                setupId: setup.id
              };
              setNotifications((prev) => [newNotif, ...prev]);
            }
          });
        }
      } catch (error) {
        console.error("Telemetry update issue:", error);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [favorites, notifications]);

  // Save / Edit setup
  const handleSaveSetup = (setupData: Omit<TuningSetup, "id" | "createdAt"> & { id?: string }) => {
    if (setupData.id) {
      // Edit mode
      setSetups((prev) =>
        prev.map((s) =>
          s.id === setupData.id
            ? { ...s, ...setupData, createdAt: new Date().toISOString() } as TuningSetup
            : s
        )
      );
    } else {
      // New mode
      const newSetup: TuningSetup = {
        ...setupData,
        id: "setup_" + Date.now(),
        createdAt: new Date().toISOString(),
      } as TuningSetup;
      setSetups((prev) => [newSetup, ...prev]);
    }
    setEditingSetup(null);
    setIsCreatingNew(false);
  };

  const handleDeleteSetup = (id: string) => {
    if (window.confirm("Are you sure you want to delete this tuning configuration?")) {
      setSetups((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Add Lap Time Log
  const handleAddLapLog = (logData: Omit<LapTimeLog, "id" | "isPersonalBest" | "createdAt">) => {
    // Determine if Personal Best
    const existingSame = lapLogs.filter(
      (l) => l.carModel === logData.carModel && l.track === logData.track
    );
    const pbTime = existingSame.length > 0
      ? Math.min(...existingSame.map((l) => l.lapTimeSeconds))
      : Infinity;

    const isPB = logData.lapTimeSeconds < pbTime;

    const newLog: LapTimeLog = {
      ...logData,
      id: "lap_" + Date.now(),
      isPersonalBest: isPB,
      createdAt: new Date().toISOString(),
    };

    setLapLogs((prev) => [newLog, ...prev]);

    // Handle haptic feedback and beautiful PB modal
    if (isPB) {
      if (navigator.vibrate) {
        // Double pulse vibration for PB
        navigator.vibrate([150, 50, 150]);
      }
      setPbToast({
        car: logData.carModel,
        track: logData.track,
        time: logData.lapTime,
      });
      // Auto clear PB toast after 5s
      setTimeout(() => setPbToast(null), 5000);
    }
  };

  // Favorites Handlers
  const handleAddFavorite = (model: string) => {
    if (!favorites.some((f) => f.model === model)) {
      setFavorites((prev) => [...prev, { model, addedAt: new Date().toISOString() }]);
    }
  };

  const handleRemoveFavorite = (model: string) => {
    setFavorites((prev) => prev.filter((f) => f.model !== model));
  };

  // Notification Handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Import setup from community
  const handleImportSetup = (setup: TuningSetup) => {
    const imported: TuningSetup = {
      ...setup,
      id: "setup_imported_" + Date.now(),
      name: `${setup.name} (Imported)`,
      createdAt: new Date().toISOString(),
    };
    setSetups((prev) => [imported, ...prev]);
    alert(`Successfully imported "${setup.carModel}" setup into your garage list!`);
  };

  // Share setup to community database
  const handleShareSetup = async (setupId: string, description: string) => {
    const setupToShare = setups.find((s) => s.id === setupId);
    if (!setupToShare) return;

    try {
      const response = await fetch("/api/community/setups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...setupToShare,
          creator: googleUser?.displayName?.replace(/\s+/g, "") || "Pro_Racer",
          description: description || setupToShare.description,
          isCommunityShared: true,
        }),
      });

      if (response.ok) {
        alert("Tune successfully shared on the Community Board!");
      } else {
        alert("Failed to share tune with community server.");
      }
    } catch (error) {
      console.error(error);
      alert("Error sharing tune with server.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Dynamic Personal Best Overlay Toast */}
      {pbToast && (
        <div className="fixed inset-x-4 top-4 md:inset-x-auto md:right-4 md:top-4 z-50 animate-bounce">
          <div className="bg-yellow-500 text-zinc-950 p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm border border-yellow-400">
            <div className="p-3 bg-zinc-950 text-yellow-500 rounded-lg shrink-0">
              <Award className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-800">
                ⭐ NEW PERSONAL BEST!
              </p>
              <p className="font-sans font-bold text-sm mt-0.5">{pbToast.car}</p>
              <p className="text-xs text-zinc-900 leading-none mt-1">{pbToast.track}</p>
              <p className="font-mono font-black text-lg text-zinc-950 mt-1">{pbToast.time}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar Header */}
      <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white font-mono font-black italic tracking-tighter text-lg px-3 py-1 rounded">
              GT7
            </div>
            <div>
              <h1 className="font-sans font-black text-md tracking-wider uppercase text-white">
                TUNING ENGINE
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest leading-none">
                FLUX89 COMPLETE CHEAT SHEET PLATFORM
              </p>
            </div>
          </div>

          {/* Quick Stats bar */}
          <div className="flex items-center gap-4 text-xs">
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
              <span className="text-zinc-500 uppercase font-bold text-[9px] block">Garage Tunes</span>
              <span className="font-mono text-zinc-200 font-bold">{setups.length} saved</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
              <span className="text-zinc-500 uppercase font-bold text-[9px] block">Track Laps</span>
              <span className="font-mono text-zinc-200 font-bold">
                {lapLogs.length} logged
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-6">
        {/* Navigation Rail */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-2">
          <button
            onClick={() => {
              setActiveTab("garage");
              setEditingSetup(null);
              setIsCreatingNew(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "garage" && !editingSetup && !isCreatingNew
                ? "bg-red-600 text-white"
                : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Setup Garage</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("comparer");
              setEditingSetup(null);
              setIsCreatingNew(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "comparer"
                ? "bg-red-600 text-white"
                : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Setup Comparer</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("laps");
              setEditingSetup(null);
              setIsCreatingNew(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "laps"
                ? "bg-red-600 text-white"
                : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Lap Analyzer</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("community");
              setEditingSetup(null);
              setIsCreatingNew(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "community"
                ? "bg-red-600 text-white"
                : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Community Board</span>
            {notifications.some((n) => !n.read) && (
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("engineer");
              setEditingSetup(null);
              setIsCreatingNew(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "engineer"
                ? "bg-red-600 text-white"
                : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span>Race Engineer Chat</span>
          </button>
        </div>

        {/* Dynamic Views Rendering */}
        <div className="space-y-6">
          {/* Create or Edit Setup Forms */}
          {(isCreatingNew || editingSetup) ? (
            <TuningDetails
              setup={editingSetup || undefined}
              onSaveSetup={handleSaveSetup}
              onCancel={() => {
                setEditingSetup(null);
                setIsCreatingNew(false);
              }}
            />
          ) : (
            <>
              {/* Tab: Garage */}
              {activeTab === "garage" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Garage setups list */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-red-500" />
                        <h2 className="font-sans font-bold text-md text-white uppercase tracking-wider">
                          Active Telemetry Garage
                        </h2>
                      </div>

                      <button
                        onClick={() => setIsCreatingNew(true)}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Setup</span>
                      </button>
                    </div>

                    {setups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {setups.map((setup) => (
                          <div
                            key={setup.id}
                            className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-red-600/40 transition duration-300 flex flex-col justify-between space-y-4"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] font-bold font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                                    {setup.carClass} • {setup.drivetrain}
                                  </span>
                                  <h3 className="font-sans font-bold text-sm text-zinc-100 mt-2">
                                    {setup.carModel}
                                  </h3>
                                  <p className="text-xs text-red-500 font-semibold mt-0.5">
                                    {setup.track}
                                  </p>
                                </div>

                                <span className="text-[10px] uppercase font-bold font-mono px-2 py-1.5 bg-zinc-900 text-zinc-300 rounded">
                                  {setup.weather === "dry" ? "☀️ DRY" : setup.weather === "wet" ? "🌧️ WET" : "🌦️ INT"}
                                </span>
                              </div>

                              <p className="text-xs text-zinc-400 mt-3 font-semibold text-zinc-300">
                                {setup.name}
                              </p>
                              {setup.description && (
                                <p className="text-xs text-zinc-500 italic mt-1 line-clamp-2">
                                  "{setup.description}"
                                </p>
                              )}

                              {/* Mini table snapshot */}
                              <div className="grid grid-cols-3 gap-2 mt-4 bg-zinc-900/50 p-2.5 rounded-lg font-mono text-[10px] text-zinc-400">
                                <div>
                                  <span className="text-zinc-600 text-[9px] block uppercase">Downforce</span>
                                  {setup.tuning.frontDownforce}/{setup.tuning.rearDownforce}
                                </div>
                                <div>
                                  <span className="text-zinc-600 text-[9px] block uppercase">Ride Ht</span>
                                  {setup.tuning.frontRideHeight}/{setup.tuning.rearRideHeight}mm
                                </div>
                                <div>
                                  <span className="text-zinc-600 text-[9px] block uppercase">ARB (F/R)</span>
                                  {setup.tuning.frontARB}/{setup.tuning.rearARB}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
                              <button
                                onClick={() => setEditingSetup(setup)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase"
                              >
                                Edit Settings
                              </button>
                              <button
                                onClick={() => handleDeleteSetup(setup.id)}
                                className="bg-zinc-900 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 p-1.5 rounded-lg"
                                title="Delete build"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-zinc-800 rounded-xl bg-zinc-950 p-12 text-center space-y-4">
                        <p className="text-zinc-500 text-sm font-medium">Your Garage is Empty</p>
                        <p className="text-zinc-600 text-xs max-w-sm mx-auto">
                          Create your first Gran Turismo 7 car setup baseline by clicking the button above. We will pre-populate values using Flux89's physical racing parameters.
                        </p>
                        <button
                          onClick={() => setIsCreatingNew(true)}
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition"
                        >
                          Generate New Baseline
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sidebar controls for exports */}
                  <div className="lg:col-span-1 space-y-6">
                    <OAuthAndSync
                      localSetups={setups}
                      onUserAuth={(user, token) => {
                        setGoogleUser(user);
                        setGoogleToken(token);
                      }}
                    />

                    {/* Quick Guide Card */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-red-500 font-bold uppercase">
                        <BookmarkCheck className="w-4 h-4" />
                        <span>Tuning Baseline Rules</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">
                        Follow these golden rules validated from real in-game physics testing:
                      </p>
                      <ul className="space-y-2 text-zinc-400 list-decimal list-inside">
                        <li>
                          <span className="text-zinc-200 font-semibold">Tires first:</span> Always select tire compound before tweaking spring stiffness.
                        </li>
                        <li>
                          <span className="text-zinc-200 font-semibold">Positive rake:</span> Start with rear ride height taller than front to help entry rotation.
                        </li>
                        <li>
                          <span className="text-zinc-200 font-semibold">Dampers:</span> Expansion must always be higher than compression values.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Comparer */}
              {activeTab === "comparer" && <SetupComparer setups={setups} />}

              {/* Tab: Lap logs */}
              {activeTab === "laps" && (
                <LapTimeDashboard lapLogs={lapLogs} onAddLapLog={handleAddLapLog} />
              )}

              {/* Tab: Community board */}
              {activeTab === "community" && (
                <CommunitySharing
                  localSetups={setups}
                  favorites={favorites}
                  notifications={notifications}
                  onAddFavorite={handleAddFavorite}
                  onRemoveFavorite={handleRemoveFavorite}
                  onImportSetup={handleImportSetup}
                  onMarkNotificationRead={handleMarkNotificationRead}
                  onClearNotifications={handleClearNotifications}
                  onShareSetup={handleShareSetup}
                />
              )}

              {/* Tab: AI engineer chatbot */}
              {activeTab === "engineer" && (() => {
                const activeIssues = detectIssuesFromMessages(chatMessages);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <RaceEngineerChat
                        carModel={setups[0]?.carModel}
                        track={setups[0]?.track}
                        currentTuning={setups[0]?.tuning}
                        messages={chatMessages}
                        setMessages={setChatMessages}
                        triggerMessage={triggerMessage}
                        onTriggerMessageClear={() => setTriggerMessage(null)}
                      />
                    </div>
                    
                    {/* Track Segment Suggestion Panel Sidebar */}
                    <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-4 h-[600px] overflow-hidden">
                      <div className="space-y-4 flex-1 flex flex-col min-h-0">
                        <div>
                          <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider text-xs">
                            <Compass className="w-4 h-4 animate-pulse" />
                            <span>Telemetry Track Advisor</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                            GT7 PHYSICS-ALIGNED TEST SECTIONS
                          </p>
                        </div>

                        {/* Identified issues section */}
                        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850 text-[11px] space-y-1.5">
                          <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider block">
                            Issues Detected in Chat:
                          </span>
                          {activeIssues.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {activeIssues.map((issue) => (
                                <span
                                  key={issue}
                                  className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-600/20 text-red-400 border border-red-600/30 flex items-center gap-1"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                                  {issue === "exit" ? "exit traction" : issue}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-zinc-400 italic text-[10px] leading-relaxed">
                              No active issues found in recent chat. Discuss handling problems (e.g. "understeer", "bouncy", "spin") or select a segment below to start a test.
                            </p>
                          )}
                        </div>

                        {/* Track Segments List */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                          <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider block sticky top-0 bg-zinc-950 py-1 z-10">
                            Recommended Test Segments
                          </span>
                          
                          {TEST_SEGMENTS.map((seg) => {
                            const isRecommended = activeIssues.includes(seg.issueKey);
                            const isExpanded = expandedSegment === seg.id;
                            
                            return (
                              <div
                                key={seg.id}
                                className={`border rounded-lg text-left transition duration-200 overflow-hidden ${
                                  isRecommended
                                    ? "bg-red-950/10 border-red-900/50 hover:border-red-600/60"
                                    : "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700/60"
                                }`}
                              >
                                {/* Header Toggle */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedSegment(isExpanded ? null : seg.id)}
                                  className="w-full p-2.5 flex items-start justify-between gap-2 text-left"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-sans font-extrabold text-[11px] text-zinc-200">
                                        {seg.trackName}
                                      </span>
                                      {isRecommended && (
                                        <span className="text-[8px] bg-red-600 text-white font-black uppercase px-1 rounded tracking-wide animate-pulse">
                                          🚨 Target
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-medium leading-tight">
                                      {seg.segmentName}
                                    </p>
                                    <span className="text-[9px] text-zinc-500 font-mono">
                                      Focus: {seg.issueLabel}
                                    </span>
                                  </div>
                                  <span className="text-zinc-500 text-[10px] font-bold shrink-0">
                                    {isExpanded ? "▲" : "▼"}
                                  </span>
                                </button>

                                {/* Expanded Details */}
                                {isExpanded && (
                                  <div className="p-2.5 pt-0 border-t border-zinc-800/40 bg-zinc-950/40 text-[10px] space-y-2">
                                    <p className="text-zinc-400 leading-normal italic">
                                      "{seg.description}"
                                    </p>
                                    
                                    {/* Tuning Parameter Targets */}
                                    <div className="space-y-1">
                                      <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono block">
                                        Primary Tuning Knobs:
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {seg.tuningFocus.map((f, idx) => (
                                          <span
                                            key={idx}
                                            className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 rounded font-mono border border-zinc-800 text-[8px]"
                                          >
                                            {f}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Hot Lap Tips */}
                                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-850 text-[10px] text-zinc-300 leading-normal">
                                      <span className="text-[9px] text-red-400 font-extrabold uppercase block font-mono">
                                        🔧 Telemetry Test Procedure:
                                      </span>
                                      {seg.hotLapTip}
                                    </div>

                                    {/* Action button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTriggerMessage(
                                          `What is the ideal suspension, downforce, and LSD adjustment protocol to test and resolve ${seg.issueLabel} specifically at ${seg.segmentName} on ${seg.trackName}?`
                                        );
                                      }}
                                      className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-sans font-bold text-[9px] uppercase tracking-wider transition flex items-center justify-center gap-1"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>Ask AI Engineer About This Section</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Short instructions on how to use */}
                      <div className="border-t border-zinc-900 pt-3 text-[10px] text-zinc-500 leading-normal space-y-1 bg-zinc-950">
                        <p className="font-bold text-zinc-400">💡 Physics Grounding Tip:</p>
                        <p>
                          Our recommended test sectors focus purely on mechanical load-transfer hot spots in Gran Turismo 7's physics engine.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </main>

      {/* Main footer layout */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-4 mt-12 text-center text-[10px] text-zinc-600 font-mono tracking-wider">
        <p>GRAN TURISMO 7 TUNING COMPANION ENGINE • CREATED WITH ACCURATE TELEMETRY MODELS</p>
      </footer>
    </div>
  );
}
