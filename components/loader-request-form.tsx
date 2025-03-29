"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Clock, Camera, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { generatePDF } from "@/lib/pdf-generator"
import LogoUploader from "@/components/logo-uploader"

// Define photo sections
const PHOTO_SECTIONS = [
  "foto tampak depan",
  "depan sisi kiri",
  "depan sisi kanan",
  "segel",
  "foto tampak belakang sebelum dibuka",
  "sampling kanan",
  "sampling kiri",
  "foto tampak belakang sebelum muat",
  "foto setelah muat",
  "Product 1",
  "Product 2",
  "Product 3",
  "Product 4",
  "Product 5",
  "Product 6",
  "Product 7",
]

export default function LoaderRequestForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString("en-GB"),
    shift: "",
    nikeMP: 0,
    timeInNike: "",
    shipperName: "",
    receiptDate: new Date().toLocaleDateString("en-GB"),
    noDocument: "",
    transaction: "Outbound", // Default to Outbound
    vehicleNo: "",
    containerNo: "",
    warehouseName: "",
  })

  // Store photos by section
  const [photos, setPhotos] = useState<Record<string, File | null>>(
    PHOTO_SECTIONS.reduce((acc, section) => ({ ...acc, [section]: null }), {}),
  )

  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setPhotos((prev) => ({ ...prev, [section]: file }))
    }
  }

  const handleNikeMPChange = (increment: boolean) => {
    setFormData({
      ...formData,
      nikeMP: increment ? formData.nikeMP + 1 : Math.max(0, formData.nikeMP - 1),
    })
  }

  const openFileInput = (section: string) => {
    if (fileInputRefs.current[section]) {
      fileInputRefs.current[section]?.click()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Upload photos to Supabase
      const photoUrls: Record<string, string> = {}

      for (const section of PHOTO_SECTIONS) {
        const photo = photos[section]
        if (photo) {
          const fileName = `${Date.now()}-${section}-${photo.name}`
          const { data, error } = await supabase.storage.from("loader-request-photos").upload(fileName, photo)

          if (error) throw error

          const { data: urlData } = supabase.storage.from("loader-request-photos").getPublicUrl(fileName)

          photoUrls[section] = urlData.publicUrl
        }
      }

      // 2. Save data to Neon DB (via API route)
      const response = await fetch("/api/loader-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          photoUrls,
        }),
      })

      if (!response.ok) throw new Error("Failed to save data")

      const { id } = await response.json()

      // 3. Generate PDF
      await generatePDF(formData, photoUrls)

      // 4. Redirect or show success
      router.push(`/success?id=${id}`)
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("An error occurred while submitting the form")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-2 rounded-t-lg">
        <Button variant="ghost" size="icon" className="text-white hover:bg-blue-600">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="bg-white text-blue-500 rounded-full p-1">
            <div className="h-6 w-6 flex items-center justify-center font-bold">D</div>
          </div>
          <span className="font-medium text-lg">Loader Request</span>
        </div>
      </div>

      {/* Logo Uploader */}
      <div className="p-4 border-b">
        <LogoUploader />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Date */}
            <div className="space-y-1">
              <Label htmlFor="date" className="text-sm font-medium after:content-['*'] after:text-red-500 after:ml-0.5">
                Date
              </Label>
              <div className="relative">
                <Input
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Shift */}
            <div className="space-y-1">
              <Label
                htmlFor="shift"
                className="text-sm font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
              >
                Shift
              </Label>
              <Select value={formData.shift} onValueChange={(value) => handleSelectChange("shift", value)}>
                <SelectTrigger id="shift" className="w-full">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nike MP */}
            <div className="space-y-1">
              <Label htmlFor="nikeMP" className="text-sm font-medium">
                Nike MP
              </Label>
              <div className="flex items-center">
                <Input
                  id="nikeMP"
                  name="nikeMP"
                  value={formData.nikeMP}
                  onChange={handleInputChange}
                  className="text-center"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => handleNikeMPChange(false)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => handleNikeMPChange(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Time in nike */}
            <div className="space-y-1">
              <Label
                htmlFor="timeInNike"
                className="text-sm font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
              >
                Time in nike
              </Label>
              <div className="relative">
                <Input
                  id="timeInNike"
                  name="timeInNike"
                  value={formData.timeInNike}
                  onChange={handleInputChange}
                  placeholder="--:--"
                  className="pr-10"
                  required
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* 1. Shipper Name */}
            <div className="space-y-1">
              <Label htmlFor="shipperName" className="text-sm font-medium">
                1. Shipper Name
              </Label>
              <Input
                id="shipperName"
                name="shipperName"
                value={formData.shipperName}
                onChange={handleInputChange}
                placeholder="Enter shipper name"
              />
            </div>

            {/* 2. Receipt Date */}
            <div className="space-y-1">
              <Label htmlFor="receiptDate" className="text-sm font-medium">
                2. Receipt Date
              </Label>
              <div className="relative">
                <Input
                  id="receiptDate"
                  name="receiptDate"
                  value={formData.receiptDate}
                  onChange={handleInputChange}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* 3. No Document */}
            <div className="space-y-1">
              <Label htmlFor="noDocument" className="text-sm font-medium">
                3. No Document
              </Label>
              <Input
                id="noDocument"
                name="noDocument"
                value={formData.noDocument}
                onChange={handleInputChange}
                placeholder="Enter document number"
              />
            </div>

            {/* 4. Transaction */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">4. Transaction</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.transaction === "Inbound" ? "default" : "outline"}
                  className={formData.transaction === "Inbound" ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : ""}
                  onClick={() => handleSelectChange("transaction", "Inbound")}
                >
                  Inbound
                </Button>
                <Button
                  type="button"
                  variant={formData.transaction === "Outbound" ? "default" : "outline"}
                  className={formData.transaction === "Outbound" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                  onClick={() => handleSelectChange("transaction", "Outbound")}
                >
                  Outbound
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Fields */}
        <div className="space-y-4">
          {/* 5. Vehicle No */}
          <div className="space-y-1">
            <Label htmlFor="vehicleNo" className="text-sm font-medium">
              5. Vehicle No
            </Label>
            <Input
              id="vehicleNo"
              name="vehicleNo"
              value={formData.vehicleNo}
              onChange={handleInputChange}
              placeholder="Enter vehicle number"
            />
          </div>

          {/* 6. Container No */}
          <div className="space-y-1">
            <Label htmlFor="containerNo" className="text-sm font-medium">
              6. Container No
            </Label>
            <Input
              id="containerNo"
              name="containerNo"
              value={formData.containerNo}
              onChange={handleInputChange}
              placeholder="Enter container number"
            />
          </div>

          {/* 7. Warehouse Name */}
          <div className="space-y-1">
            <Label htmlFor="warehouseName" className="text-sm font-medium">
              7. Warehouse Name
            </Label>
            <Input
              id="warehouseName"
              name="warehouseName"
              value={formData.warehouseName}
              onChange={handleInputChange}
              placeholder="Enter warehouse name"
            />
          </div>

          {/* 8. Photo Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              8. foto 16 field ({Object.values(photos).filter(Boolean).length}/16)
            </Label>

            {/* Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {PHOTO_SECTIONS.map((section) => (
                <div key={section} className="space-y-1">
                  <Label className="text-xs font-medium">{section}</Label>
                  <div
                    className="border border-dashed rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => openFileInput(section)}
                  >
                    {photos[section] ? (
                      <img
                        src={URL.createObjectURL(photos[section] as File) || "/placeholder.svg"}
                        alt={section}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Add photo</span>
                      </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, section)}
                        ref={(el) => {
                        if (el) fileInputRefs.current[section] = el;
                    }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
            {loading ? "Processing..." : "Submit & Print"}
          </Button>
        </div>
      </form>
    </div>
  )
}

