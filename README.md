# Patiizpet

İzmir'de hizmet veren modern pet kuaförü için Next.js tabanlı randevu sitesi ve admin paneli.

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

## Vercel ortam değişkenleri

Kalıcı randevu verisi için Vercel KV bağlayın ve şu değişkenleri ekleyin:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `ADMIN_PASSWORD`

`ADMIN_PASSWORD` admin paneline girişte kullanılır. Panel yolu: `/admin`.
