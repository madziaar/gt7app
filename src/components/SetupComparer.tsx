import React, { useState } from "react";
import { TuningSetup } from "../types";
import { Scale, ArrowRight, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

interface SetupComparerProps {
  setups: TuningSetup[];
}

export default function SetupComparer({ setups }: SetupComparerProps) {
  const [setup1Id, setSetup1Id] = useState<string>("");
  const [setup2Id, setSetup2Id] = useState<string>("");

  const setup1 = setups.find((s) => s.id === setup1Id);
  const setup2 = setups.find((s) => s.id === setup2Id);

  const getCompareBadge = (val1: number, val2: number, lowerIsBetter: boolean | null = null) => {
    if (val1 === val2) return <span className="text-zinc-500 font-mono text-xs">=</span>;
    const diff = val1 - val2;
    const sign = diff > 0 ? "+" : "";

    if (lowerIsBetter === null) {
      return (
        <span className="font-mono text-xs text-amber-500 font-semibold">
          {sign}
          {diff.toFixed(2)}
        </span>
      );
    }

    const val1Better = lowerIsBetter ? diff < 0 : diff > 0;
    return (
      <span className={`font-mono text-xs font-semibold ${val1Better ? "text-emerald-500" : "text-rose-500"}`}>
        {sign}
        {diff.toFixed(2)}
      </span>
    );
  };

  const getRakeDiffText = (s1: TuningSetup, s2: TuningSetup) => {
    const rake1 = s1.tuning.rearRideHeight - s1.tuning.frontRideHeight;
    const rake2 = s2.tuning.rearRideHeight - s2.tuning.frontRideHeight;
    if (Math.abs(rake1 - rake2) < 0.1) return "Equal rake balance.";
    if (rake1 > rake2) {
      return `Setup 1 has more rear rake (+${(rake1 - rake2).toFixed(1)}mm), which promotes more oversteer and rotation.`;
    } else {
      return `Setup 2 has more rear rake (+${(rake2 - rake1).toFixed(1)}mm), promoting more oversteer and rotation.`;
    }
  };

  const checkSuspensionSafety = (s: TuningSetup) => {
    const warnings: string[] = [];
    if (s.tuning.frontExp <= s.tuning.frontComp) {
      warnings.push("Front Expansion must be strictly higher than Front Compression!");
    }
    if (s.tuning.rearExp <= s.tuning.rearComp) {
      warnings.push("Rear Expansion must be strictly higher than Rear Compression!");
    }
    if (s.tuning.frontRideHeight <= 60 && s.tuning.frontNF < 2.5) {
      warnings.push("Warning: Low ride height paired with soft front springs may cause the wheel to rub or bottom out!");
    }
    return warnings;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-600 rounded-lg text-white">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-sans font-bold text-lg text-white uppercase tracking-wide">
            Setup Comparer
          </h2>
          <p className="text-xs text-zinc-400">
            Compare mechanical parameters and analyze handling implications side-by-side
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Setup A (Reference)
          </label>
          <select
            value={setup1Id}
            onChange={(e) => setSetup1Id(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600"
          >
            <option value="">-- Choose Base Setup --</option>
            {setups.map((s) => (
              <option key={s.id} value={s.id}>
                {s.carModel} ({s.carClass}) - {s.track} [{s.weather.toUpperCase()}] - {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Setup B (Compare To)
          </label>
          <select
            value={setup2Id}
            onChange={(e) => setSetup2Id(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-600"
          >
            <option value="">-- Choose Setup to Compare --</option>
            {setups.map((s) => (
              <option key={s.id} value={s.id}>
                {s.carModel} ({s.carClass}) - {s.track} [{s.weather.toUpperCase()}] - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {setup1 && setup2 ? (
        <div className="space-y-6">
          {/* Diagnostic Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Telemetry Comparison Advice
            </h4>
            <div className="text-xs text-zinc-300 space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-red-500 font-bold font-mono">RAKE:</span>
                <span>{getRakeDiffText(setup1, setup2)}</span>
              </p>
              {setup1.drivetrain !== setup2.drivetrain && (
                <p className="text-amber-400/90 text-xs">
                  ⚠️ Note: These cars have different drivetrains ({setup1.drivetrain} vs {setup2.drivetrain}).
                  LSD and anti-roll bar baselines will vary fundamentally.
                </p>
              )}
            </div>

            {/* Warnings display */}
            {(() => {
              const w1 = checkSuspensionSafety(setup1);
              const w2 = checkSuspensionSafety(setup2);
              if (w1.length === 0 && w2.length === 0) return null;
              return (
                <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Handling Violations Detected:</span>
                  </div>
                  {w1.map((w, i) => (
                    <div key={`w1-${i}`} className="text-xs text-zinc-400 pl-5">
                      • <span className="text-zinc-300 font-semibold">Setup A:</span> {w}
                    </div>
                  ))}
                  {w2.map((w, i) => (
                    <div key={`w2-${i}`} className="text-xs text-zinc-400 pl-5">
                      • <span className="text-zinc-300 font-semibold">Setup B:</span> {w}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Table of values */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold bg-zinc-900/50">
                  <th className="py-2.5 px-3">TUNING SPECIFICATION</th>
                  <th className="py-2.5 px-3 text-right bg-zinc-900">SETUP A</th>
                  <th className="py-2.5 px-3 text-right bg-zinc-950">SETUP B</th>
                  <th className="py-2.5 px-3 text-center">VARIANCE (A - B)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300 font-mono">
                {/* Aero */}
                <tr className="bg-zinc-900/20 text-[11px] font-sans font-bold text-zinc-400 tracking-wide uppercase">
                  <td colSpan={4} className="py-2 px-3">1. Aerodynamics (Downforce)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Front Downforce</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.frontDownforce}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.frontDownforce}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.frontDownforce, setup2.tuning.frontDownforce, false)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Rear Downforce</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.rearDownforce}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.rearDownforce}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.rearDownforce, setup2.tuning.rearDownforce, false)}</td>
                </tr>

                {/* Suspension Heights */}
                <tr className="bg-zinc-900/20 text-[11px] font-sans font-bold text-zinc-400 tracking-wide uppercase">
                  <td colSpan={4} className="py-2 px-3">2. Ride Height & Springs</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Front Ride Height (mm)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.frontRideHeight}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.frontRideHeight}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.frontRideHeight, setup2.tuning.frontRideHeight, true)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Rear Ride Height (mm)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.rearRideHeight}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.rearRideHeight}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.rearRideHeight, setup2.tuning.rearRideHeight, true)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Front Natural Freq (Hz)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.frontNF.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.frontNF.toFixed(2)}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.frontNF, setup2.tuning.frontNF)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Rear Natural Freq (Hz)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.rearNF.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.rearNF.toFixed(2)}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.rearNF, setup2.tuning.rearNF)}</td>
                </tr>

                {/* ARBs */}
                <tr className="bg-zinc-900/20 text-[11px] font-sans font-bold text-zinc-400 tracking-wide uppercase">
                  <td colSpan={4} className="py-2 px-3">3. Anti-Roll Bars</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Front ARB (1-10)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.frontARB}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.frontARB}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.frontARB, setup2.tuning.frontARB)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Rear ARB (1-10)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.rearARB}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.rearARB}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.rearARB, setup2.tuning.rearARB)}</td>
                </tr>

                {/* Dampers */}
                <tr className="bg-zinc-900/20 text-[11px] font-sans font-bold text-zinc-400 tracking-wide uppercase">
                  <td colSpan={4} className="py-2 px-3">4. Dampers (Compression & Expansion)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Front Compression</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.frontComp}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.frontComp}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.frontComp, setup2.tuning.frontComp)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Rear Compression</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.rearComp}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.rearComp}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.rearComp, setup2.tuning.rearComp)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Front Expansion</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.frontExp}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.frontExp}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.frontExp, setup2.tuning.frontExp)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Rear Expansion</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.rearExp}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.rearExp}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.rearExp, setup2.tuning.rearExp)}</td>
                </tr>

                {/* Alignment */}
                <tr className="bg-zinc-900/20 text-[11px] font-sans font-bold text-zinc-400 tracking-wide uppercase">
                  <td colSpan={4} className="py-2 px-3">5. Alignment (Camber & Toe)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Front Camber (deg)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.frontCamber}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.frontCamber}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.frontCamber, setup2.tuning.frontCamber)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Rear Camber (deg)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.rearCamber}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.rearCamber}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.rearCamber, setup2.tuning.rearCamber)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Front Toe (deg)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.frontToe}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.frontToe}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.frontToe, setup2.tuning.frontToe)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Rear Toe (deg)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.rearToe}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.rearToe}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.rearToe, setup2.tuning.rearToe)}</td>
                </tr>

                {/* LSD */}
                <tr className="bg-zinc-900/20 text-[11px] font-sans font-bold text-zinc-400 tracking-wide uppercase">
                  <td colSpan={4} className="py-2 px-3">6. Limited Slip Differential</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Initial Torque</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.initTorque}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.initTorque}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.initTorque, setup2.tuning.initTorque)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Acceleration Sensitivity</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.accelSens}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.accelSens}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.accelSens, setup2.tuning.accelSens)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Braking Sensitivity</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.brakingSens}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.brakingSens}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.brakingSens, setup2.tuning.brakingSens)}</td>
                </tr>

                {/* Transmission & Brake Balance */}
                <tr className="bg-zinc-900/20 text-[11px] font-sans font-bold text-zinc-400 tracking-wide uppercase">
                  <td colSpan={4} className="py-2 px-3">7. Transmission & Braking</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Top Speed (km/h)</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.topSpeed}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.topSpeed}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.topSpeed, setup2.tuning.topSpeed)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Final Drive</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.finalDrive}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.finalDrive}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.finalDrive, setup2.tuning.finalDrive)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans">Brake Balance</td>
                  <td className="py-2 px-3 text-right bg-zinc-900">{setup1.tuning.brakeBalance}</td>
                  <td className="py-2 px-3 text-right bg-zinc-950">{setup2.tuning.brakeBalance}</td>
                  <td className="py-2 px-3 text-center">{getCompareBadge(setup1.tuning.brakeBalance, setup2.tuning.brakeBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-zinc-800 rounded-lg bg-zinc-950 text-center">
          <HelpCircle className="w-10 h-10 text-zinc-600 mb-2 animate-pulse" />
          <p className="text-zinc-400 text-sm font-sans font-medium">Select Two Setups to Compare</p>
          <p className="text-zinc-500 text-xs mt-1 max-w-sm">
            Choose a reference build and a challenger build above to view exact metric differences and custom race engineer insights.
          </p>
        </div>
      )}
    </div>
  );
}
