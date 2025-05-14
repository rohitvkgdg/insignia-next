import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function customTooltipFormatter(value: number, name: string) {
  if (name.toLowerCase().includes('revenue')) {
    return formatCurrency(value)
  }
  return value.toLocaleString()
}

export function EventAnalytics({ data }: EventAnalyticsProps) {
  const totalRevenue = data.byCategory.reduce((sum, cat) => sum + (cat.revenue || 0), 0)
  const totalRegistrations = data.byCategory.reduce((sum, cat) => sum + (cat.total || 0), 0)
  const totalPaid = data.byCategory.reduce((sum, cat) => sum + (cat.paid || 0), 0)

  const pieChartData = data.byCategory.map(cat => ({
    name: cat.category,
    value: cat.total
  }))

  const barChartData = data.byCategory.map(cat => ({
    name: cat.category,
    Revenue: cat.revenue,
    Paid: cat.paid,
    Unpaid: cat.unpaid
  }))

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
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

      {/* Category-wise Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registration Distribution</CardTitle>
            <CardDescription>Registration breakdown by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={customTooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Revenue and registration status by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={customTooltipFormatter} />
                <Bar yAxisId="left" dataKey="Revenue" fill="#0088FE" />
                <Bar yAxisId="right" dataKey="Paid" fill="#00C49F" />
                <Bar yAxisId="right" dataKey="Unpaid" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Total Registrations</th>
                  <th className="px-6 py-3">Paid</th>
                  <th className="px-6 py-3">Unpaid</th>
                  <th className="px-6 py-3">Revenue</th>
                  <th className="px-6 py-3">Payment Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.byCategory.map((category) => (
                  <tr key={category.category} className="border-b">
                    <td className="px-6 py-4 font-medium">{category.category}</td>
                    <td className="px-6 py-4">{category.total}</td>
                    <td className="px-6 py-4">{category.paid}</td>
                    <td className="px-6 py-4">{category.unpaid}</td>
                    <td className="px-6 py-4">{formatCurrency(category.revenue)}</td>
                    <td className="px-6 py-4">
                      {category.total ? Math.round((category.paid / category.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Events Table */}
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