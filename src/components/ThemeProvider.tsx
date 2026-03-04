"use client"
import { ReactNode } from 'react';
import { useThemeEffect } from '@/hooks/useTheme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  useThemeEffect();
  return <>{children}</>;
}
