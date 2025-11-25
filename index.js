#!/usr/bin/env node
/**
 * Netlify Entry Point
 * This file serves as the main entry point for Netlify deployments
 */

import("./dist/index.js").catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
