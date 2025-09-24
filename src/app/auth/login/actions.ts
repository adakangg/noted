"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabaseServer } from "@/utils/supabase/server" 

type FormData = {
  email: string;
  password: string;
};

export const login = async (formData: FormData) => {  
  const supabase = await supabaseServer(); 
  const { error } = await supabase.auth.signInWithPassword(formData);  
  if (error) throw error;  
  revalidatePath("/", "layout");
  redirect("/notes");
};
 
export const signup = async (formData: FormData) => {   
  const supabase = await supabaseServer(); 
  const { error } = await supabase.auth.signUp(formData); 
  if (error) throw error;
  revalidatePath("/", "layout");
  redirect("/notes"); 
};