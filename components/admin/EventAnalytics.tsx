import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface AnalyticsData {
  byCategory: {
    category: string
    total: number
    paid: number
    unpaid: number
    revenue: number
  }[]
  trends: {
    date: string
    count: number
  }[]
  topEvents: {
    eventId: string
    title: string
    category: string
    registrations: number
    revenue: number
  }[]
}

interface EventAnalyticsProps {
  data: AnalyticsData
}

function customTooltipFormatter(value: number, name: string) {
  if (name.toLowerCase().includes('revenue')) {
    return formatCurrency(value)
  }
  return value.toLocaleString()
}

export function EventAnalytics({ data }: EventAnalyticsProps) {
  // Calculate totals correctly by summing actual numbers
  const totalRevenue = Number(data.byCategory.reduce((sum, cat) => sum + (cat.revenue || 0), 0))
  const totalRegistrations = Number(data.byCategory.reduce((sum, cat) => sum + (cat.total || 0), 0))
  const totalPaid = Number(data.byCategory.reduce((sum, cat) => sum + (cat.paid || 0), 0))

  const pieChartData = data.byCategory.map(cat => ({
    name: cat.category,
    value: cat.total
  }))

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRegistrations ? Math.round((totalPaid / totalRegistrations) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
          <CardDescription>Events with highest registrations and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Registrations</th>
                  <th className="px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topEvents.map((event) => (
                  <tr key={event.eventId} className="border-b">
                    <td className="px-6 py-4 font-medium">{event.title}</td>
                    <td className="px-6 py-4">{event.category}</td>
                    <td className="px-6 py-4">{event.registrations}</td>
                    <td className="px-6 py-4">{formatCurrency(event.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}