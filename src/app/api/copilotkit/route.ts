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
  return handleRequest(req)
}
