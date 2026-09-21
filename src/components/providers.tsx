"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/query-persist-client-core";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Fresh enough to feel live, cached enough to feel instant.
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            // Pick up friends' changes when returning to the app.
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  // Cold loads render the last persisted cache instantly while
  // background refetch corrects it. Effect-only: never touches
  // storage during SSR. Session revalidates on mount regardless.
  useEffect(() => {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: "settleup-query-cache",
      throttleTime: 1000,
    });
    const [unsubscribe] = persistQueryClient({
      queryClient: client,
      persister,
      maxAge: 24 * 60 * 60 * 1000,
      buster: "settleup-v1",
    });
    return unsubscribe;
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
