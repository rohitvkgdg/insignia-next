import { PaymentStatus } from "@/types/enums"

export interface RegistrationData {
  id: string
  userName: string
  eventName: string
  date: string
  status: string
  paymentStatus: PaymentStatus
}

export type AdminEventData = {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  registrationCount: number
}