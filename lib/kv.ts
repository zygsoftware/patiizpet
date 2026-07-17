import { hasPersistentStorage } from "./storage";

type KvResult<T> = {
  result: T;
  error?: string;
};

function endpoint(command: string, ...parts: string[]) {
  const base = process.env.KV_REST_API_URL;
  if (!base || !process.env.KV_REST_API_TOKEN) {
    throw new Error("KV bağlantısı için ortam değişkenleri eksik.");
  }

  const path = [command, ...parts.map((part) => encodeURIComponent(part))].join("/");
  return `${base.replace(/\/$/, "")}/${path}`;
}

async function request<T>(command: string, ...parts: string[]) {
  if (!hasPersistentStorage()) throw new Error("KV bağlantısı aktif değil.");

  const response = await fetch(endpoint(command, ...parts), {
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
    },
    cache: "no-store"
  });
  const data = (await response.json()) as KvResult<T>;

  if (!response.ok || data.error) {
    throw new Error(data.error || `KV komutu başarısız: ${command}`);
  }

  return data.result;
}

function serialize(value: unknown) {
  return JSON.stringify(value);
}

function parse<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export const kvStore = {
  async get<T>(key: string) {
    return parse<T>(await request<string | null>("get", key));
  },

  async set(key: string, value: unknown) {
    await request<string>("set", key, serialize(value));
  },

  async del(key: string) {
    await request<number>("del", key);
  },

  async sadd(key: string, value: string) {
    await request<number>("sadd", key, value);
  },

  async srem(key: string, value: string) {
    await request<number>("srem", key, value);
  },

  async smembers(key: string) {
    return request<string[]>("smembers", key);
  },

  async mget<T>(keys: string[]) {
    if (!keys.length) return [];
    const values = await request<(string | null)[]>("mget", ...keys);
    return values.map((value) => parse<T>(value));
  }
};
