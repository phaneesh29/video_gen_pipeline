import fs from "fs";
import path from "path";
import crypto from "crypto";
import { removeStudioBackground } from "./imageProcessor.js";

const CACHE_DIR = path.resolve("./.cache/images");

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Standardize slug to lowercase alphanumeric (e.g. "Apache Kafka" -> "apachekafka")
 */
function normalizeSlug(raw) {
  if (!raw) return "";
  return raw.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

function getCacheKey(type, query) {
  return crypto.createHash("md5").update(`${type}:${query}`).digest("hex");
}

function readFromCache(cacheKey) {
  ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return data.dataUri;
    } catch {
      return null;
    }
  }
  return null;
}

function writeToCache(cacheKey, dataUri) {
  ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify({ dataUri, timestamp: Date.now() }));
  } catch {}
}

async function tryFetchSimpleIcon(slug) {
  const url = `https://cdn.simpleicons.org/${slug}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const svg = await res.text();
      if (svg && svg.includes("<svg")) {
        const base64 = Buffer.from(svg).toString("base64");
        return `data:image/svg+xml;base64,${base64}`;
      }
    }
  } catch {
    clearTimeout(timeout);
  }
  return null;
}

/**
 * Fetch official tech vector logo directly from Simple Icons CDN using LLM-generated slug
 */
export async function fetchTechLogo(slug) {
  const norm = normalizeSlug(slug);
  if (!norm) return null;

  const cacheKey = getCacheKey("tech", norm);
  const cached = readFromCache(cacheKey);
  if (cached) return cached;

  // 1. Try exact normalized slug from LLM (e.g. "apachekafka", "redis", "postgresql")
  let dataUri = await tryFetchSimpleIcon(norm);

  // 2. Automated alias fallback (e.g. "kafka" -> "apachekafka", "aws" -> "amazonaws")
  if (!dataUri) {
    const candidates = [];
    if (!norm.startsWith("apache")) candidates.push(`apache${norm}`);
    if (norm === "aws") candidates.push("amazonaws");
    if (norm === "k8s") candidates.push("kubernetes");

    for (const alt of candidates) {
      dataUri = await tryFetchSimpleIcon(alt);
      if (dataUri) break;
    }
  }

  // 3. Fallback: Search DuckDuckGo for transparent logo if not on Simple Icons
  if (!dataUri) {
    dataUri = await fetchWebImage(`${slug} logo transparent icon`);
  }

  if (dataUri) {
    writeToCache(cacheKey, dataUri);
    return dataUri;
  }

  return null;
}

/**
 * Fetch web image / illustration via DuckDuckGo Image Search, anchored to the video context
 */
export async function fetchWebImage(query, context = "") {
  if (!query || !query.trim()) return null;
  const cleanQuery = query.trim();

  // Combine query with video domain context and exclude entertainment pop culture
  let searchString = cleanQuery;
  if (context && !searchString.toLowerCase().includes(context.toLowerCase())) {
    searchString = `${searchString} ${context}`;
  }
  searchString = `${searchString} -movie -film -actor -poster -wallpaper -cinema -trailer -hollywood -celebrity`;

  const cacheKey = getCacheKey("web", `${cleanQuery}:${context}`);
  const cached = readFromCache(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    // 1. Get VQD token from search page
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchString)}`;
    const pageRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });

    const html = await pageRes.text();
    const vqdMatch = html.match(/vqd=["']?([0-9-]+)["']?/i) || html.match(/vqd=([0-9-]+)/i);
    if (!vqdMatch) {
      clearTimeout(timeout);
      return null;
    }

    const vqd = vqdMatch[1];
    // 2. Query DDG image endpoint (prioritizing transparent icons/cutouts)
    const imgApiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(searchString)}&vqd=${vqd}&f=,,,type:transparent,,&p=1`;
    const imgRes = await fetch(imgApiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://duckduckgo.com/"
      },
      signal: controller.signal
    });

    if (!imgRes.ok) {
      clearTimeout(timeout);
      return null;
    }

    const imgData = await imgRes.json();

    // 3. Reject any result that matches entertainment/movies to strictly stay within technical video context
    const isEntertainmentOrJunk = (item) => {
      const text = `${item.title || ""} ${item.url || ""}`.toLowerCase();
      return /movie|film|actor|cinema|hollywood|keanu|reeves|imdb|fandom|trailer|wallpaper|celebrity|poster|dvd|box office/i.test(text);
    };

    const validResult = imgData.results?.find((r) => !isEntertainmentOrJunk(r));
    if (!validResult) {
      clearTimeout(timeout);
      return null;
    }

    const targetUrl = validResult.thumbnail || validResult.image;
    const downloadRes = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (downloadRes.ok) {
      const arrayBuf = await downloadRes.arrayBuffer();
      const rawBuf = Buffer.from(arrayBuf);
      const processedBuf = await removeStudioBackground(rawBuf);
      const base64 = processedBuf.toString("base64");
      const dataUri = `data:image/png;base64,${base64}`;
      writeToCache(cacheKey, dataUri);
      return dataUri;
    }
  } catch {}
  return null;
}

/**
 * Batch resolve and embed images into storyboard nodes concurrently
 */
export async function enrichStoryboardWithImages(storyboard) {
  if (!storyboard || !Array.isArray(storyboard.scenes)) {
    return storyboard;
  }

  // Extract core domain context keywords from the video topic
  const topicContext = (storyboard.topic || "")
    .replace(/how|what|inside|an|the|without|explained|system|design/gi, "")
    .replace(/[^\w\s]/g, "")
    .trim();

  // 1. Collect all explicit image tasks (Never invent image searches for generic/abstract nodes!)
  const tasks = new Map(); // key -> { isTech, prompt }

  for (const scene of storyboard.scenes) {
    if (Array.isArray(scene.visual?.gallery)) {
      for (const item of scene.visual.gallery) {
        if (!item.imagePrompt && !item.isTech) continue;
        const query = item.imagePrompt;
        if (!query || !query.trim()) continue;

        if (item.isTech) {
          const key = `tech:${query.trim()}`;
          if (!tasks.has(key)) tasks.set(key, { isTech: true, prompt: query.trim() });
        } else {
          const key = `web:${query.trim()}`;
          if (!tasks.has(key)) tasks.set(key, { isTech: false, prompt: query.trim() });
        }
      }
    }

    const structures = scene.visual?.structures || [];
    for (const struct of structures) {
      const nodes = struct.nodes || [];
      for (const node of nodes) {
        // ONLY fetch image if isTech is true OR imagePrompt was explicitly requested by LLM
        if (!node.imagePrompt && !node.isTech) continue;
        const query = node.imagePrompt;
        if (!query || !query.trim()) continue;

        if (node.isTech) {
          const key = `tech:${query.trim()}`;
          if (!tasks.has(key)) tasks.set(key, { isTech: true, prompt: query.trim() });
        } else {
          const key = `web:${query.trim()}`;
          if (!tasks.has(key)) tasks.set(key, { isTech: false, prompt: query.trim() });
        }
      }
    }
  }

  if (tasks.size === 0) {
    return storyboard;
  }

  // 2. Fetch all unique images concurrently in parallel with topic context
  const resolvedImages = new Map(); // key -> dataUri
  const taskEntries = Array.from(tasks.entries());

  await Promise.allSettled(
    taskEntries.map(async ([key, item]) => {
      let dataUri = null;
      if (item.isTech) {
        dataUri = await fetchTechLogo(item.prompt);
      } else {
        dataUri = await fetchWebImage(item.prompt, topicContext);
      }
      if (dataUri) {
        resolvedImages.set(key, dataUri);
      }
    })
  );

  // 3. Inject imageSrc only into items that explicitly requested images
  for (const scene of storyboard.scenes) {
    if (Array.isArray(scene.visual?.gallery)) {
      for (const item of scene.visual.gallery) {
        if (!item.imagePrompt && !item.isTech) continue;
        const query = item.imagePrompt.trim();
        const key = item.isTech ? `tech:${query}` : `web:${query}`;
        if (resolvedImages.has(key)) {
          item.imageSrc = resolvedImages.get(key);
        }
      }
    }

    const structures = scene.visual?.structures || [];
    for (const struct of structures) {
      const nodes = struct.nodes || [];
      for (const node of nodes) {
        if (!node.imagePrompt && !node.isTech) continue;
        const query = node.imagePrompt.trim();
        const key = node.isTech ? `tech:${query}` : `web:${query}`;
        if (resolvedImages.has(key)) {
          node.imageSrc = resolvedImages.get(key);
        }
      }
    }
  }

  return storyboard;
}
