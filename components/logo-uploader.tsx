"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LogoUploader() {
  const [logo, setLogo] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setLogo(file)
      setLogoUrl(URL.createObjectURL(file))
    }
  }

  const handleSaveLogo = async () => {
    if (!logo) return

    try {
      const formData = new FormData()
      formData.append("logo", logo)

      const response = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        alert("Logo uploaded successfully")
      } else {
        throw new Error("Failed to upload logo")
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      alert("Failed to upload logo")
    }
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-lg font-medium">Company Logo</h2>

      <div className="space-y-2">
        <Label htmlFor="logo-upload">Upload Logo</Label>
        <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} />
      </div>

      {logoUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Preview:</p>
          <div className="border p-2 rounded-md">
            <img src={logoUrl || "/placeholder.svg"} alt="Logo Preview" className="h-16 object-contain" />
          </div>
        </div>
      )}

      <Button onClick={handleSaveLogo} disabled={!logo} className="w-full">
        Save Logo
      </Button>
    </div>
  )
}

