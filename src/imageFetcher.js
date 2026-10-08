import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = path.resolve("./temp/image_cache");

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Tech slug alias dictionary mapping common variants to official Simple Icons slugs
const TECH_SLUG_MAP = {
  kafka: "apachekafka",
  apachekafka: "apachekafka",
  cassandra: "apachecassandra",
  apachecassandra: "apachecassandra",
  postgres: "postgresql",
  postgresql: "postgresql",
  redis: "redis",
  docker: "docker",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  aws: "amazonaws",
  amazon: "amazonwebservices",
  s3: "amazons3",
  amazons3: "amazons3",
  lambda: "awslambda",
  awslambda: "awslambda",
  gcp: "googlecloud",
  googlecloud: "googlecloud",
  azure: "microsoftazure",
  cloudflare: "cloudflare",
  nginx: "nginx",
  rabbitmq: "rabbitmq",
  graphql: "graphql",
  grpc: "grpc",
  mysql: "mysql",
  mongodb: "mongodb",
  mongo: "mongodb",
  elasticsearch: "elasticsearch",
  elastic: "elasticsearch",
  kibana: "kibana",
  logstash: "logstash",
  prometheus: "prometheus",
  grafana: "grafana",
  terraform: "terraform",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  nodejs: "nodedotjs",
  node: "nodedotjs",
  react: "react",
  nextjs: "nextdotjs",
  vue: "vuedotjs",
  python: "python",
  golang: "go",
  go: "go",
  rust: "rust",
  java: "openjdk",
  csharp: "csharp",
  cpp: "cplusplus",
  netflix: "netflix",
  youtube: "youtube",
  spotify: "spotify",
  uber: "uber",
  stripe: "stripe",
  linux: "linux",
  ubuntu: "ubuntu",
  apple: "apple",
  android: "android"
};

function normalizeSlug(raw) {
  if (!raw) return "";
  const cleaned = raw.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  return TECH_SLUG_MAP[cleaned] || cleaned;
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

/**
 * Fetch official tech vector logo from Simple Icons CDN
 */
export async function fetchTechLogo(slug) {
  const norm = normalizeSlug(slug);
  if (!norm) return null;

  const cacheKey = getCacheKey("tech", norm);
  const cached = readFromCache(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://cdn.simpleicons.org/${norm}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const svg = await res.text();
      if (svg && svg.includes("<svg")) {
        const base64 = Buffer.from(svg).toString("base64");
        const dataUri = `data:image/svg+xml;base64,${base64}`;
        writeToCache(cacheKey, dataUri);
        return dataUri;
      }
    }
  } catch {}
  return null;
}

/**
 * Fetch web image / illustration via DuckDuckGo Image Search
 */
export async function fetchWebImage(query) {
  if (!query || !query.trim()) return null;
  const cleanQuery = query.trim();

  const cacheKey = getCacheKey("web", cleanQuery);
  const cached = readFromCache(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    // 1. Get VQD token from search page
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}`;
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
    // 2. Query DDG image endpoint (prioritizing transparent icons)
    const imgApiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(cleanQuery)}&vqd=${vqd}&f=,,,type:transparent,,&p=1`;
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
    const firstResult = imgData.results?.[0];
    if (!firstResult) {
      clearTimeout(timeout);
      return null;
    }

    // Prefer high-speed Bing CDN thumbnail for reliable embedding
    const targetUrl = firstResult.thumbnail || firstResult.image;
    const downloadRes = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (downloadRes.ok) {
      const buffer = await downloadRes.arrayBuffer();
      const contentType = downloadRes.headers.get("content-type") || "image/jpeg";
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUri = `data:${contentType};base64,${base64}`;
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

  // 1. Collect all unique image tasks
  const tasks = new Map(); // key -> { isTech, prompt }

  for (const scene of storyboard.scenes) {
    const structures = scene.visual?.structures || [];
    for (const struct of structures) {
      const nodes = struct.nodes || [];
      for (const node of nodes) {
        if (node.isTech && (node.imagePrompt || node.label)) {
          const key = `tech:${node.imagePrompt || node.label}`;
          if (!tasks.has(key)) {
            tasks.set(key, { isTech: true, prompt: node.imagePrompt || node.label });
          }
        } else if (node.imagePrompt && node.imagePrompt.trim()) {
          const key = `web:${node.imagePrompt}`;
          if (!tasks.has(key)) {
            tasks.set(key, { isTech: false, prompt: node.imagePrompt });
          }
        }
      }
    }
  }

  if (tasks.size === 0) {
    return storyboard;
  }

  // 2. Fetch all unique images concurrently in parallel
  const resolvedImages = new Map(); // key -> dataUri
  const taskEntries = Array.from(tasks.entries());

  await Promise.allSettled(
    taskEntries.map(async ([key, item]) => {
      let dataUri = null;
      if (item.isTech) {
        dataUri = await fetchTechLogo(item.prompt);
        // Fallback to label if prompt failed
        if (!dataUri && item.prompt) {
          dataUri = await fetchTechLogo(normalizeSlug(item.prompt));
        }
      } else {
        dataUri = await fetchWebImage(item.prompt);
      }
      if (dataUri) {
        resolvedImages.set(key, dataUri);
      }
    })
  );

  // 3. Inject imageSrc into matching nodes across all scenes
  let injectedCount = 0;
  for (const scene of storyboard.scenes) {
    const structures = scene.visual?.structures || [];
    for (const struct of structures) {
      const nodes = struct.nodes || [];
      for (const node of nodes) {
        if (node.isTech && (node.imagePrompt || node.label)) {
          const key = `tech:${node.imagePrompt || node.label}`;
          if (resolvedImages.has(key)) {
            node.imageSrc = resolvedImages.get(key);
            injectedCount++;
          }
        } else if (node.imagePrompt && node.imagePrompt.trim()) {
          const key = `web:${node.imagePrompt}`;
          if (resolvedImages.has(key)) {
            node.imageSrc = resolvedImages.get(key);
            injectedCount++;
          }
        }
      }
    }
  }

  return storyboard;
}
