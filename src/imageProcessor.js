import sharp from "sharp";

/**
 * Automatically removes white, light gray, and studio backgrounds from downloaded
 * product/hardware images using border-connected flood-fill and alpha feathering,
 * returning a tightly trimmed transparent PNG buffer.
 */
export async function removeStudioBackground(buffer) {
  try {
    if (!buffer || buffer.length === 0) return buffer;

    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Preserve vector SVGs as-is
    if (metadata.format === "svg") {
      return buffer;
    }

    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const totalPixels = width * height;

    // 1. Check if the image already has significant transparency along edges
    let transparentEdgeCount = 0;
    let totalEdgeCount = 0;

    for (let x = 0; x < width; x++) {
      if (data[x * 4 + 3] < 30) transparentEdgeCount++;
      if (data[((height - 1) * width + x) * 4 + 3] < 30) transparentEdgeCount++;
      totalEdgeCount += 2;
    }
    for (let y = 0; y < height; y++) {
      if (data[(y * width) * 4 + 3] < 30) transparentEdgeCount++;
      if (data[(y * width + (width - 1)) * 4 + 3] < 30) transparentEdgeCount++;
      totalEdgeCount += 2;
    }

    // If already transparent along edges (>15%), simply trim empty transparent margins
    if (transparentEdgeCount / totalEdgeCount > 0.15) {
      return await sharp(data, { raw: { width, height, channels: 4 } })
        .trim({ threshold: 10 })
        .png({ quality: 90, compressionLevel: 8 })
        .toBuffer();
    }

    // 2. Sample corner pixels to determine background key color
    const cornerIndices = [
      0,
      (width - 1) * 4,
      ((height - 1) * width) * 4,
      ((height - 1) * width + (width - 1)) * 4
    ];

    let sumR = 0, sumG = 0, sumB = 0;
    for (const idx of cornerIndices) {
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
    }
    const bgR = sumR / 4;
    const bgG = sumG / 4;
    const bgB = sumB / 4;

    const isLightBg = bgR > 205 && bgG > 205 && bgB > 205;
    const isDarkBg = bgR < 40 && bgG < 40 && bgB < 40;

    // If corners are neither light nor dark uniform backdrop, preserve original buffer
    if (!isLightBg && !isDarkBg) {
      return buffer;
    }

    // 3. Flood-fill from borders inward using BFS
    // visited: 0 = unvisited, 1 = background, 2 = foreground
    const visited = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let qHead = 0;
    let qTail = 0;

    function isBackgroundPixel(idx) {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (isLightBg) {
        // High lightness studio white/off-white
        if (r > 234 && g > 234 && b > 234) return true;
        // Neutral light gray backdrop
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        if (minC > 205 && (maxC - minC) < 24) return true;
        // Within Euclidean distance of corner color
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        if (dist < 40) return true;
      } else if (isDarkBg) {
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        if (dist < 28) return true;
      }

      return false;
    }

    // Enqueue outer border pixels
    function enqueue(x, y) {
      const pIdx = y * width + x;
      if (visited[pIdx] === 0) {
        const bIdx = pIdx * 4;
        if (isBackgroundPixel(bIdx)) {
          visited[pIdx] = 1;
          queue[qTail++] = pIdx;
        } else {
          visited[pIdx] = 2;
        }
      }
    }

    for (let x = 0; x < width; x++) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }
    for (let y = 1; y < height - 1; y++) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    // BFS loop
    while (qHead < qTail) {
      const pIdx = queue[qHead++];
      const px = pIdx % width;
      const py = Math.floor(pIdx / width);

      const neighbors = [
        px > 0 ? pIdx - 1 : -1,
        px < width - 1 ? pIdx + 1 : -1,
        py > 0 ? pIdx - width : -1,
        py < height - 1 ? pIdx + width : -1
      ];

      for (const nIdx of neighbors) {
        if (nIdx !== -1 && visited[nIdx] === 0) {
          const bIdx = nIdx * 4;
          if (isBackgroundPixel(bIdx)) {
            visited[nIdx] = 1;
            queue[qTail++] = nIdx;
          } else {
            visited[nIdx] = 2;
          }
        }
      }
    }

    // 4. Set alpha = 0 for background pixels, feather edges for anti-aliasing
    for (let pIdx = 0; pIdx < totalPixels; pIdx++) {
      const bIdx = pIdx * 4;
      if (visited[pIdx] === 1) {
        data[bIdx + 3] = 0; // Fully transparent
      } else if (visited[pIdx] === 2) {
        // Edge pixel: soft feathering to eliminate halo
        const r = data[bIdx];
        const g = data[bIdx + 1];
        const b = data[bIdx + 2];
        if (isLightBg && (r > 215 && g > 215 && b > 215)) {
          const alphaFactor = Math.min(1, Math.max(0, (255 - Math.min(r, g, b)) / 40));
          data[bIdx + 3] = Math.round(data[bIdx + 3] * alphaFactor);
        }
      }
    }

    // 5. Trim empty margins and export as optimized PNG
    const processedBuffer = await sharp(data, {
      raw: { width, height, channels: 4 }
    })
      .trim({ threshold: 5 })
      .png({ quality: 90, compressionLevel: 8 })
      .toBuffer();

    return processedBuffer;
  } catch (err) {
    console.warn("removeStudioBackground warning:", err.message);
    return buffer;
  }
}
