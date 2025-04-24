"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, GraduationCap, Mail, MapPin, Phone, School, Landmark, User, Clock, MapPin as LocationIcon, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { updateProfile } from "@/app/actions/profile"
import { UserProfileData, UpdateProfileInput } from "@/app/actions/profile"
import { Role, PaymentStatus } from "@/types/enums"

export default function ProfileClient({ profile }: { profile: UserProfileData }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Display role in a more user-friendly format
  const roleDisplay: Record<Role, string> = {
    [Role.USER]: "Student",
    [Role.ADMIN]: "Administrator"
  }

  // Handle form submission
  async function handleProfileUpdate(formData: FormData) {
    setIsSubmitting(true)
    setFormError(null)
    
    try {
      // Extract and format form data
      const semesterValue = formData.get("semester") as string;
      const semester = semesterValue === "none" ? null : semesterValue ? Number(semesterValue) : null;
      
      const data: UpdateProfileInput = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string || null,
        department: formData.get("department") as string,
        semester,
        college: formData.get("college") as string,
        usn: formData.get("usn") as string,
      }

      // Call the server action to update profile
      await updateProfile(data)
      
      // Show success message and refresh the page
      toast.success("Profile updated successfully")
      router.refresh()
    } catch (error) {
      let message = "Failed to update profile"
      if (error instanceof Error) message = error.message
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and event registrations</p>
      </div>
      
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Profile Card */}
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.image || "/placeholder-user.jpg"} alt={profile.name || "U"} />
                  <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center">
                  <h2 className="text-2xl font-bold">{profile.name || "User"}</h2>
                  <Badge variant="outline">{roleDisplay[profile.role as Role]}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.usn && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.usn}</span>
                  </div>
                )}
                {profile.department && (
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {profile.department}
                      {profile.semester && ` - Semester ${profile.semester}`}
                    </span>
                  </div>
                )}
                {profile.college && (
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.college}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span className="text-sm">{profile.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {profile.profileCompleted ? (
                <div className="w-full rounded-md bg-green-50 px-3 py-2 text-center text-sm text-green-700 dark:bg-green-900/30 dark:text-green-200">
                  Profile complete
                </div>
              ) : (
                <div className="w-full rounded-md bg-amber-50 px-3 py-2 text-center text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                  Please complete your profile
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="flex-1">
          <Tabs defaultValue={profile.profileCompleted ? "registrations" : "settings"}>
            <TabsList className="mb-4 w-full sm:w-auto">
              <TabsTrigger value="registrations">My Registrations</TabsTrigger>
              <TabsTrigger value="settings">Update Profile</TabsTrigger>
            </TabsList>

            {/* Registrations Tab */}
            <TabsContent value="registrations">
              <Card>
                <CardHeader>
                  <CardTitle>Event Registrations</CardTitle>
                  <CardDescription>View and manage your event registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.registrations.length > 0 ? (
                    <div className="space-y-4">
                      {profile.registrations.map((registration) => (
                        <Card key={registration.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{registration.eventName}</CardTitle>
                            <CardDescription>
                              Registered on {format(new Date(registration.createdAt), 'PPP')}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="grid gap-3">
                              <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{format(new Date(registration.date), 'PPP')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{registration.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <LocationIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{registration.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>₹{registration.fee.toFixed(2)}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs font-medium">Payment Status</span>
                                  <Badge variant={getPaymentBadgeVariant(registration.paymentStatus)}>
                                    {registration.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                              <Link href={`/events/${registration.eventId}`}>View Event</Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CalendarDays className="h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No registrations yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You haven't registered for any events yet.
                      </p>
                      <Button asChild className="mt-4">
                        <Link href="/events">Browse Events</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Update Profile</CardTitle>
                  <CardDescription>
                    Complete your profile information to register for events
                  </CardDescription>
                </CardHeader>
                <form ref={formRef} action={handleProfileUpdate} aria-describedby={formError ? "profile-form-error" : undefined}>
                  <CardContent>
                    {/* {formError && (
                      <div id="profile-form-error" className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
                        {formError}
                      </div>
                    )} */}
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          defaultValue={profile.name || ""}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      {/* Email Field (Disabled) */}
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={profile.email || ""}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed as it is linked to your account.
                        </p>
                      </div>

                      {/* USN Field */}
                      <div className="grid gap-2">
                        <Label htmlFor="usn">USN / College ID <span className="text-red-500">*</span></Label>
                        <Input
                          id="usn"
                          name="usn"
                          type="text"
                          defaultValue={profile.usn || ""}
                          placeholder="e.g. 1XX22XX000"
                          required
                        />
                      </div>

                      {/* Department and Semester Grid */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                          <Input
                            id="department"
                            name="department"
                            type="text"
                            defaultValue={profile.department || ""}
                            placeholder="e.g. Computer Science"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="semester">Semester</Label>
                          <Select name="semester" defaultValue={profile.semester?.toString() || "1"}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <SelectItem key={sem} value={sem.toString()}>
                                  {sem}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* College Field */}
                      <div className="grid gap-2">
                        <Label htmlFor="college">College Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="college"
                          name="college"
                          type="text"
                          defaultValue={profile.college || ""}
                          placeholder="e.g. ABC College of Engineering"
                          required
                        />
                      </div>

                      {/* Phone Field */}
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          defaultValue={profile.phone || ""}
                          placeholder="e.g. +91 9876543210"
                          required
                        />
                      </div>

                      {/* Address Field */}
                      <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          className="min-h-24"
                          defaultValue={profile.address || ""}
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update Profile"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}