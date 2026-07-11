import React, { useState, useEffect } from "react";
import { TuningSetup, FavoriteCar, NotificationMessage } from "../types";
import { CAR_PRESETS, TRACKS } from "../constants";
import { Users, Heart, Download, Share2, Plus, Bell, Car, Check, Trash } from "lucide-react";

interface CommunitySharingProps {
  localSetups: TuningSetup[];
  favorites: FavoriteCar[];
  notifications: NotificationMessage[];
  onAddFavorite: (model: string) => void;
  onRemoveFavorite: (model: string) => void;
  onImportSetup: (setup: TuningSetup) => void;
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onShareSetup: (setupId: string, description: string) => Promise<void>;
}

export default function CommunitySharing({
  localSetups,
  favorites,
  notifications,
  onAddFavorite,
  onRemoveFavorite,
  onImportSetup,
  onMarkNotificationRead,
  onClearNotifications,
  onShareSetup,
}: CommunitySharingProps) {
  const [communitySetups, setCommunitySetups] = useState<TuningSetup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shareSetupId, setShareSetupId] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [searchCar, setSearchCar] = useState("");
  const [searchTrack, setSearchTrack] = useState("");
  const [favProducer, setFavProducer] = useState("");
  const [favModel, setFavModel] = useState("");

  const fetchCommunitySetups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/community/setups");
      if (response.ok) {
        const data = await response.json();
        setCommunitySetups(data);
      }
    } catch (error) {
      console.error("Failed to load community setups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunitySetups();
  }, []);

  const handleLike = async (id: string) => {
    try {
      const response = await fetch(`/api/community/setups/${id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        const updated = await response.json();
        setCommunitySetups((prev) =>
          prev.map((s) => (s.id === id ? { ...s, likes: updated.likes } : s))
        );
      }
    } catch (error) {
      console.error("Failed to like setup:", error);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareSetupId) return;

    setIsSharing(true);
    try {
      await onShareSetup(shareSetupId, shareDescription);
      setShareSetupId("");
      setShareDescription("");
      await fetchCommunitySetups();
    } catch (error) {
      console.error("Failed to share setup:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const filteredCommunity = communitySetups.filter((s) => {
    const matchesCar = s.carModel.toLowerCase().includes(searchCar.toLowerCase());
    const matchesTrack = s.track.toLowerCase().includes(searchTrack.toLowerCase());
    return matchesCar && matchesTrack;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Sidebar: Favorites & Notifications */}
      <div className="xl:col-span-1 space-y-6">
        {/* Favorites Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-red-500" />
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              Favorite Cars
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Star favorite models to receive system notifications whenever a new community build is shared.
          </p>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 bg-zinc-900/50 p-2.5 border border-zinc-800/80 rounded-lg">
              <select
                value={favProducer}
                onChange={(e) => {
                  setFavProducer(e.target.value);
                  setFavModel("");
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-red-600"
              >
                <option value="">Manufacturer</option>
                {Array.from(new Set(CAR_PRESETS.map((c) => c.producer))).sort().map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={favModel}
                onChange={(e) => setFavModel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-red-600 disabled:opacity-50"
                disabled={!favProducer}
              >
                <option value="">Model</option>
                {CAR_PRESETS.filter((c) => c.producer === favProducer).map((m) => {
                  const combinedName = `${favProducer} ${m.model}`;
                  const isAlreadyFav = favorites.some((f) => f.model === combinedName);
                  return (
                    <option key={m.model} value={m.model} disabled={isAlreadyFav}>
                      {m.model} {isAlreadyFav ? "(Favorite)" : ""}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() => {
                  if (favProducer && favModel) {
                    onAddFavorite(`${favProducer} ${favModel}`);
                    setFavProducer("");
                    setFavModel("");
                  }
                }}
                disabled={!favProducer || !favModel}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-sans text-[10px] font-bold uppercase py-1.5 rounded transition"
              >
                + Add Favorite
              </button>
            </div>

            {favorites.length > 0 ? (
              <div className="divide-y divide-zinc-900">
                {favorites.map((fav) => (
                  <div key={fav.model} className="flex items-center justify-between py-2 text-xs text-zinc-300">
                    <span className="truncate pr-2 font-medium">{fav.model}</span>
                    <button
                      onClick={() => onRemoveFavorite(fav.model)}
                      className="text-zinc-500 hover:text-red-400 transition"
                      title="Remove from favorites"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-600 text-xs text-center py-2 font-medium">No favorite models added yet.</p>
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                Notifications
              </h3>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={onClearNotifications}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-2.5 rounded-lg text-xs border relative transition ${
                    notif.read
                      ? "bg-zinc-900/40 border-zinc-900 text-zinc-400"
                      : "bg-red-950/20 border-red-900/30 text-zinc-200"
                  }`}
                >
                  {!notif.read && (
                    <button
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-400 font-bold"
                      title="Mark as Read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <p className="font-bold pr-5">{notif.title}</p>
                  <p className="text-zinc-400 mt-0.5">{notif.message}</p>
                  <span className="text-[9px] text-zinc-600 font-mono mt-1 block">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 text-xs text-center py-4 font-medium">No alerts at the moment.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel: Browse Shared & Publish build */}
      <div className="xl:col-span-3 space-y-6">
        {/* Publish form */}
        {localSetups.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-red-500" />
              Publish a Tune to Community
            </h3>

            <form onSubmit={handleShareSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Select Local Setup
                </label>
                <select
                  value={shareSetupId}
                  onChange={(e) => setShareSetupId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-red-600"
                  required
                >
                  <option value="">-- Choose Setup --</option>
                  {localSetups.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.carModel} ({s.carClass}) - {s.track} [{s.weather.toUpperCase()}] - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Description / Performance Notes
                </label>
                <input
                  type="text"
                  placeholder="Describe tires, strategy, performance..."
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSharing || !shareSetupId}
                className="bg-red-600 hover:bg-red-500 text-white font-sans font-semibold uppercase tracking-wider text-xs py-2.5 px-4 rounded-lg transition disabled:opacity-50"
              >
                {isSharing ? "Publishing..." : "Share Setup"}
              </button>
            </form>
          </div>
        )}

        {/* Search and Browse Feed */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                Community Setup Board
              </h3>
            </div>

            {/* Live Filter Inputs */}
            <div className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Search Car..."
                value={searchCar}
                onChange={(e) => setSearchCar(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-red-600"
              />
              <input
                type="text"
                placeholder="Search Track..."
                value={searchTrack}
                onChange={(e) => setSearchTrack(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-mono">Loading telemetry database...</div>
          ) : filteredCommunity.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCommunity.map((setup) => (
                <div
                  key={setup.id}
                  className="bg-zinc-900 border border-zinc-800/80 hover:border-red-600/40 rounded-xl p-4 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950 px-2 py-0.5 rounded">
                          {setup.carClass} • {setup.drivetrain}
                        </span>
                        <h4 className="font-sans font-bold text-sm text-white mt-1.5">{setup.carModel}</h4>
                        <p className="text-xs text-red-400 font-semibold">{setup.track}</p>
                      </div>

                      <span className="text-[10px] uppercase font-bold px-2 py-1.5 bg-zinc-950 text-zinc-400 rounded-lg font-mono">
                        {setup.weather === "dry" ? "☀️ DRY" : setup.weather === "wet" ? "🌧️ WET" : "🌦️ INT"}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-3 italic line-clamp-2">
                      "{setup.description || "Optimal mechanical adjustments for perfect entry rotation."}"
                    </p>

                    {/* Compact Specs summary */}
                    <div className="grid grid-cols-3 gap-2 mt-4 bg-zinc-950 p-2 rounded-lg font-mono text-[10px] text-zinc-400">
                      <div>
                        <span className="text-zinc-600 text-[9px] block">Aero (F/R)</span>
                        {setup.tuning.frontDownforce}/{setup.tuning.rearDownforce}
                      </div>
                      <div>
                        <span className="text-zinc-600 text-[9px] block">Ride H. (F/R)</span>
                        {setup.tuning.frontRideHeight}/{setup.tuning.rearRideHeight}mm
                      </div>
                      <div>
                        <span className="text-zinc-600 text-[9px] block">Camber (F/R)</span>
                        {setup.tuning.frontCamber}/{setup.tuning.rearCamber}°
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/50 text-xs text-zinc-500">
                    <span>by @{setup.creator || "Driver"}</span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(setup.id)}
                        className="flex items-center gap-1 hover:text-red-500 transition text-zinc-400"
                        title="Like setup"
                      >
                        <Heart className="w-4 h-4 fill-current text-red-600" />
                        <span className="font-mono text-zinc-300">{setup.likes || 0}</span>
                      </button>

                      <button
                        onClick={() => onImportSetup(setup)}
                        className="flex items-center gap-1 hover:text-emerald-500 transition text-zinc-400 font-sans text-xs bg-zinc-950 hover:bg-zinc-800 py-1 px-2.5 rounded-lg"
                        title="Import setup to your local catalog"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Import</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-600 text-xs font-sans">
              No matching community setups found. Be the first to publish a setup!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
