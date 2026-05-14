import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", danger = true }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${danger ? "bg-red-100 dark:bg-red-900/40" : "bg-yellow-100 dark:bg-yellow-900/40"}`}>
          🗑️
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
