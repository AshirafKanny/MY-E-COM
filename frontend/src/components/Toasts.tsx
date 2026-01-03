import { useEffect } from "react";
import { useToastStore } from "../store/toastStore";

function toastClass(type: "success" | "error" | "info") {
  switch (type) {
    case "success":
      return "alert-success";
    case "error":
      return "alert-error";
    default:
      return "alert-info";
  }
}

export function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) => setTimeout(() => removeToast(toast.id), 3500));
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return (
    <div className="fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`alert shadow-sm ${toastClass(toast.type)}`}>
          <div className="flex w-full items-center justify-between gap-3 text-sm">
            <span>{toast.message}</span>
            <button className="btn btn-ghost btn-xs" onClick={() => removeToast(toast.id)}>
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
