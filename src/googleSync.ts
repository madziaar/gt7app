import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";
import { TuningSetup } from "./types";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to retrieve token if already logged in (Firebase doesn't persist the OAuth access token itself automatically, so they might need to sign in to fetch Google APIs)
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In (called on button interaction)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Google sign-in");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Sign In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Export to Google Sheet
export const exportSetupsToGoogleSheets = async (
  accessToken: string,
  setups: TuningSetup[],
  fileName: string = "GT7_Tuning_Configurations"
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  if (setups.length === 0) {
    throw new Error("No tuning setups selected for export.");
  }

  // 1. Create a new Spreadsheet
  const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: fileName,
      },
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const spreadsheet = await createResponse.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare spreadsheet rows
  const headers = [
    "Car Model",
    "Class",
    "Drivetrain",
    "Track",
    "Weather",
    "Name/Version",
    "Front Downforce",
    "Rear Downforce",
    "Front Ride Height (mm)",
    "Rear Ride Height (mm)",
    "Front NF (Hz)",
    "Rear NF (Hz)",
    "Front ARB",
    "Rear ARB",
    "Front Compression",
    "Rear Compression",
    "Front Expansion",
    "Rear Expansion",
    "Front Camber (deg)",
    "Rear Camber (deg)",
    "Front Toe (deg)",
    "Rear Toe (deg)",
    "LSD Init Torque",
    "LSD Accel Sens",
    "LSD Braking Sens",
    "Top Speed (km/h)",
    "Final Drive",
    "Brake Balance",
    "Description",
    "Created At"
  ];

  const rows = [headers];

  setups.forEach((s) => {
    rows.push([
      s.carModel,
      s.carClass,
      s.drivetrain,
      s.track,
      s.weather,
      s.name,
      s.tuning.frontDownforce,
      s.tuning.rearDownforce,
      s.tuning.frontRideHeight,
      s.tuning.rearRideHeight,
      s.tuning.frontNF,
      s.tuning.rearNF,
      s.tuning.frontARB,
      s.tuning.rearARB,
      s.tuning.frontComp,
      s.tuning.rearComp,
      s.tuning.frontExp,
      s.tuning.rearExp,
      s.tuning.frontCamber,
      s.tuning.rearCamber,
      s.tuning.frontToe,
      s.tuning.rearToe,
      s.tuning.initTorque,
      s.tuning.accelSens,
      s.tuning.brakingSens,
      s.tuning.topSpeed,
      s.tuning.finalDrive,
      s.tuning.brakeBalance,
      s.description || "",
      new Date(s.createdAt).toLocaleString()
    ] as any);
  });

  // 3. Write data to Spreadsheet
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:AD${rows.length}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!writeResponse.ok) {
    const errText = await writeResponse.text();
    throw new Error(`Failed to write values to sheet: ${errText}`);
  }

  return { spreadsheetId, spreadsheetUrl };
};
