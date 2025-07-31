/**
 * Waits for a specified number of milliseconds
 *
 * @param ms - The number of milliseconds to wait
 */
export async function waitFor(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
