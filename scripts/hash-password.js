import bcrypt from "bcryptjs"

const password = process.argv[2]
if (!password) {
  console.error("Usage: node scripts/hash-password.js <password>")
  process.exit(1)
}

bcrypt.hash(password, 12).then((hash) => {
  console.log("\n--- For .env.local (single quotes prevent $ expansion) ---")
  console.log(`DEMO_PASSWORD_HASH='${hash}'`)
  console.log("\n--- For Vercel environment variables (paste the value below as-is) ---")
  console.log(hash)
  console.log("")
})
