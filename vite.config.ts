// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

function jsonMockPlugin() {
  return {
    name: "json-mock-plugin",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === "/api/operadores" && req.method === "GET") {
          const filePath = path.resolve(process.cwd(), "src/data/operadores.json");
          const data = fs.readFileSync(filePath, "utf-8");
          res.setHeader("Content-Type", "application/json");
          res.end(data);
          return;
        }
        if (req.url === "/api/operadores" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            const filePath = path.resolve(process.cwd(), "src/data/operadores.json");
            // format nicely
            const jsonStr = JSON.stringify(JSON.parse(body), null, 2);
            fs.writeFileSync(filePath, jsonStr, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), jsonMockPlugin()],
});