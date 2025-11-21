import { ProfileEditor } from "@/components/profile/profile-editor"

export default function ProfilePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black mb-2">Edit Profile</h1>
        <p className="text-gray-600">Update your learning preferences and personalization settings</p>
      </div>
      <ProfileEditor />
    </div>
  )
}









