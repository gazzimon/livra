import './globals.css'
import NavBar from '@/components/NavBar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
