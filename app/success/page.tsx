"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const requestId = searchParams.get("id")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!requestId) return

      try {
        const response = await fetch(`/api/loader-requests/${requestId}`)
        if (response.ok) {
          const result = await response.json()
          setData(result.data)
        }
      } catch (error) {
        console.error("Error fetching request data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [requestId])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl">Success!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            Your loader request has been submitted successfully and the PDF has been generated.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" passHref>
            <Button>Back to Form</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

