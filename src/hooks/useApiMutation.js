import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../context/SnackbarContext";

const useApiMutation = (
  mutationFn,
  {
    successMessage,
    invalidateKeys = [],
    onSuccess,
    onError,
    ...options
  } = {}
) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showValidationErrors } = useSnackbar();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context) => {
      if (successMessage) {
        showSuccess(successMessage);
      }

      if (invalidateKeys.length > 0) {
        await Promise.all(
          invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
        );
      }

      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (error?.validationErrors) {
        showValidationErrors(error.validationErrors);
      } else if (error?.message) {
        showError(error.message);
      }
      onError?.(error, variables, context);
    }
  });
};

export default useApiMutation;

