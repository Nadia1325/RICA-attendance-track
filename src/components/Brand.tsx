// src/components/Brand.tsx
import React from "react";
import ricaLogo from "../assets/rica-logo.png";
import rwandaEmblem from "../assets/republic-of-rwanda.png";
import { cn } from "../lib/utils";

interface BrandProps {
  className?: string;
}

/** Full RICA wordmark (transparent PNG, best on a light background). */
export const RicaLogo: React.FC<BrandProps> = ({ className }) => {
  return (
    <img
      src={ricaLogo}
      alt="RICA – Rwanda Inspectorate, Competition and Consumer Protection Authority"
      className={cn("select-none object-contain", className)}
      draggable={false}
    />
  );
};

/** Republic of Rwanda coat of arms (transparent PNG). */
export const RwandaEmblem: React.FC<BrandProps> = ({ className }) => {
  return (
    <img
      src={rwandaEmblem}
      alt="Republic of Rwanda coat of arms"
      className={cn("select-none object-contain", className)}
      draggable={false}
    />
  );
};