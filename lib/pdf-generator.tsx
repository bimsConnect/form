"use client"

import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Define the type for form data
type FormData = {
  date: string
  shift: string
  nikeMP: number
  timeInNike: string
  shipperName: string
  receiptDate: string
  noDocument: string
  transaction: string
  vehicleNo: string
  containerNo: string
  warehouseName: string
}

// Define photo sections in the correct order for the PDF
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

export const generatePDF = async (formData: FormData, photoUrls: Record<string, string>) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set font
  doc.setFont("helvetica")

  // Add company logo (placeholder - will be replaced with local logo)
  // This is just a placeholder circle that will be replaced with the actual logo
  doc.setFillColor(0, 0, 128) // Dark blue
  doc.circle(20, 20, 7, "F")
  doc.setTextColor(255, 255, 255) // White
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("D", 18, 23)

  // Company name
  doc.setTextColor(0, 0, 0) // Black
  doc.setFontSize(10)
  doc.text("PT. DUNIA KIMIA JAYA", 32, 20)

  // Add title with transaction type highlighted
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 0, 128) // Dark blue for title

  // Calculate positions for title parts
  const titlePrefix = "Report Documentation Warehouse "
  const titleSuffix = " Activity"
  const transactionType = formData.transaction

  // Measure text widths
  const prefixWidth = doc.getTextWidth(titlePrefix)
  const transactionWidth = doc.getTextWidth(transactionType)

  // Calculate starting position to center the entire title
  const fullWidth = doc.getTextWidth(titlePrefix + transactionType + titleSuffix)
  const startX = 105 - fullWidth / 2

  // Draw title parts
  doc.text(titlePrefix, startX, 30)

  // Draw transaction type with highlight
  const transactionX = startX + prefixWidth

//   // Draw yellow highlight for transaction type
   doc.setFillColor(255, 255, 0) // Yellow
   doc.rect(transactionX - 1, 30 - 10, transactionWidth + 2, 12, "F")

  // Draw transaction type text
  doc.setTextColor(0, 0, 128) // Dark blue
  doc.text(transactionType, transactionX, 30)

  // Draw suffix
  doc.text(titleSuffix, transactionX + transactionWidth, 30)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Add left column data
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Shipper Name", 15, 45)
  doc.text(":", 50, 45)
  doc.text(formData.shipperName, 55, 45)

  doc.text("Receipt Date", 15, 52)
  doc.text(":", 50, 52)
  doc.text(formData.receiptDate, 55, 52)

  doc.text("No Document", 15, 59)
  doc.text(":", 50, 59)
  doc.text(formData.noDocument, 55, 59)

  // Add right column data
  doc.text("Transaction", 120, 45)
  doc.text(":", 155, 45)

  // Highlight transaction value
  const transactionValueWidth = doc.getTextWidth(formData.transaction)
  doc.setFillColor(255, 255, 0) // Yellow
  doc.rect(160 - 1, 45 - 5, transactionValueWidth + 2, 7, "F")
  doc.text(formData.transaction, 160, 45)

  doc.text("Vehicle No", 120, 52)
  doc.text(":", 155, 52)
  doc.text(formData.vehicleNo, 160, 52)

  doc.text("Container No", 120, 59)
  doc.text(":", 155, 59)
  doc.text(formData.containerNo, 160, 59)

  // Add summary on right side - exactly as in the reference image
  doc.setFontSize(8)
  doc.text("1. Shipper Name", 120, 80)
  doc.text(":", 155, 80)
  doc.text(formData.shipperName ? formData.shipperName : "Input", 160, 80)

  doc.text("2. Receipt Date", 120, 85)
  doc.text(":", 155, 85)
  doc.text("(Today)", 160, 85)

  doc.text("3. No Document", 120, 90)
  doc.text(":", 155, 90)
  doc.text(formData.noDocument ? formData.noDocument : "Input", 160, 90)

  doc.text("4. Transaction", 120, 95)
  doc.text(":", 155, 95)
  doc.text("Choose", 160, 95)

  doc.text("5. Vehicle No", 120, 100)
  doc.text(":", 155, 100)
  doc.text(formData.vehicleNo ? formData.vehicleNo : "Input", 160, 100)

  doc.text("6. Container No", 120, 105)
  doc.text(":", 155, 105)
  doc.text(formData.containerNo ? formData.containerNo : "Input", 160, 105)

  doc.text("7. Warehouse Name", 120, 110)
  doc.text(":", 155, 110)
  doc.text(formData.warehouseName ? formData.warehouseName : "Input", 160, 110)

  // Draw horizontal line
  doc.setLineWidth(0.5)
  doc.line(15, 70, 195, 70)

  // Photo grid layout
  const photoGrid = [
    // First row
    { section: "foto tampak depan", x: 15, y: 75, width: 40, height: 30 },
    { section: "depan sisi kiri", x: 60, y: 75, width: 40, height: 30 },
    { section: "depan sisi kanan", x: 105, y: 75, width: 40, height: 30 },
    { section: "segel", x: 150, y: 75, width: 40, height: 30 },

    // Second row
    { section: "foto tampak belakang sebelum dibuka", x: 15, y: 110, width: 40, height: 30 },
    { section: "sampling kanan", x: 60, y: 110, width: 40, height: 30 },
    { section: "sampling kiri", x: 105, y: 110, width: 40, height: 30 },
    { section: "foto tampak belakang sebelum muat", x: 150, y: 110, width: 40, height: 30 },

    // Third row
    { section: "foto setelah muat", x: 15, y: 145, width: 40, height: 30 },
    { section: "Product 1", x: 60, y: 145, width: 40, height: 30 },
    { section: "Product 2", x: 105, y: 145, width: 40, height: 30 },
    { section: "Product 3", x: 150, y: 145, width: 40, height: 30 },

    // Fourth row
    { section: "Product 4", x: 15, y: 180, width: 40, height: 30 },
    { section: "Product 5", x: 60, y: 180, width: 40, height: 30 },
    { section: "Product 6", x: 105, y: 180, width: 40, height: 30 },
    { section: "Product 7", x: 150, y: 180, width: 40, height: 30 },
  ]

  // Function to add photo with label
  const addPhotoWithLabel = async (section: string, x: number, y: number, width: number, height: number) => {
    // Add label
    doc.setFontSize(6)
    doc.text(section, x, y - 1)

    // Add border
    doc.rect(x, y, width, height)

    // Add photo if available
    const url = photoUrls[section]
    if (url) {
      try {
        const response = await fetch(url)
        const blob = await response.blob()
        const reader = new FileReader()

        return new Promise<void>((resolve) => {
          reader.onloadend = () => {
            const base64data = reader.result as string
            doc.addImage(base64data, "JPEG", x + 0.5, y + 0.5, width - 1, height - 1)
            resolve()
          }

          reader.readAsDataURL(blob)
        })
      } catch (error) {
        console.error(`Error loading image for ${section}:`, error)
      }
    }
  }

  // Add all photos in the correct positions
  for (const item of photoGrid) {
    await addPhotoWithLabel(item.section, item.x, item.y, item.width, item.height)
  }

  // Add summary text below photos (as shown in gambar4.jpeg)
  const summaryY = 220
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")

  // Draw summary items
  const summaryItems = [
    { label: "1. Shipper Name", value: formData.shipperName || "Input" },
    { label: "2. Receipt Date", value: "(Today)" },
    { label: "3. No Document", value: formData.noDocument || "Input" },
    { label: "4. Transaction", value: "Choose" },
    { label: "5. Vehicle No", value: formData.vehicleNo || "Input" },
    { label: "6. Container No", value: formData.containerNo || "Input" },
    { label: "7. Warehouse Name", value: formData.warehouseName || "Input" },
  ]

  summaryItems.forEach((item, index) => {
    const y = summaryY + index * 7
    doc.setFont("helvetica", "normal")
    doc.text(item.label, 15, y)
    doc.text(":", 70, y)
    doc.text(item.value, 75, y)
  })

  // Add warehouse name at bottom
  doc.setFontSize(10)
  doc.text("Warehouse Name", 105, 280, { align: "center" })
  doc.text(formData.warehouseName, 105, 285, { align: "center" })

  // Save the PDF
  doc.save("warehouse_report.pdf")

  return true
}

