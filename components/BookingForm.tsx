"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock, Loader2, PawPrint } from "lucide-react";
import { todayInTurkey } from "@/lib/date";
import type { BusinessSettings, DayKey } from "@/lib/types";

type PublicAppointment = {
  date: string;
  startTime: string;
  endTime: string;
};

const today = todayInTurkey();
const dayOrder: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function dayKeyForDate(date: string): DayKey {
  const dayIndex = new Date(`${date}T12:00:00`).getDay();
  return dayOrder[(dayIndex + 6) % 7];
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

function buildSlots(settings: BusinessSettings | null, date: string) {
  const hours = settings?.workingHours[dayKeyForDate(date)];
  if (!hours || hours.closed) return [];

  const slotMinutes = settings.slotMinutes || 60;
  const result: string[][] = [];
  for (let start = toMinutes(hours.open); start + slotMinutes <= toMinutes(hours.close); start += slotMinutes) {
    result.push([toTime(start), toTime(start + slotMinutes)]);
  }
  return result;
}

export default function BookingForm() {
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState("12:00-13:00");
  const [booked, setBooked] = useState<PublicAppointment[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoadingSlots(true);
    Promise.all([fetch(`/api/appointments?date=${date}`), fetch("/api/settings")])
      .then(async ([appointmentsResponse, settingsResponse]) => {
        const appointmentsData = await appointmentsResponse.json();
        const settingsData = await settingsResponse.json();
        setBooked(appointmentsData.appointments || []);
        setSettings(settingsData.settings || null);
      })
      .finally(() => setLoadingSlots(false));
  }, [date]);

  const slots = useMemo(() => buildSlots(settings, date), [settings, date]);
  const [selectedStart, selectedEnd] = slot.split("-");

  useEffect(() => {
    if (slots.length > 0 && !slots.some(([start, end]) => `${start}-${end}` === slot)) {
      setSlot(`${slots[0][0]}-${slots[0][1]}`);
    }
  }, [slot, slots]);

  const isBusy = (start: string, end: string) => booked.some((item) => overlaps(start, end, item.startTime, item.endTime));

  async function refreshBooked() {
    const refresh = await fetch(`/api/appointments?date=${date}`);
    const data = await refresh.json();
    setBooked(data.appointments || []);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const [startTime, endTime] = slot.split("-");
    const payload = {
      date,
      startTime,
      endTime,
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      petName: formData.get("petName"),
      petType: formData.get("petType"),
      service: formData.get("service"),
      notes: formData.get("notes")
    };

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setMessage(result.message || "Randevu oluşturulamadı.");
      return;
    }

    setMessage("Randevu talebiniz alındı. Kısa süre içinde sizi arayarak teyit edeceğiz.");
    event.currentTarget.reset();
    await refreshBooked();
  }

  return (
    <form className="bookingForm" onSubmit={handleSubmit}>
      <div className="formHeader">
        <PawPrint size={24} />
        <div>
          <h3>Randevu bilgileri</h3>
          <p>Müsait saatler seçilen tarihe göre güncellenir.</p>
        </div>
      </div>

      <label>
        <span>Tarih</span>
        <div className="inputWithIcon">
          <CalendarDays size={18} />
          <input type="date" value={date} min={today} onChange={(event) => setDate(event.target.value)} />
        </div>
      </label>

      <div className="slotBlock">
        <span className="fieldLabel">Saat</span>
        {loadingSlots ? (
          <div className="loadingLine">
            <Loader2 size={18} className="spin" /> Saatler kontrol ediliyor
          </div>
        ) : (
          <div className="slotGrid">
            {slots.length === 0 && <p className="emptyState">Bu gün için randevu alınamıyor.</p>}
            {slots.map(([start, end]) => {
              const value = `${start}-${end}`;
              const disabled = isBusy(start, end);
              return (
                <button
                  type="button"
                  className={slot === value ? "slot active" : "slot"}
                  disabled={disabled}
                  key={value}
                  onClick={() => setSlot(value)}
                  title={disabled ? "Bu saat dolu veya kapalı" : `${start} - ${end}`}
                >
                  <Clock size={15} />
                  <span>{start} - {end}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="formGrid">
        <label>
          <span>Ad soyad</span>
          <input name="customerName" required placeholder="Adınız" autoComplete="name" />
        </label>
        <label>
          <span>Telefon</span>
          <input name="phone" required placeholder="05xx xxx xx xx" autoComplete="tel" />
        </label>
        <label>
          <span>Dostunuzun adı</span>
          <input name="petName" required placeholder="Pati" />
        </label>
        <label>
          <span>Tür / ırk</span>
          <input name="petType" required placeholder="Maltese, kedi..." />
        </label>
      </div>

      <label>
        <span>Hizmet</span>
        <select name="service" required defaultValue="Komple bakım">
          <option>Komple bakım</option>
          <option>Banyo ve kurutma</option>
          <option>Makas tıraşı</option>
          <option>Tırnak ve pati bakımı</option>
        </select>
      </label>

      <label>
        <span>Not</span>
        <textarea name="notes" rows={4} placeholder="Özel hassasiyet, tüy durumu veya ek not" />
      </label>

      <button className="submitButton" disabled={submitting || slots.length === 0 || isBusy(selectedStart, selectedEnd)}>
        {submitting ? <Loader2 size={18} className="spin" /> : <Check size={18} />}
        Randevu talebi oluştur
      </button>
      {message && <p className="formMessage">{message}</p>}
    </form>
  );
}
