import { loadFont as loadPlusJakartaSans } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

export const primaryFont = loadPlusJakartaSans("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"]
});

export const displayFont = loadOutfit("normal", {
  weights: ["600", "700", "800", "900"],
  subsets: ["latin"]
});

export const monoFont = loadJetBrainsMono("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"]
});
