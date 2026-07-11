import React, { useState, useMemo } from "react";
import { LapTimeLog } from "../types";
import { TRACKS, CAR_PRESETS } from "../constants";
import { Timer, Plus, Award, TrendingUp, Zap, HelpCircle, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface LapTimeDashboardProps {
  lapLogs: LapTimeLog[];
  onAddLapLog: (log: Omit<LapTimeLog, "id" | "isPersonalBest" | "createdAt">) => void;
}

export default function LapTimeDashboard({ lapLogs, onAddLapLog }: LapTimeDashboardProps) {
  const [carModel, setCarModel] = useState(`${CAR_PRESETS[0].producer} ${CAR_PRESETS[0].model}`);
  const [track, setTrack] = useState(TRACKS[0]);
  const [weather, setWeather] = useState<"dry" | "wet" | "intermediate">("dry");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [millis, setMillis] = useState("");
  const [notes, setNotes] = useState("");
  const [filterCar, setFilterCar] = useState(`${CAR_PRESETS[0].producer} ${CAR_PRESETS[0].model}`);
  const [filterTrack, setFilterTrack] = useState(TRACKS[0]);

  // Derive Producer and Model for active recorder form selection
  const currentPreset = useMemo(() => {
    return CAR_PRESETS.find((c) => `${c.producer} ${c.model}` === carModel) || CAR_PRESETS[0];
  }, [carModel]);

  const currentProducer = currentPreset.producer;
  const currentModel = currentPreset.model;

  // Derive Producer and Model for active analytics filter selection
  const filterPreset = useMemo(() => {
    return CAR_PRESETS.find((c) => `${c.producer} ${c.model}` === filterCar) || CAR_PRESETS[0];
  }, [filterCar]);

  const filterProducer = filterPreset.producer;
  const filterModel = filterPreset.model;

  const producersList = useMemo(() => {
    return Array.from(new Set(CAR_PRESETS.map((c) => c.producer))).sort();
  }, []);

  const modelsListForProducer = useMemo(() => {
    return CAR_PRESETS.filter((c) => c.producer === currentProducer);
  }, [currentProducer]);

  const modelsListForFilter = useMemo(() => {
    return CAR_PRESETS.filter((c) => c.producer === filterProducer);
  }, [filterProducer]);

  // Handle adding new lap log
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!minutes || !seconds || !millis) return;

    const minVal = parseInt(minutes, 10);
    const secVal = parseInt(seconds, 10);
    const milVal = parseInt(millis, 10);

    const formattedTime = `${minVal}:${secVal.toString().padStart(2, "0")}.${milVal.toString().padStart(3, "0")}`;
    const totalSeconds = minVal * 60 + secVal + milVal / 1000;

    onAddLapLog({
      carModel,
      track,
      lapTime: formattedTime,
      lapTimeSeconds: totalSeconds,
      weather,
      notes: notes.trim() || undefined,
    });

    // Clear inputs
    setMinutes("");
    setSeconds("");
    setMillis("");
    setNotes("");
  };

  // Filter logs for chart
  const activeLogs = useMemo(() => {
    return lapLogs
      .filter((l) => l.carModel === filterCar && l.track === filterTrack)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [lapLogs, filterCar, filterTrack]);

  // Personal best for filtered selection
  const personalBest = useMemo(() => {
    if (activeLogs.length === 0) return null;
    return [...activeLogs].sort((a, b) => a.lapTimeSeconds - b.lapTimeSeconds)[0];
  }, [activeLogs]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return activeLogs.map((log, idx) => ({
      index: idx + 1,
      date: new Date(log.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      lapSeconds: parseFloat(log.lapTimeSeconds.toFixed(3)),
      lapTime: log.lapTime,
      isPB: log.isPersonalBest,
    }));
  }, [activeLogs]);

  // Format tooltip for chart
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-zinc-400 font-sans mb-1 font-semibold">{data.date}</p>
          <p className="text-red-500 font-bold">Lap Time: {data.lapTime}</p>
          <p className="text-zinc-500">({data.lapSeconds}s)</p>
          {data.isPB && (
            <span className="inline-block mt-1.5 bg-yellow-500/25 text-yellow-400 text-[10px] font-sans px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
              ⭐ Personal Best
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Logger Panel */}
      <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600 rounded-lg text-white">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm tracking-wide text-white uppercase">
              Lap Recorder
            </h3>
            <p className="text-xs text-zinc-500">Record a new lap time on the track</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Manufacturer
              </label>
              <select
                value={currentProducer}
                onChange={(e) => {
                  const newProducer = e.target.value;
                  const firstModel = CAR_PRESETS.find((c) => c.producer === newProducer)?.model || "";
                  setCarModel(`${newProducer} ${firstModel}`);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600"
              >
                {producersList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Model
              </label>
              <select
                value={currentModel}
                onChange={(e) => {
                  const newModel = e.target.value;
                  setCarModel(`${currentProducer} ${newModel}`);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600"
              >
                {modelsListForProducer.map((m) => (
                  <option key={m.model} value={m.model}>
                    {m.model} ({m.class})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Track
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600"
            >
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Weather
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600"
              >
                <option value="dry">☀️ Dry</option>
                <option value="wet">🌧️ Wet</option>
                <option value="intermediate">🌦️ Intermediate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Lap Duration
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="M"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-12 bg-zinc-900 border border-zinc-800 rounded-lg py-2 text-center text-sm font-mono text-white focus:outline-none focus:border-red-600"
                  required
                  min="0"
                />
                <span className="text-zinc-500 font-mono">:</span>
                <input
                  type="number"
                  placeholder="SS"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-14 bg-zinc-900 border border-zinc-800 rounded-lg py-2 text-center text-sm font-mono text-white focus:outline-none focus:border-red-600"
                  required
                  min="0"
                  max="59"
                />
                <span className="text-zinc-500 font-mono">.</span>
                <input
                  type="number"
                  placeholder="000"
                  value={millis}
                  onChange={(e) => setMillis(e.target.value)}
                  className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg py-2 text-center text-sm font-mono text-white focus:outline-none focus:border-red-600"
                  required
                  min="0"
                  max="999"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Telemetry Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Fuel Map 1, soft tires, TC 1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-sans font-semibold uppercase tracking-wider text-xs py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Record Lap Time</span>
          </button>
        </form>
      </div>

      {/* Analytics & Graph Panel */}
      <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
        {/* Graph Header with Filter selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              Lap Time Analytics
            </h3>
          </div>

          {/* Quick selectors for graphing */}
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={filterProducer}
              onChange={(e) => {
                const newProducer = e.target.value;
                const firstModel = CAR_PRESETS.find((c) => c.producer === newProducer)?.model || "";
                setFilterCar(`${newProducer} ${firstModel}`);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 focus:outline-none"
            >
              {producersList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={filterModel}
              onChange={(e) => {
                const newModel = e.target.value;
                setFilterCar(`${filterProducer} ${newModel}`);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 focus:outline-none"
            >
              {modelsListForFilter.map((m) => (
                <option key={m.model} value={m.model}>
                  {m.model}
                </option>
              ))}
            </select>

            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300"
            >
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dashboard Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Personal Best Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Personal Best</p>
              <p className="text-sm font-mono font-bold text-white">
                {personalBest ? personalBest.lapTime : "--:--.---"}
              </p>
            </div>
          </div>

          {/* Total Laps Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Laps Recorded</p>
              <p className="text-sm font-mono font-bold text-white">
                {activeLogs.length}
              </p>
            </div>
          </div>

          {/* Improvement Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Performance Gap</p>
              <p className="text-sm font-mono font-bold text-white">
                {activeLogs.length > 1
                  ? `-${(activeLogs[0].lapTimeSeconds - activeLogs[activeLogs.length - 1].lapTimeSeconds).toFixed(2)}s`
                  : "0.00s"}
              </p>
            </div>
          </div>
        </div>

        {/* Graph rendering */}
        <div className="h-64 flex-1 mt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  domain={["auto", "auto"]}
                  tickFormatter={(val) => `${val.toFixed(1)}s`}
                />
                <Tooltip content={customTooltip} />
                <Line
                  type="monotone"
                  dataKey="lapSeconds"
                  stroke="#ef4444"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isPB) {
                      return (
                        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="#eab308" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      );
                    }
                    return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#09090b" strokeWidth={1} />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg bg-zinc-950 text-center p-6">
              <HelpCircle className="w-8 h-8 text-zinc-600 mb-2 animate-bounce" />
              <p className="text-zinc-400 text-xs font-sans font-medium">No Session Data Found</p>
              <p className="text-zinc-500 text-[11px] mt-1 max-w-xs">
                To view improvement trends, record at least 1 lap time for {filterCar} on {filterTrack}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
