import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import {
  createSong,
  deleteSong,
  getSong,
  listSongs,
  streamAudioFile,
  updateSong,
} from "./server/songs-store.js";

const root = path.dirname(fileURLToPath(import.meta.url));

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sendStoreResult(res, result, successStatus = 200) {
  if (result?.error === "nao_encontrada") {
    sendJson(res, 404, { error: result.error });
    return;
  }
  if (result?.error) {
    const status = result.error === "numero_em_uso" ? 409 : 400;
    sendJson(res, status, { error: result.error });
    return;
  }
  sendJson(res, successStatus, result.song ?? result);
}

function localSongsApiPlugin() {
  return {
    name: "coletanea-local-songs-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || "/", "http://localhost");
        if (!url.pathname.startsWith("/api/")) {
          next();
          return;
        }
        try {
          if (req.method === "GET" && url.pathname === "/api/health") {
            sendJson(res, 200, { ok: true, app: "coletanea-louvor" });
            return;
          }
          if (req.method === "GET" && url.pathname === "/api/songs") {
            sendJson(res, 200, await listSongs());
            return;
          }
          if (req.method === "POST" && url.pathname === "/api/songs") {
            const body = await readJsonBody(req);
            sendStoreResult(res, await createSong(body), 201);
            return;
          }
          const audioMatch = url.pathname.match(/^\/api\/audios\/([^/]+)$/);
          if (audioMatch && (req.method === "GET" || req.method === "HEAD")) {
            await streamAudioFile(decodeURIComponent(audioMatch[1]), req, res);
            return;
          }
          const match = url.pathname.match(/^\/api\/songs\/(\d+)$/);
          if (match) {
            const id = Number(match[1]);
            if (req.method === "GET") {
              const song = await getSong(id);
              if (!song) {
                sendJson(res, 404, { error: "nao_encontrada" });
                return;
              }
              sendJson(res, 200, song);
              return;
            }
            if (req.method === "PUT") {
              const body = await readJsonBody(req);
              sendStoreResult(res, await updateSong(id, body), 200);
              return;
            }
            if (req.method === "DELETE") {
              const result = await deleteSong(id);
              if (result?.error) {
                sendStoreResult(res, result);
                return;
              }
              res.statusCode = 204;
              res.end();
              return;
            }
          }
          next();
        } catch (error) {
          console.error(error);
          sendJson(res, 500, { error: "erro_interno" });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_DEV_API_URL || "http://127.0.0.1:3002";

  return {
    base: env.VITE_BASE || "/",
    resolve: {
      alias: {
        "@": path.resolve(root, "./src"),
      },
    },
    plugins: [react(), localSongsApiPlugin()],
    server: {
      host: true,
      port: 5174,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: 5174,
      strictPort: true,
    },
  };
});
