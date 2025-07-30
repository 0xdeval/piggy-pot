import OpenAI from "openai";
import { appConfig } from "@/config";

const openai = new OpenAI({
  apiKey: appConfig.openai.apiKey,
});

export interface LLMResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export async function getLLMResponse(prompt: string): Promise<LLMResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return {
        success: false,
        error: "No response from OpenAI",
      };
    }

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
