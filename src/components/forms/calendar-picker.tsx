"use client";

import { useEffect, useState, useCallback } from "react";
import type { CalendarSlot } from "@/types/admin";
import { cn } from "@/lib/utils";
import { FIELD } from "./styles";

interface CalendarPickerProps {
  onSelect: (datetime: string | null) => void;
  locale?: string;
}

export default function CalendarPicker({ onSelect, locale = "en" }: CalendarPickerProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isArabic = locale === "ar";

  // Check if calendar is enabled
  useEffect(() => {
    fetch("/api/calendar/slots?date=" + formatDate(new Date()))
      .then((r) => r.json())
      .then((d) => setEnabled(d.data?.enabled ?? false))
      .catch(() => setEnabled(false));
  }, []);

  const fetchSlots = useCallback(async (date: string) => {
    setLoading(true);
    setSelectedSlot(null);
    onSelect(null);
    try {
      const res = await fetch(`/api/calendar/slots?date=${date}`);
      const data = await res.json();
      setSlots(data.data?.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [onSelect]);

  function handleDateChange(date: string) {
    setSelectedDate(date);
    if (date) fetchSlots(date);
  }

  function handleSlotClick(slot: CalendarSlot) {
    if (!slot.available) return;
    const datetime = `${selectedDate}T${slot.start}:00`;
    setSelectedSlot(slot.start);
    onSelect(datetime);
  }

  // Don't render if calendar is disabled or not yet checked
  if (enabled === null || enabled === false) return null;

  const today = formatDate(new Date());
  const maxDate = formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="rounded-2xl bg-page p-5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.08)]">
      <h3 className="mb-1 text-base font-bold text-ink rtl:font-semibold">
        {isArabic ? "اختر الوقت المفضل للموعد" : "Choose a preferred time"}
      </h3>
      <p className="mb-4 text-sm text-body">
        {isArabic ? "اختياري. نؤكد الموعد معك بعد إرسال الطلب." : "Optional. We confirm the appointment with you after you submit."}
      </p>

      {/* Date picker */}
      <div className="mb-4">
        <label htmlFor="demo-date" className="mb-1.5 block text-sm font-semibold text-ink">
          {isArabic ? "التاريخ" : "Date"}
        </label>
        <input
          id="demo-date"
          type="date"
          value={selectedDate}
          min={today}
          max={maxDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className={FIELD}
        />
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="mb-2 block text-sm font-semibold text-ink">
            {isArabic ? "الأوقات المتاحة" : "Available times"}
          </p>

          {loading ? (
            <p className="py-6 text-center text-sm text-body">
              {isArabic ? "جارٍ تحميل الأوقات" : "Loading times"}
            </p>
          ) : slots.length === 0 ? (
            <p className="py-4 text-center text-sm text-body">
              {isArabic ? "لا توجد أوقات متاحة في هذا اليوم" : "No available times on this day"}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => handleSlotClick(slot)}
                  aria-pressed={selectedSlot === slot.start}
                  dir="ltr"
                  className={cn(
                    "v2-press h-11 rounded-full text-center text-sm font-semibold outline-brand focus-visible:outline-3 focus-visible:outline-offset-2",
                    selectedSlot === slot.start
                      ? "bg-brand text-white"
                      : slot.available
                        ? "bg-surface text-ink shadow-[inset_0_0_0_1px_rgba(11,26,51,0.16)] hover:bg-sky"
                        : "cursor-not-allowed bg-surface/60 text-muted line-through",
                  )}
                >
                  {slot.start}
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <p className="mt-3 rounded-xl bg-sky px-4 py-2 text-sm font-semibold text-brand-deep">
              {isArabic
                ? `الوقت المفضل: ${selectedSlot} في ${selectedDate}`
                : `Preferred time: ${selectedSlot} on ${selectedDate}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
