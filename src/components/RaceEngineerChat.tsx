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
  const [mode, setMode] = useState<"standard" | "thinking" | "search" | "nvidia">("standard");
  const [selectedNvidiaModel, setSelectedNvidiaModel] = useState<string>(
    NVIDIA_MODELS[0]?.id || "nvidia/nemotron-3-super-120b-a12b"
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate race advice. Check server status.");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ **Error connecting to race engine:** ${err.message}. Please verify your server is running and the Gemini API key is configured.`,
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
      <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm tracking-wide text-white uppercase">
              Race Engineer AI
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Powered by Gemini & Flux89 Cheat Sheet
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-zinc-950 border-b border-zinc-800 text-xs">
        <button
          type="button"
          onClick={() => setMode("standard")}
          className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition ${
            mode === "standard"
              ? "bg-zinc-800 text-red-500 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Standard</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("thinking")}
          className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition ${
            mode === "thinking"
              ? "bg-zinc-800 text-amber-500 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          title="Uses Gemini 3.1 Pro High Thinking for deep setup physics reasoning"
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Deep Thinking</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("search")}
          className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition ${
            mode === "search"
              ? "bg-zinc-800 text-blue-400 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          title="Uses Google Search Grounding to find actual community tunes for specific cars"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Search Web</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("nvidia")}
          className={`flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition ${
            mode === "nvidia"
              ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          title="Uses physics-optimized NVIDIA Large Language Models for mechanical diagnostics"
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
