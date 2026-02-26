import { NextRequest, NextResponse } from 'next/server'

// GET /api/product-image?model=NA-VX900BL
// Searches Kakaku.com for a product image by model number.
// Returns { imageUrl: string | null }
export async function GET(req: NextRequest) {
  const model = req.nextUrl.searchParams.get('model')?.trim()
  if (!model || model.length < 3) return NextResponse.json({ imageUrl: null })

  try {
    // First try: search on Kakaku.com
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

      // Kakaku CDN image pattern (e.g. img1.kakaku.k-img.com/images/productimage/l/K0001234567.jpg)
      const match = html.match(
        /img1\.kakaku\.k-img\.com\/images\/productimage\/l\/[A-Z0-9]+\.jpg/i
      )
      if (match) {
        return NextResponse.json({ imageUrl: `https://${match[0]}` })
      }
    }

    // Second try: check our own products table for an existing image_url
    // (No DB call here — the caller already checks DB before calling this API)

    return NextResponse.json({ imageUrl: null })
  } catch {
    return NextResponse.json({ imageUrl: null })
  }
}
