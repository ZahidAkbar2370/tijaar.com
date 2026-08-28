import { getLlmTxtBody, llmTxtResponse } from "@/lib/llmTxt";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = await getLlmTxtBody();
  return llmTxtResponse(body);
}
