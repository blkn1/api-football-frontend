# Football Data Frontend Implementation Guide (Final +Applied)

Bu doküman, Read API ile çalışan iddaa benzeri bir canlı skor uygulaması için **teknik olarak doğru, güvenli ve uygulanabilir tek yaklaşımı** anlatır.

## 1. Amaç ve API Endpoint'leri

Sistem aşağıdaki endpoint'ler üzerine kuruludur. Başka endpoint (örn: `/v1/leagues`) **yoktur**.

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/v1/health` | Servis sağlık durumu kontrolü. |
| `GET` | `/v1/fixtures?date=...` | Günlük bülten (Filtresiz tüm ligler). |
| `GET` | `/v1/sse/live-scores` | Canlı skor akışı (SSE). |
| `GET` | `/v1/teams/{id}/fixtures` | Takım fikstürü. |
| `GET` | `/v1/teams/{id}/metrics` | Takım analiz verileri. |
| `GET` | `/v1/fixtures/{id}/details` | Maç detayları. |
| `GET` | `/v1/h2h` | İki takım arası geçmiş maçlar. |

## 2. Data Fetching Stratejisi

Read API, tarih bazlı sorgularda veritabanındaki **tüm** maçları döndürür. Bu durum "çöp" veri görüntüsüne sebep olur.

### Çözüm: "Tracked Leagues" Whitelist
İddaa bültenine benzer temiz bir görüntü için **Client-Side Filtering** uygulanmalıdır.

1.  **Konfigürasyon (`.env`):**
    ```env
    # İzlenen popüler liglerin ID listesi (Süper Lig, PL, La Liga, Bundesliga, Serie A, Şampiyonlar Ligi)
    VITE_TRACKED_LEAGUES="203,39,140,78,135,2" 
    ```
    
    *Güvenli Parse Mantığı:*
    ```typescript
    const raw = (import.meta.env.VITE_TRACKED_LEAGUES || "").trim();
    const trackedLeagues = new Set(
      raw ? raw.split(",").map(s => Number(s.trim())).filter(n => Number.isFinite(n)) : []
    );
    ```

2.  **Fetch & Filter Yöntemi:**
    *   API'den `limit=200` (maksimum limit) ile günün maçlarını çek.
    *   Frontend içinde `fixture.league_id` değeri whitelist içinde değilse kullanıcıya gösterme.

### Status Bucket Kuralları (Strict Contract)
Maçların hangi sekmede görüneceği **kesinlikle** aşağıdaki kümere göre belirlenmelidir:

```typescript
const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "SUSP", "INT"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO", "ABD", "CANC"]);
// Geri kalan her şey (NS, TBD vb.) -> UPCOMING
```

## 3. Lig İsimlendirme Çözümü

API `/v1/leagues` endpoint'i sağlamadığı için lig isimleri statik olarak çözülmelidir.

**Çözüm: Static League Map**
Sadece whitelist (`VITE_TRACKED_LEAGUES`) ile uyumlu ligler için frontend tarafında statik bir map oluşturulur.

```typescript
// src/lib/constants.ts
export const LEAGUE_NAMES: Record<number, string> = {
  203: "Trendyol Süper Lig",
  39:  "Premier League",
  140: "La Liga",
  78:  "Bundesliga",
  135: "Serie A",
  2:   "UEFA Şampiyonlar Ligi"
};

// Kullanımı
const leagueName = LEAGUE_NAMES[fixture.league_id] || `League ${fixture.league_id}`;
```

## 4. Canlı Skor Sayfası (Live Page + Filtering)

Canlı skorlar için **SSE (Server-Sent Events)** kullanılır. Gelen veriler, tıpkı normal istekler gibi **whitelist** ile filtrelenmelidir.

### SSE Implementasyonu

```typescript
useEffect(() => {
  const raw = (import.meta.env.VITE_TRACKED_LEAGUES || "").trim();
  const trackedLeagues = new Set(
    raw ? raw.split(",").map(s => Number(s.trim())).filter(n => Number.isFinite(n)) : []
  );
  
  // Proxy üzerinden bağlantı
  const evtSource = new EventSource("/api/v1/sse/live-scores?interval_seconds=3&limit=300");

  evtSource.onmessage = (event) => {
    const allLiveFixtures = JSON.parse(event.data);
    
    // Whitelist ile filtreleme
    const filteredLive = allLiveFixtures.filter((f: any) => trackedLeagues.has(f.league_id));
    
    updateLiveState(filteredLive);
  };

  return () => evtSource.close();
}, []);
```

## 5. Güvenlik ve Reverse Proxy (Nginx)

**Kritik Kural:** Frontend repo'su ve Nginx konfigürasyonu **hiçbir gizli anahtar (API Şifresi)** tutmamalıdır.

**Prod Çözümü:**
Basic Auth, uygulama seviyesinde (Nginx/Code) **DEĞİL**, altyapı seviyesinde çözülmelidir:
1.  **IP Allowlist:** Read API tarafında, bu sunucunun IP'sine şifresiz erişim izni tanımlanır.
2.  **Platform Proxy:** Coolify/Traefik gibi araçlar ile dışarıya çıkan isteklere otomatik header eklenir.

### Nginx Konfigürasyonu (`nginx.conf`)

```nginx
server {
    listen 80;
    server_name localhost;

    # SPA Routing
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        # URL Rewrite: /api/v1/x -> /v1/x
        rewrite ^/api/(.*) /$1 break;

        proxy_pass https://readapi.zinalyze.pro;
        proxy_set_header Host readapi.zinalyze.pro;

        # SSE Optimization (Connection header removed per request)
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
    }
}
```

## 6. 5 Dakikalık Smoke Test

Deployment sonrası sistemin çalıştığını doğrulamak için `curl` ile test edin.

```bash
# 1. Health Check
curl http://localhost/api/v1/health

# 2. Fikstür Çekimi
curl http://localhost/api/v1/fixtures?date=2025-12-21&limit=200

# 3. SSE Testi
curl -N "http://localhost/api/v1/sse/live-scores?interval_seconds=3&limit=300"
```
