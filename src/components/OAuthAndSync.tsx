import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { initAuth, googleSignIn, logout, exportSetupsToGoogleSheets } from "../googleSync";
import { TuningSetup } from "../types";
import { FolderGit2, Link2, LogOut, CheckCircle, AlertCircle } from "lucide-react";

interface OAuthAndSyncProps {
  localSetups: TuningSetup[];
  onUserAuth: (user: User | null, token: string | null) => void;
}

export default function OAuthAndSync({ localSetups, onUserAuth }: OAuthAndSyncProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        onUserAuth(currentUser, accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        onUserAuth(null, null);
      }
    );
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        onUserAuth(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setError("Sign in failed. Ensure you accept all permissions.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    onUserAuth(null, null);
    setExportUrl(null);
  };

  const triggerExport = async () => {
    if (!token) return;
    setIsExporting(true);
    setError(null);
    setExportUrl(null);

    try {
      const result = await exportSetupsToGoogleSheets(token, localSetups);
      setExportUrl(result.spreadsheetUrl);
      setShowConfirm(false);
    } catch (err: any) {
      console.error(err);
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-red-500" />
          <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
            Cloud Sync & Export
          </h3>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        )}
      </div>

      <p className="text-zinc-400 leading-relaxed">
        Securely backup, restore, and synchronize all your GT7 performance sheets to your personal Google Drive or export direct to Google Sheets spreadsheets.
      </p>

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Auth state display */}
      {!user ? (
        <div className="flex flex-col items-center py-3">
          {/* Official Google sign-in button markup compiled */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button w-full flex justify-center py-2 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-sans font-semibold border border-zinc-300 rounded-lg shadow transition items-center gap-2.5"
          >
            <div className="gsi-material-button-icon w-5 h-5">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents">
              {isLoggingIn ? "Connecting..." : "Sign in with Google"}
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={user.photoURL || "https://lh3.googleusercontent.com/a/default-user=s40-c"}
                alt={user.displayName || "Google User"}
                className="w-7 h-7 rounded-full border border-zinc-700"
                referrerPolicy="no-referrer"
              />
              <div className="text-zinc-300">
                <p className="font-semibold leading-none">{user.displayName}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{user.email}</p>
              </div>
            </div>

            <span className="bg-emerald-950 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              ONLINE
            </span>
          </div>

          {/* Sync control block */}
          {localSetups.length > 0 ? (
            <div className="space-y-3 pt-1">
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-sans font-bold uppercase py-2.5 px-4 rounded-lg shadow-lg tracking-wider transition text-xs"
              >
                Export to Google Sheets
              </button>
            </div>
          ) : (
            <p className="text-zinc-600 text-xs italic text-center py-2">
              Create a saved tuning configuration first to export.
            </p>
          )}

          {/* Result spread URL */}
          {exportUrl && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Export Successful!</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Your GT7 tuning configs have been written to a new Google Sheet in your Google Drive.
              </p>
              <a
                href={exportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white font-semibold underline hover:text-emerald-300 mt-1"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Open Google Sheet</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 max-w-sm w-full space-y-4">
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider text-center">
              Confirm Google Sheets Export
            </h3>
            <p className="text-zinc-400 leading-relaxed text-center">
              You are about to export your <span className="font-bold text-red-500 font-mono">{localSetups.length} local tuning configuration(s)</span> into a brand new spreadsheet in your Google Drive.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={triggerExport}
                disabled={isExporting}
                className="px-5 py-2 bg-red-600 text-white hover:bg-red-500 rounded-lg font-bold"
              >
                {isExporting ? "Exporting..." : "Confirm Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
