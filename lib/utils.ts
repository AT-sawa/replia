/**
 * 残り日数を「X年Xヶ月X日」形式の日本語文字列に変換する
 * 例: 280日 → "9ヶ月10日", 45日 → "1ヶ月15日", 400日 → "1年1ヶ月5日", 10日 → "10日"
 */
export function formatDaysRemaining(days: number): string {
  if (days <= 0) return ''

  const years = Math.floor(days / 365)
  const remaining = days % 365
  const months = Math.floor(remaining / 30)
  const leftDays = remaining % 30

  const parts: string[] = []
  if (years > 0) parts.push(`${years}年`)
  if (months > 0) parts.push(`${months}ヶ月`)
  if (leftDays > 0) parts.push(`${leftDays}日`)

  return parts.join('') || '0日'
}
