import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.SUBATHON_TIMER_PORT || 18452);
const HOST = "127.0.0.1";
const STATE_FILE = path.join(os.homedir(), ".teewee-subathon-timer-state.json");

const defaultMilestones = [
  { goal: 35, label: "Broforce w Chat" },
  { goal: 50, label: "Facecam" },
  { goal: 75, label: "Misha Cosplay" },
  { goal: 100, label: "Perma character day" },
  { goal: 125, label: "No more countdown timer (6h minimum daily)" },
  { goal: 150, label: "Tow Truck Tower Character" },
  { goal: 175, label: "12h stream" }
];

const defaultState = {
  startHours: 6,
  startMinutes: 0,
  followMinutes: 10,
  subMinutes: 20,
  warningMinutes: 30,
  timerScale: 1,
  subGoalTitle: "Subtember",
  startingSubs: 0,
  currentSubs: 0,
  milestones: defaultMilestones,
  remainingMs: 6 * 60 * 60 * 1000,
  paused: false,
  lastUpdatedAt: Date.now(),
  follows: 0,
  subs: 0,
  totalAddedMinutes: 0,
  lastEventMessage: "Timer ready",
  lastEventAt: Date.now()
};

let state = await loadState();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function getConfiguredStartMs(source = state) {
  const hours = Math.max(0, Number(source.startHours) || 0);
  const minutes = Math.max(0, Number(source.startMinutes) || 0);
  return ((hours * 60) + minutes) * 60 * 1000;
}

function minutesToMs(minutes) {
  return (Number(minutes) || 0) * 60 * 1000;
}

function clampNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseMilestones(raw) {
  try {
    const parsed = Array.isArray(raw) ? raw : JSON.parse(String(raw || "[]"));
    if (!Array.isArray(parsed)) {
      return defaultMilestones;
    }

    const milestones = parsed
      .map((item) => ({
        goal: Math.floor(Number(item?.goal)),
        label: safeText(item?.label)
      }))
      .filter((item) => Number.isFinite(item.goal) && item.goal > 0 && item.label)
      .sort((a, b) => a.goal - b.goal);

    return milestones.length ? milestones : defaultMilestones;
  } catch {
    return defaultMilestones;
  }
}

function getActiveMilestone(source = state) {
  const milestones = Array.isArray(source.milestones) ? source.milestones : defaultMilestones;
  const currentSubs = Math.max(0, Math.floor(Number(source.currentSubs) || 0));

  const next = milestones.find((item) => item.goal > currentSubs);
  if (next) {
    return next;
  }

  const last = milestones[milestones.length - 1] || { goal: currentSubs, label: "Add milestones" };
  return {
    goal: last.goal,
    label: currentSubs >= last.goal ? "All listed goals complete" : last.label
  };
}

function normaliseState(input) {
  const merged = { ...defaultState, ...input };
  merged.startHours = clampNumber(merged.startHours, defaultState.startHours, 0, 999);
  merged.startMinutes = clampNumber(merged.startMinutes, defaultState.startMinutes, 0, 59);
  merged.followMinutes = clampNumber(merged.followMinutes, defaultState.followMinutes, 0, 240);
  merged.subMinutes = clampNumber(merged.subMinutes, defaultState.subMinutes, 0, 240);
  merged.warningMinutes = clampNumber(merged.warningMinutes, defaultState.warningMinutes, 0, 240);
  merged.timerScale = clampNumber(merged.timerScale, defaultState.timerScale, 0.6, 1.6);
  merged.subGoalTitle = safeText(merged.subGoalTitle, defaultState.subGoalTitle);
  merged.startingSubs = clampNumber(merged.startingSubs, defaultState.startingSubs, 0, 1000000);
  merged.currentSubs = clampNumber(merged.currentSubs, merged.startingSubs, 0, 1000000);
  merged.follows = clampNumber(merged.follows, defaultState.follows, 0, 1000000);
  merged.subs = clampNumber(merged.subs, defaultState.subs, 0, 1000000);
  merged.totalAddedMinutes = clampNumber(merged.totalAddedMinutes, defaultState.totalAddedMinutes, 0, 10000000);
  merged.milestones = parseMilestones(merged.milestones);
  return merged;
}

async function loadState() {
  try {
    const raw = await fsp.readFile(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const merged = normaliseState(parsed);
    applyElapsed(merged);
    return merged;
  } catch {
    return { ...defaultState };
  }
}

function applyElapsed(target = state) {
  const now = Date.now();
  if (!target.paused) {
    const last = Number(target.lastUpdatedAt) || now;
    target.remainingMs -= Math.max(0, now - last);
  }
  target.lastUpdatedAt = now;
}

async function persistState() {
  state.lastUpdatedAt = Date.now();
  await fsp.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

function getPublicState() {
  const snapshot = normaliseState(structuredClone(state));
  applyElapsed(snapshot);
  snapshot.activeMilestone = getActiveMilestone(snapshot);
  return snapshot;
}

async function updateSettings(payload) {
  applyElapsed();
  state.startHours = clampNumber(payload.startHours, state.startHours, 0, 999);
  state.startMinutes = clampNumber(payload.startMinutes, state.startMinutes, 0, 59);
  state.followMinutes = clampNumber(payload.followMinutes, state.followMinutes, 0, 240);
  state.subMinutes = clampNumber(payload.subMinutes, state.subMinutes, 0, 240);
  state.warningMinutes = clampNumber(payload.warningMinutes, state.warningMinutes, 0, 240);
  state.timerScale = clampNumber(payload.timerScale, state.timerScale, 0.6, 1.6);
  state.subGoalTitle = safeText(payload.subGoalTitle, state.subGoalTitle);
  state.startingSubs = clampNumber(payload.startingSubs, state.startingSubs, 0, 1000000);
  if (payload.currentSubs !== undefined) {
    state.currentSubs = clampNumber(payload.currentSubs, state.currentSubs, 0, 1000000);
  }
  if (payload.milestones !== undefined) {
    state.milestones = parseMilestones(payload.milestones);
  }
  await persistState();
  return getPublicState();
}

async function addMinutes(minutes, reason, options = {}) {
  applyElapsed();
  const safeMinutes = Number(minutes) || 0;
  if (safeMinutes === 0) {
    return getPublicState();
  }

  state.remainingMs += minutesToMs(safeMinutes);
  if (safeMinutes > 0) {
    state.totalAddedMinutes += safeMinutes;
  }

  if (options.follows) {
    state.follows += options.follows;
  }
  if (options.subs) {
    state.subs += options.subs;
  }
  if (options.subCounterIncrement) {
    state.currentSubs += options.subCounterIncrement;
  }

  const sign = safeMinutes > 0 ? "+" : "";
  state.lastEventMessage = `${reason} ${sign}${safeMinutes}m`;
  state.lastEventAt = Date.now();
  await persistState();
  return getPublicState();
}

async function togglePause() {
  applyElapsed();
  state.paused = !state.paused;
  state.lastEventMessage = state.paused ? "Timer paused" : "Timer resumed";
  state.lastEventAt = Date.now();
  await persistState();
  return getPublicState();
}

async function resetTimer() {
  applyElapsed();
  state.remainingMs = getConfiguredStartMs();
  state.paused = false;
  state.follows = 0;
  state.subs = 0;
  state.totalAddedMinutes = 0;
  state.currentSubs = state.startingSubs;
  state.lastEventMessage = "Timer reset";
  state.lastEventAt = Date.now();
  await persistState();
  return getPublicState();
}

async function parseBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(data));
}

async function serveStatic(requestPath, response) {
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const resolvedPath = path.join(__dirname, safePath);
  if (!resolvedPath.startsWith(__dirname)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  try {
    const stat = await fsp.stat(resolvedPath);
    if (!stat.isFile()) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(resolvedPath).pipe(response);
  } catch {
    sendJson(response, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${HOST}:${PORT}`);

  try {
    if (request.method === "GET" && url.pathname === "/") {
      response.writeHead(302, { Location: "/subathon-controller.html" });
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/state") {
      sendJson(response, 200, getPublicState());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/settings") {
      const body = await parseBody(request);
      sendJson(response, 200, await updateSettings(body));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/action") {
      const body = await parseBody(request);
      const type = body.type;

      if (type === "follow") {
        sendJson(response, 200, await addMinutes(state.followMinutes, "Follow", { follows: 1 }));
        return;
      }

      if (type === "subs") {
        const count = Math.max(1, clampNumber(body.count, 1, 1, 100));
        sendJson(response, 200, await addMinutes(count * state.subMinutes, `${count} sub${count === 1 ? "" : "s"}`, {
          subs: count,
          subCounterIncrement: count
        }));
        return;
      }

      if (type === "minutes") {
        sendJson(response, 200, await addMinutes(Number(body.minutes) || 0, "Manual"));
        return;
      }

      if (type === "pause") {
        sendJson(response, 200, await togglePause());
        return;
      }

      if (type === "reset") {
        sendJson(response, 200, await resetTimer());
        return;
      }

      sendJson(response, 400, { error: "Unknown action" });
      return;
    }

    const filePath = url.pathname === "/subathon-overlay.html"
      ? "subathon-overlay.html"
      : url.pathname === "/subathon-controller.html"
        ? "subathon-controller.html"
        : url.pathname.slice(1);

    if (!filePath) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }

    await serveStatic(filePath, response);
  } catch (error) {
    sendJson(response, 500, {
      error: "Server error",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Subathon timer server running at http://${HOST}:${PORT}`);
  console.log(`Overlay:    http://${HOST}:${PORT}/subathon-overlay.html`);
  console.log(`Controller: http://${HOST}:${PORT}/subathon-controller.html`);
});
