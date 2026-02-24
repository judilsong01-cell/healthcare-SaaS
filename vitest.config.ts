import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Vitest Configuration
 * 
 * Design Philosophy: Testes Robustos e Rápidos
 * - Configuração otimizada para React
 * - Suporte a TypeScript
 * - Coverage reporting
 * - Mocking e stubbing
 */

export default defineConfig({
  plugins: [react()],
  test: {
    // Ambiente de teste
    environment: "jsdom",
    
    // Globals para testes
    globals: true,
    
    // Setup files
    setupFiles: ["./client/src/__tests__/setup.ts"],
    
    // Coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "client/src/__tests__/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
    
    // Include patterns
    include: ["client/src/**/*.{test,spec}.{ts,tsx}"],
    
    // Exclude patterns
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
});
