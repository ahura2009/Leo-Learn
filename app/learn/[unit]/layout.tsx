import type { ReactNode } from "react";
import { units } from "@/lib/course-data";

export function generateStaticParams() {
  return units.map((unit) => ({ unit: unit.id }));
}

export default function UnitLayout({ children }: { children: ReactNode }) {
  return children;
}
