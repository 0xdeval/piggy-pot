#!/usr/bin/env node

import { main } from "./fetchPools";

// Run the main function
main()
  .then(() => {
    console.log("\nScript completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
