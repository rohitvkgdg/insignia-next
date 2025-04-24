import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, LineChart, PieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
  const totalRevenue = data.byCategory.reduce((sum, cat) => sum + cat.revenue, 0)
  const totalRegistrations = data.byCategory.reduce((sum, cat) => sum + cat.total, 0)
  const totalPaid = data.byCategory.reduce((sum, cat) => sum + cat.paid, 0)

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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Daily registration activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{
              count: {
                label: "Registrations",
                theme: {
                  light: "var(--chart-1)",
                  dark: "var(--chart-1)"
                }
              }
            }}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--chart-1)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Registrations by event category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{
              value: {
                label: "Registrations",
                theme: {
                  light: "var(--chart-2)",
                  dark: "var(--chart-2)"
                }
              }
            }}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="var(--chart-2)"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Analysis</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <ChartContainer className="min-h-[400px]" config={{
              total: {
                label: "Total",
                theme: {
                  light: "var(--chart-1)",
                  dark: "var(--chart-1)"
                }
              },
              paid: {
                label: "Paid",
                theme: {
                  light: "var(--chart-3)",
                  dark: "var(--chart-3)"
                }
              },
              unpaid: {
                label: "Unpaid",
                theme: {
                  light: "var(--chart-4)",
                  dark: "var(--chart-4)"
                }
              },
              revenue: {
                label: "Revenue",
                theme: {
                  light: "var(--chart-5)",
                  dark: "var(--chart-5)"
                }
              }
            }}>
              <BarChart data={data.byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="category" width={100} />
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
                <Bar dataKey="total" name="Total Registrations" fill="var(--chart-1)" />
                <Bar dataKey="paid" name="Paid" fill="var(--chart-3)" />
                <Bar dataKey="unpaid" name="Unpaid" fill="var(--chart-4)" />
              </BarChart>
            </ChartContainer>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

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