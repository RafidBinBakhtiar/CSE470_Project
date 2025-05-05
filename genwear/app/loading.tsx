import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header (simplified) */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block h-10 w-64 bg-gray-200 rounded-md animate-pulse"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-teal-400 py-8">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="h-8 w-48 bg-teal-300 rounded-md animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-teal-300 rounded-md animate-pulse"></div>
            <div className="h-4 w-4 bg-teal-300 rounded-md animate-pulse"></div>
            <div className="h-4 w-32 bg-teal-300 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
        <h2 className="text-xl font-semibold text-teal-600 mb-2">Loading Products</h2>
        <p className="text-gray-500">Please wait while we fetch the latest products for you</p>
      </div>

      {/* Skeleton Product Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-gray-50 p-4 rounded-lg h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              </div>

              {/* Filter Sections */}
              {[1, 2, 3].map((section) => (
                <div key={section} className="mt-6">
                  <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse mb-3"></div>
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-4 bg-gray-200 rounded-sm animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="mt-6">
                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="flex-1">
            {/* Controls Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-md animate-pulse"></div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map((tab) => (
                <div key={tab} className="h-10 w-28 bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((product) => (
                <div key={product} className="bg-white rounded-lg overflow-hidden border animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 w-full bg-gray-200 rounded-md mb-2"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-md mb-2"></div>
                    <div className="flex items-center mt-2">
                      <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
