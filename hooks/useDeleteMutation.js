import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { showToast } from "@/lib/showtoast";

const useDeleteMutation = (queryKey, deleteEndpoint) => {
  const queryClient = useQueryClient(); // ⚠ must be under QueryClientProvider

  return useMutation({
    mutationFn: async ({ ids, deleteType }) => {
      const { data: response } = await axios({
        url: deleteEndpoint,
        method: deleteType === 'PD' ? 'DELETE' : 'PUT', // fixed
        data: { ids, deleteType },
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: (data) => {
      showToast('success', data.message); // fixed
      queryClient.invalidateQueries([queryKey]);
    },
    onError: (error) => {
      showToast('error', error.message);
    },
  });
};

export default useDeleteMutation;
