import { getProfile } from "@/actions/profiles";
import { ProfileForm } from "@/components/forms/ProfileForms";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-foreground tracking-tight">Profile Settings</h1>
        <p className="text-text-muted font-medium">Manage your personal information and preferences.</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
