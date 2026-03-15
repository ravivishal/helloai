import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  urgency: string;
}

const urgencyConfig = {
  low: {
    label: "Low",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  emergency: {
    label: "Emergency",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || {
    label: urgency,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <Badge variant="secondary" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
