export const dynamic = 'force-dynamic'

import { Suspense } from "react"
import AdminWrapper from "./wrapper"
import { Card } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="container py-10">
        <Card className="p-6">
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </Card>
      </div>
    }>
      <AdminWrapper />
    </Suspense>
  )
}
