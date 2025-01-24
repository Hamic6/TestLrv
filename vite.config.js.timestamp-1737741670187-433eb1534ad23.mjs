// vite.config.js
import { defineConfig } from "file:///C:/Users/hamic/Desktop/Projets%20LRV/Maquettes_Mira/V2/maquette-5-0-0-vite/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///C:/Users/hamic/Desktop/Projets%20LRV/Maquettes_Mira/V2/maquette-5-0-0-vite/node_modules/vite-tsconfig-paths/dist/index.js";
import react from "file:///C:/Users/hamic/Desktop/Projets%20LRV/Maquettes_Mira/V2/maquette-5-0-0-vite/node_modules/@vitejs/plugin-react-swc/index.mjs";
import svgr from "file:///C:/Users/hamic/Desktop/Projets%20LRV/Maquettes_Mira/V2/maquette-5-0-0-vite/node_modules/@svgr/rollup/dist/index.js";
import { nodePolyfills } from "file:///C:/Users/hamic/Desktop/Projets%20LRV/Maquettes_Mira/V2/maquette-5-0-0-vite/node_modules/vite-plugin-node-polyfills/dist/index.js";
var vite_config_default = defineConfig({
  base: "/",
  plugins: [
    react(),
    svgr(),
    nodePolyfills({
      protocolImports: true
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      "@mui/utils": "@mui/utils/esm"
    }
  },
  build: {
    chunkSizeWarningLimit: 6e3,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "EVAL") return;
        warn(warning);
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxoYW1pY1xcXFxEZXNrdG9wXFxcXFByb2pldHMgTFJWXFxcXE1hcXVldHRlc19NaXJhXFxcXFYyXFxcXG1hcXVldHRlLTUtMC0wLXZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGhhbWljXFxcXERlc2t0b3BcXFxcUHJvamV0cyBMUlZcXFxcTWFxdWV0dGVzX01pcmFcXFxcVjJcXFxcbWFxdWV0dGUtNS0wLTAtdml0ZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvaGFtaWMvRGVza3RvcC9Qcm9qZXRzJTIwTFJWL01hcXVldHRlc19NaXJhL1YyL21hcXVldHRlLTUtMC0wLXZpdGUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgc3ZnciBmcm9tIFwiQHN2Z3Ivcm9sbHVwXCI7XHJcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tIFwidml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogXCIvXCIsXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIHN2Z3IoKSxcclxuICAgIG5vZGVQb2x5ZmlsbHMoe1xyXG4gICAgICBwcm90b2NvbEltcG9ydHM6IHRydWUsXHJcbiAgICB9KSxcclxuICAgIHRzY29uZmlnUGF0aHMoKSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAbXVpL3V0aWxzJzogJ0BtdWkvdXRpbHMvZXNtJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAwLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvbndhcm4od2FybmluZywgd2Fybikge1xyXG4gICAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09IFwiRVZBTFwiKSByZXR1cm47XHJcbiAgICAgICAgd2Fybih3YXJuaW5nKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFosU0FBUyxvQkFBb0I7QUFDemIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUU5QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsSUFDTCxjQUFjO0FBQUEsTUFDWixpQkFBaUI7QUFBQSxJQUNuQixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLGNBQWM7QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNiLE9BQU8sU0FBUyxNQUFNO0FBQ3BCLFlBQUksUUFBUSxTQUFTLE9BQVE7QUFDN0IsYUFBSyxPQUFPO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
