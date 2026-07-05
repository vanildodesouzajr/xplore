export function computeCompletionPercent(
  totalItems: number,
  completedItems: number
): number {
  if (totalItems === 0) return 0;
  return Math.round((completedItems / totalItems) * 100);
}
