import { NextRequest, NextResponse } from 'next/server'

// Japanese → display brand name map
const BRAND_MAP: Record<string, string> = {
  'パナソニック': 'Panasonic',
  'シャープ':     'SHARP',
  '東芝':         'TOSHIBA',
  '日立':         'HITACHI',
  '三菱電機':     '三菱電機',
  '三菱重工':     '三菱重工',
  'ソニー':       'SONY',
  'ダイキン':     'DAIKIN',
  '富士通':       '富士通ゼネラル',
  'コロナ':       'CORONA',
  'アイリスオーヤマ': 'アイリスオーヤマ',
  'ハイアール':   'Haier',
  'ヤマハ':       'YAMAHA',
  'バルミューダ': 'BALMUDA',
  'デロンギ':     'De\'Longhi',
}

// Simple prefix → brand fallback for common Japanese appliance model numbers
function guessFromModelPrefix(model: string): string | null {
  const m = model.toUpperCase()
  // Panasonic
  if (/^NA-|^NR-|^CS-|^CF-|^HH-|^SC-|^EH-|^EW-|^F-\d|^MC-|^SR-/.test(m)) return 'Panasonic'
  // SHARP（ES-は洗濯機、SJ-は冷蔵庫、AY-はエアコン等）
  if (/^ES-|^SJ-|^SH-|^AY-|^LC-|^AH-|^FP-|^KC-|^RE-|^RX-|^EC-/.test(m))  return 'SHARP'
  // TOSHIBA
  if (/^AW-|^GR-|^VC-|^TW-|^RC-|^NW-|^NH-|^RAS-A|^ER-/.test(m))           return 'TOSHIBA'
  // HITACHI
  if (/^BD-|^BW-|^R-S|^R-X|^R-W|^R-HW|^RAS-X|^RAS-Y|^RAS-G|^CV-|^PV-/.test(m)) return 'HITACHI'
  // 三菱電機
  if (/^MSZ-|^MXZ-|^MJ-|^MR-|^ML-|^MFZ-/.test(m))                          return '三菱電機'
  // SONY
  if (/^KJ-|^KD-|^HT-|^SRS-|^MDR-|^WF-/.test(m))                           return 'SONY'
  // DAIKIN
  if (/^AN-|^ATC-|^ATZ-|^S\d{2}[A-Z]|^C\d{2}[A-Z]/.test(m))               return 'DAIKIN'
  // 富士通ゼネラル
  if (/^AS-|^AH-X|^AG-|^AB-/.test(m))                                       return '富士通ゼネラル'
  // AQUA
  if (/^AQW-|^AQR-/.test(m))                                                 return 'AQUA'
  // Haier
  if (/^JW-|^JR-/.test(m))                                                   return 'Haier'
  // アイリスオーヤマ
  if (/^IAW-|^KAW-|^PCF-|^IHF-/.test(m))                                    return 'アイリスオーヤマ'
  // YAMAHA
  if (/^YSP-|^AX-[A-Z]|^TSR-|^NS-[A-Z]/.test(m))                           return 'YAMAHA'
  return null
}

// GET /api/product-image?model=NA-VX900BL
// Returns { imageUrl: string | null, brand: string | null }
export async function GET(req: NextRequest) {
  const model = req.nextUrl.searchParams.get('model')?.trim()
  if (!model || model.length < 3) return NextResponse.json({ imageUrl: null, brand: null })

  // Start with prefix-based brand guess (instant, no network)
  let brand: string | null = guessFromModelPrefix(model)
  let imageUrl: string | null = null

  try {
    const kakakuUrl = `https://kakaku.com/search_results/?query=${encodeURIComponent(model)}&category=0020&act=Input`
    const res = await fetch(kakakuUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'ja-JP,ja;q=0.9',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(6000),
    })

    if (res.ok) {
      const html = await res.text()

      // Extract product image URL from Kakaku CDN
      const imgMatch = html.match(
        /img1\.kakaku\.k-img\.com\/images\/productimage\/l\/[A-Z0-9]+\.jpg/i
      )
      if (imgMatch) imageUrl = `https://${imgMatch[0]}`

      // Extract manufacturer from page title or first product title
      // Kakaku product titles often start with the maker name
      // e.g. <title>パナソニック NA-VX900BL-W ...</title>
      // or in og:title / class="itmName" etc.
      const titleMatch = html.match(/<title[^>]*>([^<]{3,80})<\/title>/i)
      if (titleMatch) {
        const title = titleMatch[1]
        for (const [ja, en] of Object.entries(BRAND_MAP)) {
          if (title.includes(ja)) { brand = en; break }
        }
      }

      // Fallback: look in first 20KB for maker name in product listing
      if (!brand) {
        const snippet = html.slice(0, 20000)
        for (const [ja, en] of Object.entries(BRAND_MAP)) {
          if (snippet.includes(ja)) { brand = en; break }
        }
      }
    }
  } catch {
    // Network error — prefix-based brand still returned below
  }

  return NextResponse.json({ imageUrl, brand })
}
