import { getLlmTxtBody, llmTxtResponse } from "@/lib/llmTxt";

export const dynamic = "force-dynamic";

/** Same dynamic content as /llms.txt (admin-configurable via API). */
export async function GET() {
  const body = await getLlmTxtBody();
  return llmTxtResponse(body);
}
