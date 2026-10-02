# Goship123 — GitHub Pages (v2.3)

Site đặt xe / đồ ăn Phú Quốc. Bản deploy: **bỏ thuê xe giờ/ngày**, thêm thẻ **đón / tiễn sân bay**, UI premium.

**Hotline / Zalo:** [0387720750](https://zalo.me/0387720750) · `tel:0387720750`

## Giá cuốc (v2.3)

**Xe ôm** 15.000đ + 6.000đ/km (+15k sân bay) · **Ô tô 4 chỗ** 40.000đ/2km + 12.000đ/km · **7 chỗ** 55.000đ/2km + 14.500đ/km (ô tô sân bay +50k). Cut tài xế 85%/80%.

Trên trang chủ có thẻ **Đón / tiễn sân bay Phú Quốc** (Dương Đông / Bãi Trường / An Thới) — preselect form Gọi xe rồi đặt như cuốc thường. Tour Nam/Bắc đảo: mở Zalo hotline.

Chi tiết thay đổi: `CHANGELOG.md`.

## Deploy GitHub Pages

Repo: `vaultadidas-collab/goship-bi` · nhánh `main` · nội dung **ở root** (không bọc thêm thư mục).

1. Settings → Pages → Source: Deploy from a branch → `main` → folder **/ (root)**.
2. Có workflow `.github/workflows/pages.yml` và file `.nojekyll` (tránh Jekyll nuốt `assets/`).
3. URL dự kiến: https://vaultadidas-collab.github.io/goship-bi/
4. Kiểm tra: logo `assets/logo.svg`, hotline, Zalo, `taixe.html`, `quanly.html`, không 404 `assets/webgl.js` / `manifest.json` / `sw.js`.

## Cấu trúc

| File | Vai trò |
|------|---------|
| `index.html` | Trang khách (v2.3 — không thuê xe; thẻ sân bay) |
| `quanly.html` | Sổ điều hành (noindex) |
| `taixe.html` | Cổng tài xế (noindex) |
| `assets/logo.svg` | Logo premium / favicon |
| `assets/webgl.js` | Canvas biển/orb (tắt khi reduced-motion) |
| `manifest.json` | PWA manifest tối thiểu |
| `sw.js` | Service worker stub |
| `bot-qr.png` | Placeholder QR Bot Zalo |
| `pay-qr.png` | Placeholder QR ZaloPay |
| `CHANGELOG.md` | Nhật ký phiên bản |

## Việc cần làm trước khi chạy thật

- Thay `bot-qr.png` và `pay-qr.png` bằng QR thật.
- (Tuỳ chọn) `CONFIG.TG_BOT_TOKEN` / `TG_CHAT_ID` / `GA_ID` — không hard-code secret lên repo public.
- Cập nhật `canonical` / `og:url` / `og:image` thành URL Pages tuyệt đối khi ổn định.

## Kiểm tra nhanh

- [ ] Logo hiện, không 404 `assets/`
- [ ] Zalo → `zalo.me/0387720750`
- [ ] Hotline `tel:0387720750`
- [ ] Footer → `taixe.html` / `quanly.html`
- [ ] Thẻ đón/tiễn sân bay trên index; không còn rentbox
- [ ] Console không 404 `webgl.js` / `manifest.json` / `sw.js`
