import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, Brain, Globe, Bot, User, Trash2, Cpu } from "lucide-react";
import { NVIDIA_MODELS } from "../constants";

interface Message {
  role: "user" | "model";
  text: string;
}

interface RaceEngineerChatProps {
  carModel?: string;
  track?: string;
  currentTuning?: any;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  triggerMessage: string | null;
  onTriggerMessageClear: () => void;
}

type ChatProvider = "auto" | "gemini" | "openai" | "openrouter";

export default function RaceEngineerChat({
  carModel,
  track,
  currentTuning,
  messages,
  setMessages,
  triggerMessage,
  onTriggerMessageClear,
}: RaceEngineerChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState({ gemini: false, nvidia: false, openai: false, openrouter: false });
  const [mode, setMode] = useState<"standard" | "thinking" | "search" | "nvidia">("standard");
  const [selectedProvider, setSelectedProvider] = useState<ChatProvider>("auto");
  const [selectedNvidiaModel, setSelectedNvidiaModel] = useState<string>(
    NVIDIA_MODELS[0]?.id || "nvidia/nemotron-3-super-120b-a12b"
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch("/api/providers");
        if (!response.ok) return;
        const data = await response.json();
        setProviderStatus({
          gemini: Boolean(data.gemini),
          nvidia: Boolean(data.nvidia),
          openai: Boolean(data.openai),
          openrouter: Boolean(data.openrouter),
        });
      } catch (error) {
        console.warn("Could not load AI provider status", error);
      }
    };

    fetchProviders();
  }, []);

  const canUseMode = (desiredMode: "standard" | "thinking" | "search" | "nvidia") => {
    if (desiredMode === "nvidia") return providerStatus.nvidia;
    if (desiredMode === "search") {
      return selectedProvider === "auto"
        ? providerStatus.gemini
        : selectedProvider === "gemini" && providerStatus.gemini;
    }
    if (selectedProvider === "gemini") return providerStatus.gemini;
    if (selectedProvider === "openai") return providerStatus.openai;
    if (selectedProvider === "openrouter") return providerStatus.openrouter;
    return providerStatus.gemini || providerStatus.openai || providerStatus.openrouter;
  };

  const handleProviderChange = (value: string) => {
    if (value !== "auto" && value !== "gemini" && value !== "openai" && value !== "openrouter") return;
    setSelectedProvider(value);
    if (mode === "search" && value !== "auto" && value !== "gemini") {
      setMode("standard");
    }
  };

  // Monitor trigger message from track segment advisor
  useEffect(() => {
    if (triggerMessage) {
      handleSendMessage(undefined, triggerMessage);
      onTriggerMessageClear();
    }
  }, [triggerMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleModeChange = (nextMode: "standard" | "thinking" | "search" | "nvidia") => {
    if (!canUseMode(nextMode)) {
      const providerLabel = nextMode === "nvidia"
        ? "NVIDIA"
        : nextMode === "search"
          ? "Search Web requires Gemini with a configured API key"
          : `${selectedProvider === "auto" ? "An AI provider" : selectedProvider} is not configured`;
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ ${providerLabel}. Select an available provider or configure its API key.`,
        },
      ]);
      return;
    }

    setMode(nextMode);
  };

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    if (!canUseMode(mode)) {
      const providerLabel = mode === "nvidia"
        ? "NVIDIA"
        : mode === "search"
          ? "Search Web requires Gemini with a configured API key"
          : `${selectedProvider === "auto" ? "An AI provider" : selectedProvider} is not configured`;
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ ${providerLabel}. Select an available provider or configure its API key.`,
        },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", text: promptToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          history: messages,
          mode: mode,
          carModel,
          track,
          currentTuning,
          nvidiaModel: selectedNvidiaModel,
          provider: selectedProvider,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate race advice. Check server status.");
      }
      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ **Error connecting to race engine:** ${err.message}. Check that the selected provider is configured and available.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "model",
        text: "Chat cleared. Ask me anything about your car setup or diagnosing racing behaviors!",
      },
    ]);
  };

  const suggestions = [
    { label: "Rake & Rotation", query: "How does ride height rake affect corner entry and rotation?" },
    { label: "Exit Traction Fix", query: "My car loses traction and slides out on corner exit under throttle. How do I adjust LSD?" },
    { label: "Bouncing Fix", query: "The car bounces constantly on bumpy tracks. How do I fix the suspension?" },
    { label: "Gear Spacing Setup", query: "Explain step-by-step how to set up individual gear ratios for high top speed." },
  ];

  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl h-[600px] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-red-600 rounded-lg text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-sans font-bold text-sm tracking-wide text-white uppercase">
              Race Engineer AI
            </h3>
            <p className="text-xs text-zinc-400 font-mono truncate">
              GT7 setup guidance across multiple AI providers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <label className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
            <span>Provider</span>
            <select
              value={selectedProvider}
              onChange={(event) => handleProviderChange(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-200 focus:outline-none focus:border-red-600"
              aria-label="AI chat provider"
            >
              <option value="auto">Auto</option>
              <option value="gemini" disabled={!providerStatus.gemini}>Gemini</option>
              <option value="openai" disabled={!providerStatus.openai}>OpenAI</option>
              <option value="openrouter" disabled={!providerStatus.openrouter}>OpenRouter</option>
            </select>
          </label>
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-medium">
            <span className={`h-2 w-2 rounded-full ${providerStatus.gemini ? "bg-emerald-400" : "bg-zinc-500"}`} />
            <span className={providerStatus.gemini ? "text-emerald-300" : "text-zinc-400"}>Gemini</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-medium">
            <span className={`h-2 w-2 rounded-full ${providerStatus.nvidia ? "bg-emerald-400" : "bg-zinc-500"}`} />
            <span className={providerStatus.nvidia ? "text-emerald-300" : "text-zinc-400"}>NVIDIA</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-medium">
            <span className={`h-2 w-2 rounded-full ${providerStatus.openai ? "bg-emerald-400" : "bg-zinc-500"}`} />
            <span className={providerStatus.openai ? "text-emerald-300" : "text-zinc-400"}>OpenAI</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-medium">
            <span className={`h-2 w-2 rounded-full ${providerStatus.openrouter ? "bg-emerald-400" : "bg-zinc-500"}`} />
            <span className={providerStatus.openrouter ? "text-emerald-300" : "text-zinc-400"}>OpenRouter</span>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-zinc-950 border-b border-zinc-800 text-xs">
        <button
          type="button"
          onClick={() => handleModeChange("standard")}
          className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition ${
            mode === "standard"
              ? "bg-zinc-800 text-red-500 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          } ${!canUseMode("standard") ? "opacity-50 cursor-not-allowed" : ""}`}
          title={canUseMode("standard") ? "Uses the selected chat provider for GT7 tuning guidance" : "Selected provider is not configured"}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Standard</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("thinking")}
          className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition ${
            mode === "thinking"
              ? "bg-zinc-800 text-amber-500 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          } ${!canUseMode("thinking") ? "opacity-50 cursor-not-allowed" : ""}`}
          title={canUseMode("thinking") ? "Uses the selected provider for detailed setup reasoning" : "Selected provider is not configured"}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Deep Thinking</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("search")}
          className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition ${
            mode === "search"
              ? "bg-zinc-800 text-blue-400 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          } ${!canUseMode("search") ? "opacity-50 cursor-not-allowed" : ""}`}
          title={canUseMode("search") ? "Uses Gemini Google Search grounding to find current setup advice" : "Live web search requires Gemini with a configured API key"}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Search Web</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("nvidia")}
          className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition ${
            mode === "nvidia"
              ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          } ${!providerStatus.nvidia ? "opacity-50 cursor-not-allowed" : ""}`}
          title={providerStatus.nvidia ? "Uses physics-optimized NVIDIA Large Language Models for mechanical diagnostics" : "NVIDIA is not configured in this environment"}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>NVIDIA AI</span>
        </button>
      </div>

      {mode === "nvidia" && (
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              NVIDIA AI Active Model
            </span>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
              {NVIDIA_MODELS.find(m => m.id === selectedNvidiaModel)?.isFree ? "Free Endpoint" : "Developer Trial"}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {NVIDIA_MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelectedNvidiaModel(model.id)}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border text-[10px] whitespace-nowrap font-medium transition ${
                  selectedNvidiaModel === model.id
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>{model.name.replace("Nemotron-3 ", "").replace("Instruct", "").trim()}</span>
                {model.isFree && (
                  <span className="text-[8px] bg-emerald-500/30 text-emerald-300 px-1 rounded uppercase scale-90">
                    Free
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[85%] ${
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                m.role === "user"
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                  : "bg-red-950/40 border-red-900/60 text-red-400"
              }`}
            >
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`p-3 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-red-600 text-white rounded-tr-none"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-none whitespace-pre-wrap"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 text-red-500 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl rounded-tl-none text-zinc-400 text-xs font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              Engineer is calculating...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts on empty input */}
      {!input && messages.length <= 2 && (
        <div className="px-4 pb-2 pt-1 flex flex-wrap gap-2 bg-zinc-900">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(undefined, s.query)}
              className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-red-600/50 hover:bg-zinc-800 py-1.5 px-3 rounded-full transition"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Form Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Race engineer listening... e.g. "Fix entry oversteer"`}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
          disabled={!input.trim() || isLoading}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
