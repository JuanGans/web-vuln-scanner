import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700 animate-pulse" />
            <div className="w-48 h-8 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="w-24 h-10 bg-gray-700 rounded animate-pulse" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="w-32 h-10 bg-gray-700 rounded animate-pulse mb-4" />
          <div className="w-48 h-6 bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Search Bar Skeleton */}
        <Card className="bg-card border-border p-6 mb-8">
          <div className="h-10 bg-gray-700 rounded animate-pulse" />
        </Card>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border p-6">
              <div className="space-y-4">
                <div className="w-full h-6 bg-gray-700 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse" />
                <div className="grid grid-cols-3 gap-4 py-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-12 bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
