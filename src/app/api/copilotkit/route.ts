import {
  CopilotRuntime,
  AnthropicAdapter,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime"
import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"

const runtime = new CopilotRuntime()

export async function POST(req: Request): Promise<Response> {
  const userKey = req.headers.get("x-user-api-key") ?? ""
  const provider = req.headers.get("x-user-provider") ?? "anthropic"

  let serviceAdapter
  if (provider === "openai") {
    const openai = new OpenAI({ apiKey: userKey || process.env.OPENAI_API_KEY })
    serviceAdapter = new OpenAIAdapter({ openai })
  } else {
    const anthropic = new Anthropic({
      apiKey: userKey || process.env.ANTHROPIC_API_KEY,
      baseURL: "https://api.anthropic.com/v1",
    })
    serviceAdapter = new AnthropicAdapter({ anthropic })
  }

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  })

  try {
    return await handleRequest(req)
  } catch (err: unknown) {
    const e = err as Record<string, unknown>
    const status =
      (e?.status as number) ??
      (e?.statusCode as number) ??
      ((e?.response as Record<string, unknown>)?.status as number) ??
      500
    const message = (e?.message as string) ?? "Unknown error"
    console.error("[copilotkit] provider error:", status, message)
    return Response.json({ error: message }, { status: typeof status === "number" ? status : 500 })
  }
}
