"use client"

import Link from "next/link"
import { format } from "date-fns"
import { CalendarDays, Clock, MapPin, FileText, IndianRupeeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RegistrationSummary } from "@/app/actions/profile"
import { PaymentStatus } from "@/types/enums"

interface RegistrationsClientProps {
  registrations: RegistrationSummary[]
}

export default function RegistrationsClient({ registrations }: RegistrationsClientProps) {
  // Helper function to get badge variant based on payment status
  function getPaymentBadgeVariant(status: string) {
    switch (status) {
      case PaymentStatus.PAID:
        return "default"
      case PaymentStatus.REFUNDED:
        return "outline"
      default:
        return "destructive"
    }
  }

  return (
    <div className="container py-36">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Registrations</h1>
        <p className="text-muted-foreground">View your event registrations</p>
      </div>

      {registrations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {registrations.map((registration) => (
            <Card key={registration.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{registration.eventName}</CardTitle>
                    <CardDescription>
                      Registered on {format(new Date(registration.createdAt), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge variant={getPaymentBadgeVariant(registration.paymentStatus)}>
                    {registration.paymentStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Registration ID: {registration.registrationId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(registration.date), 'PPP')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{registration.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{registration.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupeeIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{registration.fee}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/events/${registration.eventId}`}>
                    View Event Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No registrations yet</h2>
          <p className="text-muted-foreground mb-4">
            You haven't registered for any events yet.
          </p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      )}
    </div>
  )
}