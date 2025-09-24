"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"  
/* eslint-disable @typescript-eslint/no-explicit-any */ 

/* Provides a single, stable instance of React Query client */

export const ReactQueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 1000 * 60 
      }
    }
  })); 
  useEffect(() => {
    (window as any).__TANSTACK_QUERY_CLIENT__ = client;
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}; 