import React, { useState, useEffect, useMemo } from "react";
import { TuningSetup, WeatherCondition, CarClass, DrivetrainType, TuningParams } from "../types";
import { CAR_PRESETS, TRACKS, getBaselineTuning, NVIDIA_MODELS } from "../constants";
import { Save, Sparkles, Sliders, AlertTriangle, HelpCircle, Eye, Info, Gauge, Thermometer, Brain, Cpu, CheckCircle2, TrendingUp, Loader2, ChevronDown, ChevronUp, Users, Activity, Play, Settings, Layers, Zap } from "lucide-react";

interface TuningDetailsProps {
  setup?: TuningSetup;
  onSaveSetup: (setup: Omit<TuningSetup, "id" | "createdAt"> & { id?: string }) => void;
  onCancel: () => void;
}

export default function TuningDetails({ setup, onSaveSetup, onCancel }: TuningDetailsProps) {
  // Setup Info States
  const [name, setName] = useState(setup?.name || "Baseline Tune v1");

  // NVIDIA AI Generation States
  const [selectedNvidiaModel, setSelectedNvidiaModel] = useState<string>(
    NVIDIA_MODELS[0]?.id || "nvidia/nemotron-3-super-120b-a12b"
  );
  const [aiFocus, setAiFocus] = useState<string>("Maximum cornering response and stable braking under load");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<boolean>(false);
  const [onlineFindings, setOnlineFindings] = useState<string | null>(null);

  // NVIDIA Multi-Agent & Telemetry Lab States
  const [aiPanelMode, setAiPanelMode] = useState<"single" | "team">("single");
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState<boolean>(false);
  const [telemetrySimStep, setTelemetrySimStep] = useState<string>("");
  const [telemetryProgress, setTelemetryProgress] = useState<number>(0);
  const [capturedTelemetry, setCapturedTelemetry] = useState<any>(null);

  const [selectedAgents, setSelectedAgents] = useState<string[]>([
    "perfDirector",
    "chassisEng",
    "aeroEng",
    "powertrainEng",
  ]);
  const [isGeneratingTeam, setIsGeneratingTeam] = useState<boolean>(false);
  const [teamConclusions, setTeamConclusions] = useState<any>(null);
  const [teamAnalysis, setTeamAnalysis] = useState<string | null>(null);
  const [teamThinking, setTeamThinking] = useState<string | null>(null);
  const [showTeamThinking, setShowTeamThinking] = useState<boolean>(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccessMessage, setTeamSuccessMessage] = useState<boolean>(false);

  const handleSimulateTelemetry = () => {
    setIsSimulatingTelemetry(true);
    setTelemetryProgress(0);
    setTelemetrySimStep("Initializing GT7 Virtual Wind Tunnel & Chassis Dynamometer...");
    setCapturedTelemetry(null);

    const steps = [
      { progress: 15, step: "Configuring car aerodynamics & spring preload maps..." },
      { progress: 35, step: "Simulating high-speed straight-line tire temperatures & inflation drag..." },
      { progress: 55, step: "Recording lateral suspension travel & damper compression logs..." },
      { progress: 75, step: "Logging multi-disc differential torque slip vs cornering apex rotation..." },
      { progress: 90, step: "Consolidating CAN-bus data & telemetry logs..." },
      { progress: 100, step: "Telemetry Capture Complete!" }
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setTelemetryProgress(steps[currentStepIndex].progress);
        setTelemetrySimStep(steps[currentStepIndex].step);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        
        let baseUndersteer = drivetrain === "AWD" ? 3.4 : drivetrain === "FF" ? 4.1 : 2.2;
        let baseOversteer = drivetrain === "RR" ? 4.2 : drivetrain === "MR" ? 3.1 : 1.9;
        
        const bumpyTracks = ["Nürburgring Nordschleife", "Mount Panorama (Bathurst)", "Trial Mountain Circuit", "Fishermans Ranch (Dirt)", "Colorado Springs (Dirt)"];
        const bottomingFront = bumpyTracks.includes(track) ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2);
        const bottomingRear = bumpyTracks.includes(track) ? Math.floor(Math.random() * 2) + 1 : 0;
        
        if (weather === "wet") {
          baseUndersteer += 0.8;
          baseOversteer += 0.6;
        }

        setCapturedTelemetry({
          understeerAngle: parseFloat((baseUndersteer + Math.random() * 0.8).toFixed(2)),
          oversteerAngle: parseFloat((baseOversteer + Math.random() * 0.7).toFixed(2)),
          tireTemps: {
            fl: Math.floor(82 + Math.random() * 15),
            fr: Math.floor(84 + Math.random() * 15),
            rl: Math.floor(78 + Math.random() * 12),
            rr: Math.floor(80 + Math.random() * 12)
          },
          tirePressures: {
            fl: parseFloat((28.2 + Math.random() * 3).toFixed(1)),
            fr: parseFloat((28.5 + Math.random() * 3).toFixed(1)),
            rl: parseFloat((27.8 + Math.random() * 2.5).toFixed(1)),
            rr: parseFloat((28.1 + Math.random() * 2.5).toFixed(1))
          },
          suspensionBottoming: {
            front: bottomingFront,
            rear: bottomingRear
          },
          aeroDragIndex: carClass === "Gr.1" || carClass === "Gr.2" ? "High Downforce / Ultra-High Drag" : carClass === "Gr.3" ? "Optimized GT3 Balance" : "Low Aerodynamic Profile",
          gearRatioScore: Math.floor(85 + Math.random() * 14)
        });

        setIsSimulatingTelemetry(false);
      }
    }, 400);
  };

  const handleGenerateTeamSetup = async () => {
    if (!capturedTelemetry) return;
    setIsGeneratingTeam(true);
    setTeamError(null);
    setTeamConclusions(null);
    setTeamAnalysis(null);
    setTeamThinking(null);
    setOnlineFindings(null);
    setTeamSuccessMessage(false);

    try {
      const response = await fetch("/api/nvidia/agent-team-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carModel,
          carClass,
          drivetrain,
          track,
          weather,
          telemetryData: capturedTelemetry,
          activeAgents: selectedAgents,
          selectedModel: selectedNvidiaModel,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to run team simulation");
      }

      const data = await response.json();
      if (data.tuning) {
        setParams(data.tuning);
        setTeamConclusions(data.conclusions);
        setTeamAnalysis(data.analysis);
        if (data.thinking) {
          setTeamThinking(data.thinking);
        }
        if (data.onlineFindings) {
          setOnlineFindings(data.onlineFindings);
        }
        setTeamSuccessMessage(true);
        const activeModelObj = NVIDIA_MODELS.find(m => m.id === selectedNvidiaModel);
        const modelLabel = activeModelObj ? activeModelObj.name : "NVIDIA Agent Team";
        setDescription(`AI Generated (${modelLabel} Multi-Agent) using collected telemetry on ${track}.`);
      } else {
        throw new Error("No tuning parameters returned in the response");
      }
    } catch (err: any) {
      console.error(err);
      setTeamError(err.message || "An unknown error occurred during team generation.");
    } finally {
      setIsGeneratingTeam(false);
    }
  };

  const handleGenerateAiSetup = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    setAiAnalysis(null);
    setAiThinking(null);
    setOnlineFindings(null);
    setAiSuccessMessage(false);

    try {
      const response = await fetch("/api/nvidia/generate-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carModel,
          carClass,
          drivetrain,
          track,
          weather,
          focus: aiFocus,
          model: selectedNvidiaModel,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate setup");
      }

      const data = await response.json();
      if (data.tuning) {
        setParams(data.tuning);
        setAiAnalysis(data.analysis);
        if (data.thinking) {
          setAiThinking(data.thinking);
        }
        if (data.onlineFindings) {
          setOnlineFindings(data.onlineFindings);
        }
        setAiSuccessMessage(true);
        // update description as well to show it was AI generated
        const activeModelObj = NVIDIA_MODELS.find(m => m.id === selectedNvidiaModel);
        const modelLabel = activeModelObj ? activeModelObj.name : "NVIDIA AI";
        setDescription(`AI Generated (${modelLabel}) targeting: ${aiFocus}`);
      } else {
        throw new Error("No tuning parameters returned in the response");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An unknown error occurred during AI setup generation.");
    } finally {
      setIsGeneratingAi(false);
    }
  };
  const [carModel, setCarModel] = useState(setup?.carModel || `${CAR_PRESETS[0].producer} ${CAR_PRESETS[0].model}`);
  const [carClass, setCarClass] = useState<CarClass>(setup?.carClass || CAR_PRESETS[0].class);
  const [drivetrain, setDrivetrain] = useState<DrivetrainType>(setup?.drivetrain || CAR_PRESETS[0].drivetrain);
  const [track, setTrack] = useState(setup?.track || TRACKS[0]);
  const [weather, setWeather] = useState<WeatherCondition>(setup?.weather || "dry");
  const [description, setDescription] = useState(setup?.description || "");

  // Tire Pressure Calculator States
  const [frontColdPressure, setFrontColdPressure] = useState<number>(23.0);
  const [rearColdPressure, setRearColdPressure] = useState<number>(23.0);
  const [ambientTemp, setAmbientTemp] = useState<number>(25); // °C
  const [drivingIntensity, setDrivingIntensity] = useState<"low" | "medium" | "high">("medium");
  const [pressureUnit, setPressureUnit] = useState<"psi" | "bar">("psi");

  // Derive active preset details
  const currentPreset = CAR_PRESETS.find((c) => `${c.producer} ${c.model}` === carModel) || CAR_PRESETS[0];
  const currentProducer = currentPreset.producer;
  const currentModel = currentPreset.model;

  const producers = Array.from(new Set(CAR_PRESETS.map((c) => c.producer))).sort();
  const models = CAR_PRESETS.filter((c) => c.producer === currentProducer);

  // Tuning parameter States
  const [params, setParams] = useState<TuningParams>(
    setup?.tuning || getBaselineTuning(CAR_PRESETS[0].drivetrain, CAR_PRESETS[0].class, "dry")
  );

  // Diagnostics / Symptom States
  const [activeSymptom, setActiveSymptom] = useState<string>("");

  // Helpers for Tire Pressure
  const psiToBar = (psi: number) => psi * 0.0689476;
  const barToPsi = (bar: number) => bar / 0.0689476;

  const formatPressure = (psi: number) => {
    if (pressureUnit === "bar") {
      return `${psiToBar(psi).toFixed(2)} bar`;
    }
    return `${psi.toFixed(1)} psi`;
  };

  // Thermodynamic calculation model for Hot Tire Pressure
  const tirePressureData = useMemo(() => {
    // 1. Target Hot Pressure based on Class & Weather
    let targetMinPsi = 28.5;
    let targetMaxPsi = 30.0;
    let targetOptPsi = 29.2;

    if (weather === "dry") {
      if (carClass === "Road Cars") {
        targetMinPsi = 30.5; targetMaxPsi = 32.5; targetOptPsi = 31.5;
      } else if (carClass === "Gr.B") {
        targetMinPsi = 26.5; targetMaxPsi = 28.5; targetOptPsi = 27.5;
      } else if (carClass === "Gr.1") {
        targetMinPsi = 27.5; targetMaxPsi = 29.0; targetOptPsi = 28.3;
      } else { // Gr.4, Gr.3, Gr.2
        targetMinPsi = 28.5; targetMaxPsi = 30.0; targetOptPsi = 29.2;
      }
    } else if (weather === "wet") {
      if (carClass === "Road Cars") {
        targetMinPsi = 32.0; targetMaxPsi = 34.0; targetOptPsi = 33.0;
      } else if (carClass === "Gr.B") {
        targetMinPsi = 28.5; targetMaxPsi = 30.5; targetOptPsi = 29.5;
      } else if (carClass === "Gr.1") {
        targetMinPsi = 29.5; targetMaxPsi = 31.0; targetOptPsi = 30.2;
      } else {
        targetMinPsi = 30.5; targetMaxPsi = 32.0; targetOptPsi = 31.2;
      }
    } else { // intermediate
      if (carClass === "Road Cars") {
        targetMinPsi = 31.0; targetMaxPsi = 33.0; targetOptPsi = 32.0;
      } else if (carClass === "Gr.B") {
        targetMinPsi = 27.5; targetMaxPsi = 29.5; targetOptPsi = 28.5;
      } else if (carClass === "Gr.1") {
        targetMinPsi = 28.5; targetMaxPsi = 30.0; targetOptPsi = 29.2;
      } else {
        targetMinPsi = 29.5; targetMaxPsi = 31.0; targetOptPsi = 30.2;
      }
    }

    // 2. Temperature rise model based on weather and intensity
    let deltaT = 25;
    if (weather === "dry") {
      deltaT = drivingIntensity === "low" ? 15 : drivingIntensity === "medium" ? 28 : 42;
    } else if (weather === "intermediate") {
      deltaT = drivingIntensity === "low" ? 10 : drivingIntensity === "medium" ? 18 : 27;
    } else { // wet
      deltaT = drivingIntensity === "low" ? 5 : drivingIntensity === "medium" ? 10 : 16;
    }

    const estimatedHotTireTemp = ambientTemp + deltaT;
    const expansionFactor = (estimatedHotTireTemp + 273.15) / (ambientTemp + 273.15);

    // 3. Projected Hot Pressure (gauge pressure formula)
    const projectedFrontHot = (frontColdPressure + 14.7) * expansionFactor - 14.7;
    const projectedRearHot = (rearColdPressure + 14.7) * expansionFactor - 14.7;

    // 4. Optimal Cold pressure to hit exact target
    const recommendedFrontCold = (targetOptPsi + 14.7) / expansionFactor - 14.7;
    const recommendedRearCold = (targetOptPsi + 14.7) / expansionFactor - 14.7;

    // Helpers for status classes
    const getStatus = (proj: number) => {
      if (proj < targetMinPsi) {
        return {
          label: "Under-inflated",
          color: "text-amber-500",
          border: "border-amber-500/30",
          bg: "bg-amber-500/10",
          desc: "Tires will run too cold, risking low grip on acceleration."
        };
      }
      if (proj > targetMaxPsi) {
        return {
          label: "Over-inflated",
          color: "text-red-500",
          border: "border-red-500/30",
          bg: "bg-red-500/10",
          desc: "Tires will crown, reducing the contact patch and snapping traction."
        };
      }
      return {
        label: "Optimal Range",
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
        desc: "Perfect contact patch. Maximum uniform traction achieved."
      };
    };

    return {
      targetMinPsi,
      targetMaxPsi,
      targetOptPsi,
      deltaT,
      estimatedHotTireTemp,
      projectedFrontHot,
      projectedRearHot,
      recommendedFrontCold,
      recommendedRearCold,
      frontStatus: getStatus(projectedFrontHot),
      rearStatus: getStatus(projectedRearHot),
    };
  }, [weather, carClass, frontColdPressure, rearColdPressure, ambientTemp, drivingIntensity]);

  // Sync class/drivetrain when carModel changes
  useEffect(() => {
    if (!setup) {
      const preset = CAR_PRESETS.find((c) => `${c.producer} ${c.model}` === carModel);
      if (preset) {
        setCarClass(preset.class);
        setDrivetrain(preset.drivetrain);
        // Regenerate baseline
        setParams(getBaselineTuning(preset.drivetrain, preset.class, weather));
      }
    }
  }, [carModel, setup]);

  // Adjust baseline when weather changes
  const applyBaseline = () => {
    setParams(getBaselineTuning(drivetrain, carClass, weather));
  };

  const updateParam = (key: keyof TuningParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSetup({
      id: setup?.id,
      name,
      carModel,
      carClass,
      drivetrain,
      track,
      weather,
      description,
      tuning: params,
    });
  };

  // Symptoms troubleshooting lists from Page 13-15 of PDF
  const symptomsList = [
    { id: "entry-understeer", label: "Car Understeers (Won't Turn In)", fixes: [
      { field: "frontARB", text: "Soften front ARB (or stiffen rear ARB)", action: "decrease" },
      { field: "frontNF", text: "Soften front Natural Frequency springs by 1-2 clicks", action: "decrease" },
      { field: "frontCamber", text: "Increase front camber by 0.5 degrees", action: "increase" },
      { field: "frontDownforce", text: "Increase front downforce / reduce rear downforce", action: "increase" },
      { field: "brakeBalance", text: "Move brake balance rearward", action: "decrease" },
      { field: "initTorque", text: "Reduce LSD Initial Torque", action: "decrease" }
    ]},
    { id: "oversteer", label: "Car Oversteers (Rear Slides Out)", fixes: [
      { field: "frontARB", text: "Stiffen front ARB or soften rear ARB", action: "increase" },
      { field: "rearNF", text: "Soften rear Natural Frequency springs by 1-2 clicks", action: "decrease" },
      { field: "rearDownforce", text: "Increase rear downforce", action: "increase" },
      { field: "accelSens", text: "Reduce LSD acceleration sensitivity by 5", action: "decrease" },
      { field: "rearToe", text: "Add rear toe-in (+0.05 deg)", action: "increase" },
      { field: "brakeBalance", text: "Move brake balance forward", action: "increase" }
    ]},
    { id: "stiff-bouncy", label: "Suspension is Too Stiff / Bouncy", fixes: [
      { field: "frontNF", text: "Reduce Spring NF by 2-3 clicks both ends", action: "decrease" },
      { field: "rearNF", text: "Reduce Spring NF by 2-3 clicks both ends", action: "decrease" },
      { field: "frontComp", text: "Reduce compression damping toward 24-26", action: "decrease" },
      { field: "rearComp", text: "Reduce compression damping toward 24-26", action: "decrease" },
      { field: "frontARB", text: "Soften ARBs by 1-2 clicks", action: "decrease" },
      { field: "frontRideHeight", text: "Raise ride height 2-3 clicks to allow suspension travel", action: "increase" }
    ]},
    { id: "exit-traction", label: "Losing Traction on Corner Exit", fixes: [
      { field: "accelSens", text: "Inside spinning? Increase LSD accel. Outside spinning? Decrease", action: "adjust" },
      { field: "rearNF", text: "Soften rear springs by 1-2 clicks", action: "decrease" },
      { field: "rearComp", text: "Lower rear compression toward 26-28", action: "decrease" }
    ]},
    { id: "unstable-braking", label: "Unstable Under Braking", fixes: [
      { field: "brakeBalance", text: "Move brake balance forward to stabilize", action: "increase" },
      { field: "brakingSens", text: "Increase LSD braking sensitivity by 5", action: "increase" },
      { field: "rearToe", text: "Add rear toe-in (+0.05 deg)", action: "increase" },
      { field: "rearExp", text: "Increase rear expansion damping toward 42-44", action: "increase" }
    ]}
  ];

  const currentSymptomData = symptomsList.find((s) => s.id === activeSymptom);

  // Highlighter for fields
  const getHighlightClass = (fieldName: keyof TuningParams) => {
    if (!currentSymptomData) return "border-zinc-800 focus:border-red-600";
    const fix = currentSymptomData.fixes.find((f) => f.field === fieldName);
    if (!fix) return "border-zinc-800 focus:border-red-600";
    return "border-yellow-500 bg-yellow-950/20 shadow-md shadow-yellow-500/10 focus:border-yellow-400";
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Header Information Panel */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg text-white uppercase tracking-wider">
                {setup ? "Edit Tune Configuration" : "New Tuning Sheet"}
              </h2>
              <p className="text-xs text-zinc-400">
                Configure precise telemetry settings aligned with Flux89 race benchmarks
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyBaseline}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-semibold text-red-500 uppercase tracking-wider transition"
            >
              Reset to Baseline
            </button>
            <button
              type="button"
              disabled={isGeneratingAi || isGeneratingTeam}
              onClick={handleGenerateAiSetup}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-red-950/45 disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Auto-Tuning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  <span>NVIDIA Auto-Tune</span>
                </>
              )}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Tune</span>
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Tune Name/Version</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Manufacturer</label>
            <select
              value={currentProducer}
              onChange={(e) => {
                const newProducer = e.target.value;
                const firstModel = CAR_PRESETS.find((c) => c.producer === newProducer)?.model || "";
                setCarModel(`${newProducer} ${firstModel}`);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
            >
              {producers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Car Model</label>
            <select
              value={currentModel}
              onChange={(e) => {
                const newModel = e.target.value;
                setCarModel(`${currentProducer} ${newModel}`);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
            >
              {models.map((m) => (
                <option key={m.model} value={m.model}>
                  {m.model}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Target Track</label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
            >
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Track Weather</label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
            >
              <option value="dry">☀️ Dry Track</option>
              <option value="wet">🌧️ Wet Track</option>
              <option value="intermediate">🌦️ Intermediate</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Notes & Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Optimized for high downforce cornering speed, softer rear to manage bumpiness"
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 font-semibold block uppercase">Car Class</span>
              <span className="font-bold text-red-500 mt-1 block font-mono">{carClass}</span>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold block uppercase">Drivetrain</span>
              <span className="font-bold text-red-500 mt-1 block font-mono">{drivetrain}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1.5 NVIDIA AI RESEARCH & SETUP GENERATION PANEL */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
        {/* Glow styling accent */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-red-600/10 to-transparent pointer-events-none rounded-tr-xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider flex flex-wrap items-center gap-2">
                NVIDIA AI Performance Lab
                <span className="text-[9px] bg-red-600/20 text-red-400 font-mono font-bold px-1.5 py-0.5 rounded border border-red-500/20 uppercase">
                  Nemotron & Llama Core
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Execute physics-guided dynamics calibrations on <span className="text-zinc-300 font-semibold">{carModel}</span> for <span className="text-zinc-300 font-semibold">{track}</span>.
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-zinc-900/60 p-1 rounded-lg border border-zinc-800/80 shrink-0">
            <button
              type="button"
              onClick={() => setAiPanelMode("single")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                aiPanelMode === "single"
                  ? "bg-red-600/20 text-red-400 border border-red-500/20 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Single Model
            </button>
            <button
              type="button"
              onClick={() => setAiPanelMode("team")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                aiPanelMode === "team"
                  ? "bg-red-600/20 text-red-400 border border-red-500/20 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Multi-Agent Team
            </button>
          </div>
        </div>

        {/* Model Selection Grid (Shared) */}
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Core LLM Simulation Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {NVIDIA_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedNvidiaModel(model.id)}
                  className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between h-full group ${
                    selectedNvidiaModel === model.id
                      ? "bg-red-950/20 border-red-600 text-white"
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/80"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        selectedNvidiaModel === model.id ? "text-red-400" : "text-zinc-300 group-hover:text-white"
                      }`}>
                        {model.name.replace("Nemotron-3 ", "").replace("Instruct", "").trim()}
                      </span>
                      <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono px-1 rounded scale-90 uppercase">
                        {model.isFree ? "Free" : "Trial"}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                      {model.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: SINGLE MODEL MODE */}
          {aiPanelMode === "single" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Handling & Tuning Strategy Focus
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={aiFocus}
                    onChange={(e) => setAiFocus(e.target.value)}
                    placeholder="Describe your handling problems or tuning objectives (e.g., 'Make it rotate faster on slow corners')"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAiSetup}
                    disabled={isGeneratingAi}
                    className="px-5 py-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shrink-0"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        <span>Analyzing Dynamics...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4 text-yellow-400" />
                        <span>Execute AI Research</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick presets buttons */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mr-1">
                  Objective Presets:
                </span>
                {[
                  { label: "🌀 Aggressive Entry Turn-in", desc: "Aggressive entry turn-in and corner rotation" },
                  { label: "🛡️ Stop Lift-off Snap", desc: "Rear-end stability and lift-off snap-oversteer mitigation" },
                  { label: "🌧️ Max Rain Traction", desc: "Wet surface mechanical compliance and maximum rain tire traction" },
                  { label: "🚀 High-Speed Top End", desc: "Minimal aerodynamic drag and optimized final drive ratios for pure speed" },
                  { label: "⛰️ Bumpy Track Absorption", desc: "Softer natural frequency spring-rates and compression damping for bumpy track compliance" },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiFocus(preset.desc)}
                    className={`px-2.5 py-1 rounded border text-[10px] transition ${
                      aiFocus === preset.desc
                        ? "bg-red-600/20 border-red-500/40 text-red-400 font-semibold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* AI Success Confirmation */}
              {aiSuccessMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-lg flex items-start gap-2.5 text-xs animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">AI Calibration Successful</span>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed">
                      The tuning sheet values have been successfully overridden and calibrated using the simulated results from the <span className="text-white font-mono font-bold">NVIDIA Nemotron 120B</span> model. Feel free to tweak them manually below.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Error Alert */}
              {aiError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Simulation Error</span>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed">{aiError}</p>
                  </div>
                </div>
              )}

              {/* Generated Analysis Explanation */}
              {aiAnalysis && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-white font-bold uppercase tracking-wider border-b border-zinc-800 pb-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>NVIDIA Engineering Telemetry Analysis</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line italic">
                    "{aiAnalysis}"
                  </p>
                </div>
              )}

              {/* Google Search Grounded Predictions & Findings */}
              {onlineFindings && (
                <div className="bg-blue-950/25 border border-blue-900/40 rounded-xl p-4 space-y-2.5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider border-b border-blue-900/30 pb-2">
                    <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span>Google Search Grounded Online Findings & Predictions</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                    {onlineFindings}
                  </p>
                  <div className="text-[9px] text-zinc-500 font-mono text-right">
                    Verified GT7 web guidelines & prediction telemetry ingested successfully
                  </div>
                </div>
              )}

              {/* Thinking process toggle */}
              {aiThinking && (
                <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950">
                  <button
                    type="button"
                    onClick={() => setShowThinking(!showThinking)}
                    className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-zinc-400 hover:text-zinc-200 transition bg-zinc-900/30"
                  >
                    <span className="flex items-center gap-1.5 uppercase">
                      💭 View NVIDIA Nemotron thinking process ({aiThinking.split(" ").length} words)
                    </span>
                    {showThinking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showThinking && (
                    <div className="p-3.5 bg-zinc-950/40 border-t border-zinc-900 text-[11px] font-mono text-zinc-400 max-h-56 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800">
                      <div className="whitespace-pre-wrap pl-2 border-l border-red-500/30">
                        {aiThinking}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MULTI-AGENT TEAM MODE */}
          {aiPanelMode === "team" && (
            <div className="space-y-4">
              {/* Telemetry Capture Section */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Track Telemetry Log Center
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Friction coefficient and mechanical heat values captured on <span className="text-zinc-300 font-semibold">{track}</span> ({weather}).
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleSimulateTelemetry}
                    disabled={isSimulatingTelemetry || isGeneratingTeam}
                    className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-emerald-400/20" />
                    {isSimulatingTelemetry ? "Simulating..." : capturedTelemetry ? "Recapture Telemetry Log" : "Capture Telemetry Log"}
                  </button>
                </div>

                {isSimulatingTelemetry && (
                  <div className="space-y-2 py-3">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span className="animate-pulse">{telemetrySimStep}</span>
                      <span>{telemetryProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${telemetryProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {!isSimulatingTelemetry && !capturedTelemetry && (
                  <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/20">
                    <Activity className="w-8 h-8 text-zinc-600 mx-auto stroke-[1.5]" />
                    <p className="text-[11px] text-zinc-500 mt-2 max-w-sm mx-auto">
                      No live track telemetry has been recorded yet. Click <span className="text-emerald-400 font-semibold">Capture Telemetry Log</span> to simulate dynamic tire, suspension, and gearbox friction loops.
                    </p>
                  </div>
                )}

                {capturedTelemetry && !isSimulatingTelemetry && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">Cornering Grip Slip</span>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm font-mono font-bold text-zinc-200">
                          {capturedTelemetry.understeerAngle}° <span className="text-[9px] text-zinc-500">und</span>
                        </span>
                      </div>
                      <div className="mt-0.5 text-[8px] font-mono text-zinc-400">
                        {capturedTelemetry.understeerAngle > 3.0 ? "⚠️ High Understeer" : "🟢 Optimal Rotational slip"}
                      </div>
                    </div>

                    <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">Rear End Slide</span>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm font-mono font-bold text-zinc-200">
                          {capturedTelemetry.oversteerAngle}° <span className="text-[9px] text-zinc-500">ovr</span>
                        </span>
                      </div>
                      <div className="mt-0.5 text-[8px] font-mono text-zinc-400">
                        {capturedTelemetry.oversteerAngle > 4.0 ? "🔴 Loose / Snap Hazard" : "🟢 Stable lateral hold"}
                      </div>
                    </div>

                    <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">Suspension Bottoming</span>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm font-mono font-bold text-zinc-200">
                          F: {capturedTelemetry.suspensionBottoming.front} / R: {capturedTelemetry.suspensionBottoming.rear}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[8px] font-mono text-zinc-400">
                        {capturedTelemetry.suspensionBottoming.front > 2 ? "⚠️ Bottoming Front Springs" : "🟢 Ride compliance secure"}
                      </div>
                    </div>

                    <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">Tire Pressures (Hot)</span>
                      <div className="mt-1 flex items-baseline gap-1 font-mono text-[10px] text-zinc-300">
                        <span>FL: {capturedTelemetry.tirePressures.fl}</span>
                        <span className="text-zinc-600">|</span>
                        <span>FR: {capturedTelemetry.tirePressures.fr}</span>
                      </div>
                      <div className="mt-0.5 text-[8px] font-mono text-zinc-400">
                        Avg Hot Pressure: {((capturedTelemetry.tirePressures.fl + capturedTelemetry.tirePressures.fr + capturedTelemetry.tirePressures.rl + capturedTelemetry.tirePressures.rr) / 4).toFixed(1)} psi
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Team Checkboxes */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Select Active AI Specialists for Consultation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { id: "perfDirector", name: "Performance Director", role: "Nemotron 120B", desc: "Coordinates strategy, aligns baseline track aero & downforce to weight balance.", color: "border-red-500/20 hover:border-red-500/40 text-red-400" },
                    { id: "chassisEng", name: "Chassis & Dampers Specialist", role: "Llama 3.1 70B", desc: "Calibrates Ride heights, natural frequencies, damping bounce / rebound, alignment.", color: "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400" },
                    { id: "aeroEng", name: "Aerodynamics Consultant", role: "Nemotron 340B", desc: "Fine-tunes high-speed front/rear downforce ratios to minimize high speed aerodynamic drag.", color: "border-blue-500/20 hover:border-blue-500/40 text-blue-400" },
                    { id: "powertrainEng", name: "Powertrain & LSD Engineer", role: "Mistral NeMo 12B", desc: "Calibrates multi-disc LSD initial torque, acceleration sensitivity, and top-gear speeds.", color: "border-purple-500/20 hover:border-purple-500/40 text-purple-400" },
                  ].map((agent) => {
                    const isActive = selectedAgents.includes(agent.id);
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                          } else {
                            setSelectedAgents([...selectedAgents, agent.id]);
                          }
                        }}
                        className={`p-3 rounded-lg border text-left transition flex flex-col justify-between h-full relative ${
                          isActive 
                            ? "bg-zinc-900/90 border-red-600 text-white" 
                            : "bg-zinc-950/40 border-zinc-850 text-zinc-500 hover:bg-zinc-900/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider block">
                              {agent.name}
                            </span>
                            <span className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono px-1 rounded">
                              {agent.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                            {agent.desc}
                          </p>
                        </div>
                        <div className="mt-2.5 pt-1.5 border-t border-zinc-900/80 flex items-center justify-between">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase">Expertise Module</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? "text-red-400" : "text-zinc-600"}`}>
                            {isActive ? "● Active" : "○ Offline"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consult Team Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateTeamSetup}
                  disabled={isGeneratingTeam || !capturedTelemetry || selectedAgents.length === 0}
                  className="w-full py-2.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-600 text-white text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isGeneratingTeam ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      <span>NVIDIA Team Consultation & Calibration in progress...</span>
                    </>
                  ) : !capturedTelemetry ? (
                    <>
                      <Activity className="w-4 h-4 text-zinc-500" />
                      <span>Must Record Track Telemetry to trigger Consultation</span>
                    </>
                  ) : selectedAgents.length === 0 ? (
                    <>
                      <Users className="w-4 h-4 text-zinc-500" />
                      <span>Select at least 1 specialist agent</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Consult NVIDIA AI Specialist Team ({selectedAgents.length} Agents)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Consultation Team Error */}
              {teamError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg flex items-start gap-2.5 text-xs animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Consultation Interrupted</span>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed">{teamError}</p>
                  </div>
                </div>
              )}

              {/* Simulation Consensus results */}
              {teamSuccessMessage && teamConclusions && (
                <div className="space-y-4 pt-2 border-t border-zinc-900 animate-fade-in">
                  
                  {/* General Notification */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-lg flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block uppercase tracking-wider text-[10px]">Multi-Agent Consensus Calibration Successful</span>
                      <p className="text-zinc-300 mt-0.5 leading-relaxed">
                        The virtual racing team completed their mathematical simulations. The tuning parameters below have been overridden to resolve the telemetry anomalies.
                      </p>
                    </div>
                  </div>

                  {/* Multi-Agent bubble Board */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-red-500" />
                      Active Specialist Debriefing Notes:
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedAgents.map((agentId) => {
                        const content = teamConclusions[agentId];
                        if (!content) return null;
                        
                        const agentDetails: any = {
                          perfDirector: { name: "Performance Director", role: "Team Principal", avatar: "🔴" },
                          chassisEng: { name: "Chassis dynamics Specialist", role: "Damper & Spring tuning", avatar: "🟢" },
                          aeroEng: { name: "Aerodynamics Consultant", role: "Downforce & Drags", avatar: "🔵" },
                          powertrainEng: { name: "Powertrain & LSD Engineer", role: "Transmission calibration", avatar: "🟣" }
                        };
                        const agent = agentDetails[agentId];
                        if (!agent) return null;

                        return (
                          <div key={agentId} className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-3.5 flex items-start gap-3">
                            <div className="text-xl leading-none">{agent.avatar}</div>
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[11px] font-extrabold text-white">{agent.name}</span>
                                <span className="text-[9px] text-zinc-500 font-mono font-medium">({agent.role})</span>
                              </div>
                              <p className="text-[11px] text-zinc-300 leading-relaxed italic">
                                "{content}"
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Combined executive analysis */}
                  {teamAnalysis && (
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-white font-bold uppercase tracking-wider border-b border-zinc-800 pb-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>NVIDIA AI Team Joint Executive Summary</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line italic">
                        "{teamAnalysis}"
                      </p>
                    </div>
                  )}

                  {/* Google Search Grounded Predictions & Findings */}
                  {onlineFindings && (
                    <div className="bg-blue-950/25 border border-blue-900/40 rounded-xl p-4 space-y-2.5 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider border-b border-blue-900/30 pb-2">
                        <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span>Google Search Grounded Online Findings & Predictions</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                        {onlineFindings}
                      </p>
                      <div className="text-[9px] text-zinc-500 font-mono text-right">
                        Verified GT7 web guidelines & prediction telemetry ingested successfully
                      </div>
                    </div>
                  )}

                  {/* Expandable team thinking logs */}
                  {teamThinking && (
                    <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950">
                      <button
                        type="button"
                        onClick={() => setShowTeamThinking(!showTeamThinking)}
                        className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-zinc-400 hover:text-zinc-200 transition bg-zinc-900/30"
                      >
                        <span className="flex items-center gap-1.5 uppercase">
                          💭 View Joint Agent thinking and calibration logs ({teamThinking.split(" ").length} words)
                        </span>
                        {showTeamThinking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {showTeamThinking && (
                        <div className="p-3.5 bg-zinc-950/40 border-t border-zinc-900 text-[11px] font-mono text-zinc-400 max-h-56 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800">
                          <div className="whitespace-pre-wrap pl-2 border-l border-red-500/30">
                            {teamThinking}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 2. RACE ENGINEER REAL-TIME TROUBLESHOOTING TOOL */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
            Race Engineer Analyzer
          </h3>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Experiencing a handling problem? Select your active symtom below, and we will highlight the exact mechanical parameters to correct.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <select
            value={activeSymptom}
            onChange={(e) => setActiveSymptom(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none"
          >
            <option value="">-- Analyzer: No Active Symptom --</option>
            {symptomsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {currentSymptomData ? (
            <div className="md:col-span-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 space-y-1.5 text-xs text-yellow-100">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                <span>Recommended Fix Action Map:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                {currentSymptomData.fixes.map((f, idx) => (
                  <li key={idx}>
                    {f.text} (
                    <span className="font-bold text-yellow-500">
                      {f.action === "increase" ? "Stiffen / Higher" : f.action === "decrease" ? "Soften / Lower" : "Adjust"}
                    </span>
                    )
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="md:col-span-2 text-zinc-500 text-xs italic py-2 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              <span>Select a symptom to map tuning indicators on the sliders.</span>
            </div>
          )}
        </div>
      </div>

      {/* 2.5 OPTIMAL HOT TIRE PRESSURE PREDICTOR & CALCULATOR */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                Optimal Hot Tire Pressure Predictor
              </h3>
              <p className="text-[11px] text-zinc-400">
                Thermodynamic calculator predicting live hot tyre pressures for <span className="text-red-500 font-semibold">{carClass}</span> in <span className="text-red-500 font-semibold">{weather}</span> conditions.
              </p>
            </div>
          </div>
          <div className="flex bg-zinc-900 p-1 border border-zinc-800 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPressureUnit("psi")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                pressureUnit === "psi" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              PSI
            </button>
            <button
              type="button"
              onClick={() => setPressureUnit("bar")}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                pressureUnit === "bar" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              BAR
            </button>
          </div>
        </div>

        {/* Dynamic Target Guidelines Info */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <span className="text-zinc-400 block font-semibold uppercase text-[10px] tracking-wide">Suggested Hot Target Range</span>
            <span className="text-lg font-mono font-bold text-white mt-1 block">
              {formatPressure(tirePressureData.targetMinPsi)} – {formatPressure(tirePressureData.targetMaxPsi)}
              <span className="text-xs text-zinc-400 font-sans font-normal ml-2">
                (Ideal: <span className="text-emerald-400 font-mono font-semibold">{formatPressure(tirePressureData.targetOptPsi)}</span>)
              </span>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFrontColdPressure(Number(tirePressureData.recommendedFrontCold.toFixed(1)));
                setRearColdPressure(Number(tirePressureData.recommendedRearCold.toFixed(1)));
              }}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold uppercase rounded-lg transition shadow-md"
            >
              Apply Perfect Cold Pressures
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Section 1: Inputs */}
          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Thermometer className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Track Variables</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Ambient Temperature</span>
                <span className="font-mono text-white font-bold">{ambientTemp}°C</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Driving Intensity</label>
              <select
                value={drivingIntensity}
                onChange={(e) => setDrivingIntensity(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-600"
              >
                <option value="low">Low (Out-lap / Wet cruise)</option>
                <option value="medium">Medium (Standard race pace)</option>
                <option value="high">High (Hot-lap / Qualifying push)</option>
              </select>
            </div>

            <div className="text-[10px] text-zinc-500 leading-relaxed pt-1">
              * Thermodynamics factor modeled: Tire temperatures estimated to reach <span className="text-zinc-300 font-semibold">{tirePressureData.estimatedHotTireTemp}°C</span> (Ambient + {tirePressureData.deltaT}°C heat expansion soak).
            </div>
          </div>

          {/* Section 2: Front Tires */}
          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Front Tyre Profile</span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">F_TYRE</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Cold Starting Pressure</span>
                <span className="font-mono text-zinc-100 font-bold">{formatPressure(frontColdPressure)}</span>
              </div>
              <input
                type="range"
                min={pressureUnit === "bar" ? 1.0 : 15.0}
                max={pressureUnit === "bar" ? 2.5 : 35.0}
                step={pressureUnit === "bar" ? 0.05 : 0.5}
                value={pressureUnit === "bar" ? Number(psiToBar(frontColdPressure).toFixed(2)) : frontColdPressure}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFrontColdPressure(pressureUnit === "bar" ? Number(barToPsi(val).toFixed(1)) : val);
                }}
                className="w-full accent-red-600"
              />
            </div>

            <div className="pt-2 border-t border-zinc-900/50 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">Projected Hot</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                  {formatPressure(tirePressureData.projectedFrontHot)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">Rec. Cold</span>
                <span className="text-sm font-mono font-semibold text-emerald-400 mt-0.5 block">
                  {formatPressure(tirePressureData.recommendedFrontCold)}
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-lg border text-[11px] ${tirePressureData.frontStatus.bg} ${tirePressureData.frontStatus.border} ${tirePressureData.frontStatus.color} space-y-0.5`}>
              <span className="font-bold uppercase tracking-wider block text-[10px]">
                {tirePressureData.frontStatus.label}
              </span>
              <span className="text-zinc-300 text-[10.5px] leading-relaxed block">
                {tirePressureData.frontStatus.desc}
              </span>
            </div>
          </div>

          {/* Section 3: Rear Tires */}
          <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Rear Tyre Profile</span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">R_TYRE</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Cold Starting Pressure</span>
                <span className="font-mono text-zinc-100 font-bold">{formatPressure(rearColdPressure)}</span>
              </div>
              <input
                type="range"
                min={pressureUnit === "bar" ? 1.0 : 15.0}
                max={pressureUnit === "bar" ? 2.5 : 35.0}
                step={pressureUnit === "bar" ? 0.05 : 0.5}
                value={pressureUnit === "bar" ? Number(psiToBar(rearColdPressure).toFixed(2)) : rearColdPressure}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRearColdPressure(pressureUnit === "bar" ? Number(barToPsi(val).toFixed(1)) : val);
                }}
                className="w-full accent-red-600"
              />
            </div>

            <div className="pt-2 border-t border-zinc-900/50 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">Projected Hot</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                  {formatPressure(tirePressureData.projectedRearHot)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">Rec. Cold</span>
                <span className="text-sm font-mono font-semibold text-emerald-400 mt-0.5 block">
                  {formatPressure(tirePressureData.recommendedRearCold)}
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-lg border text-[11px] ${tirePressureData.rearStatus.bg} ${tirePressureData.rearStatus.border} ${tirePressureData.rearStatus.color} space-y-0.5`}>
              <span className="font-bold uppercase tracking-wider block text-[10px]">
                {tirePressureData.rearStatus.label}
              </span>
              <span className="text-zinc-300 text-[10.5px] leading-relaxed block">
                {tirePressureData.rearStatus.desc}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Parameter Customization Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aerodynamics & Suspension */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-5">
          <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-2">
            <span>Aero & Primary Suspension</span>
          </h3>

          {/* Downforce */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">Aerodynamics (Downforce)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Front Aero</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.frontDownforce}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="5"
                  value={params.frontDownforce}
                  onChange={(e) => updateParam("frontDownforce", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("frontDownforce")}`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Rear Aero</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.rearDownforce}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="5"
                  value={params.rearDownforce}
                  onChange={(e) => updateParam("rearDownforce", Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          </div>

          {/* Ride Height */}
          <div className="space-y-4 pt-3 border-t border-zinc-900">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">Ride Height (mm)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Front Ride Height</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.frontRideHeight} mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="1"
                  value={params.frontRideHeight}
                  onChange={(e) => updateParam("frontRideHeight", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("frontRideHeight")}`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Rear Ride Height</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.rearRideHeight} mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="1"
                  value={params.rearRideHeight}
                  onChange={(e) => updateParam("rearRideHeight", Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed italic">
              Note: Positive rake (rear taller than front) promotes better rotation on entry. Lower height yields higher grip but risk of arch rub.
            </p>
          </div>

          {/* Natural Frequency */}
          <div className="space-y-4 pt-3 border-t border-zinc-900">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">Natural Frequency (Hz)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Front Spring Rate</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.frontNF.toFixed(2)} Hz</span>
                </div>
                <input
                  type="range"
                  min="1.00"
                  max="5.00"
                  step="0.05"
                  value={params.frontNF}
                  onChange={(e) => updateParam("frontNF", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("frontNF")}`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Rear Spring Rate</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.rearNF.toFixed(2)} Hz</span>
                </div>
                <input
                  type="range"
                  min="1.00"
                  max="5.00"
                  step="0.05"
                  value={params.rearNF}
                  onChange={(e) => updateParam("rearNF", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("rearNF")}`}
                />
              </div>
            </div>
          </div>

          {/* Anti-Roll Bars */}
          <div className="space-y-4 pt-3 border-t border-zinc-900">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">Anti-Roll Bars (ARBs)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Front ARB</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.frontARB} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={params.frontARB}
                  onChange={(e) => updateParam("frontARB", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("frontARB")}`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Rear ARB</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.rearARB} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={params.rearARB}
                  onChange={(e) => updateParam("rearARB", Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dampers, Alignment & LSD */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-5">
          <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-2">
            <span>Dampers, Alignment & LSD</span>
          </h3>

          {/* Dampers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">Dampers</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Front Compression</span>
                  <span className="font-mono text-zinc-100">{params.frontComp}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="40"
                  step="1"
                  value={params.frontComp}
                  onChange={(e) => updateParam("frontComp", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("frontComp")}`}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Rear Compression</span>
                  <span className="font-mono text-zinc-100">{params.rearComp}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="40"
                  step="1"
                  value={params.rearComp}
                  onChange={(e) => updateParam("rearComp", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("rearComp")}`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Front Expansion</span>
                  <span className="font-mono text-zinc-100">{params.frontExp}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="50"
                  step="1"
                  value={params.frontExp}
                  onChange={(e) => updateParam("frontExp", Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Rear Expansion</span>
                  <span className="font-mono text-zinc-100">{params.rearExp}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="50"
                  step="1"
                  value={params.rearExp}
                  onChange={(e) => updateParam("rearExp", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("rearExp")}`}
                />
              </div>
            </div>
            {(params.frontExp <= params.frontComp || params.rearExp <= params.rearComp) && (
              <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Expansion must strictly be higher than Compression!</span>
              </p>
            )}
          </div>

          {/* Camber */}
          <div className="space-y-3 pt-3 border-t border-zinc-900">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">Negative Camber (deg)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Front Camber</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.frontCamber}°</span>
                </div>
                <input
                  type="range"
                  min="-5.0"
                  max="0.0"
                  step="0.1"
                  value={params.frontCamber}
                  onChange={(e) => updateParam("frontCamber", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("frontCamber")}`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Rear Camber</span>
                  <span className="font-mono text-zinc-100 font-bold">{params.rearCamber}°</span>
                </div>
                <input
                  type="range"
                  min="-5.0"
                  max="0.0"
                  step="0.1"
                  value={params.rearCamber}
                  onChange={(e) => updateParam("rearCamber", Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          </div>

          {/* LSD */}
          <div className="space-y-3 pt-3 border-t border-zinc-900">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">Limited Slip Differential (LSD)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 block">Initial Torque</span>
                <span className="font-mono font-bold text-zinc-200 text-xs">{params.initTorque}</span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={params.initTorque}
                  onChange={(e) => updateParam("initTorque", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("initTorque")}`}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 block">Accel. Sensitivity</span>
                <span className="font-mono font-bold text-zinc-200 text-xs">{params.accelSens}</span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={params.accelSens}
                  onChange={(e) => updateParam("accelSens", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("accelSens")}`}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 block">Braking Sensitivity</span>
                <span className="font-mono font-bold text-zinc-200 text-xs">{params.brakingSens}</span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={params.brakingSens}
                  onChange={(e) => updateParam("brakingSens", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("brakingSens")}`}
                />
              </div>
            </div>
          </div>

          {/* Gearing & Brake Balance */}
          <div className="space-y-3 pt-3 border-t border-zinc-900">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">Transmission & Braking</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 block">Top Speed</span>
                <span className="font-mono font-bold text-zinc-200 text-xs">{params.topSpeed} km/h</span>
                <input
                  type="range"
                  min="120"
                  max="480"
                  step="10"
                  value={params.topSpeed}
                  onChange={(e) => updateParam("topSpeed", Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 block">Final Drive</span>
                <span className="font-mono font-bold text-zinc-200 text-xs">{params.finalDrive.toFixed(2)}</span>
                <input
                  type="range"
                  min="2.00"
                  max="6.00"
                  step="0.05"
                  value={params.finalDrive}
                  onChange={(e) => updateParam("finalDrive", Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 block">Brake Bias</span>
                <span className="font-mono font-bold text-zinc-200 text-xs">
                  {params.brakeBalance === 0 ? "0 (Neutral)" : params.brakeBalance < 0 ? `R ${Math.abs(params.brakeBalance)}` : `F ${params.brakeBalance}`}
                </span>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="1"
                  value={params.brakeBalance}
                  onChange={(e) => updateParam("brakeBalance", Number(e.target.value))}
                  className={`w-full accent-red-600 ${getHighlightClass("brakeBalance")}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-semibold rounded-lg text-xs uppercase tracking-wider transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs uppercase tracking-wider transition shadow-lg"
        >
          Save Tune Sheet
        </button>
      </div>
    </form>
  );
}
