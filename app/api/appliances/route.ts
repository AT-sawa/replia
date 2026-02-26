import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAppliance(row: any) {
  const product = Array.isArray(row.products) ? row.products[0] : row.products
  const warrantyEndMs  = row.warranty_end  ? new Date(row.warranty_end).getTime()  : null
  const purchaseDateMs = row.purchase_date ? new Date(row.purchase_date).getTime() : null
  const warrantyMonths =
    warrantyEndMs && purchaseDateMs
      ? Math.round((warrantyEndMs - purchaseDateMs) / (30 * 24 * 60 * 60 * 1000))
      : (product?.default_warranty_months ?? 12)

  return {
    id:              row.id,
    appliance_type:  product?.product_name        ?? 'その他',
    brand:           product?.manufacturer_name   ?? '',
    model:           product?.model_number        ?? '',
    purchase_date:   row.purchase_date            ?? null,
    warranty_months: warrantyMonths,
    store_name:      row.purchase_store           ?? '',
    image_url:       product?.image_url           ?? null,
    created_at:      row.created_at,
  }
}

const PRODUCT_SELECT = `
  id,
  purchase_date,
  purchase_store,
  warranty_start,
  warranty_end,
  created_at,
  products (
    id,
    model_number,
    product_name,
    manufacturer_name,
    category,
    image_url,
    default_warranty_months
  )
`

// GET /api/appliances — list user's appliances
export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_products')
    .select(PRODUCT_SELECT)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appliances: (data ?? []).map(rowToAppliance) })
}

// POST /api/appliances — create new appliance
export async function POST(req: NextRequest) {
  // 1. Verify user via session client
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    appliance_type  = 'その他',
    brand           = '',
    model           = '',
    purchase_date   = null,
    warranty_months = 12,
    store_name      = '',
    image_url       = null,
  } = body

  // Use admin client for all DB writes (bypasses RLS)
  const admin = createAdminClient()

  // 2. Find existing product by model_number or create new
  let productId: string
  const trimmedModel = model?.trim() ?? ''

  if (trimmedModel) {
    const { data: existing } = await admin
      .from('products')
      .select('id')
      .eq('model_number', trimmedModel)
      .maybeSingle()

    if (existing) {
      productId = existing.id
    } else {
      const { data: newProd, error: pe } = await admin
        .from('products')
        .insert({
          model_number:            trimmedModel,
          product_name:            appliance_type,
          manufacturer_name:       brand,
          category:                appliance_type,
          image_url:               image_url,
          default_warranty_months: warranty_months,
        })
        .select('id')
        .single()
      if (pe || !newProd) return NextResponse.json({ error: pe?.message ?? 'product insert failed' }, { status: 500 })
      productId = newProd.id
    }
  } else {
    // No model → create unique product entry
    const { data: newProd, error: pe } = await admin
      .from('products')
      .insert({
        model_number:            `custom_${Date.now()}`,
        product_name:            appliance_type,
        manufacturer_name:       brand,
        category:                appliance_type,
        image_url:               image_url,
        default_warranty_months: warranty_months,
      })
      .select('id')
      .single()
    if (pe || !newProd) return NextResponse.json({ error: pe?.message ?? 'product insert failed' }, { status: 500 })
    productId = newProd.id
  }

  // 3. Calculate warranty_end
  let warrantyEnd: string | null = null
  if (purchase_date) {
    const end = new Date(purchase_date)
    end.setMonth(end.getMonth() + warranty_months)
    warrantyEnd = end.toISOString().split('T')[0]
  }

  // 4. Insert user_products
  const { data: up, error: upe } = await admin
    .from('user_products')
    .insert({
      user_id:        user.id,
      product_id:     productId,
      purchase_date:  purchase_date,
      purchase_store: store_name,
      warranty_start: purchase_date,
      warranty_end:   warrantyEnd,
    })
    .select(PRODUCT_SELECT)
    .single()

  if (upe || !up) return NextResponse.json({ error: upe?.message ?? 'user_product insert failed' }, { status: 500 })
  return NextResponse.json({ appliance: rowToAppliance(up) }, { status: 201 })
}
