"use client";

import { useEffect, useState } from "react";
import { useReminder } from "@/hooks/useReminder";

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  // Activate reminders
  useReminder();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
