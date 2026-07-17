import { kvStore } from "./kv";
import { hasPersistentStorage } from "./storage";
import type { GalleryRecord } from "./types";

const INDEX_KEY = "gallery:index";
const memoryStore = new Map<string, GalleryRecord>();

function keyFor(id: string) {
  return `gallery:${id}`;
}

export async function listGalleryRecords() {
  if (!hasPersistentStorage()) return Array.from(memoryStore.values()).sort(sortGallery);

  const ids = await kvStore.smembers(INDEX_KEY);
  if (!ids.length) return [];

  const items = await kvStore.mget<GalleryRecord>(ids.map(keyFor));
  return items.filter((item): item is GalleryRecord => Boolean(item)).sort(sortGallery);
}

export async function createGalleryRecord(input: Partial<GalleryRecord>) {
  if (!input.title?.trim()) throw new Error("Başlık zorunludur.");
  if (!input.beforeImage?.trim() || !input.afterImage?.trim()) {
    throw new Error("Önce ve sonra fotoğrafı zorunludur.");
  }

  const record: GalleryRecord = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    petName: input.petName?.trim() || "",
    beforeImage: input.beforeImage,
    afterImage: input.afterImage,
    notes: input.notes?.trim() || "",
    createdAt: new Date().toISOString()
  };

  await saveGalleryRecord(record);
  return record;
}

export async function deleteGalleryRecord(id: string) {
  if (!hasPersistentStorage()) {
    memoryStore.delete(id);
    return;
  }

  await kvStore.del(keyFor(id));
  await kvStore.srem(INDEX_KEY, id);
}

async function saveGalleryRecord(record: GalleryRecord) {
  if (!hasPersistentStorage()) {
    memoryStore.set(record.id, record);
    return;
  }

  await kvStore.set(keyFor(record.id), record);
  await kvStore.sadd(INDEX_KEY, record.id);
}

function sortGallery(a: GalleryRecord, b: GalleryRecord) {
  return b.createdAt.localeCompare(a.createdAt);
}
