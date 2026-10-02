# Changelog — Goship123 out-v2

Vòng nâng cấp UI từ `out/` → `out-v2/` (không đụng `out/`).

## v2.3 — Bỏ thuê xe giờ/ngày → thẻ đón tiễn sân bay (02/10/2026, Asia/Saigon)

### Đã gỡ (feature thuê xe)

- HTML `#rentbox` / `#rentVeh` / `#rentPk` / `#bookRent` / `#rentWhen`
- CONFIG `RENTALS` + `RENT_LBL`, handler `calcRent` / `rentVeh` / `rentPk`
- Banner / FAQ / schema FAQPage / footer / GoBot / DICT EN còn quảng cáo gói 250k–320k/giờ · 1,2–1,5tr/ngày

### Thay bằng

- Thẻ **Đón / tiễn sân bay Phú Quốc** (`.airbox`): 3 tuyến mẫu sân bay↔Dương Đông / Bãi Trường / An Thới
- Giá mẫu tính từ `VEHICLES.car4` + bảng `KM` + phụ sân bay (vd. ~186k / ~138k / ~258k)
- CTA preselect form Gọi xe (car4 + điểm đón/trả sân bay) rồi `calcFare()` — khách bấm **Đặt xe** như cuốc thường
- Chip **Tour Nam đảo / Bắc đảo** + hotline: copy intent → mở Zalo `CONFIG.ZALO_PHONE` (không fake CONFIG thuê)

### Giữ nguyên

- Cuốc bike / car4 / car7 + phụ phí sân bay trên trip
- Hotline **0387720750**, Zalo, Telegram, `taixe.html` / `quanly.html`, `esc()`, food + ride flows

### Kỹ thuật

- `node --check` JS inline: OK
- Sửa nhỏ: `isAirport(zFrom)||isAirport(zTo)` khi ghép tin đặt xe (trước gọi `isAirport()` không đối số)

## v2.2 — Giá thuê xe có tài xế + tone local shop (02/10/2026, Asia/Saigon)

### RENTALS (CONFIG — trước → sau)

Gói **có tài xế + xăng** (cut tài xế 80%). Không đụng `VEHICLES` (xe ôm / ô tô cuốc).

| Loại | Gói | Trước | Sau |
|------|-----|-------|-----|
| 4 chỗ | 1 giờ | 150.000 | **250.000** |
| 4 chỗ | Nửa ngày (4h) | 520.000 | **850.000** |
| 4 chỗ | Nguyên ngày (~10h) | 700.000 | **1.200.000** |
| 7 chỗ | 1 giờ | 200.000 | **320.000** |
| 7 chỗ | Nửa ngày (4h) | 680.000 | **1.100.000** |
| 7 chỗ | Nguyên ngày (~10h) | 900.000 | **1.500.000** |

**Lý do:** Giá cũ (150k/giờ · 700k/ngày) dưới sâu so với thị trường Phú Quốc thuê **có tài xế** (thường ~250–400k/giờ · gói ngày ~1,2–1,8tr). Self-drive 4 chỗ ~500–900k/ngày; with-driver phải cao hơn. Mức mới cạnh tranh mid-market, đủ bền cho tài xế/quản lý.

**Nguồn tham chiếu (Google, ~10/2026):** khamphaphuquoc.com.vn, viettopreview.vn, thuexetaydo.com, thanhduyphuquoc.com và các gói đưa đón sân bay/tour đảo phổ biến trên đảo.

### Chuỗi UI đã đồng bộ

- Rentbox `.vpr` (250k/giờ · 320k/giờ), `#rentAmt` mặc định 250.000đ
- Nhãn gói: **Nguyên ngày (~10h)** + `RENT_LBL`
- Banner b4, FAQ phí dịch vụ, schema FAQPage (câu phí)
- GoBot quick replies (ô tô & phí ship), DICT EN (banner / CTA / gói ngày)
- CTA: bỏ rocket “gửi shop liền 🚀” → “Đặt thuê xe — gửi shop”

### Giao diện (bớt “bot AI”)

- Orbs nền mờ hơn / chậm hơn; sheen logo mềm 9s; tắt blink clock-dot / hotline pill / pinslot bounce / track-step blink / botfab float
- Soften ALL-CAPS: “Đang mở cửa”, “Hotline / Zalo”
- Giữ logo premium, hotline **0387720750**, Zalo, Telegram, `taixe.html` / `quanly.html`, `esc()`, `CONFIG.ZALO_PHONE`, booking JS

### Giữ nguyên

- `VEHICLES` bike/car4/car7 (cuốc) từ v2.1
- FREESHIP ngưỡng 150.000đ (đồ ăn — không liên quan thuê xe)

## v2.1 — Giá cuốc + polish premium (02/10/2026, Asia/Saigon)

### Bảng giá xe (CONFIG `VEHICLES` — client hiển thị & tính giá)

Công thức giữ nguyên: `fare = base + max(0, km − freeKm) × perKm + (airport nếu đón/trả sân bay)`.

| Loại | Trước | Sau |
|------|-------|-----|
| Xe ôm | base 13.000 · /km 5.500 · sân bay +10.000 · cut 85% | **base 15.000 · /km 6.000 · sân bay +15.000 · cut 85%** |
| Ô tô 4 chỗ | base 35.000 (2 km) · /km 13.000 · sân bay +40.000 · cut 80% | **base 40.000 (2 km) · /km 12.000 · sân bay +50.000 · cut 80%** |
| Ô tô 7 chỗ | base 45.000 (2 km) · /km 16.000 · sân bay +40.000 · cut 80% | **base 55.000 (2 km) · /km 14.500 · sân bay +50.000 · cut 80%** |

- Xe ôm tăng nhẹ → tài xế & hệ thống đều thêm tiền tuyệt đối trên cuốc ngắn/sân bay.
- Ô tô: tăng base + phụ sân bay, **hạ /km** → cuốc dài (An Thới…) cạnh tranh hơn, dễ có việc.
- Thuê xe ngày/giờ lúc đó **giữ nguyên** (sau này chỉnh ở v2.2).
- Đồng bộ banner, FAQ, schema FAQ, `VEH_HINT`, nhãn `.vpr`, bot GoBot, DICT EN.

### Giao diện

- Logo SVG premium hơn (viền glass, đảo–sóng–xe giao hàng); header logo 64px, float + sheen nhẹ (không xoay đồng xu).
- Header glass/depth chậm; tắt blink pill / numGlow gây cảm giác “AI ghost”.
- `#bgfx` orb biển + plane CSS; `webgl.js` sóng/đảo/mây/thuyền/cá heo — IntersectionObserver + `prefers-reduced-motion`.
- Caption biển: tone du lịch địa phương, không hype rẻ.
- Thẻ dịch vụ / chọn xe: glass nhẹ, SVG thay emoji chrome (giữ emoji trong chat/đơn).

### Giữ nguyên

- Hotline **038 772 0750**, Zalo `zalo.me/0387720750`, Telegram `t.me/Kodeeboyzz`.
- `taixe.html` / `quanly.html`, `esc()`, `CONFIG.ZALO_PHONE`, luồng đặt đơn, Leaflet, QR.

## Việc còn lại (Cuong)

- Thay `bot-qr.png` / `pay-qr.png` bằng QR thật.
- (Tuỳ chọn) Token bot / GA khi deploy; `og:image` PNG tuyệt đối sau khi có domain Pages.
