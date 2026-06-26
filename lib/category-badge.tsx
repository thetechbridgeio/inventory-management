import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const badgeColors = [
  "bg-red-100 text-red-700 border-red-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-pink-100 text-pink-700 border-pink-200",
];

const categoryColorMap = new Map<string, string>();

function getCategoryColor(category: string) {
  if (!categoryColorMap.has(category)) {
    const usedColors = [...categoryColorMap.values()];

    const availableColors = badgeColors.filter(
      (color) => !usedColors.includes(color)
    );

    const color =
      availableColors[Math.floor(Math.random() * availableColors.length)] ??
      badgeColors[Math.floor(Math.random() * badgeColors.length)];

    categoryColorMap.set(category, color);
  }

  return categoryColorMap.get(category)!;
}

type CategoryBadgeProps = {
  category: string;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 font-medium",
        getCategoryColor(category)
      )}
    >
      {category}
    </Badge>
  );
}