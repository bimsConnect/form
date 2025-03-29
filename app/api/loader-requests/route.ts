import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      date,
      shift,
      nikeMP,
      timeInNike,
      shipperName,
      receiptDate,
      noDocument,
      transaction,
      vehicleNo,
      containerNo,
      warehouseName,
      photoUrls,
    } = body

    // Insert into Neon DB
    const result = await sql`
      INSERT INTO loader_requests (
        date,
        shift,
        nike_mp,
        time_in_nike,
        shipper_name,
        receipt_date,
        no_document,
        transaction,
        vehicle_no,
        container_no,
        warehouse_name,
        photo_urls
      ) VALUES (
        ${date},
        ${shift},
        ${nikeMP},
        ${timeInNike},
        ${shipperName},
        ${receiptDate},
        ${noDocument},
        ${transaction},
        ${vehicleNo},
        ${containerNo},
        ${warehouseName},
        ${JSON.stringify(photoUrls)}
      )
      RETURNING id
    `

    const id = result.rows[0].id

    return NextResponse.json({ id, success: true })
  } catch (error) {
    console.error("Error saving loader request:", error)
    return NextResponse.json({ error: "Failed to save loader request" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const result = await sql`SELECT * FROM loader_requests ORDER BY created_at DESC`
    return NextResponse.json({ data: result.rows })
  } catch (error) {
    console.error("Error fetching loader requests:", error)
    return NextResponse.json({ error: "Failed to fetch loader requests" }, { status: 500 })
  }
}

