import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
        <p className="mt-2 text-gray-600">Loading</p>
      </div>
    </div>
  )
}
