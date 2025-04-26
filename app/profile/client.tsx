"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, GraduationCap, Mail, MapPin, Phone, School, Landmark, User, Clock, MapPin as LocationIcon, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { updateProfile } from "@/app/actions/profile"
import { UserProfileData, UpdateProfileInput } from "@/app/actions/profile"
import { Role, PaymentStatus } from "@/types/enums"
import { Switch } from "@/components/ui/switch"

export default function ProfileClient({ profile }: { profile: UserProfileData }) {
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const callbackUrl = searchParams.get('callbackUrl')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [usn, setUsn] = useState(profile.usn || "")
  const [confirmUsn, setConfirmUsn] = useState(profile.usn || "")
  const [usnError, setUsnError] = useState("")

  // Display role in a more user-friendly format
  const roleDisplay: Record<Role, string> = {
    [Role.USER]: "Student",
    [Role.ADMIN]: "Administrator"
  }

  // Add validation function
  const validateUsn = () => {
    if (usn !== confirmUsn) {
      setUsnError("USN fields do not match")
      return false
    }
    setUsnError("")
    return true
  }

  // Handle form submission
  async function handleProfileUpdate(formData: FormData) {
    if (!validateUsn()) {
      toast.error("USN fields do not match")
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      // Extract and format form data
      const semesterValue = formData.get("semester") as string;
      const semester = semesterValue === "none" ? null : semesterValue ? Number(semesterValue) : null;

      // Create a plain object with explicit type casting
      const data = {
        name: String(formData.get("name")),
        phone: String(formData.get("phone")),
        department: String(formData.get("department")),
        semester,
        college: String(formData.get("college")),
        usn: String(formData.get("usn")),
        accommodation: formData.get("accommodation") === "true"
      } satisfies UpdateProfileInput;

      // Call the server action to update profile
      const result = await updateProfile(data)

      if (!result || 'error' in result) {
        throw new Error(typeof result?.error === 'string' ? result.error : "Failed to update profile")
      }

      toast.success("Profile updated successfully")

      // Handle redirect after successful update
      if (callbackUrl) {
        const decodedUrl = decodeURIComponent(callbackUrl)
        console.log('Redirecting to:', decodedUrl) // Debug log
        await router.push(decodedUrl)
      } else {
        router.refresh()
      }
    } catch (error) {
      let message = "Failed to update profile"
      if (error instanceof Error) message = error.message
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10 flex flex-col items-center">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and event registrations</p>
      </div>

      <div className="flex flex-col align-center gap-8 lg:flex-row">
        {/* Profile Card */}
        <div className="lg:w-2/4">
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={"/placeholder-user.jpg"} alt={profile.name || "U"} />
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
                {profile.college && (
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.college}</span>
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
          <Card className="w-fit">
            <CardHeader>
              <CardTitle>Update Profile</CardTitle>
              <CardDescription>
                Complete your profile information to register for events
              </CardDescription>
            </CardHeader>
            <form ref={formRef} action={handleProfileUpdate} aria-describedby={formError ? "profile-form-error" : undefined}>
              <CardContent>
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

                  {/* USN Fields */}
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="usn">USN / College ID <span className="text-red-500">*</span></Label>
                      <Input
                        id="usn"
                        name="usn"
                        type="text"
                        value={usn}
                        onChange={(e) => {
                          setUsn(e.target.value)
                          setUsnError("")
                        }}
                        placeholder="e.g. 1XX22XX000"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="confirmUsn">Confirm USN / College ID <span className="text-red-500">*</span></Label>
                      <Input
                        id="confirmUsn"
                        name="confirmUsn"
                        type="text"
                        value={confirmUsn}
                        onChange={(e) => {
                          setConfirmUsn(e.target.value)
                          setUsnError("")
                        }}
                        onBlur={validateUsn}
                        placeholder="Confirm your USN"
                        required
                      />
                      {usnError && (
                        <p className="text-sm text-red-500 mt-1">
                          {usnError}
                        </p>
                      )}
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
                  {/* Accommodation Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="accommodation">Need Accommodation?</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="accommodation"
                        name="accommodation"
                        defaultChecked={profile.accommodation || false}
                        onCheckedChange={(checked) => {
                          const formData = new FormData(formRef.current!);
                          formData.set('accommodation', checked.toString());
                        }}
                      />
                      <Label htmlFor="accommodation" className="text-sm text-muted-foreground">
                        Toggle if you need accommodation during the event
                      </Label>
                    </div>
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
        </div>
      </div>
    </div>
  )
}