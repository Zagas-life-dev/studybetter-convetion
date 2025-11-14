import { PdfUploadForm } from "@/components/pdf-upload-form"

export default function NewResourcePage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-2">Create New Resource</h1>
        <p className="text-sm sm:text-base text-gray-600">Upload a PDF and get AI-powered summaries or explanations</p>
      </div>
      <PdfUploadForm hideHeading={true} />
    </div>
  )
}

