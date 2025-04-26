"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { registerForEvent } from "@/app/actions/events"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TeamRegistrationFormProps {
  eventId: string
  minTeamSize: number
  maxTeamSize: number
}

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  usn: z.string().min(3, "USN must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
})

const formSchema = z.object({
  teamMembers: z.array(teamMemberSchema)
    .min(1, "At least one team member is required"),
})

type FormValues = z.infer<typeof formSchema>

export default function TeamRegistrationForm({ eventId, minTeamSize, maxTeamSize }: TeamRegistrationFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamMembers: Array(minTeamSize).fill({ name: "", usn: "", phone: "" }),
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      const result = await registerForEvent(eventId, undefined, data.teamMembers)
      if (!result.success) {
        if (result.code === "INCOMPLETE_PROFILE") {
          const callbackUrl = encodeURIComponent(`/events/${eventId}`)
          toast.info("Please complete your profile first")
          router.push(`/profile?callbackUrl=${callbackUrl}`)
          return
        }
        throw new Error(result.error)
      }
      setIsRegistered(true)
      toast.success("Successfully registered for the event")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register for event")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isRegistered) {
    return (
      <Button className="w-full" variant="secondary" disabled>
        <Check className="mr-2 h-4 w-4" />
        Registered
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Register Team</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Team Registration</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {form.watch("teamMembers").map((_, index) => (
                    <div key={index} className="space-y-4 rounded-lg border p-4">
                      <h3 className="font-semibold">Team Member {index + 1}</h3>
                      <FormField
                        control={form.control}
                        name={`teamMembers.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`teamMembers.${index}.usn`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>USN</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`teamMembers.${index}.phone`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
                {form.watch("teamMembers").length < maxTeamSize && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const teamMembers = form.getValues("teamMembers")
                      form.setValue("teamMembers", [
                        ...teamMembers,
                        { name: "", usn: "", phone: "" },
                      ])
                    }}
                  >
                    Add Team Member
                  </Button>
                )}
                {form.watch("teamMembers").length > minTeamSize && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const teamMembers = form.getValues("teamMembers")
                      form.setValue("teamMembers", teamMembers.slice(0, -1))
                    }}
                  >
                    Remove Last Member
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Registering..." : "Register Team"}
                </Button>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}