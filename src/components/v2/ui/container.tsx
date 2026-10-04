import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/**
 * Page column: 1200px of content, 20px inline padding on mobile, 120px on wide
 * screens (so the box is 1440px wide with padding included).
 */
export default function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1440px] px-5 md:px-12 xl:px-[120px]", className)}>
      {children}
    </Tag>
  );
}
