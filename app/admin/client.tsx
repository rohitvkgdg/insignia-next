"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Calendar, Search, AlertCircle, ArrowUpDown, FileText, Phone, HelpCircle, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PaymentStatus } from "@/types/enums"
import { RegistrationData, AdminEventData } from "@/app/actions/admin"
import { EventAnalytics } from "@/components/admin/EventAnalytics"
import { Pagination } from "@/components/ui/pagination"
import { useDebounce } from "@/hooks/useDebounce"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

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

interface Metadata {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminDashboard({ initialRegistrations, initialEvents }: Props) {
  // Registrations state
  const [registrations, setRegistrations] = useState<RegistrationData[]>(initialRegistrations || [])
  const [registrationSearch, setRegistrationSearch] = useState("")
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<string | null>(null)
  const [isDeletingRegistration, setIsDeletingRegistration] = useState<string | null>(null)
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)
  const [registrationsMetadata, setRegistrationsMetadata] = useState<Metadata>({
    total: initialRegistrations?.length || 0,
    page: 1,
    limit: 10,
    totalPages: Math.ceil((initialRegistrations?.length || 0) / 10)
  })
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null)
  const [regSortBy, setRegSortBy] = useState<string>('createdAt')
  const [regSortOrder, setRegSortOrder] = useState<'asc' | 'desc'>('desc')

  // Events state
  const [events, setEvents] = useState<AdminEventData[]>(initialEvents || [])
  const [eventSearch, setEventSearch] = useState("")
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isDeletingEvent, setIsDeletingEvent] = useState<string | null>(null)
  const [eventsMetadata, setEventsMetadata] = useState<Metadata>({
    total: initialEvents?.length || 0,
    page: 1,
    limit: 12,
    totalPages: Math.ceil((initialEvents?.length || 0) / 12)
  })
  const [eventSortBy, setEventSortBy] = useState<string>('date')
  const [eventSortOrder, setEventSortOrder] = useState<'asc' | 'desc'>('desc')

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  // Debounced search values for API calls
  const debouncedRegistrationSearch = useDebounce(registrationSearch, 300)
  const debouncedEventSearch = useDebounce(eventSearch, 300)

  // Fetch registrations with search and pagination
  const fetchRegistrations = useCallback(async (
    page: number = registrationsMetadata.page,
    search: string = debouncedRegistrationSearch,
    sortBy: string = regSortBy,
    sortOrder: 'asc' | 'desc' = regSortOrder
  ) => {
    try {
      setIsLoadingRegistrations(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: registrationsMetadata.limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search })
      })
      
      const response = await fetch(`/api/admin/registrations?${queryParams}`)
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 404) {
          // Handle no results found
          setRegistrations([])
          setRegistrationsMetadata({ total: 0, page: 1, limit: registrationsMetadata.limit, totalPages: 0 })
          return
        }
        throw new Error(data.error || 'Failed to fetch registrations')
      }

      setRegistrations(data.data || [])
      setRegistrationsMetadata(data.metadata || { total: 0, page: 1, limit: registrationsMetadata.limit, totalPages: 0 })
    } catch (error) {
      console.error('Registration fetch error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to load registrations. Please try again.")
    } finally {
      setIsLoadingRegistrations(false)
    }
  }, [debouncedRegistrationSearch, registrationsMetadata.limit, regSortBy, regSortOrder])

  // Fetch events with search and pagination
  const fetchEvents = useCallback(async (
    page: number = eventsMetadata.page,
    search: string = debouncedEventSearch,
    sortBy: string = eventSortBy,
    sortOrder: 'asc' | 'desc' = eventSortOrder
  ) => {
    try {
      setIsLoadingEvents(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: eventsMetadata.limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search })
      })
      
      const response = await fetch(`/api/admin/events?${queryParams}`)
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 404) {
          // Handle no results found
          setEvents([])
          setEventsMetadata({ total: 0, page: 1, limit: eventsMetadata.limit, totalPages: 0 })
          return
        }
        throw new Error(data.error || 'Failed to fetch events')
      }

      setEvents(data.data || [])
      setEventsMetadata(data.metadata || { total: 0, page: 1, limit: eventsMetadata.limit, totalPages: 0 })
    } catch (error) {
      console.error('Event fetch error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to load events. Please try again.")
    } finally {
      setIsLoadingEvents(false)
    }
  }, [debouncedEventSearch, eventsMetadata.limit, eventSortBy, eventSortOrder])

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoadingAnalytics(true)
        const response = await fetch('/api/admin/analytics')
        if (!response.ok) throw new Error('Failed to fetch analytics')
        
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

  // Fetch registrations when search changes
  useEffect(() => {
    fetchRegistrations(1)
  }, [debouncedRegistrationSearch, regSortBy, regSortOrder, fetchRegistrations])

  // Fetch events when search changes
  useEffect(() => {
    fetchEvents(1)
  }, [debouncedEventSearch, eventSortBy, eventSortOrder, fetchEvents])

  // Update payment status for a registration
  const handleUpdatePayment = async (registrationId: string) => {
    try {
      setIsUpdatingPayment(registrationId)
      const response = await fetch('/api/admin/update-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: registrationId,
          paymentStatus: PaymentStatus.PAID 
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update payment')
      }
      
      toast.success("Payment status updated successfully")
      
      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId
            ? { ...reg, paymentStatus: PaymentStatus.PAID, status: "CONFIRMED" } 
            : reg
        )
      )
      
      // Refresh analytics after payment status update
      const analyticsResponse = await fetch('/api/admin/analytics')
      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update payment status")
      console.error(error)
    } finally {
      setIsUpdatingPayment(null)
    }
  }

  // Delete a registration
  const handleDeleteRegistration = async (registrationId: string) => {
    try {
      setIsDeletingRegistration(registrationId)
      const response = await fetch(`/api/admin/delete-registration/${registrationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete registration')

      toast.success("Registration deleted successfully")
      
      // Update local state
      setRegistrations(prev => prev.filter(reg => reg.id !== registrationId))
      setRegistrationsMetadata(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit)
      }))
      
      // Refresh analytics after deletion
      const analyticsResponse = await fetch('/api/admin/analytics')
      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      toast.error("Failed to delete registration")
      console.error(error)
    } finally {
      setIsDeletingRegistration(null)
    }
  }

  // Set event to delete (shows confirmation dialog)
  const handleInitiateEventDelete = (eventId: string) => {
    setEventToDelete(eventId)
  }

  // Handle confirmed event deletion
  const handleConfirmEventDelete = async () => {
    if (!eventToDelete) return

    try {
      setIsDeletingEvent(eventToDelete)
      const response = await fetch(`/api/admin/events/${eventToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete event')

      toast.success("Event deleted successfully")
      
      // Update local state
      setEvents(prev => prev.filter(event => event.id !== eventToDelete))
      setEventsMetadata(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit)
      }))
      
      // Refresh analytics after deletion
      const analyticsResponse = await fetch('/api/admin/analytics')
      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      toast.error("Failed to delete event")
      console.error(error)
    } finally {
      setIsDeletingEvent(null)
      setEventToDelete(null)
    }
  }

  // Handle registration sorting
  const toggleRegistrationSort = (column: string) => {
    if (regSortBy === column) {
      setRegSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setRegSortBy(column)
      setRegSortOrder('desc')
    }
  }

  // Handle event sorting
  const toggleEventSort = (column: string) => {
    if (eventSortBy === column) {
      setEventSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setEventSortBy(column)
      setEventSortOrder('desc')
    }
  }

  // Download registrations for an event
  const handleDownloadRegistrations = async (eventId: string, eventTitle: string) => {
    try {
      const response = await fetch(`/api/admin/download-registrations?eventId=${eventId}`)
      
      if (!response.ok) {
        throw new Error('Failed to download registrations')
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Create object URL
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `${eventTitle}_registrations.xlsx`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      toast.error("Failed to download registrations")
    }
  }

  // Download all registrations
  const handleDownloadAllRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/download-all-registrations')
      
      if (!response.ok) {
        throw new Error('Failed to download registrations')
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Create object URL
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `all_registrations.xlsx`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      toast.error("Failed to download registrations")
    }
  }

  // Download unpaid registrations
  const handleDownloadUnpaidRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/download-unpaid-registrations')
      
      if (!response.ok) {
        throw new Error('Failed to download unpaid registrations')
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Create object URL
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `unpaid_registrations.xlsx`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      toast.error("Failed to download unpaid registrations")
    }
  }

  return (
    <div className="container py-10">

      {/* Delete Event Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and all associated registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmEventDelete} 
              disabled={!!isDeletingEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingEvent ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Registration Details Dialog */}
      <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Detailed information about this registration
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Event</h3>
                  <p className="font-medium">{selectedRegistration.eventName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                  <p>{new Date(selectedRegistration.date).toLocaleDateString()} at {selectedRegistration.time}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p>{selectedRegistration.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant={selectedRegistration.paymentStatus === PaymentStatus.PAID ? "default" : "secondary"}>
                    {selectedRegistration.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fee</h3>
                  <p>₹{selectedRegistration.eventFee}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Team Size</h3>
                  <p>{selectedRegistration.teamSize} {selectedRegistration.teamSize === 1 ? 'person' : 'people'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Participant Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{selectedRegistration.userName}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedRegistration.userUSN || 'No USN provided'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedRegistration.userPhone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                {selectedRegistration.paymentStatus !== PaymentStatus.PAID && (
                  <Button
                    variant="default"
                    onClick={() => {
                      handleUpdatePayment(selectedRegistration.id)
                      setSelectedRegistration(null)
                    }}
                    disabled={!!isUpdatingPayment}
                  >
                    {isUpdatingPayment === selectedRegistration.id ? "Updating..." : "Mark as Paid"}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteRegistration(selectedRegistration.id)
                    setSelectedRegistration(null)
                  }}
                  disabled={!!isDeletingRegistration}
                >
                  {isDeletingRegistration === selectedRegistration.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col mt-36 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage events, registrations, and track analytics</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="w-fit justify-end" onClick={handleDownloadAllRegistrations}>
            <Download className="h-4 w-4 mr-2" />
            Download Paid Registrations
          </Button>
          <Button variant="outline" className="w-fit justify-end" onClick={handleDownloadUnpaidRegistrations}>
            <Download className="h-4 w-4 mr-2" />
            Download Unpaid Registrations
          </Button>
        </div>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Analytics Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading analytics...</p>
                </div>
              </div>
            ) : analyticsData ? (
              <EventAnalytics data={analyticsData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 gap-2">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
                <p className="text-xl">No analytics data available</p>
                <p className="text-muted-foreground">Try adding some events and registrations first</p>
              </div>
            )}
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">All Registrations</h2>
                <div className="flex items-center gap-2">
                  <Select
                    value={registrationsMetadata.limit.toString()}
                    onValueChange={(value) => {
                      setRegistrationsMetadata(prev => ({
                        ...prev,
                        limit: parseInt(value),
                        page: 1
                      }))
                      fetchRegistrations(1, debouncedRegistrationSearch, regSortBy, regSortOrder)
                    }}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="10 per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, user name, or event..."
                    className="pl-8"
                    value={registrationSearch}
                    onChange={(e) => setRegistrationSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => toggleRegistrationSort('registrationId')}
                      >
                        <div className="flex items-center gap-1">
                          Registration ID
                          {regSortBy === 'registrationId' && (
                            <ArrowUpDown className={`h-4 w-4 ${regSortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => toggleRegistrationSort('userName')}
                      >
                        <div className="flex items-center gap-1">
                          User
                          {regSortBy === 'userName' && (
                            <ArrowUpDown className={`h-4 w-4 ${regSortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => toggleRegistrationSort('eventName')}
                      >
                        <div className="flex items-center gap-1">
                          Event
                          {regSortBy === 'eventName' && (
                            <ArrowUpDown className={`h-4 w-4 ${regSortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => toggleRegistrationSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          {regSortBy === 'date' && (
                            <ArrowUpDown className={`h-4 w-4 ${regSortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => toggleRegistrationSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {regSortBy === 'status' && (
                            <ArrowUpDown className={`h-4 w-4 ${regSortOrder === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingRegistrations ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex justify-center items-center">
                            <Calendar className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading registrations...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : registrations.length > 0 ? (
                      registrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-mono text-xs">
                            {registration.registrationId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {registration.userName || "Unknown User"}
                          </TableCell>
                          <TableCell>{registration.eventName}</TableCell>
                          <TableCell>
                            {new Date(registration.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={registration.paymentStatus === PaymentStatus.PAID ? "default" : "destructive"}>
                              {registration.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {registration.userPhone || "Not provided"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <span className="sr-only">Open menu</span>
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedRegistration(registration)}>
                                  View Details
                                </DropdownMenuItem>
                                {registration.paymentStatus !== PaymentStatus.PAID && (
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdatePayment(registration.id)}
                                    disabled={isUpdatingPayment === registration.id}
                                  >
                                    {isUpdatingPayment === registration.id ? "Updating..." : "Mark as Paid"}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteRegistration(registration.id)}
                                  disabled={isDeletingRegistration === registration.id}
                                  className="text-destructive focus:text-destructive"
                                >
                                  {isDeletingRegistration === registration.id ? "Deleting..." : "Delete Registration"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <div className="flex items-center text-muted-foreground">
                              {registrationSearch ? (
                                <>
                                  <Search className="mr-2 h-4 w-4" />
                                  No matching registrations found
                                </>
                              ) : (
                                <>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  No registrations yet
                                </>
                              )}
                            </div>
                            {!registrationSearch && (
                              <p className="text-xs text-muted-foreground">
                                Registrations will appear here when users sign up for events.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination for registrations */}
              {registrationsMetadata.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{((registrationsMetadata.page - 1) * registrationsMetadata.limit) + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(registrationsMetadata.page * registrationsMetadata.limit, registrationsMetadata.total)}
                    </span> of{" "}
                    <span className="font-medium">{registrationsMetadata.total}</span> registrations
                  </p>
                  <Pagination
                    currentPage={registrationsMetadata.page}
                    totalPages={registrationsMetadata.totalPages}
                    onPageChange={page => fetchRegistrations(page)}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">All Events</h2>
                <div className="flex items-center gap-2">
                  <Button asChild variant="default" size="sm">
                    <Link href="/admin/events/new">Create Event</Link>
                  </Button>
                  <Select
                    value={eventsMetadata.limit.toString()}
                    onValueChange={(value) => {
                      setEventsMetadata(prev => ({
                        ...prev,
                        limit: parseInt(value),
                        page: 1
                      }))
                      fetchEvents(1, debouncedEventSearch, eventSortBy, eventSortOrder)
                    }}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="12 per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 per page</SelectItem>
                      <SelectItem value="12">12 per page</SelectItem>
                      <SelectItem value="24">24 per page</SelectItem>
                      <SelectItem value="48">48 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, description, category or location..."
                    className="pl-8"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={eventSortBy}
                  onValueChange={(value) => {
                    setEventSortBy(value)
                    fetchEvents(1, debouncedEventSearch, value, eventSortOrder)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Event Name</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="registrations">Registrations</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEventSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
                    fetchEvents(1, debouncedEventSearch, eventSortBy, eventSortOrder === 'asc' ? 'desc' : 'asc')
                  }}
                >
                  <ArrowUpDown className={`h-4 w-4 ${eventSortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  <span className="sr-only">Toggle sort order</span>
                </Button>
              </div>

              {isLoadingEvents ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading events...</p>
                  </div>
                </div>
              ) : events.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {event.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                            </div>
                            <span className="font-medium">₹{event.fee}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {event.registrationCount} registration{event.registrationCount !== 1 && 's'} • {" "}
                              {event.paidRegistrations} paid
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>Revenue: ₹{event.revenue}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0 flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadRegistrations(event.id, event.title)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleInitiateEventDelete(event.id)}
                          disabled={isDeletingEvent === event.id}
                        >
                          {isDeletingEvent === event.id ? "Deleting..." : "Delete"}
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
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 gap-2">
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  <p className="text-xl">
                    {eventSearch ? "No matching events found" : "No events created yet"}
                  </p>
                  <p className="text-muted-foreground">
                    {eventSearch 
                      ? "Try adjusting your search terms" 
                      : "Get started by creating your first event"}
                  </p>
                  {!eventSearch && (
                    <Button asChild className="mt-4">
                      <Link href="/admin/events/new">Create Event</Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination for events */}
              {eventsMetadata.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{((eventsMetadata.page - 1) * eventsMetadata.limit) + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(eventsMetadata.page * eventsMetadata.limit, eventsMetadata.total)}
                    </span> of{" "}
                    <span className="font-medium">{eventsMetadata.total}</span> events
                  </p>
                  <Pagination
                    currentPage={eventsMetadata.page}
                    totalPages={eventsMetadata.totalPages}
                    onPageChange={page => fetchEvents(page)}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}