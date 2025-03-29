import LoaderRequestForm from "@/components/loader-request-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <LoaderRequestForm />
      </div>
    </main>
  )
}

