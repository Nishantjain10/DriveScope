import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1 text-base md:text-sm",
        "placeholder:text-gray-400",
        "focus:border-neutral-300 focus:ring-1 focus:ring-neutral-300 focus:outline-none transition-all",
        "file:text-foreground selection:bg-primary selection:text-primary-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-400",
        className
      )}
      {...props}
    />
  );
}

export { Input };
