export const getAgentId = async (): Promise<string> => {
  try {
    const response = await fetch("http://localhost:3000/api/agents");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get agent id: ${response.status} ${errorText}`
      );
    }

    const data = (await response.json()) as {
      success: boolean;
      data?: { agents: Array<{ id: string }> };
      error?: any;
    };

    if (!data.success) {
      throw new Error(
        `Failed to get agent id: ${data.error || "Unknown error"}`
      );
    }

    if (!data.data?.agents || data.data.agents.length === 0) {
      throw new Error("No agents found");
    }

    const agentId = data.data.agents[0].id;
    console.log("✅ Agent ID retrieved:", agentId);

    return agentId;
  } catch (error) {
    console.error("❌ Error getting agent ID:", error);
    throw error;
  }
};
