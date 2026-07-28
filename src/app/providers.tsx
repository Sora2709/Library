// src/app/providers.tsx
'use client';

import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // ✅ No SessionProvider needed anymore
  return <>{children}</>;
}