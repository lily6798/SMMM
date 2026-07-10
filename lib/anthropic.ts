import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BOOLEAN_COLUMNS = new Set([
  "promo_flag",
  "school_holiday_flag",
  "public_holiday_flag",
  "disruption_flag",
]);

export async function extractWeeklyRows(
  fileText: string,
  targetColumns: string[],
): Promise<Array<Record<string, string | number | boolean>>> {
  const properties: Record<string, { type: string; description?: string }> = {
    week_start: { type: "string", description: "Monday of the week, YYYY-MM-DD" },
  };
  for (const col of targetColumns) {
    properties[col] = { type: BOOLEAN_COLUMNS.has(col) ? "boolean" : "number" };
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 8192,
    tools: [
      {
        name: "record_weekly_rows",
        description:
          "Record one row per calendar week extracted from the uploaded file, aggregated to Monday-start weeks.",
        input_schema: {
          type: "object",
          properties: {
            rows: {
              type: "array",
              items: {
                type: "object",
                properties,
                required: ["week_start"],
              },
            },
          },
          required: ["rows"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "record_weekly_rows" },
    messages: [
      {
        role: "user",
        content: `Extract weekly data from this file. Aggregate to Monday-start calendar weeks — if the file has daily rows, sum spend/impressions/clicks within each week. Only populate these columns: ${targetColumns.join(", ")}. If a week has no data at all, omit it rather than inventing a zero.\n\nFile contents:\n${fileText.slice(0, 100_000)}`,
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return [];
  const input = toolUse.input as { rows?: Array<Record<string, string | number | boolean>> };
  return input.rows ?? [];
}
