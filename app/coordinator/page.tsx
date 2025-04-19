import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, DollarSign } from "lucide-react"

export default async function CoordinatorDashboard() {
  const session = await getServerSession()

  if (!session?.user || session.user.role !== "COORDINATOR") {
    redirect("/")
  }

  // This would normally come from a database
  const stats = {
    assignedEvents: 3,
    totalRegistrations: 120,
    pendingPayments: 45,
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
  ]

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage event registrations and payment statuses</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="registrations">
            <TabsList>
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
              <TabsTrigger value="events">My Events</TabsTrigger>
            </TabsList>
            <TabsContent value="registrations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Registrations</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/coordinator/registrations">View All</Link>
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
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Update Payment
                              </Button>
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            </div>
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
                <h2 className="text-xl font-bold">My Events</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Tech Symposium 2023</CardTitle>
                    <CardDescription>October 15, 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Registrations:</span>
                        <span>75 / 500</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pending Payments:</span>
                        <span>25</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href="/coordinator/events/1">Manage Event</Link>
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Cultural Night</CardTitle>
                    <CardDescription>October 20, 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Registrations:</span>
                        <span>30 / 1000</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pending Payments:</span>
                        <span>15</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href="/coordinator/events/2">Manage Event</Link>
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Robotics Workshop</CardTitle>
                    <CardDescription>October 25, 2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Registrations:</span>
                        <span>15 / 100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pending Payments:</span>
                        <span>5</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href="/coordinator/events/3">Manage Event</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
