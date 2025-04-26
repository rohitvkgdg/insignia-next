"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { eventCategoryEnum, departmentEnum } from "@/schema"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { uploadEventImage } from "@/lib/r2"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or less"),
  date: z.string()
    .min(1, "Date is required")
    .transform((date) => {
      return new Date(`${date}T12:00:00.000Z`).toISOString();
    }),
  time: z.string()
    .min(1, "Time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s*(AM|PM|am|pm))?$/, "Please provide a valid time format (e.g. 14:30 or 2:30 PM)"),
  location: z.string()
    .min(3, "Location must be at least 3 characters")
    .max(200, "Location must be 200 characters or less"),
  category: z.enum(eventCategoryEnum.enumValues),
  department: z.enum(departmentEnum.enumValues).optional(),
  fee: z.coerce
    .number()
    .min(0, "Fee cannot be negative")
    .max(100000, "Fee must be 100,000 or less")
    .transform((val) => Number(val)), // Ensure it's a number for the server
  details: z.string()
    .min(10, "Details must be at least 10 characters")
    .max(5000, "Details must be 5000 characters or less"),
  isTeamEvent: z.boolean().default(false),
  minTeamSize: z.number().nullable().refine((val) => {
    if (val === null) return true;
    return val >= 2;
  }, "Minimum team size must be at least 2"),
  maxTeamSize: z.number().nullable().refine((val) => {
    if (val === null) return true;
    return val >= 2;
  }, "Maximum team size must be at least 2"),
  image: z.union([
    z.string().url("Please provide a valid image URL").optional(),
    z.instanceof(File, { message: "Please upload a valid image file" }).optional()
  ]).optional().or(z.literal("")),  // Allow empty string
  imageFile: z.instanceof(File).optional(),
})

export type EventFormValues = z.infer<typeof formSchema>

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>
  action: (data: EventFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function EventForm({ defaultValues, action, isSubmitting: externalIsSubmitting }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "CENTRALIZED",
      fee: 0,
      details: "",
      image: "",
      ...defaultValues
    }
  })

  const showDepartmentField = form.watch("category") === "TECHNICAL";

  async function onSubmit(data: EventFormValues) {
    try {
      setIsSubmitting(true)
      let imageUrl = data.image

      // Only attempt upload if there's a file
      if (data.imageFile) {
        setIsUploading(true)
        try {
          const tempEventId = crypto.randomUUID()
          imageUrl = await uploadEventImage(data.imageFile, data.id || tempEventId)
        } catch (error) {
          console.error("Image upload error:", error)
          toast.error("Failed to upload image, but you can still save the event")
          imageUrl = ""
        } finally {
          setIsUploading(false)
        }
      }

      // Format the data for submission
      const formattedData = {
        ...data,
        image: imageUrl || "",
        imageFile: undefined
      }

      try {
        await action(formattedData)
        toast.success("Event saved successfully")
        router.refresh()
        router.push('/admin') // Add explicit navigation
      } catch (actionError: any) {
        // Handle specific error types
        if (actionError.message?.includes("Unauthorized")) {
          toast.error("You are not authorized to perform this action")
          router.push('/auth/signin')
          return
        }
        
        if (actionError.message?.includes("VALIDATION_ERROR")) {
          toast.error("Please check your input and try again")
          return
        }

        // Log the error for debugging in production
        console.error("Server action error:", actionError)
        toast.error("Failed to save event. Please try again later")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("An unexpected error occurred. Please try again")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea  {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventCategoryEnum.enumValues.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showDepartmentField && (
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departmentEnum.enumValues.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the department for this technical event
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">

          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isTeamEvent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Team Event</FormLabel>
                <FormDescription>
                  Enable this if participants need to register as a team
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {form.watch("isTeamEvent") && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minTeamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Team Size</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={2}
                      {...field}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTeamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Team Size</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={2}
                      {...field}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="imageFile"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Event Image (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        onChange(file)
                      }
                    }}
                    {...field}
                  />
                  {typeof form.watch("image") === "string" && form.watch("image") && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Current image: {String(form.watch("image"))}</p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Optional: Upload an image for the event. Supported formats: JPG, PNG, GIF
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting || externalIsSubmitting || isUploading}
          className="w-full"
        >
          {(isSubmitting || externalIsSubmitting || isUploading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Event"}
        </Button>
      </form>
    </Form>
  )
}