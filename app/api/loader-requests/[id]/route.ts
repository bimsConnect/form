import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      SELECT * FROM loader_requests WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Loader request not found" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] })
  } catch (error) {
    console.error("Error fetching loader request:", error)
    return NextResponse.json({ error: "Failed to fetch loader request" }, { status: 500 })
  }
}

