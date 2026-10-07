import React from "react";
import * as LucideIcons from "lucide-react";

/**
 * Resolves any icon name, Lucide component, emoji, or fallback keyword to a valid React component.
 */
function resolveIconComponent(rawName, label) {
  if (rawName && LucideIcons[rawName]) {
    return LucideIcons[rawName];
  }

  if (rawName) {
    const pascal = String(rawName)
      .split(/[-_\s]+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    if (LucideIcons[pascal]) {
      return LucideIcons[pascal];
    }
  }

  // Keyword-based fallback from label or rawName
  const text = `${rawName || ""} ${label || ""}`.toLowerCase();
  if (text.includes("brain") || text.includes("llm") || text.includes("neural") || text.includes("ai") || text.includes("gpt") || text.includes("model")) return LucideIcons.Brain;
  if (text.includes("user") || text.includes("prompt") || text.includes("client") || text.includes("browser") || text.includes("human")) return LucideIcons.User;
  if (text.includes("server") || text.includes("host") || text.includes("backend") || text.includes("origin") || text.includes("api") || text.includes("gateway")) return LucideIcons.Server;
  if (text.includes("database") || text.includes("db") || text.includes("storage") || text.includes("sql") || text.includes("disk")) return LucideIcons.Database;
  if (text.includes("cdn") || text.includes("edge") || text.includes("globe") || text.includes("internet") || text.includes("network") || text.includes("proxy")) return LucideIcons.Globe;
  if (text.includes("sample") || text.includes("pick") || text.includes("prob") || text.includes("odds") || text.includes("random")) return LucideIcons.Shuffle;
  if (text.includes("output") || text.includes("chat") || text.includes("message") || text.includes("text") || text.includes("result")) return LucideIcons.MessageSquare;
  if (text.includes("loop") || text.includes("repeat") || text.includes("cycle") || text.includes("feedback") || text.includes("auto")) return LucideIcons.RefreshCw;
  if (text.includes("cache") || text.includes("speed") || text.includes("fast") || text.includes("memory")) return LucideIcons.Zap;
  if (text.includes("queue") || text.includes("stream") || text.includes("event") || text.includes("layer")) return LucideIcons.Layers;
  if (text.includes("auth") || text.includes("security") || text.includes("token") || text.includes("lock") || text.includes("protect")) return LucideIcons.ShieldCheck;
  if (text.includes("code") || text.includes("script") || text.includes("program")) return LucideIcons.FileCode;

  return LucideIcons.Sparkles;
}

export function DynamicIcon({ name, label, size = 22, color = "#ffffff", strokeWidth = 2.2 }) {
  if (name && typeof name === "string" && /\p{Extended_Pictographic}/u.test(name)) {
    return (
      <span
        style={{
          fontSize: `${size}px`,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {name}
      </span>
    );
  }

  const IconComp = resolveIconComponent(name, label);
  return <IconComp size={size} color={color} strokeWidth={strokeWidth} />;
}
