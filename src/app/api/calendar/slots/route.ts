import { NextRequest } from "next/server";
import { getIntegrations } from "@/lib/data-store";
import { getCalendarEvents } from "@/lib/odoo/client";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { CalendarSlot } from "@/types/admin";

// GET /api/calendar/slots?date=2026-04-01
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return jsonError("Valid date parameter required (YYYY-MM-DD)", 400);
  }

  const integrations = await getIntegrations();

  if (!integrations.calendar.enabled) {
    return jsonSuccess({ enabled: false, slots: [] });
  }

  const {
    slotDuration,
    availableDays,
    startHour,
    endHour,
    bufferMinutes,
    maxAdvanceDays,
    resourceId,
  } = integrations.calendar;

  // Check if date is within allowed range
  const requestDate = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

  if (requestDate < today) {
    return jsonSuccess({ enabled: true, slots: [] });
  }
  if (requestDate > maxDate) {
    return jsonSuccess({ enabled: true, slots: [] });
  }

  // Check if day is available
  const dayOfWeek = requestDate.getDay();
  if (!availableDays.includes(dayOfWeek)) {
    return jsonSuccess({ enabled: true, slots: [] });
  }

  // Generate all possible slots for the day
  const slots: CalendarSlot[] = [];
  const totalSlotMinutes = slotDuration + bufferMinutes;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += totalSlotMinutes) {
      const slotStart = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const endMinutes = hour * 60 + minute + slotDuration;
      if (endMinutes > endHour * 60) break;
      const slotEnd = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

      slots.push({ start: slotStart, end: slotEnd, available: true });
    }
  }

  // Try to fetch busy times from Odoo Calendar
  try {
    const dateFrom = `${dateStr} ${String(startHour).padStart(2, "0")}:00:00`;
    const dateTo = `${dateStr} ${String(endHour).padStart(2, "0")}:00:00`;

    const events = await getCalendarEvents(dateFrom, dateTo, resourceId);

    // Mark slots as unavailable if they overlap with existing events
    for (const event of events) {
      const eventStart = new Date(event.start as string);
      const eventEnd = new Date(event.stop as string);

      for (const slot of slots) {
        const slotStartTime = new Date(`${dateStr}T${slot.start}:00`);
        const slotEndTime = new Date(`${dateStr}T${slot.end}:00`);

        // Check overlap
        if (slotStartTime < eventEnd && slotEndTime > eventStart) {
          slot.available = false;
        }
      }
    }
  } catch (error) {
    console.warn("[Calendar] Could not fetch Odoo events, showing all slots as available:", error);
    // All slots remain available if Odoo is unreachable
  }

  // If date is today, mark past slots as unavailable
  const now = new Date();
  if (requestDate.toDateString() === now.toDateString()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const slot of slots) {
      const [h, m] = slot.start.split(":").map(Number);
      if (h * 60 + m <= currentMinutes) {
        slot.available = false;
      }
    }
  }

  return jsonSuccess({ enabled: true, slots });
}
