"use server"
import { supabaseServer } from "@/utils/supabase/server"; 
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"  

export const logout = async () => {  
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signOut(); 
  if (error) redirect("/error"); 
  revalidatePath("/", "layout");
  redirect("/");
};