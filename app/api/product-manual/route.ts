import { NextRequest, NextResponse } from 'next/server'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// GET /api/product-manual?model=NA-VX900BL
// Searches Kakaku for the model, then tries to find a manual PDF or manufacturer support page
export async function GET(req: NextRequest) {
  const model = req.nextUrl.searchParams.get('model')?.trim()
  if (!model || model.length < 3) return NextResponse.json({ manualUrl: null })

  try {
    // Step 1: Search Kakaku to get itemId
    const searchRes = await fetch(
      `https://kakaku.com/search_results/?keyword=${encodeURIComponent(model)}`,
      { headers: { 'User-Agent': UA }, next: { revalidate: 0 } }
    )
    if (!searchRes.ok) return NextResponse.json({ manualUrl: null })
    const searchHtml = await searchRes.text()

    // Extract Kakaku itemId from image URL pattern
    const imgMatch = searchHtml.match(
      /img1\.kakaku\.k-img\.com\/images\/productimage\/[a-z]+\/([A-Za-z0-9]+)\.jpg/i
    )
    const itemId = imgMatch?.[1]
    if (!itemId) return NextResponse.json({ manualUrl: null })

    // Step 2: Fetch Kakaku spec page — often contains PDF download links
    const specRes = await fetch(
      `https://kakaku.com/item/${itemId}/spec/`,
      { headers: { 'User-Agent': UA }, next: { revalidate: 0 } }
    )
    if (specRes.ok) {
      const specHtml = await specRes.text()
      const pdfMatch = specHtml.match(/href="(https?:\/\/[^"]+\.pdf)"/i)
      if (pdfMatch) return NextResponse.json({ manualUrl: pdfMatch[1] })
    }

    // Step 3: Fetch main Kakaku product page — check for PDF or manufacturer manual links
    const itemRes = await fetch(
      `https://kakaku.com/item/${itemId}/`,
      { headers: { 'User-Agent': UA }, next: { revalidate: 0 } }
    )
    if (!itemRes.ok) return NextResponse.json({ manualUrl: null })
    const itemHtml = await itemRes.text()

    // PDF on main item page
    const pdfMatch = itemHtml.match(/href="(https?:\/\/[^"]+\.pdf)"/i)
    if (pdfMatch) return NextResponse.json({ manualUrl: pdfMatch[1] })

    // Manufacturer manual/support page links (by domain)
    const mfrPatterns: RegExp[] = [
      /href="(https?:\/\/panasonic\.net[^"]+(?:manual|support|download|manualspc)[^"]*)"/i,
      /href="(https?:\/\/www2?\.panasonic\.jp[^"]+(?:manual|support|download)[^"]*)"/i,
      /href="(https?:\/\/jp\.sharp[^"]+(?:manual|support|download)[^"]*)"/i,
      /href="(https?:\/\/www\.sharp\.co\.jp[^"]+(?:manual|support|download)[^"]*)"/i,
      /href="(https?:\/\/kadenfan\.hitachi\.co\.jp[^"]+(?:manual|support)[^"]*)"/i,
      /href="(https?:\/\/www\.hitachi-ap\.co\.jp[^"]+(?:manual|support)[^"]*)"/i,
      /href="(https?:\/\/www\.toshiba-lifestyle\.com[^"]+(?:manual|support|download)[^"]*)"/i,
      /href="(https?:\/\/www\.toshiba\.co\.jp[^"]+(?:manual|support|download)[^"]*)"/i,
      /href="(https?:\/\/www\.mitsubishielectric\.co\.jp[^"]+(?:manual|support|download)[^"]*)"/i,
      /href="(https?:\/\/www\.daikin\.co\.jp[^"]+(?:manual|support|download)[^"]*)"/i,
      /href="(https?:\/\/www\.sony\.jp[^"]+(?:manual|support|download)[^"]*)"/i,
      /href="(https?:\/\/www\.fujitsu-general\.com[^"]+(?:manual|support|download)[^"]*)"/i,
    ]
    for (const pattern of mfrPatterns) {
      const match = itemHtml.match(pattern)
      if (match) return NextResponse.json({ manualUrl: match[1] })
    }

    return NextResponse.json({ manualUrl: null })
  } catch {
    return NextResponse.json({ manualUrl: null })
  }
}
