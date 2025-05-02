"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Loader2, Users } from "lucide-react"
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

  // Start with 1 member since team leader is already included
  useEffect(() => {
    setTeamMembers(Array(1).fill({ name: "", usn: "", phone: "" }))
  }, [])

  const handleAddMember = () => {
    if (teamMembers.length < (maxTeamSize - 1)) { // Subtract 1 to account for team leader
      setTeamMembers([...teamMembers, { name: "", usn: "", phone: "" }])
    }
  }

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length > (minTeamSize - 1)) { // Subtract 1 to account for team leader
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

      toast.success("Successfully registered your team for the event")
      router.refresh()
      router.push(`/events/${eventId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register team for event")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team Leader Section */}
      <Card className="p-4 border-2 border-primary">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-lg">Team Leader (You)</h3>
          </div>
          <p className="text-sm text-muted-foreground">Your profile information will be used as the team leader details</p>
        </div>
      </Card>

      {/* Additional Team Members */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Additional Team Members</h3>
        {teamMembers.map((member, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Team Member {index + 2}</h3> {/* Add 2 to account for team leader being 1 */}
              {teamMembers.length > (minTeamSize - 1) && (
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
        {teamMembers.length < (maxTeamSize - 1) && ( // Subtract 1 to account for team leader
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