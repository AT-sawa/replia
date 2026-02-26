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
    id:                row.id,
    appliance_type:    product?.product_name        ?? 'その他',
    brand:             product?.manufacturer_name   ?? '',
    model:             product?.model_number        ?? '',
    purchase_date:     row.purchase_date            ?? null,
    warranty_months:   warrantyMonths,
    store_name:        row.purchase_store           ?? '',
    image_url:         product?.image_url           ?? null,
    created_at:        row.created_at,
    receipt_photo_url: row.receipt_photo_url        ?? null,
    warranty_photo_url:row.warranty_photo_url       ?? null,
    manual_url:        row.manual_url               ?? null,
  }
}

// notes は別クエリで取得（カラム未追加でも安全にfallback）
async function fetchNotes(admin: ReturnType<typeof createAdminClient>, id: string, userId: string): Promise<string | null> {
  try {
    const { data, error } = await admin
      .from('user_products')
      .select('notes')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (error) return null
    return (data as { notes?: string | null })?.notes ?? null
  } catch {
    return null
  }
}

const PRODUCT_SELECT = `
  id,
  purchase_date,
  purchase_store,
  warranty_start,
  warranty_end,
  receipt_photo_url,
  warranty_photo_url,
  manual_url,
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

// GET /api/appliances/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // 主要データ取得（notesは含まない — カラム未追加でも安全）
  const { data, error } = await admin
    .from('user_products')
    .select(PRODUCT_SELECT)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // notes は別クエリ（カラムがなければ null が返るだけ）
  const notes = await fetchNotes(admin, params.id, user.id)

  return NextResponse.json({ appliance: { ...rowToAppliance(data), notes } })
}

// PATCH /api/appliances/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Get current record to find product_id
  const { data: current, error: ce } = await admin
    .from('user_products')
    .select('product_id, purchase_date, warranty_end')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (ce || !current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { appliance_type, brand, model, purchase_date, warranty_months, store_name, image_url,
          receipt_photo_url, warranty_photo_url, manual_url, notes } = body

  // Update products master table
  if (current.product_id) {
    const productUpdates: Record<string, unknown> = {}
    if (appliance_type !== undefined) {
      productUpdates.product_name = appliance_type
      productUpdates.category     = appliance_type
    }
    if (brand           !== undefined) productUpdates.manufacturer_name      = brand
    if (model           !== undefined) productUpdates.model_number            = model || 'カスタム'
    if (image_url       !== undefined) productUpdates.image_url               = image_url
    if (warranty_months !== undefined) productUpdates.default_warranty_months = warranty_months

    if (Object.keys(productUpdates).length > 0) {
      await admin.from('products').update(productUpdates).eq('id', current.product_id)
    }
  }

  // notes は別クエリで更新（カラム未追加ならエラーを無視）
  if (notes !== undefined) {
    await admin
      .from('user_products')
      .update({ notes })
      .eq('id', params.id)
      .eq('user_id', user.id)
    // エラーが返っても無視（カラム未追加の場合は保存できないだけ）
  }

  // Build user_products update（notes は除く）
  const userProductUpdates: Record<string, unknown> = {}
  const resolvedPurchaseDate   = purchase_date !== undefined ? (purchase_date || null) : current.purchase_date
  const resolvedWarrantyMonths = warranty_months ?? 12

  if (purchase_date !== undefined) {
    userProductUpdates.purchase_date  = purchase_date || null
    userProductUpdates.warranty_start = purchase_date || null
  }
  if (store_name          !== undefined) userProductUpdates.purchase_store     = store_name
  if (receipt_photo_url  !== undefined) userProductUpdates.receipt_photo_url  = receipt_photo_url
  if (warranty_photo_url !== undefined) userProductUpdates.warranty_photo_url = warranty_photo_url
  if (manual_url         !== undefined) userProductUpdates.manual_url         = manual_url

  if ((purchase_date !== undefined || warranty_months !== undefined) && resolvedPurchaseDate) {
    const end = new Date(resolvedPurchaseDate)
    end.setMonth(end.getMonth() + resolvedWarrantyMonths)
    userProductUpdates.warranty_end = end.toISOString().split('T')[0]
  }

  // If nothing in user_products changed, just fetch and return
  if (Object.keys(userProductUpdates).length === 0) {
    const { data: cur } = await admin
      .from('user_products')
      .select(PRODUCT_SELECT)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    const currentNotes = await fetchNotes(admin, params.id, user.id)
    return NextResponse.json({ appliance: { ...rowToAppliance(cur), notes: currentNotes } })
  }

  const { data: updated, error } = await admin
    .from('user_products')
    .update(userProductUpdates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select(PRODUCT_SELECT)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const updatedNotes = await fetchNotes(admin, params.id, user.id)
  return NextResponse.json({ appliance: { ...rowToAppliance(updated), notes: updatedNotes } })
}

// DELETE /api/appliances/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('user_products')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
