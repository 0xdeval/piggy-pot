export const recommendPoolsPrompt = (
  intent: string,
  previousSelections: any[],
  thisBatch: any[]
) => `
You are an expert DeFi LP advisor.
A user wants to get ${intent}.

So far, your top pools are:
${previousSelections.length > 0 ? JSON.stringify(previousSelections, null, 2) : "(none yet)"}

Here are up to 10 NEW candidate pools:
\`\`\`json
${JSON.stringify(thisBatch, null, 2)}
\`\`\`

From the union of your previous top picks and these new candidates, recommend the best **1 or 2** pools.  

IMPORTANT: You must return ONLY a JSON array with the exact format below. Do not include any other text, explanations, or markdown formatting.

Return this exact JSON structure:
\`\`\`json
[
  {
    "poolId": "0x...",
    "feeTier": "500"
  }
]
\`\`\`

Rules:
1. Return ONLY the JSON array - no other text
2. Use the exact field names: "poolId" and "feeTier"
3. poolId should be the pool's ID from the data
4. feeTier should be the pool's fee tier (e.g., "500", "3000", "10000")
5. Select 1-2 pools maximum
6. Do not include any explanations, markdown, or additional text
`;
