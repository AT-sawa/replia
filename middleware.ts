import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase環境変数が未設定の場合はミドルウェアをスキップ
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
    const isApiRoute  = pathname.startsWith('/api')
    const isCallback  = pathname.startsWith('/auth/callback')

    // 未ログイン → ログインページへリダイレクト
    if (!user && !isAuthRoute && !isApiRoute && !isCallback) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ログイン済みで認証ページ → ホームへリダイレクト
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (e) {
    // Supabase接続エラー時はスキップして通常レスポンスを返す
    console.error('Middleware Supabase error:', e)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
