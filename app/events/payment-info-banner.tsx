"use client"

import { motion } from "framer-motion"

export function PaymentInfoBanner() {
  return (
    <div className="w-full bg-red-600 overflow-hidden py-2 h-10 rounded-md">
      <div className="relative">
        <motion.div
          animate={{
            x: ["100%", "-100%"],

          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "linear",
          }}
          className="text-white font-medium whitespace-nowrap absolute"
        >
          Payment for event registrations must be completed at the Registration Desk • All payments must be made in person.
        </motion.div>
      </div>
    </div>
  )
}