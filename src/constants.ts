import { TuningParams, DrivetrainType, CarClass, WeatherCondition } from "./types";

export const TRACKS = [
  "Nürburgring Nordschleife",
  "Nürburgring GP",
  "Spa-Francorchamps",
  "Mount Panorama (Bathurst)",
  "Suzuka Circuit",
  "Trial Mountain Circuit",
  "Deep Forest Raceway",
  "WeatherTech Raceway Laguna Seca",
  "Autodromo de Interlagos",
  "Autodromo Nazionale Monza",
  "Brands Hatch GP",
  "Fuji Speedway",
  "Daytona International Speedway",
  "Circuit de la Sarthe (Le Mans)",
  "Goodwood Motor Circuit",
  "Tsukuba Circuit",
  "Kyoto Driving Park",
  "Sardegna - Road Track",
  "Willow Springs (Big Willow)",
  "Grand Valley - Highway 1",
  "Red Bull Ring",
  "Circuit de Barcelona-Catalunya",
  "Autodrome Lago Maggiore",
  "Tokyo Expressway - East",
  "Alsace - Village",
  "Circuit de Sainte-Croix",
  "High Speed Ring",
  "Blue Moon Bay Speedway",
  "Colorado Springs (Dirt)",
  "Fishermans Ranch (Dirt)"
];

export interface CarPreset {
  producer: string;
  model: string;
  class: CarClass;
  drivetrain: DrivetrainType;
}

export const CAR_PRESETS: CarPreset[] = [
  // Porsche
  { producer: "Porsche", model: "911 GT3 RS (992) '22", class: "Road Cars", drivetrain: "RR" },
  { producer: "Porsche", model: "Cayman GT4 Clubsport '16", class: "Gr.4", drivetrain: "MR" },
  { producer: "Porsche", model: "911 RSR (991) '17", class: "Gr.3", drivetrain: "MR" },
  { producer: "Porsche", model: "919 Hybrid '16", class: "Gr.1", drivetrain: "AWD" },
  { producer: "Porsche", model: "Carrera GT '04", class: "Road Cars", drivetrain: "MR" },
  { producer: "Porsche", model: "918 Spyder '13", class: "Road Cars", drivetrain: "AWD" },

  // Toyota
  { producer: "Toyota", model: "GR Yaris RZ '20", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Toyota", model: "GR Supra Gr.4", class: "Gr.4", drivetrain: "FR" },
  { producer: "Toyota", model: "GR010 Hybrid '21", class: "Gr.1", drivetrain: "AWD" },
  { producer: "Toyota", model: "Supra RZ '97", class: "Road Cars", drivetrain: "FR" },
  { producer: "Toyota", model: "GR86 RZ '21", class: "Road Cars", drivetrain: "FR" },
  { producer: "Toyota", model: "Castrol Tom's Supra '97", class: "Gr.3", drivetrain: "FR" },

  // Honda
  { producer: "Honda", model: "Civic Type R (FL5) '22", class: "Road Cars", drivetrain: "FF" },
  { producer: "Honda", model: "NSX Type R '92", class: "Road Cars", drivetrain: "MR" },
  { producer: "Honda", model: "S2000 '99", class: "Road Cars", drivetrain: "FR" },
  { producer: "Honda", model: "NSX Gr.3", class: "Gr.3", drivetrain: "MR" },
  { producer: "Honda", model: "Civic Type R (EK) '98", class: "Road Cars", drivetrain: "FF" },

  // Ferrari
  { producer: "Ferrari", model: "F40 '92", class: "Road Cars", drivetrain: "MR" },
  { producer: "Ferrari", model: "458 Italia '09", class: "Road Cars", drivetrain: "MR" },
  { producer: "Ferrari", model: "FXX K '15", class: "Road Cars", drivetrain: "MR" },
  { producer: "Ferrari", model: "458 Italia GT3 '13", class: "Gr.3", drivetrain: "MR" },
  { producer: "Ferrari", model: "Enzo Ferrari '02", class: "Road Cars", drivetrain: "MR" },

  // Chevrolet
  { producer: "Chevrolet", model: "Corvette ZR1 (C7) '19", class: "Road Cars", drivetrain: "FR" },
  { producer: "Chevrolet", model: "Corvette C7 Gr.3", class: "Gr.3", drivetrain: "FR" },
  { producer: "Chevrolet", model: "Camaro ZL1 1LE Package '18", class: "Road Cars", drivetrain: "FR" },
  { producer: "Chevrolet", model: "Corvette Stingray (C8) '20", class: "Road Cars", drivetrain: "MR" },

  // Nissan
  { producer: "Nissan", model: "GT-R Nismo '17", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Nissan", model: "GT-R GT500 '08", class: "Gr.2", drivetrain: "FR" },
  { producer: "Nissan", model: "Skyline GT-R V-Spec II (R34) '02", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Nissan", model: "Fairlady Z Version S (Z33) '07", class: "Road Cars", drivetrain: "FR" },
  { producer: "Nissan", model: "GT-R GT3 '13", class: "Gr.3", drivetrain: "FR" },

  // BMW
  { producer: "BMW", model: "M3 Coupe (E92) '07", class: "Road Cars", drivetrain: "FR" },
  { producer: "BMW", model: "M3 E30 Sport Evolution '89", class: "Road Cars", drivetrain: "FR" },
  { producer: "BMW", model: "M6 GT3 '16", class: "Gr.3", drivetrain: "FR" },
  { producer: "BMW", model: "M4 Coupe '14", class: "Road Cars", drivetrain: "FR" },
  { producer: "BMW", model: "M4 Gr.4", class: "Gr.4", drivetrain: "FR" },

  // Subaru
  { producer: "Subaru", model: "WRX STI Gr.4", class: "Gr.4", drivetrain: "AWD" },
  { producer: "Subaru", model: "BRZ GT300 '21", class: "Gr.3", drivetrain: "FR" },
  { producer: "Subaru", model: "Impreza 22B-STi Version '98", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Subaru", model: "BRZ S '21", class: "Road Cars", drivetrain: "FR" },

  // Audi
  { producer: "Audi", model: "R8 LMS Evo '19", class: "Gr.3", drivetrain: "MR" },
  { producer: "Audi", model: "RS 5 Turbo DTM '19", class: "Gr.2", drivetrain: "FR" },
  { producer: "Audi", model: "Sport quattro S1 Pikes Peak '87", class: "Gr.B", drivetrain: "AWD" },
  { producer: "Audi", model: "R8 V10 plus '16", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Audi", model: "TT Cup '16", class: "Gr.4", drivetrain: "FF" },

  // Aston Martin
  { producer: "Aston Martin", model: "DBR9 GT1 '10", class: "Gr.3", drivetrain: "FR" },
  { producer: "Aston Martin", model: "Vantage Gr.4", class: "Gr.4", drivetrain: "FR" },
  { producer: "Aston Martin", model: "Valkyrie '21", class: "Road Cars", drivetrain: "MR" },
  { producer: "Aston Martin", model: "V12 Vantage GT3 '12", class: "Gr.3", drivetrain: "FR" },

  // Mazda
  { producer: "Mazda", model: "RX-Vision GT3 Concept", class: "Gr.3", drivetrain: "FR" },
  { producer: "Mazda", model: "LM55 Vision Gran Turismo", class: "Gr.1", drivetrain: "AWD" },
  { producer: "Mazda", model: "RX-7 Spirit R Type A (FD) '02", class: "Road Cars", drivetrain: "FR" },
  { producer: "Mazda", model: "Roadster S (ND) '15", class: "Road Cars", drivetrain: "FR" },

  // Peugeot
  { producer: "Peugeot", model: "908 HDi FAP '10", class: "Gr.1", drivetrain: "MR" },
  { producer: "Peugeot", model: "205 Turbo 16 Evolution 2 '86", class: "Gr.B", drivetrain: "AWD" },
  { producer: "Peugeot", model: "RCZ Gr.3", class: "Gr.3", drivetrain: "MR" },

  // Lexus
  { producer: "Lexus", model: "SC430 GT500 '08", class: "Gr.2", drivetrain: "FR" },
  { producer: "Lexus", model: "RC F GT3 '17", class: "Gr.3", drivetrain: "FR" },
  { producer: "Lexus", model: "LFA '10", class: "Road Cars", drivetrain: "FR" },

  // Lamborghini
  { producer: "Lamborghini", model: "Aventador LP 700-4 '11", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Lamborghini", model: "Huracán GT3 '15", class: "Gr.3", drivetrain: "MR" },
  { producer: "Lamborghini", model: "Diablo GT '00", class: "Road Cars", drivetrain: "MR" },

  // McLaren
  { producer: "McLaren", model: "F1 '94", class: "Road Cars", drivetrain: "MR" },
  { producer: "McLaren", model: "650S GT3 '15", class: "Gr.3", drivetrain: "MR" },
  { producer: "McLaren", model: "P1 GTR '16", class: "Road Cars", drivetrain: "MR" },

  // Mercedes-Benz
  { producer: "Mercedes-Benz", model: "SLS AMG '10", class: "Road Cars", drivetrain: "FR" },
  { producer: "Mercedes-Benz", model: "AMG GT3 '20", class: "Gr.3", drivetrain: "FR" },
  { producer: "Mercedes-Benz", model: "SLS AMG GT3 '11", class: "Gr.3", drivetrain: "FR" },
  { producer: "Mercedes-Benz", model: "AMG GT 4-Door Coupe '19", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Mercedes-Benz", model: "C 63 S Coupe '18", class: "Road Cars", drivetrain: "FR" },

  // Ford
  { producer: "Ford", model: "GT '06", class: "Road Cars", drivetrain: "MR" },
  { producer: "Ford", model: "GT LM Race Car Spec II", class: "Gr.3", drivetrain: "MR" },
  { producer: "Ford", model: "Mustang Gr.3", class: "Gr.3", drivetrain: "FR" },
  { producer: "Ford", model: "Mustang Gr.4", class: "Gr.4", drivetrain: "FR" },
  { producer: "Ford", model: "Focus Gr.B Rally Car", class: "Gr.B", drivetrain: "AWD" },

  // Dodge
  { producer: "Dodge", model: "Viper GTS '13", class: "Road Cars", drivetrain: "FR" },
  { producer: "Dodge", model: "Viper SRT10 Coupe '06", class: "Road Cars", drivetrain: "FR" },
  { producer: "Dodge", model: "Viper Gr.3", class: "Gr.3", drivetrain: "FR" },
  { producer: "Dodge", model: "Charger SRT Hellcat '15", class: "Road Cars", drivetrain: "FR" },

  // Mitsubishi
  { producer: "Mitsubishi", model: "Lancer Evolution Final Edition '15", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Mitsubishi", model: "Lancer Evolution IV GSR '96", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Mitsubishi", model: "Lancer Evolution Final Gr.3", class: "Gr.3", drivetrain: "AWD" },
  { producer: "Mitsubishi", model: "Lancer Evolution Final Gr.4", class: "Gr.4", drivetrain: "AWD" },

  // Alpine
  { producer: "Alpine", model: "A110 '17", class: "Road Cars", drivetrain: "MR" },
  { producer: "Alpine", model: "A110 Cup '18", class: "Gr.4", drivetrain: "MR" },

  // Shelby & AC
  { producer: "Shelby", model: "Cobra 427 '66", class: "Road Cars", drivetrain: "FR" },
  { producer: "Shelby", model: "GT350 '65", class: "Road Cars", drivetrain: "FR" },

  // Pagani & Bugatti
  { producer: "Pagani", model: "Zonda R '09", class: "Road Cars", drivetrain: "MR" },
  { producer: "Pagani", model: "Huayra '13", class: "Road Cars", drivetrain: "MR" },
  { producer: "Bugatti", model: "Chiron '16", class: "Road Cars", drivetrain: "AWD" },
  { producer: "Bugatti", model: "Veyron 16.4 '13", class: "Road Cars", drivetrain: "AWD" }
];

export function getBaselineTuning(drivetrain: DrivetrainType, carClass: CarClass, weather: WeatherCondition): TuningParams {
  // Base configuration
  const base: TuningParams = {
    frontDownforce: carClass === "Road Cars" ? 50 : carClass === "Gr.4" ? 120 : carClass === "Gr.3" ? 200 : 300,
    rearDownforce: carClass === "Road Cars" ? 100 : carClass === "Gr.4" ? 200 : carClass === "Gr.3" ? 350 : 500,
    frontRideHeight: carClass === "Road Cars" ? 100 : carClass === "Gr.4" ? 95 : carClass === "Gr.3" ? 70 : 60,
    rearRideHeight: carClass === "Road Cars" ? 105 : carClass === "Gr.4" ? 100 : carClass === "Gr.3" ? 75 : 65, // Positive rake default
    frontNF: carClass === "Road Cars" ? 1.8 : carClass === "Gr.4" ? 2.5 : 3.5,
    rearNF: carClass === "Road Cars" ? 2.0 : carClass === "Gr.4" ? 2.7 : 3.7, // Rear offset
    frontARB: 5,
    rearARB: 5,
    frontComp: 30,
    rearComp: 30,
    frontExp: 40,
    rearExp: 40,
    frontCamber: -2.0,
    rearCamber: -1.5,
    frontToe: 0.00,
    rearToe: 0.05,
    initTorque: 5,
    accelSens: 15,
    brakingSens: 10,
    topSpeed: carClass === "Road Cars" ? 280 : carClass === "Gr.4" ? 260 : carClass === "Gr.3" ? 300 : 340,
    finalDrive: 3.50,
    brakeBalance: 0
  };

  // Adjustments based on drivetrain (Cheat Sheet p. 7 & p. 11)
  if (drivetrain === "FR") {
    base.frontARB = 6;
    base.rearARB = 4;
    base.initTorque = 5;
    base.accelSens = 25;
    base.brakingSens = 10;
  } else if (drivetrain === "FF") {
    base.frontARB = 4;
    base.rearARB = 6;
    base.initTorque = 10;
    base.accelSens = 35;
    base.brakingSens = 8;
  } else if (drivetrain === "MR") {
    base.frontARB = 6;
    base.rearARB = 3;
    base.initTorque = 5;
    base.accelSens = 15;
    base.brakingSens = 20;
    base.brakeBalance = 1; // 1 click front to prevent rear locking
  } else if (drivetrain === "RR") {
    base.frontARB = 6;
    base.rearARB = 3;
    base.initTorque = 5;
    base.accelSens = 15;
    base.brakingSens = 25;
    base.brakeBalance = 1; // 1 click front
  } else if (drivetrain === "AWD") {
    base.frontARB = 5;
    base.rearARB = 5;
    base.initTorque = 6; // AWD front is 5, rear is 8. Let's average or use Front as standard
    base.accelSens = 15; // Front 10, Rear 20. Midpoint
    base.brakingSens = 8; // Front 5, Rear 10. Midpoint
  }

  // Adjustments based on Weather (Wet has softer springs, dampers, and higher ride height)
  if (weather === "wet") {
    base.frontRideHeight += 5;
    base.rearRideHeight += 5;
    base.frontNF = Math.max(1.2, base.frontNF - 0.4);
    base.rearNF = Math.max(1.35, base.rearNF - 0.4);
    base.frontARB = Math.max(1, base.frontARB - 1);
    base.rearARB = Math.max(1, base.rearARB - 1);
    base.frontComp = 26; // softer compression for wet
    base.rearComp = 26;
    base.frontExp = 36;
    base.rearExp = 36;
    base.frontCamber = Math.max(-1.5, base.frontCamber + 0.5);
    base.rearCamber = Math.max(-1.0, base.rearCamber + 0.5);
  } else if (weather === "intermediate") {
    base.frontRideHeight += 2;
    base.rearRideHeight += 2;
    base.frontNF = Math.max(1.2, base.frontNF - 0.2);
    base.rearNF = Math.max(1.35, base.rearNF - 0.2);
    base.frontComp = 28;
    base.rearComp = 28;
    base.frontExp = 38;
    base.rearExp = 38;
  }

  return base;
}

export interface NvidiaModel {
  id: string;
  name: string;
  type: "reasoning" | "instruct" | "lightweight";
  description: string;
  isFree: boolean;
  capabilities: string[];
}

export const NVIDIA_MODELS: NvidiaModel[] = [
  {
    id: "meta/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B Instruct",
    type: "reasoning",
    description: "Highly advanced 70-billion parameter model by Meta, optimized for complex physics calculations, mechanical logic, and telemetry grounding.",
    isFree: true,
    capabilities: ["Physics Calibration", "Mechanical Analysis", "Telemetry Grounding"]
  },
  {
    id: "meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    type: "lightweight",
    description: "Fast, efficient 8-billion parameter model by Meta. Excellent for rapid diagnostics and real-time suspension or tire temperature fixes.",
    isFree: true,
    capabilities: ["Ultra-fast Response", "Handling Diagnostic", "Troubleshooting"]
  },
  {
    id: "google/gemma-2-2b-it",
    name: "Google Gemma 2 2B IT",
    type: "lightweight",
    description: "Ultra-lightweight model by Google. Perfect for quick adjustments and fast, low-latency conversational feedback.",
    isFree: true,
    capabilities: ["Low Latency", "Quick Adjustments", "Free Tier Endpoint"]
  }
];
