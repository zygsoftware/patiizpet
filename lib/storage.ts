export function hasPersistentStorage() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export function storageStatus() {
  return {
    mode: hasPersistentStorage() ? "kv" : "memory",
    persistent: hasPersistentStorage()
  };
}
