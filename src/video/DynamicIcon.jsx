import React from "react";
import * as LucideIcons from "lucide-react";

function toPascalCase(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Resolves an icon name from Lucide dictionary in O(1).
 * Returns the React component if found, or null for clean plain-text fallback.
 */
export function resolveIconComponent(iconName) {
  if (!iconName || typeof iconName !== "string") return null;

  const trimmed = iconName.trim();
  if (LucideIcons[trimmed]) return LucideIcons[trimmed];

  const pascal = toPascalCase(trimmed);
  if (LucideIcons[pascal]) return LucideIcons[pascal];

  return null;
}

export function DynamicIcon({ name, size = 24, color = "#ffffff", strokeWidth = 2.2 }) {
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

  const IconComp = resolveIconComponent(name);
  if (!IconComp) return null;
  return <IconComp size={size} color={color} strokeWidth={strokeWidth} />;
}
