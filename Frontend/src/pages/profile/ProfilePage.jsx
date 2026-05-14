import { useAuth } from "../../context/AuthContext";
import { Card, Button } from "../../components/ui";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <p className="text-gray-900 dark:text-gray-100 mt-1">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <p className="text-gray-900 dark:text-gray-100 mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <p className="text-gray-900 dark:text-gray-100 mt-1">{user?.role}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security</h2>
        <Button variant="secondary">Change Password</Button>
      </Card>
    </div>
  );
}
