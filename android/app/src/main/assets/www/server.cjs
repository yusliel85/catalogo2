"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = require("fs");
var import_vite = require("vite");
var PORT = 3e3;
var VIEWS_FILE = import_path.default.join(process.cwd(), "views-store.json");
var inMemoryViews = null;
var clients = {};
async function getOrLoadViews() {
  if (inMemoryViews !== null) {
    return inMemoryViews;
  }
  try {
    const data = await import_fs.promises.readFile(VIEWS_FILE, "utf-8");
    inMemoryViews = JSON.parse(data);
  } catch (e) {
    inMemoryViews = {};
  }
  return inMemoryViews || {};
}
var saveTimeout = null;
function scheduleDiskSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      if (inMemoryViews) {
        await import_fs.promises.writeFile(VIEWS_FILE, JSON.stringify(inMemoryViews, null, 2), "utf-8");
      }
    } catch (e) {
      console.error("[Views Store] Error writing views-store.json:", e);
    }
  }, 300);
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use((0, import_cors.default)({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  }));
  app.use(import_express.default.json());
  app.post("/api/views/sync/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const clientViews = req.body?.views || {};
      const views = await getOrLoadViews();
      if (!views[projectId]) {
        views[projectId] = {};
      }
      let hasChanges = false;
      for (const [prodId, count] of Object.entries(clientViews)) {
        if (typeof count === "number" && count > 0) {
          const current = views[projectId][prodId] || 0;
          if (count > current) {
            views[projectId][prodId] = count;
            hasChanges = true;
          }
        }
      }
      if (hasChanges) {
        scheduleDiskSave();
        if (clients[projectId] && clients[projectId].length > 0) {
          const dataStr = JSON.stringify(views[projectId]);
          clients[projectId].forEach((clientRes) => {
            try {
              clientRes.write(`data: ${dataStr}

`);
            } catch (err) {
            }
          });
        }
      }
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json(views[projectId] || {});
    } catch (e) {
      res.status(500).json({ error: e.message || "Internal Server Error" });
    }
  });
  app.get("/api/views/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const views = await getOrLoadViews();
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json(views[projectId] || {});
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/views/stream/:projectId", (req, res) => {
    const { projectId } = req.params;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no"
    });
    getOrLoadViews().then((views) => {
      const projectViews = views[projectId] || {};
      res.write(`data: ${JSON.stringify(projectViews)}

`);
    }).catch((err) => {
      console.error("Error sending initial views stream:", err);
    });
    if (!clients[projectId]) {
      clients[projectId] = [];
    }
    clients[projectId].push(res);
    const keepAlive = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch (e) {
      }
    }, 1e4);
    req.on("close", () => {
      clearInterval(keepAlive);
      if (clients[projectId]) {
        clients[projectId] = clients[projectId].filter((c) => c !== res);
      }
    });
  });
  app.post("/api/views/:projectId/:productId", async (req, res) => {
    try {
      const { projectId, productId } = req.params;
      const baseViews = typeof req.body?.baseViews === "number" ? req.body.baseViews : 0;
      const views = await getOrLoadViews();
      if (!views[projectId]) {
        views[projectId] = {};
      }
      const currentStored = views[projectId][productId] || 0;
      const effectiveBase = Math.max(currentStored, baseViews);
      views[projectId][productId] = effectiveBase + 1;
      const projectViews = views[projectId];
      scheduleDiskSave();
      if (clients[projectId] && clients[projectId].length > 0) {
        const dataStr = JSON.stringify(projectViews);
        clients[projectId].forEach((clientRes) => {
          try {
            clientRes.write(`data: ${dataStr}

`);
          } catch (err) {
            console.error("SSE broadcast error:", err);
          }
        });
      }
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json(projectViews);
    } catch (e) {
      console.error("Error in views increment POST:", e);
      res.status(500).json({ error: e.message || "Internal Server Error" });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: /* @__PURE__ */ new Date() });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
