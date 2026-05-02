import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
export function ButtonLoading({
  type,
  text,
  loading,
  className,
  onClick,
  ...props
}) {
  return (
    <Button
      type={type}
      disabled={loading}
      className={cn("", className)}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className=" animate-spin" />}
      {text}
    </Button>
  );
}
