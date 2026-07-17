import { findClosedBlockConflict, getBusinessSettings, isWithinWorkingHours, normalizeTime, overlaps, toMinutes } from "./business";
import { kvStore } from "./kv";
import { hasPersistentStorage } from "./storage";
import { Appointment, AppointmentInput, AppointmentStatus } from "./types";

const INDEX_KEY = "appointments:index";
const memoryStore = new Map<string, Appointment>();

export function validateAppointment(input: AppointmentInput) {
  const required = [
    input.date,
    input.startTime,
    input.endTime,
    input.customerName,
    input.phone,
    input.petName,
    input.petType,
    input.service
  ];

  if (required.some((value) => !String(value || "").trim())) {
    return "Lütfen zorunlu alanları doldurun.";
  }

  if (toMinutes(input.startTime) >= toMinutes(input.endTime)) {
    return "Bitiş saati başlangıçtan sonra olmalı.";
  }

  return null;
}

export async function listAppointments() {
  if (!hasPersistentStorage()) {
    return Array.from(memoryStore.values()).sort(sortAppointments);
  }

  const ids = await kvStore.smembers(INDEX_KEY);
  if (!ids.length) return [];

  const items = await kvStore.mget<Appointment>(ids.map((id) => `appointments:${id}`));
  return items.filter((item): item is Appointment => Boolean(item)).sort(sortAppointments);
}

export async function listPublicAppointments(date?: string) {
  const items = await listAppointments();
  const settings = await getBusinessSettings();
  const closedBlocks: { date: string; startTime: string; endTime: string; service: string; status: AppointmentStatus | "closed" }[] = settings.closedBlocks
    .filter((block) => !date || block.date === date)
    .map(({ date: day, startTime, endTime, reason }) => ({
      date: day,
      startTime,
      endTime,
      service: reason || "Kapalı",
      status: "closed" as const
    }));

  const publicAppointments: { date: string; startTime: string; endTime: string; service: string; status: AppointmentStatus | "closed" }[] = items
    .filter((item) => !date || item.date === date)
    .filter((item) => item.status !== "cancelled")
    .map(({ date: day, startTime, endTime, service, status }) => ({
      date: day,
      startTime,
      endTime,
      service,
      status
    }));

  return publicAppointments.concat(closedBlocks);
}

export async function createAppointment(input: AppointmentInput) {
  const error = validateAppointment(input);
  if (error) throw new Error(error);

  const settings = await getBusinessSettings();
  if (!isWithinWorkingHours(settings, input.date, input.startTime, input.endTime)) {
    throw new Error("Bu saat işletmenin çalışma saatleri dışında.");
  }

  const closedBlock = findClosedBlockConflict(settings, input.date, input.startTime, input.endTime);
  if (closedBlock) {
    throw new Error(`Bu saat kapalı: ${closedBlock.reason}`);
  }

  const existing = await listAppointments();
  const hasConflict = existing.some(
    (item) =>
      item.date === input.date &&
      item.status !== "cancelled" &&
      overlaps(input.startTime, input.endTime, item.startTime, item.endTime)
  );

  if (hasConflict) {
    throw new Error("Bu saat aralığı dolu. Lütfen başka bir saat seçin.");
  }

  const appointment: Appointment = {
    id: crypto.randomUUID(),
    date: input.date,
    startTime: normalizeTime(input.startTime),
    endTime: normalizeTime(input.endTime),
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    petName: input.petName.trim(),
    petType: input.petType.trim(),
    service: input.service.trim(),
    notes: input.notes?.trim() || "",
    status: input.status || "pending",
    source: input.source || "customer",
    createdAt: new Date().toISOString()
  };

  if (!hasPersistentStorage()) {
    memoryStore.set(appointment.id, appointment);
    return appointment;
  }

  await kvStore.set(`appointments:${appointment.id}`, appointment);
  await kvStore.sadd(INDEX_KEY, appointment.id);
  return appointment;
}

export async function updateAppointment(id: string, patch: Partial<Appointment>) {
  const current = await getAppointment(id);
  if (!current) throw new Error("Randevu bulunamadı.");

  const next = { ...current, ...patch, id: current.id };
  if (patch.startTime) next.startTime = normalizeTime(patch.startTime);
  if (patch.endTime) next.endTime = normalizeTime(patch.endTime);

  const error = validateAppointment(next);
  if (error) throw new Error(error);

  const existing = await listAppointments();
  const hasConflict = existing.some(
    (item) =>
      item.id !== id &&
      item.date === next.date &&
      item.status !== "cancelled" &&
      next.status !== "cancelled" &&
      overlaps(next.startTime, next.endTime, item.startTime, item.endTime)
  );

  if (hasConflict) throw new Error("Bu saat aralığı başka bir randevu ile çakışıyor.");

  if (!hasPersistentStorage()) {
    memoryStore.set(id, next);
    return next;
  }

  await kvStore.set(`appointments:${id}`, next);
  return next;
}

export async function deleteAppointment(id: string) {
  if (!hasPersistentStorage()) {
    memoryStore.delete(id);
    return;
  }

  await kvStore.del(`appointments:${id}`);
  await kvStore.srem(INDEX_KEY, id);
}

async function getAppointment(id: string) {
  if (!hasPersistentStorage()) return memoryStore.get(id) || null;
  return kvStore.get<Appointment>(`appointments:${id}`);
}

function sortAppointments(a: Appointment, b: Appointment) {
  return `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
}

export const statuses: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];
