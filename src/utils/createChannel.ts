export const createCentralChannel = async (userId: string, agentId: string) => {
  try {
    const channelCreationResponse = await fetch(
      `http://localhost:3000/api/messaging/central-channels`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Chat for userID: ${userId}`,
          server_id: "00000000-0000-0000-0000-000000000000",
          participantCentralUserIds: [userId, agentId],
          type: "DM",
          metadata: {
            isDm: true,
            user1: userId,
            user2: agentId,
            forAgent: agentId,
            createdAt: new Date().toISOString(),
          },
        }),
      }
    );

    if (!channelCreationResponse.ok) {
      const errorText = await channelCreationResponse.text();
      console.error(
        "❌ Failed to create or get DM channel",
        channelCreationResponse.status,
        errorText
      );
      throw new Error(
        `Failed to create or get DM channel: ${channelCreationResponse.status} ${errorText}`
      );
    }

    const channelData = (await channelCreationResponse.json()) as {
      success: boolean;
      data?: { id: string };
      error?: any;
    };

    if (!channelData.success || !channelData.data?.id) {
      throw new Error("Invalid response from channel creation API");
    }

    const channelId = channelData.data.id;
    console.log("✅ DM Channel created:", channelId);

    return channelId;
  } catch (error) {
    console.error("❌ Error creating channel:", error);
    throw error;
  }
};
