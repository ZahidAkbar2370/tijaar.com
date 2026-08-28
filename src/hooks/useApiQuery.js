import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "../context/SnackbarContext";

const useApiQuery = (queryKey, queryFn, options = {}) => {
  const { showError, showValidationErrors } = useSnackbar();

  return useQuery({
    queryKey,
    queryFn,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...options,
    onError: (error) => {
      if (error?.validationErrors) {
        showValidationErrors(error.validationErrors);
      } else if (error?.message) {
        showError(error.message);
      }
      options?.onError?.(error);
    }
  });
};

export default useApiQuery;

