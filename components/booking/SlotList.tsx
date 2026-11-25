"use client";

import { Alert, cn } from "@/components/ui";
import { formatTime } from "@/lib/format";
import type { SlotDto, SlotsState } from "./useSlots";

type Props = { state: SlotsState; selected: string | null; onSelect: (startsAt: string) => void };

export function SlotList({ state, selected, onSelect }: Props) {
  if (state.status === "idle") return null;
  if (state.status === "error") return <Alert tone="error">Could not load free times. Please try again.</Alert>;
  return (
    <div role="group" aria-label="Available times" aria-busy={state.status === "loading"} className="flex flex-col gap-3">
      <p className="text-sm font-medium text-ink">Available times</p>
      {state.status === "ready" && state.slots.length === 0 && (
        <p className="text-sm text-ink-muted">No free times on this day</p>
      )}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {state.slots.map((slot: SlotDto) => {
          const isSelected = slot.startsAt === selected;
          return (
            <button
              key={slot.startsAt}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(slot.startsAt)}
              className={cn(
                "h-10 rounded-[var(--radius-control)] border text-sm font-medium tabular-nums transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                isSelected
                  ? "border-ink bg-ink text-canvas"
                  : "border-line bg-surface text-ink hover:border-accent hover:bg-accent-soft",
              )}
            >
              {formatTime(slot.startsAt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
