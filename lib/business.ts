import { kv } from "@vercel/kv";
import { hasPersistentStorage } from "./storage";
import { BusinessSettings, ClosedBlock, DayKey } from "./types";

const SETTINGS_KEY = "business:settings";
let memorySettings: BusinessSettings | null = null;

export const dayLabels: Record<DayKey, string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar"
};

export const dayOrder = Object.keys(dayLabels) as DayKey[];

export function defaultBusinessSettings(): BusinessSettings {
  const workingHours = dayOrder.reduce<BusinessSettings["workingHours"]>((acc, day) => {
    acc[day] = {
      open: "09:00",
      close: day === "sunday" ? "18:00" : "19:00",
      closed: day === "sunday"
    };
    return acc;
  }, {} as BusinessSettings["workingHours"]);

  return {
    slotMinutes: 60,
    workingHours,
    closedBlocks: [],
    updatedAt: new Date().toISOString()
  };
}

export async function getBusinessSettings() {
  if (!hasPersistentStorage()) return memorySettings || defaultBusinessSettings();
  try {
    return (await kv.get<BusinessSettings>(SETTINGS_KEY)) || defaultBusinessSettings();
  } catch (error) {
    console.error("KV settings read failed", error);
    return memorySettings || defaultBusinessSettings();
  }
}

export async function updateBusinessSettings(input: Partial<BusinessSettings>) {
  const current = await getBusinessSettings();
  const next: BusinessSettings = {
    ...current,
    slotMinutes: Number(input.slotMinutes || current.slotMinutes),
    workingHours: input.workingHours || current.workingHours,
    closedBlocks: input.closedBlocks || current.closedBlocks,
    updatedAt: new Date().toISOString()
  };

  await saveBusinessSettings(next);
  return next;
}

export async function addClosedBlock(input: Omit<ClosedBlock, "id" | "createdAt">) {
  if (!input.date || !input.startTime || !input.endTime) {
    throw new Error("Tarih, başlangıç ve bitiş saati zorunludur.");
  }

  if (toMinutes(input.startTime) >= toMinutes(input.endTime)) {
    throw new Error("Kapanış bitiş saati başlangıçtan sonra olmalı.");
  }

  const current = await getBusinessSettings();
  const block: ClosedBlock = {
    id: crypto.randomUUID(),
    date: input.date,
    startTime: normalizeTime(input.startTime),
    endTime: normalizeTime(input.endTime),
    reason: input.reason?.trim() || "Kapalı",
    createdAt: new Date().toISOString()
  };
  const next = {
    ...current,
    closedBlocks: [...current.closedBlocks, block],
    updatedAt: new Date().toISOString()
  };

  await saveBusinessSettings(next);
  return next;
}

export async function removeClosedBlock(id: string) {
  const current = await getBusinessSettings();
  const next = {
    ...current,
    closedBlocks: current.closedBlocks.filter((block) => block.id !== id),
    updatedAt: new Date().toISOString()
  };

  await saveBusinessSettings(next);
  return next;
}

export function dayKeyForDate(date: string): DayKey {
  const dayIndex = new Date(`${date}T12:00:00`).getDay();
  return dayOrder[(dayIndex + 6) % 7];
}

export function isWithinWorkingHours(settings: BusinessSettings, date: string, startTime: string, endTime: string) {
  const hours = settings.workingHours[dayKeyForDate(date)];
  if (!hours || hours.closed) return false;
  return toMinutes(startTime) >= toMinutes(hours.open) && toMinutes(endTime) <= toMinutes(hours.close);
}

export function findClosedBlockConflict(settings: BusinessSettings, date: string, startTime: string, endTime: string) {
  return settings.closedBlocks.find(
    (block) => block.date === date && overlaps(startTime, endTime, block.startTime, block.endTime)
  );
}

export function normalizeTime(value: string) {
  return value.trim().padStart(5, "0");
}

export function toMinutes(value: string) {
  const [hours, minutes] = normalizeTime(value).split(":").map(Number);
  return hours * 60 + minutes;
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

async function saveBusinessSettings(settings: BusinessSettings) {
  if (!hasPersistentStorage()) {
    memorySettings = settings;
    return;
  }

  try {
    await kv.set(SETTINGS_KEY, settings);
    memorySettings = settings;
  } catch (error) {
    console.error("KV settings write failed", error);
    memorySettings = settings;
    throw error;
  }
}
