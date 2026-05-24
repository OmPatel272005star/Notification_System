import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, Button } from "../../components/ui";
import EditProfileModal from "../../components/ui/EditProfileModal";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper: format ISO date string → readable date
  const fmtDate = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  };

  // Avatar: use stored base64 picture or show initials
  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] hover:from-[#5D4EE5] hover:to-[#7B6CEF] rounded-xl shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          Edit Profile
        </button>
      </div>

      {/* Avatar + basic info */}
      <Card className="p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center text-2xl font-bold text-white overflow-hidden flex-shrink-0 shadow-lg shadow-[#6D5EF5]/30">
            {user?.profile?.profile_picture ? (
              <img
                src={user.profile.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {user?.display_name || "—"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5] capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Full Name"   value={user?.display_name} />
          <InfoRow label="Gender"      value={user?.profile?.gender ? capitalise(user.profile.gender) : null} />
          <InfoRow label="Date of Birth" value={fmtDate(user?.profile?.dob)} />
          <InfoRow label="Country"     value={user?.profile?.country} />
          <InfoRow label="State"       value={user?.profile?.state} />
          <InfoRow label="City"        value={user?.profile?.city} />
          <InfoRow label="Mobile"      value={user?.profile?.mobile} />
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security</h2>
        <Button variant="secondary">Change Password</Button>
      </Card>

      {/* Session */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Session</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Sign out of your MailFlow account on this device.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-xl transition-colors shadow-sm"
        >
          Logout
        </button>
      </Card>

      {/* Edit Profile Modal */}
      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value || "—"}</p>
    </div>
  );
}

function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
