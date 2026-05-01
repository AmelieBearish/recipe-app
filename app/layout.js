import './globals.css'

export const metadata = {
  title: 'レシピアプリ',
  description: '家族・友人とレシピを共有しよう',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <a href="/" className="text-2xl font-bold text-orange-500">🍳 みんなのレシピ</a>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
