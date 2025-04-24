"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Calendar, Search, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PaymentStatus } from "@/types/enums"
import { RegistrationData } from "@/types/admin"
import { AdminEventData } from "@/types/admin"
import { EventAnalytics } from "@/components/admin/EventAnalytics"

interface Props {
  initialRegistrations: RegistrationData[]
  initialEvents: AdminEventData[]
}

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

export default function AdminDashboard({ initialRegistrations, initialEvents }: Props) {
  const [registrations, setRegistrations] = useState<RegistrationData[]>(initialRegistrations || [])
  const [events, setEvents] = useState<AdminEventData[]>(initialEvents || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [eventFilter, setEventFilter] = useState("")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = searchQuery === "" || 
      registration.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registration.userName!.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesEvent = eventFilter === "" || 
      registration.eventName.toLowerCase().includes(eventFilter.toLowerCase())
    
    return matchesSearch && matchesEvent
  })

  const filteredEvents = events.filter(event => {
    return eventFilter === "" || 
      event.title.toLowerCase().includes(eventFilter.toLowerCase()) ||
      event.category.toLowerCase().includes(eventFilter.toLowerCase())
  })

  const stats = {
    totalRegistrations: filteredRegistrations.length || 0,
    pendingPayments: filteredRegistrations.filter(r => r.paymentStatus === PaymentStatus.UNPAID).length || 0,
    activeEvents: filteredEvents.filter(e => e.status === "OPEN").length || 0,
  }

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoadingAnalytics(true)
        const response = await fetch('/api/admin/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        toast.error("Failed to load analytics data")
      } finally {
        setIsLoadingAnalytics(false)
      }
    }

    fetchAnalytics()
  }, [])

  const handleUpdatePayment = async (registrationId: string) => {
    try {
      setIsUpdating(registrationId)
      const response = await fetch('/api/admin/update-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          registrationId, 
          paymentStatus: PaymentStatus.PAID 
        }),
      })

      if (!response.ok) throw new Error('Failed to update payment')
      
      toast.success("Payment status updated successfully")
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, paymentStatus: PaymentStatus.PAID, status: "CONFIRMED" } 
            : reg
        )
      )
    } catch (error) {
      toast.error("Failed to update payment status")
      console.error(error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteRegistration = async (registrationId: string) => {
    try {
      setIsDeleting(registrationId)
      const response = await fetch(`/api/admin/delete-registration/${registrationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete registration')

      toast.success("Registration deleted successfully")
      setRegistrations(prev => prev.filter(reg => reg.id !== registrationId))
    } catch (error) {
      toast.error("Failed to delete registration")
      console.error(error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleToggleEventStatus = async (eventId: string) => {
    try {
      setIsTogglingStatus(eventId)
      const response = await fetch(`/api/admin/toggle-event-status/${eventId}`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to update event status')

      toast.success("Event status updated successfully")
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, status: event.status === "OPEN" ? "CLOSED" : "OPEN" } 
            : event
        )
      )
    } catch (error) {
      toast.error("Failed to update event status")
      console.error(error)
    } finally {
      setIsTogglingStatus(null)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage event registrations and payment statuses</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            ) : analyticsData ? (
              <EventAnalytics data={analyticsData} />
            ) : null}
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Registrations</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/registrations">View All</Link>
                </Button>
              </div>
              
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by registration ID or user name..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by event..."
                    className="pl-8"
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                  />
                </div>
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
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((registration) => (
                        <tr key={registration.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">{registration.userName}</td>
                          <td className="p-4 align-middle">{registration.eventName}</td>
                          <td className="p-4 align-middle">
                            {new Date(registration.date).toLocaleDateString()}
                          </td>
                          <td className="p-4 align-middle">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                registration.paymentStatus === PaymentStatus.PAID
                                  ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                  : "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
                              }`}
                            >
                              {registration.status}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-2">
                              {registration.paymentStatus !== PaymentStatus.PAID && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdatePayment(registration.id)}
                                  disabled={isUpdating === registration.id}
                                >
                                  {isUpdating === registration.id ? "Updating..." : "Mark as Paid"}
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteRegistration(registration.id)}
                                disabled={isDeleting === registration.id}
                              >
                                {isDeleting === registration.id ? "Deleting..." : "Delete"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredRegistrations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                            {searchQuery || eventFilter 
                              ? "No matching registrations found" 
                              : "No registrations found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Events</h2>
                <Button asChild variant="default" size="sm">
                  <Link href="/admin/events/new">Create Event</Link>
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-8"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.description}
                          </CardDescription>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            event.status === "OPEN"
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {event.category}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {event.location}
                        </div>
                        <div>
                          <span className="font-medium">Registrations:</span>{" "}
                          {event.registrationCount} / {event.capacity}
                          {event.registrationCount >= event.capacity && (
                            <span className="ml-2 text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" /> Full
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-6 pt-0 flex gap-3">
                      <Button
                        variant={event.status === "OPEN" ? "destructive" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleEventStatus(event.id)}
                        disabled={isTogglingStatus === event.id}
                      >
                        {isTogglingStatus === event.id 
                          ? "Updating..." 
                          : event.status === "OPEN" 
                            ? "Delete Event" 
                            : "Open Registration"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="col-span-full text-center p-8 text-muted-foreground">
                    {eventFilter ? "No matching events found" : "No events found"}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}