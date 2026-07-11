export type WeatherCondition = "dry" | "wet" | "intermediate";

export type CarClass = "Gr.1" | "Gr.2" | "Gr.3" | "Gr.4" | "Gr.B" | "Road Cars" | "Other";

export type DrivetrainType = "FR" | "FF" | "MR" | "RR" | "AWD";

export interface TuningParams {
  frontDownforce: number;
  rearDownforce: number;
  frontRideHeight: number;
  rearRideHeight: number;
  frontNF: number;
  rearNF: number;
  frontARB: number;
  rearARB: number;
  frontComp: number;
  rearComp: number;
  frontExp: number;
  rearExp: number;
  frontCamber: number;
  rearCamber: number;
  frontToe: number;
  rearToe: number;
  initTorque: number;
  accelSens: number;
  brakingSens: number;
  topSpeed: number; // km/h
  finalDrive: number;
  brakeBalance: number; // -5 (rear bias) to 5 (front bias), or mid-race bias
}

export interface TuningSetup {
  id: string;
  name: string;
  carModel: string;
  carClass: CarClass;
  drivetrain: DrivetrainType;
  track: string;
  weather: WeatherCondition;
  description?: string;
  tuning: TuningParams;
  createdAt: string;
  creator?: string;
  likes?: number;
  isCommunityShared?: boolean;
}

export interface LapTimeLog {
  id: string;
  carModel: string;
  track: string;
  lapTime: string; // "1:35.420"
  lapTimeSeconds: number; // 95.420
  weather: WeatherCondition;
  isPersonalBest: boolean;
  notes?: string;
  createdAt: string;
}

export interface FavoriteCar {
  model: string;
  addedAt: string;
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  setupId?: string; // link to imported community setup
}
