import ProfileHeader from "@/components/profile/ProfileHeader";
import ObiectivesCard from "@/components/profile/ObiectivesCard";
import ProfileMenu from "@/components/profile/ProfileMenu";
import SessionKpiCard from "@/components/profile/SessionKpiCard";

export default function ProfilePage() {
  return (
    <div className="space-y-2 pb-14">
      <ProfileHeader />
      <ObiectivesCard />
      <SessionKpiCard />
      <ProfileMenu />
    </div>
  );
}