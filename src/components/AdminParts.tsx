// Admin panel muharrirlarida umumiy bo'laklar: ro'yxat elementini surish.
import { ArrowDown, ArrowUp } from "lucide-react";

/** Ro'yxatdagi elementni bir pog'ona yuqoriga (-1) yoki pastga (1) suradi. */
export function moveItem<T>(list: T[], i: number, step: -1 | 1): T[] {
  const j = i + step;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function MoveButtons({ index, count, onMove }: { index: number; count: number; onMove: (step: -1 | 1) => void }) {
  if (count < 2) return null;
  return (
    <div className="ad-move">
      <button type="button" className="ad-icon-btn" aria-label="Yuqoriga surish" disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp size={16} />
      </button>
      <button type="button" className="ad-icon-btn" aria-label="Pastga surish" disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown size={16} />
      </button>
    </div>
  );
}
