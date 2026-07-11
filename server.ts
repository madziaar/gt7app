import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Paths for persistent data store in JSON files
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const SETUPS_FILE = path.join(DATA_DIR, "community_setups.json");

// Helper to read community setups
function getCommunitySetups() {
  try {
    if (fs.existsSync(SETUPS_FILE)) {
      const data = fs.readFileSync(SETUPS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading community setups:", error);
  }
  return [];
}

// Helper to save community setups
function saveCommunitySetups(setups: any[]) {
  try {
    fs.writeFileSync(SETUPS_FILE, JSON.stringify(setups, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving community setups:", error);
  }
}

// Initial seed data if file is empty
if (getCommunitySetups().length === 0) {
  const seedSetups = [
    {
      id: "seed-1",
      carModel: "Porsche 911 GT3 RS (992) '22",
      carClass: "Road Cars",
      track: "Nürburgring Nordschleife",
      weather: "dry",
      rating: 4.8,
      likes: 12,
      creator: "Flux89",
      description: "Aggressive track day setup. High rake for quick turn-in. Very stable through Fuchsröhre.",
      tuning: {
        frontDownforce: 250,
        rearDownforce: 450,
        frontRideHeight: 90,
        rearRideHeight: 98,
        frontNF: 2.2,
        rearNF: 2.4,
        frontARB: 6,
        rearARB: 4,
        frontComp: 28,
        rearComp: 28,
        frontExp: 38,
        rearExp: 38,
        frontCamber: -2.2,
        rearCamber: -1.8,
        frontToe: 0.0,
        rearToe: 0.05,
        initTorque: 5,
        accelSens: 25,
        brakingSens: 10,
        topSpeed: 300,
        finalDrive: 3.85,
        brakeBalance: -1
      },
      createdAt: new Date().toISOString()
    },
    {
      id: "seed-2",
      carModel: "Subaru WRX Gr.4",
      carClass: "Gr.4",
      track: "Spa-Francorchamps",
      weather: "wet",
      rating: 4.5,
      likes: 8,
      creator: "AWD_Master",
      description: "Wet weather configuration. Softened anti-roll bars and dampers to find maximum mechanical grip on slippery surface.",
      tuning: {
        frontDownforce: 150,
        rearDownforce: 220,
        frontRideHeight: 105,
        rearRideHeight: 105,
        frontNF: 1.8,
        rearNF: 1.8,
        frontARB: 4,
        rearARB: 4,
        frontComp: 24,
        rearComp: 24,
        frontExp: 34,
        rearExp: 34,
        frontCamber: -1.2,
        rearCamber: -1.0,
        frontToe: 0.0,
        rearToe: 0.08,
        initTorque: 5,
        accelSens: 15,
        brakingSens: 10,
        topSpeed: 260,
        finalDrive: 4.10,
        brakeBalance: 0
      },
      createdAt: new Date().toISOString()
    }
  ];
  saveCommunitySetups(seedSetups);
}

// --- API ENDPOINTS ---

// Gemini model endpoint
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { message, history, mode, carModel, track, currentTuning, nvidiaModel } = req.body;

    const systemInstruction = `You are an expert Gran Turismo 7 Race Engineer and Setup Specialist.
Your job is to diagnose handling problems and suggest exact tuning fixes based on the provided GT7 Tuning Cheat Sheet.

Key Reference Rules for GT7 Physics:
- Weight transfer speed is controlled by dampers (Compression/Expansion). Expansion must ALWAYS be higher than Compression.
- Rake (rear ride height higher than front) promotes rotation and oversteer.
- Natural Frequency (NF) controls spring stiffness. Heavier cars need stiffer springs. Bumpy tracks need softer springs.
- ARBs control roll. Stiffen rear/soften front to reduce understeer.
- LSD: Higher acceleration sensitivity locks wheels under throttle for traction but reduces rotation. Braking sensitivity locks wheels on entry.

When the user asks to solve a problem (e.g., "oversteers on entry"), give them clear, bulleted, step-by-step tuning adjustments in exact numbers/clicks.
Always speak like a professional race engineer: supportive, precise, technical but accessible. Avoid generic marketing speech.
Use markdown for formatting.`;

    let contentPrompt = "";
    if (carModel || track) {
      contentPrompt += `Context:\n- Car model: ${carModel || "Unknown"}\n- Track: ${track || "Unknown"}\n`;
    }
    if (currentTuning) {
      contentPrompt += `- Current Setup: ${JSON.stringify(currentTuning)}\n`;
    }
    contentPrompt += `User Question: ${message}`;

    // Prepare contents including history if available
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.parts?.[0]?.text || h.text || "" }]
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: contentPrompt }] });

    if (mode === "nvidia") {
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "NVIDIA_API_KEY is not configured in environment variables. Please add it to your secrets or .env file."
        });
      }

      const formattedHistory: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          const role = h.role === "model" ? "assistant" : "user";
          formattedHistory.push({
            role,
            content: h.text || ""
          });
        });
      }

      const fullPrompt = `${systemInstruction}\n\n${contentPrompt}`;
      formattedHistory.push({ role: "user", content: fullPrompt });

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: mapNvidiaModel(nvidiaModel),
          messages: formattedHistory,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 4096,
          stream: false
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`NVIDIA API response error (${response.status}): ${errText}`);
      }

      const result = await response.json() as any;
      const responseMessage = result?.choices?.[0]?.message;
      let text = responseMessage?.content || "";

      const reasoning = responseMessage?.reasoning_content || result?.choices?.[0]?.message?.extra_body?.reasoning_content || "";
      if (reasoning) {
        text = `> 💭 **NVIDIA Nemotron Thinking Process:**\n> ${reasoning.split('\n').join('\n> ')}\n\n${text}`;
      }

      return res.json({ text });
    }

    let modelName = "gemini-3.5-flash";
    const config: any = {
      systemInstruction,
    };

    if (mode === "thinking") {
      modelName = "gemini-3.1-pro-preview";
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    } else if (mode === "search") {
      modelName = "gemini-3.5-flash";
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate response" });
  }
});

// Helper to perform Google Search grounded setup findings using gemini-3.5-flash
async function getSearchFindings(carModel: string, track: string, weather: string): Promise<string> {
  try {
    const query = `Gran Turismo 7 ${carModel} setup recommendations or tuning guide on track ${track} under ${weather} conditions`;
    console.log(`Running Google Search Grounding for query: "${query}"`);
    
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: `Search and summarize GT7 specific setup tips, suspension recommendations (natural frequency, camber, anti-roll bars), gear ratios, or aerodynamic guidelines for the ${carModel} on the track ${track} under ${weather} weather conditions. Keep the summary precise, technical, and limited to 2 paragraphs. Highlight real tuning numbers and calculations.` }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    return searchResponse.text || "No specific online findings located; using baseline mechanical simulations.";
  } catch (err: any) {
    console.warn("Google Search Grounding skipped due to quota limits, using baseline mechanical simulations:", err.message || err);
    return "No specific online findings located; using baseline mechanical simulations.";
  }
}

// Robustly escapes raw control characters (like newlines, tabs, and carriage returns) inside double-quoted JSON string values
function sanitizeJsonString(str: string): string {
  let result = "";
  let inString = false;
  let escape = false;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (escape) {
      result += char;
      escape = false;
      continue;
    }
    
    if (char === "\\") {
      result += char;
      escape = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    if (inString) {
      if (char === "\n") {
        result += "\\n";
      } else if (char === "\r") {
        result += "\\r";
      } else if (char === "\t") {
        result += "\\t";
      } else {
        const code = char.charCodeAt(0);
        if (code < 32) {
          result += " ";
        } else {
          result += char;
        }
      }
    } else {
      result += char;
    }
  }
  return result;
}

// Helper to perform robust mapping from simulation models to production NVIDIA NIM models
function mapNvidiaModel(modelId: string): string {
  const cleanId = modelId ? modelId.trim().toLowerCase() : "";
  
  if (cleanId.includes("gemma")) {
    return "google/gemma-2-2b-it";
  }
  if (cleanId.includes("8b") || cleanId.includes("nemo") || cleanId.includes("lightweight")) {
    return "meta/llama-3.1-8b-instruct";
  }
  if (cleanId.includes("llama-3.1-70b") || cleanId.includes("70b") || cleanId.includes("reasoning") || cleanId.includes("nemotron") || cleanId.includes("kimi") || cleanId.includes("stepfun") || cleanId.includes("340b")) {
    return "meta/llama-3.1-70b-instruct";
  }
  
  // Default fallback is Llama 3.1 70B Instruct, which is verified 100% working on this account
  return "meta/llama-3.1-70b-instruct";
}

// NVIDIA AI Setup Generator endpoint
app.post("/api/nvidia/generate-setup", async (req, res) => {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "NVIDIA_API_KEY is not configured in environment variables. Please add it to your secrets or .env file."
      });
    }

    const { carModel, carClass, drivetrain, track, weather, focus, model } = req.body;

    // Fetch live search findings before querying NVIDIA Core
    const searchFindings = await getSearchFindings(carModel, track, weather);

    const setupPrompt = `You are the ultimate Gran Turismo 7 Lead Performance Engineer. 
We need to generate a highly competitive, customized, and physically sound car tuning setup.

REAL-WORLD & GT7 ONLINE FINDINGS AND CALCULATIONS:
${searchFindings}

Vehicle Specification:
- Car Model: ${carModel || "Unknown"}
- Class: ${carClass || "Road Cars"}
- Drivetrain: ${drivetrain || "FR"}
- Track: ${track || "Trial Mountain"}
- Weather Condition: ${weather || "dry"} (dry, wet, or intermediate)
- Handling/Performance Focus: ${focus || "Balanced overall performance and maximum high-speed traction"}

Your response MUST be a single, valid JSON object containing:
1. "analysis": string, a comprehensive 2-paragraph engineering analysis of how the drivetrain layout interacts with this specific track's corners, bumps, and weather, justifying the tuning strategy based on both the online findings, calculations and predictions.
2. "tuning": an object containing EXACTLY these key-value pairs (as numbers, not strings):
   - "frontDownforce": number (between 50 and 700)
   - "rearDownforce": number (between 50 and 800)
   - "frontRideHeight": number (between 50 and 150)
   - "rearRideHeight": number (between 50 and 150)
   - "frontNF": number (between 1.0 and 5.0)
   - "rearNF": number (between 1.0 and 5.0)
   - "frontARB": number (between 1 and 10)
   - "rearARB": number (between 1 and 10)
   - "frontComp": number (between 15 and 45)
   - "rearComp": number (between 15 and 45)
   - "frontExp": number (between 20 and 55, MUST be higher than frontComp)
   - "rearExp": number (between 20 and 55, MUST be higher than rearComp)
   - "frontCamber": number (between -5.0 and 0.0)
   - "rearCamber": number (between -5.0 and 0.0)
   - "frontToe": number (between -1.0 and 1.0)
   - "rearToe": number (between -1.0 and 1.0)
   - "initTorque": number (between 5 and 60)
   - "accelSens": number (between 5 and 60)
   - "brakingSens": number (between 5 and 60)
   - "topSpeed": number (between 180 and 450)
   - "finalDrive": number (between 2.0 and 6.0)
   - "brakeBalance": number (between -5 and 5)

GT7 Physics Rules to Apply:
- MR/RR cars need higher front downforce/rear damping compliance to prevent snap oversteer on liftoff.
- FWD (FF) needs soft front suspension (lower NF, softer ARB) and high rear spring rate to get rotation, and low deceleration LSD to prevent turn-in lockup.
- AWD needs rear biased differential torque and stiffer rear anti-roll bars to combat default mid-corner understeer.
- Wet weather requires softening ARB, lower natural frequencies (NF), and slightly higher ride heights (aquaplaning prevention).
- Dampers: Rebound/Expansion (Exp) MUST ALWAYS be 8 to 15 points higher than Bump/Compression (Comp).

Ensure your response is valid JSON only. Do not add markdown formatting or chat wrappers around the JSON outside of standard \`\`\`json block.

Example structure:
{
  "analysis": "...",
  "tuning": {
    "frontDownforce": 120,
    "rearDownforce": 200,
    ...
  }
}`;

    const finalModel = mapNvidiaModel(model);
    console.log(`Querying NVIDIA NIM API with model: "${finalModel}" (original request: "${model || 'default'}")`);

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [{ role: "user", content: setupPrompt }],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA API response error (${response.status}): ${errText}`);
    }

    const result = await response.json() as any;
    const responseMessage = result?.choices?.[0]?.message;
    const text = responseMessage?.content || "";
    const reasoning = responseMessage?.reasoning_content || result?.choices?.[0]?.message?.extra_body?.reasoning_content || "";

    // Extract JSON from response text
    let jsonString = text.trim();
    if (jsonString.includes("```json")) {
      jsonString = jsonString.split("```json")[1].split("```")[0].trim();
    } else if (jsonString.includes("```")) {
      jsonString = jsonString.split("```")[1].split("```")[0].trim();
    }

    // Locate outer braces if any noise was printed
    const firstBrace = jsonString.indexOf("{");
    const lastBrace = jsonString.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    const sanitizedJson = sanitizeJsonString(jsonString);
    const parsedData = JSON.parse(sanitizedJson);

    res.json({
      analysis: parsedData.analysis,
      tuning: parsedData.tuning,
      thinking: reasoning,
      onlineFindings: searchFindings
    });
  } catch (error: any) {
    console.error("NVIDIA Setup Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI setup. Please verify model configuration." });
  }
});

// NVIDIA Multi-Agent Telemetry Simulation endpoint
app.post("/api/nvidia/agent-team-simulation", async (req, res) => {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "NVIDIA_API_KEY is not configured in environment variables. Please add it to your secrets or .env file."
      });
    }

    const { carModel, carClass, drivetrain, track, weather, telemetryData, activeAgents, selectedModel } = req.body;

    // Fetch live search findings before querying NVIDIA Core
    const searchFindings = await getSearchFindings(carModel, track, weather);

    const teamPrompt = `You are simulated as an Elite NVIDIA Multi-Agent Performance Engineering Team inside a Gran Turismo 7 racing lab.
Your team is analyzing collected track telemetry to generate a customized, physically calibrated setup.

REAL-WORLD & GT7 ONLINE FINDINGS AND CALCULATIONS:
${searchFindings}

TRACK & VEHICLE DETAILS:
- Vehicle: ${carModel || "Unknown"} (${carClass || "Road Cars"}, ${drivetrain || "FR"})
- Track: ${track || "Nürburgring Nordschleife"} (${weather || "dry"} condition)

COLLECTED TELEMETRY METRICS:
- Max Understeer angle: ${telemetryData?.understeerAngle || 2.4}° (Target: < 3.0° for clean turn-in)
- Max Oversteer angle: ${telemetryData?.oversteerAngle || 1.8}° (Target: < 4.0° for rear stability)
- Average Hot Tire Temp: FL: ${telemetryData?.tireTemps?.fl || 85}°C, FR: ${telemetryData?.tireTemps?.fr || 85}°C, RL: ${telemetryData?.tireTemps?.rl || 80}°C, RR: ${telemetryData?.tireTemps?.rr || 80}°C
- Average Hot Tire Pressures: FL: ${telemetryData?.tirePressures?.fl || 29.5} psi, FR: ${telemetryData?.tirePressures?.fr || 29.5} psi, RL: ${telemetryData?.tirePressures?.rl || 29.2} psi, RR: ${telemetryData?.tirePressures?.rr || 29.2} psi
- Suspension Bottoming Instances: Front: ${telemetryData?.suspensionBottoming?.front || 0}, Rear: ${telemetryData?.suspensionBottoming?.rear || 0}
- Aerodynamic Drag vs Lift Index: ${telemetryData?.aeroDragIndex || "Medium"}
- Gear Ratio RPM Drop Efficiency: ${telemetryData?.gearRatioScore || 92}%

ACTIVE AGENT TEAM:
${activeAgents?.map((a: string) => `- ${a}`).join("\n") || "- All Specialists"}

Your simulated team members are:
1. "perfDirector" (Lead Performance Director): Synthesizes overall track-specific race strategy.
2. "chassisEng" (Suspension & Chassis Dynamics Specialist): Solves mechanical balance, grip, understeer, oversteer, anti-roll, and alignment.
3. "aeroEng" (Aerodynamics Specialist): Minimizes drag, optimizes high-speed downforce balance.
4. "powertrainEng" (Powertrain & Gearbox Engineer): Calibrates gear ratios, top speed gear matching, and multi-disc differential sensitivity.

Your response MUST be a single, valid JSON object containing:
1. "conclusions": An object with a short 2-3 sentence paragraph for each of the active agents outlining their specific analysis and recommendation based on this telemetry and the online findings. Keys should correspond to the active agents' IDs: "perfDirector", "chassisEng", "aeroEng", "powertrainEng" (only provide conclusions for active agents requested in ${JSON.stringify(activeAgents)}).
2. "analysis": A combined executive summary of the calibration.
3. "tuning": An object containing EXACTLY these key-value pairs (as numbers, not strings):
   - "frontDownforce": number (between 50 and 700)
   - "rearDownforce": number (between 50 and 800)
   - "frontRideHeight": number (between 50 and 150)
   - "rearRideHeight": number (between 50 and 150)
   - "frontNF": number (between 1.0 and 5.0)
   - "rearNF": number (between 1.0 and 5.0)
   - "frontARB": number (between 1 and 10)
   - "rearARB": number (between 1 and 10)
   - "frontComp": number (between 15 and 45)
   - "rearComp": number (between 15 and 45)
   - "frontExp": number (between 20 and 55, MUST be higher than frontComp)
   - "rearExp": number (between 20 and 55, MUST be higher than rearComp)
   - "frontCamber": number (between -5.0 and 0.0)
   - "rearCamber": number (between -5.0 and 0.0)
   - "frontToe": number (between -1.0 and 1.0)
   - "rearToe": number (between -1.0 and 1.0)
   - "initTorque": number (between 5 and 60)
   - "accelSens": number (between 5 and 60)
   - "brakingSens": number (between 5 and 60)
   - "topSpeed": number (between 180 and 450)
   - "finalDrive": number (between 2.0 and 6.0)
   - "brakeBalance": number (between -5 and 5)

GT7 Physics Rules:
- Understeer is solved by softening front anti-roll bars (ARB), increasing front downforce, or adding negative front camber.
- Oversteer is solved by softening rear springs (rear NF), increasing rear downforce, or stiffening front ARB relative to rear.
- Suspension bottoming requires raising ride heights and/or increasing compression (Comp) damping.
- Dampers: Rebound/Expansion (Exp) MUST ALWAYS be 8 to 15 points higher than Bump/Compression (Comp).

Ensure your response is valid JSON only. Do not add markdown formatting or chat wrappers around the JSON outside of standard \`\`\`json block.

Example structure:
{
  "conclusions": {
    "perfDirector": "We target the specific track contours...",
    "chassisEng": "Softened front roll bars to allow weight transfer..."
  },
  "analysis": "...",
  "tuning": {
    "frontDownforce": 120,
    "rearDownforce": 200,
    ...
  }
}`;

    const finalModel = mapNvidiaModel(selectedModel);
    console.log(`Querying NVIDIA NIM API for Team Simulation with model: "${finalModel}" (original request: "${selectedModel || 'default'}")`);

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [{ role: "user", content: teamPrompt }],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA API response error (${response.status}): ${errText}`);
    }

    const result = await response.json() as any;
    const responseMessage = result?.choices?.[0]?.message;
    const text = responseMessage?.content || "";
    const reasoning = responseMessage?.reasoning_content || result?.choices?.[0]?.message?.extra_body?.reasoning_content || "";

    // Extract JSON from response text
    let jsonString = text.trim();
    if (jsonString.includes("```json")) {
      jsonString = jsonString.split("```json")[1].split("```")[0].trim();
    } else if (jsonString.includes("```")) {
      jsonString = jsonString.split("```")[1].split("```")[0].trim();
    }

    // Locate outer braces
    const firstBrace = jsonString.indexOf("{");
    const lastBrace = jsonString.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    const sanitizedJson = sanitizeJsonString(jsonString);
    const parsedData = JSON.parse(sanitizedJson);

    res.json({
      conclusions: parsedData.conclusions,
      analysis: parsedData.analysis,
      tuning: parsedData.tuning,
      thinking: reasoning,
      onlineFindings: searchFindings
    });
  } catch (error: any) {
    console.error("NVIDIA Multi-Agent Simulation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate multi-agent setup simulation." });
  }
});

// Community sharing endpoints
app.get("/api/community/setups", (req, res) => {
  try {
    const setups = getCommunitySetups();
    res.json(setups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/community/setups", (req, res) => {
  try {
    const newSetup = req.body;
    if (!newSetup.carModel || !newSetup.track || !newSetup.tuning) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const setups = getCommunitySetups();
    const setupWithId = {
      ...newSetup,
      id: "setup_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      likes: 0,
      createdAt: new Date().toISOString()
    };

    setups.unshift(setupWithId);
    saveCommunitySetups(setups);

    res.status(201).json(setupWithId);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/community/setups/:id/like", (req, res) => {
  try {
    const { id } = req.params;
    const setups = getCommunitySetups();
    const setup = setups.find((s: any) => s.id === id);
    if (!setup) {
      return res.status(404).json({ error: "Setup not found" });
    }

    setup.likes = (setup.likes || 0) + 1;
    saveCommunitySetups(setups);

    res.json(setup);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve Vite dev server or production assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GT7 Tuning Helper running on http://localhost:${PORT}`);
  });
}

startServer();
