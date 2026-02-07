import { Badge } from "@/app/components/ui/badge";

type Status = "healthy" | "attention" | "failing";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<Status, { label: string; className: string }> = {
    healthy: {
      label: "Healthy",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    attention: {
      label: "Needs Attention",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    failing: {
      label: "Failing",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const variant = variants[status] ?? variants.healthy; // Fallback to healthy if status is invalid

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}