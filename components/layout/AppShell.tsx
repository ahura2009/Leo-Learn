import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { BottomNavigation } from "./BottomNavigation";
import type { BottomNavigationProps } from "./BottomNavigation";

type AppShellProps = {
  children: ReactNode;
  activeNavigationItem?: BottomNavigationProps["activeItem"];
  hideBottomNavigation?: boolean;
  topNavigation?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AppShell({
  activeNavigationItem = "Home",
  children,
  className = "",
  contentClassName = "",
  hideBottomNavigation = false,
  topNavigation,
}: AppShellProps) {
  return (
    <div className={`min-h-screen bg-[var(--color-background)] ${className}`}>
      {topNavigation}
      <main className={`${hideBottomNavigation ? "pb-0" : "pb-28"} ${contentClassName}`}>
        <Container className="py-[var(--space-5)]">{children}</Container>
      </main>
      {hideBottomNavigation ? null : (
        <BottomNavigation activeItem={activeNavigationItem} />
      )}
    </div>
  );
}

export type { AppShellProps };
