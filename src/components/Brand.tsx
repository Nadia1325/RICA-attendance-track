// src/components/Brand.tsx
import { cn } from "../lib/utils";

interface BrandProps {
  className?: string;
}

export const RicaLogo = ({ className }: BrandProps) => (
  <img
    src="/rica-logo.png" // ← public path
    alt="RICA – Rwanda Inspectorate, Competition and Consumer Protection Authority"
    className={cn("object-contain", className)}
    draggable={false}
  />
);

export const RwandaEmblem = ({ className }: BrandProps) => (
  <img
    src="/republic-of-rwanda.png" // ← public path
    alt="Republic of Rwanda coat of arms"
    className={cn("object-contain", className)}
    draggable={false}
  />
);
