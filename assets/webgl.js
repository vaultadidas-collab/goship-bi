/* Goship123 — GPU-friendly Phú Quốc sea canvas. No-op on failure / reduced motion. */
(function () {
  "use strict";
  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("gl-reduced");
      return;
    }
    document.documentElement.classList.add("gl-on");

    var canvas = document.getElementById("seaStage");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t0 = performance.now(), raf = 0, running = true, visible = true;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width));
      H = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function wave(y, amp, len, speed, phase, color) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 5) {
        var yy = y + Math.sin((x / len) + phase + speed) * amp
          + Math.sin((x / (len * 1.65)) - phase * 0.55) * (amp * 0.32);
        ctx.lineTo(x, yy);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function cloud(cx, cy, s, a) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 18 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 12 * s, cy + 2 * s, 10 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 14 * s, cy + 1 * s, 11 * s, 6.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function boat(cx, cy, s) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(s, s);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(12, 0);
      ctx.lineTo(8, 5);
      ctx.lineTo(-7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(125,211,252,0.95)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -11);
      ctx.lineTo(8, -2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function dolphin(cx, cy, s, a) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      ctx.scale(s, s);
      ctx.fillStyle = "rgba(125,211,252,0.9)";
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.quadraticCurveTo(-4, -8, 10, -2);
      ctx.quadraticCurveTo(16, 0, 14, 4);
      ctx.quadraticCurveTo(2, 6, -10, 6);
      ctx.quadraticCurveTo(-16, 8, -14, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, -4);
      ctx.quadraticCurveTo(0, -12, -6, -6);
      ctx.quadraticCurveTo(0, -5, 2, -4);
      ctx.fill();
      ctx.restore();
    }

    function frame(now) {
      if (!running || !visible) return;
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      /* sky — deep navy → Ton blue */
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#06101C");
      g.addColorStop(0.38, "#0A3A5C");
      g.addColorStop(0.72, "#0098EA");
      g.addColorStop(1, "#14B8A6");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      /* sun / horizon glow */
      var sg = ctx.createRadialGradient(W * 0.76, H * 0.2, 2, W * 0.76, H * 0.2, H * 0.5);
      sg.addColorStop(0, "rgba(255,236,179,0.38)");
      sg.addColorStop(0.35, "rgba(125,211,252,0.28)");
      sg.addColorStop(1, "rgba(125,211,252,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);

      /* drifting clouds */
      cloud(W * 0.22 + Math.sin(t * 0.08) * 10, H * 0.16, 0.85, 0.22);
      cloud(W * 0.58 + Math.cos(t * 0.06) * 14, H * 0.12, 1.05, 0.18);
      cloud(W * 0.88 + Math.sin(t * 0.05 + 1) * 8, H * 0.2, 0.7, 0.15);

      /* distant island chain */
      ctx.fillStyle = "#0B2A44";
      ctx.beginPath();
      ctx.moveTo(W * 0.08, H * 0.52);
      ctx.quadraticCurveTo(W * 0.22, H * 0.32, W * 0.38, H * 0.5);
      ctx.quadraticCurveTo(W * 0.48, H * 0.38, W * 0.58, H * 0.5);
      ctx.quadraticCurveTo(W * 0.68, H * 0.42, W * 0.78, H * 0.52);
      ctx.lineTo(W * 0.08, H * 0.52);
      ctx.fill();
      /* palm / green crown */
      ctx.fillStyle = "#14B8A6";
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse(W * 0.32, H * 0.43, 11, 6.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(W * 0.52, H * 0.44, 8, 5, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      /* layered sea */
      wave(H * 0.56, 6, 44, t * 0.95, 0.2, "rgba(0,152,234,0.52)");
      wave(H * 0.64, 8, 38, t * 1.2, 1.05, "rgba(56,189,248,0.48)");
      wave(H * 0.72, 10, 52, t * 0.85, 2.1, "rgba(20,184,166,0.4)");
      wave(H * 0.8, 7, 40, t * 1.35, 0.65, "rgba(7,20,34,0.52)");

      /* gentle boat drift */
      var bx = W * (0.2 + ((t * 0.015) % 0.7));
      var by = H * 0.58 + Math.sin(t * 0.9) * 3;
      boat(bx, by, 0.95 + Math.sin(t) * 0.04);

      /* dolphin hop ~ every 9s */
      var cycle = t % 9;
      if (cycle < 1.35) {
        var p = cycle / 1.35;
        var jump = Math.sin(p * Math.PI);
        dolphin(W * (0.15 + p * 0.58), H * (0.62 - jump * 0.2), 1 + jump * 0.12, -0.32 + p * 0.65);
      }

      /* sparkles */
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (var i = 0; i < 5; i++) {
        var sx = (Math.sin(t * 0.55 + i * 1.9) * 0.5 + 0.5) * W;
        var sy = H * 0.14 + (i % 3) * 14 + Math.cos(t * 0.8 + i) * 3;
        ctx.globalAlpha = 0.2 + 0.35 * Math.abs(Math.sin(t * 1.6 + i));
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }

    function kick() {
      if (!running || !visible) return;
      resize();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", function () {
      clearTimeout(window.__gsSeaR);
      window.__gsSeaR = setTimeout(kick, 140);
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        t0 = performance.now();
        kick();
      }
    });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        visible = !!(entries[0] && entries[0].isIntersecting);
        if (visible) {
          t0 = performance.now();
          kick();
        } else {
          cancelAnimationFrame(raf);
        }
      }, { threshold: 0.05 });
      io.observe(canvas);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", kick);
    } else {
      kick();
    }
  } catch (e) {
    try { document.documentElement.classList.remove("gl-on"); } catch (_) {}
  }
})();
