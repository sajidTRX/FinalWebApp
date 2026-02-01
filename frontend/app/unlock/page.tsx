"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnlockScreen() {
  const [pin, setPin] = useState(["", "", "", ""])
  const [showPinInput, setShowPinInput] = useState(false)
  const [authError, setAuthError] = useState(false)
  const router = useRouter()

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      if (nextInput) nextInput.focus()
    }

    // Check if PIN is complete
    if (index === 3 && value) {
      // In a real app, we would validate the PIN
      // For demo purposes, any complete PIN works
      if (newPin.every((digit) => digit !== "")) {
        setTimeout(() => {
          router.push("/landing")
        }, 500)
      }
    }
  }

  const handleFingerprint = () => {
    // Simulate fingerprint authentication
    setTimeout(() => {
      router.push("/landing")
    }, 1000)
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        <div className="space-y-2 font-mono">
          <h1 className="text-2xl font-medium text-[#3d3225]">Unlock Device</h1>
          <p className="text-sm text-[#5a4a3a]">Touch fingerprint sensor or enter PIN</p>
        </div>

        {!showPinInput ? (
          <div className="flex flex-col items-center space-y-6 font-mono">
            <button
              onClick={handleFingerprint}
              className="group flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#a89880] bg-[#efe6d5] transition-all hover:border-[#6b5d4d] focus:outline-none focus:ring-2 focus:ring-[#8b7d6b]"
            >
              <Fingerprint className="h-16 w-16 text-[#4a3f32]" />
            </button>
            <Button variant="outline" onClick={() => setShowPinInput(true)} className="mt-4 text-[#4a3f32] border-[#a89880] hover:bg-[#e8ddd0]">
              Use PIN instead
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center space-x-4">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  className="h-12 w-12 rounded-md border border-[#a89880] bg-[#efe6d5] text-center text-xl text-[#3d3225] focus:border-[#6b5d4d] focus:outline-none focus:ring-1 focus:ring-[#8b7d6b]"
                />
              ))}
            </div>
            {authError && <p className="text-sm text-[#4a3f32]">Incorrect PIN. Please try again.</p>}
            <Button variant="outline" onClick={() => setShowPinInput(false)} className="text-[#4a3f32] border-[#a89880] hover:bg-[#e8ddd0]">
              Use fingerprint instead
            </Button>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
