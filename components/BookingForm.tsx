"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock, Loader2, PawPrint } from "lucide-react";
import { todayInTurkey } from "@/lib/date";

const slots = [
  ["09:00", "10:00"],
  ["10:00", "11:00"],
  ["11:00", "12:00"],
  ["12:00", "13:00"],
  ["13:00", "14:00"],
  ["14:00", "15:00"],
  ["15:00", "16:00"],
  ["16:00", "17:00"],
  ["17:00", "18:00"],
  ["18:00", "19:00"]
];

type PublicAppointment = {
  date: string;
  startTime: string;
  endTime: string;
};

const today = todayInTurkey();

export default function BookingForm() {
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState("12:00-13:00");
  const [booked, setBooked] = useState<PublicAppointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoadingSlots(true);
    fetch(`/api/appointments?date=${date}`)
      .then((response) => response.json())
      .then((data) => setBooked(data.appointments || []))
      .finally(() => setLoadingSlots(false));
  }, [date]);

  const busySlots = useMemo(() => {
    return new Set(booked.map((item) => `${item.startTime}-${item.endTime}`));
  }, [booked]);

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
    const refresh = await fetch(`/api/appointments?date=${date}`);
    const data = await refresh.json();
    setBooked(data.appointments || []);
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
            {slots.map(([start, end]) => {
              const value = `${start}-${end}`;
              const disabled = busySlots.has(value);
              return (
                <button
                  type="button"
                  className={slot === value ? "slot active" : "slot"}
                  disabled={disabled}
                  key={value}
                  onClick={() => setSlot(value)}
                  title={disabled ? "Bu saat dolu" : `${start} - ${end}`}
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

      <button className="submitButton" disabled={submitting || busySlots.has(slot)}>
        {submitting ? <Loader2 size={18} className="spin" /> : <Check size={18} />}
        Randevu talebi oluştur
      </button>
      {message && <p className="formMessage">{message}</p>}
    </form>
  );
}
