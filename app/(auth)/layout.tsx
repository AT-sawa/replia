export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-[390px] min-h-screen bg-white mx-auto">
      {children}
    </div>
  )
}
