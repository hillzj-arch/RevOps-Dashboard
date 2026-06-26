import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  const validUsername = process.env.DEMO_USERNAME
  const passwordHash = process.env.DEMO_PASSWORD_HASH

  if (!validUsername || !passwordHash) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 })
  }

  const usernameMatch = username === validUsername
  const passwordMatch = await bcrypt.compare(password, passwordHash)

  if (!usernameMatch || !passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  await createSession()
  return NextResponse.json({ ok: true })
}
