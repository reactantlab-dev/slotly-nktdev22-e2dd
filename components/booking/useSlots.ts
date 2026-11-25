"use client";

import { useCallback, useEffect, useState } from "react";

export type SlotDto = { startsAt: string; endsAt: string };
export type SlotsState = { status: "idle" | "loading" | "error"; slots: SlotDto[] } | { status: "ready"; slots: SlotDto[] };

/** Loads free slots for a service/specialist/day from GET /api/availability. */
export function useSlots(serviceId: number, specialistId: number | null, date: string) {
  const [state, setState] = useState<SlotsState>({ status: "idle", slots: [] });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (specialistId === null || !date) {
      setState({ status: "idle", slots: [] });
      return;
    }
    const controller = new AbortController();
    setState({ status: "loading", slots: [] });
    const query = new URLSearchParams({ serviceId: String(serviceId), specialistId: String(specialistId), date });
    fetch(`/api/availability?${query}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`availability ${response.status}`);
        const body = (await response.json()) as { slots: SlotDto[] };
        setState({ status: "ready", slots: body.slots });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setState({ status: "error", slots: [] });
      });
    return () => controller.abort();
  }, [serviceId, specialistId, date, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, reload };
}
