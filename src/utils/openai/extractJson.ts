/**
 * Extracts and parses a JSON structure from a Markdown-style ```json code block.
 *
 * @param input - The full text that may contain a ```json code block
 * @returns Parsed JSON object or null if parsing fails
 */
export function extractJsonFromMarkdownBlock(input: string): any | null {
  const match = input.match(/```json\s*([\s\S]*?)\s*```/);

  if (!match || match.length < 2) {
    console.warn("No valid ```json block found.");

    try {
      return JSON.parse(input);
    } catch (error) {
      console.error("JSON parsing failed:", error);
      return null;
    }
  }

  const jsonContent = match[1];

  try {
    return JSON.parse(jsonContent);
  } catch (err) {
    console.error("JSON parsing failed:", err);
    return null;
  }
}
