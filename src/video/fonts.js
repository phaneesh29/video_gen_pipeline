import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadArchitectsDaughter } from "@remotion/google-fonts/ArchitectsDaughter";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

export const interFont = loadInter("normal", {
  weights: ["400", "600", "700", "800", "900"],
  subsets: ["latin"]
});

export const monoFont = loadJetBrainsMono("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"]
});

export const sketchFont = loadArchitectsDaughter("normal", {
  weights: ["400"],
  subsets: ["latin"]
});

export const caveatFont = loadCaveat("normal", {
  weights: ["600", "700"],
  subsets: ["latin"]
});
