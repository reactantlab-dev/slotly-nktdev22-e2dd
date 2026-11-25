"use client";

import { useState } from "react";
import { Field, Surface } from "@/components/ui";
import type { SpecialistDto } from "@/lib/catalog";
import { SlotList } from "./SlotList";
import { useSlots } from "./useSlots";

type Props = { serviceId: number; specialists: SpecialistDto[]; today: string };

export function BookingForm({ serviceId, specialists, today }: Props) {
  const [specialistId, setSpecialistId] = useState<number | null>(specialists.length === 1 ? (specialists[0]?.id ?? null) : null);
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState<string | null>(null);
  const slots = useSlots(serviceId, specialistId, date);

  return (
    <Surface as="section" aria-label="Pick a time" className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-ink">Specialist</legend>
        {specialists.map((specialist) => (
          <label
            key={specialist.id}
            className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border border-line px-4 py-3 transition-colors has-[:checked]:border-ink has-[:checked]:bg-accent-soft"
          >
            <input
              type="radio"
              name="specialist"
              value={specialist.id}
              checked={specialistId === specialist.id}
              onChange={() => {
                setSpecialistId(specialist.id);
                setSelected(null);
              }}
              className="accent-[var(--color-ink)]"
            />
            <span className="font-medium">{specialist.name}</span>
            <span className="text-sm text-ink-muted">{specialist.title}</span>
          </label>
        ))}
      </fieldset>

      <Field
        label="Date"
        type="date"
        value={date}
        min={today}
        onChange={(event) => {
          setDate(event.target.value);
          setSelected(null);
        }}
        className="max-w-xs"
      />

      <SlotList state={slots} selected={selected} onSelect={setSelected} />
    </Surface>
  );
}
