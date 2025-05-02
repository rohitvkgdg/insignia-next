"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Loader2 } from "lucide-react"
import { registerForEvent } from "@/app/actions/events"
import { toast } from "sonner"

interface TeamRegistrationFormProps {
  eventId: string
  minTeamSize?: number
  maxTeamSize?: number
}

export default function TeamRegistrationForm({ 
  eventId,
  minTeamSize = 2,
  maxTeamSize = 5
}: TeamRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teamMembers, setTeamMembers] = useState([{ name: "", usn: "", phone: "" }])
  const router = useRouter()

  const handleAddMember = () => {
    if (teamMembers.length < maxTeamSize) {
      setTeamMembers([...teamMembers, { name: "", usn: "", phone: "" }])
    }
  }

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length > minTeamSize) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index))
    }
  }

  const handleInputChange = (index: number, field: string, value: string) => {
    const newTeamMembers = [...teamMembers]
    newTeamMembers[index] = { ...newTeamMembers[index], [field]: value }
    setTeamMembers(newTeamMembers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      const hasEmptyFields = teamMembers.some(member => 
        !member.name.trim() || !member.usn.trim() || !member.phone.trim()
      )

      if (hasEmptyFields) {
        toast.error("Please fill in all team member details")
        return
      }

      const result = await registerForEvent(eventId, undefined, teamMembers)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast.success("Successfully registered for the event")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register for event")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Team Member {index + 1}</h3>
              {teamMembers.length > minTeamSize && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor={`name-${index}`}>Name</Label>
                <Input
                  id={`name-${index}`}
                  value={member.name}
                  onChange={(e) => handleInputChange(index, "name", e.target.value)}
                  placeholder="Full name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor={`usn-${index}`}>USN</Label>
                <Input
                  id={`usn-${index}`}
                  value={member.usn}
                  onChange={(e) => handleInputChange(index, "usn", e.target.value)}
                  placeholder="University Seat Number"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor={`phone-${index}`}>Phone</Label>
                <Input
                  id={`phone-${index}`}
                  value={member.phone}
                  onChange={(e) => handleInputChange(index, "phone", e.target.value)}
                  placeholder="Phone number"
                  required
                  type="tel"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex gap-4">
        {teamMembers.length < maxTeamSize && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddMember}
            className="w-full"
            disabled={isSubmitting}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register Team"
          )}
        </Button>
      </div>
    </form>
  )
}