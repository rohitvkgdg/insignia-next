import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, DollarSign, BarChart3 } from "lucide-react"

export default async function AdminDashboard() {
  const session = await getServerSession()

  if (!session?.user || session.user.role !== "admin") {
    redirect("/")
  }

  // This would normally come from a database
  const stats = {
    totalEvents: 12,
    totalUsers: 450,
    totalRegistrations: 850,
    pendingPayments: 120,
  }

  const recentRegistrations = [
    {
      id: "1",
      userName: "John Doe",
      eventName: "Tech Symposium 2023",
      date: "2023-10-10",
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
    {
      id: "2",
      userName: "Jane Smith",
      eventName: "Cultural Night",
      date: "2023-10-08",
      status: "PENDING",
      paymentStatus: "UNPAID",
    },
    {
      id: "3",
      userName: "Bob Johnson",
      eventName: "Robotics Workshop",
      date: "2023-10-05",
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
    {
      id: "4",
      userName: "Alice Brown",
      eventName: "Hackathon 2023",
      date: "2023-10-03",
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
    {
      id: "5",
      userName: "Charlie Wilson",
      eventName: "Dance Competition",
      date: "2023-10-01",
      status: "PENDING",
      paymentStatus: "UNPAID",
    },
  ]

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage events, users, and registrations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">+2 added this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+18 registered this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">+42 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">₹60,000 pending</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="registrations">
            <TabsList>
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="registrations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Registrations</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/registrations">View All</Link>
                </Button>
              </div>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 transition-colors">
                        <th className="h-12 px-4 text-left align-middle font-medium">User</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Event</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Payment</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRegistrations.map((registration) => (
                        <tr key={registration.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">{registration.userName}</td>
                          <td className="p-4 align-middle">{registration.eventName}</td>
                          <td className="p-4 align-middle">{registration.date}</td>
                          <td className="p-4 align-middle">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                registration.status === "CONFIRMED"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                              }`}
                            >
                              {registration.status}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                registration.paymentStatus === "PAID"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                              }`}
                            >
                              {registration.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="events" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Manage Events</h2>
                <Button asChild>
                  <Link href="/admin/events/new">Create Event</Link>
                </Button>
              </div>
              <div className="rounded-md border">
                <div className="p-4 text-center text-muted-foreground">
                  <Link href="/admin/events" className="underline">
                    View all events
                  </Link>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Manage Users</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/users">View All</Link>
                </Button>
              </div>
              <div className="rounded-md border">
                <div className="p-4 text-center text-muted-foreground">
                  <Link href="/admin/users" className="underline">
                    View all users
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
