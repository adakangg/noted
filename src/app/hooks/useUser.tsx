
import { supabaseClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";   
import { logout } from "../auth/logout/actions";

// fetch + cache currently logged in user 
export const useCurrentUser = () => (
  useQuery({
    queryKey: ["user"],
    queryFn: async () => {      
      const { data, error } = await supabaseClient.auth.getUser(); 
      const userId = data?.user?.id; 
      if (error || !userId) throw new Error("No user found"); 
      return data.user;
    }
  })
); 

// logout current user + clear query
export const useLogoutUser = () => {
  const queryClient = useQueryClient(); 
  return async () => {
    await logout();  
    queryClient.clear(); 
  };
};