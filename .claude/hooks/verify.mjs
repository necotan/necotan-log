// Stop フック: 作業ツリーに変更があるときだけ lint と型チェックを走らせ、失敗したら Claude に差し戻す
import { execSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const hooksDir = dirname(fileURLToPath(import.meta.url))
const root = join(hooksDir, "..", "..")
const stampPath = join(hooksDir, ".verified")

const run = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 })

let input = {}
try {
  input = JSON.parse(readFileSync(0, "utf8") || "{}")
} catch {
  // 入力なしで手動実行した場合
}
// 差し戻し後の再停止でも失敗し続けると止まれなくなる
if (input.stop_hook_active) process.exit(0)

const status = run("git status --porcelain")
if (!/\.(ts|mts|mjs|astro|md|mdx|json)"?$/m.test(status)) process.exit(0)

// 同じ変更内容で合格済みなら、質問だけのターンで待たせない
const hash = createHash("sha256").update(status).update(run("git diff HEAD"))
// 未追跡ファイルは git diff に出ないため中身を直接含める
for (const file of run("git ls-files --others --exclude-standard").split("\n").filter(Boolean)) {
  hash.update(file).update(readFileSync(join(root, file)))
}
const stamp = hash.digest("hex")
if (existsSync(stampPath) && readFileSync(stampPath, "utf8") === stamp) process.exit(0)

try {
  run("npm run lint")
  run("npm run typecheck")
} catch (e) {
  const out = `${e.stdout ?? ""}${e.stderr ?? ""}`.trim().split("\n").slice(-60).join("\n")
  process.stderr.write(`lint または型チェックが失敗しました。修正してください。\n${out}\n`)
  process.exit(2)
}
writeFileSync(stampPath, stamp)
