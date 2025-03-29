import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("logo") as File

    if (!file) {
      return NextResponse.json({ error: "No logo file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Define path to save the logo
    const logoPath = path.join(process.cwd(), "public", "company-logo.png")

    // Write file to disk
    await writeFile(logoPath, buffer)

    return NextResponse.json({
      success: true,
      message: "Logo uploaded successfully",
      path: "/company-logo.png",
    })
  } catch (error) {
    console.error("Error uploading logo:", error)
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 })
  }
}

