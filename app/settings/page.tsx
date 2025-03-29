import LogoUploader from "@/components/logo-uploader"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-md">
        <LogoUploader />
      </div>
    </div>
  )
}

