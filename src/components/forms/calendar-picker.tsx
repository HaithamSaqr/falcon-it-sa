"use client";

import { useEffect, useState, useCallback } from "react";
import type { CalendarSlot } from "@/types/admin";

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
    <div className="rounded-xl border-2 border-dashed border-primary-500/30 bg-primary-500/5 p-5">
      <h3 className="mb-1 text-base font-bold text-text-primary">
        {isArabic ? "📅 اختر موعد العرض التجريبي" : "📅 Pick Your Demo Time"}
      </h3>
      <p className="mb-4 text-sm text-text-secondary">
        {isArabic ? "اختياري — يمكنك الحجز الآن أو سنتواصل معك لاحقاً" : "Optional — book now or we'll reach out to schedule"}
      </p>

      {/* Date picker */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          {isArabic ? "التاريخ" : "Date"}
        </label>
        <input
          type="date"
          value={selectedDate}
          min={today}
          max={maxDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            {isArabic ? "الأوقات المتاحة" : "Available Times"}
          </label>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-sm text-text-secondary">
              {isArabic ? "جاري التحميل..." : "Loading slots..."}
            </div>
          ) : slots.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-secondary">
              {isArabic ? "لا توجد أوقات متاحة في هذا اليوم" : "No available slots on this day"}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => handleSlotClick(slot)}
                  className={`rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors ${
                    selectedSlot === slot.start
                      ? "border-primary-500 bg-primary-500 text-white"
                      : slot.available
                      ? "border-gray-300 bg-white text-text-primary hover:border-primary-500 hover:bg-primary-500/5"
                      : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through"
                  }`}
                >
                  {slot.start}
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-cta/10 px-4 py-2 text-sm font-medium text-cta">
              <span>✓</span>
              {isArabic
                ? `تم اختيار ${selectedSlot} في ${selectedDate}`
                : `Selected ${selectedSlot} on ${selectedDate}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
