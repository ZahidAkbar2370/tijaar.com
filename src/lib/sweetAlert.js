import Swal from "sweetalert2";

const defaultTheme = {
  customClass: {
    popup: "rounded-2xl shadow-2xl border border-gray-100",
    title: "text-gray-900 font-bold text-xl",
    htmlContainer: "text-gray-600",
    confirmButton: "rounded-xl px-6 py-2.5 font-semibold shadow-sm",
    cancelButton: "rounded-xl px-6 py-2.5 font-medium",
  },
  buttonsStyling: false,
};

/**
 * Confirm a destructive action (e.g. delete). Returns a Promise<boolean>.
 */
export async function confirmDelete({ title = "Are you sure?", text, confirmButtonText = "Yes, delete" }) {
  const result = await Swal.fire({
    ...defaultTheme,
    title,
    text: text || "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    focusCancel: true,
  });
  return result.isConfirmed;
}

/**
 * Confirm a non-destructive action (e.g. publish, duplicate).
 */
export async function confirmAction({ title = "Confirm", text, confirmButtonText = "Confirm" }) {
  const result = await Swal.fire({
    ...defaultTheme,
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancel",
    confirmButtonColor: "#1790d7",
    cancelButtonColor: "#6b7280",
    focusCancel: true,
  });
  return result.isConfirmed;
}

/**
 * Show a success toast (alternative to snackbar for post-action feedback).
 */
export function toastSuccess(message) {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: { popup: "rounded-xl shadow-lg" },
  });
}

/**
 * Show an error toast.
 */
export function toastError(message) {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    customClass: { popup: "rounded-xl shadow-lg" },
  });
}
