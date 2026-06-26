import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  const validUsername = process.env.DEMO_USERNAME
  const passwordHashB64 = process.env.DEMO_PASSWORD_HASH

  if (!validUsername || !passwordHashB64) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 })
  }

  const passwordHash = Buffer.from(passwordHashB64, "base64").toString("utf8")
  const usernameMatch = username === validUsername
  const passwordMatch = await bcrypt.compare(password, passwordHash)

  if (!usernameMatch || !passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  await createSession()
  return NextResponse.json({ ok: true })
}
