import { AlertTriangle } from "lucide-react";
import { UserModal } from "./UserModal";

export function UserDeleteDialog({ open, onClose, onConfirm, user, loading }) {
  return (
    <UserModal open={open} onClose={onClose}>
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Remove User</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Are you sure you want to remove{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {user?.name || user?.email}
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium disabled:opacity-60"
          >
            {loading ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </UserModal>
  );
}
