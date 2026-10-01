/* Sóng Phú Quốc — ngân sách pixel thấp, dừng khi khuất / tab ẩn. */
(function () {
  if (window.__gsSea) return;
  var canvas = document.getElementById("seaStage");
  if (!canvas) return;
  window.__gsSea = true;

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = matchMedia("(max-width: 768px)").matches || matchMedia("(pointer: coarse)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (reduce || saveData) {
    canvas.style.background = "linear-gradient(#0b3a5c,#071422)";
    return;
  }

  var gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    desynchronized: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false
  });
  if (!gl) return;

  var vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";
  var fs = [
    "precision lowp float;",
    "uniform vec2 uR;",
    "uniform vec4 uP;",
    "uniform vec4 uD;",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/uR; uv=uv*2.0-1.0; uv.x*=uR.x/uR.y;",
    "  float w=sin(uv.x*1.6+uP.x)*0.04;",
    "  float seaY=-0.18+w;",
    "  float sea=clamp((seaY+0.02-uv.y)*22.0,0.0,1.0);",
    "  vec3 col=mix(vec3(0.04,0.16,0.32),vec3(0.02,0.08,0.16),uv.y);",
    "  col=mix(col,mix(vec3(0.0,0.32,0.52),vec3(0.01,0.08,0.18),clamp((seaY-uv.y)*1.4,0.0,1.0)),sea);",
    "  col+=vec3(0.55,0.75,0.9)*clamp(1.0-abs(uv.y-seaY)*36.0,0.0,1.0)*0.28*sea;",
    "  vec2 q=uv-uD.xy;",
    "  if(uD.w>0.01 && abs(q.x)<0.32 && abs(q.y)<0.2){",
    "    vec2 b=q/vec2(0.2,0.055);",
    "    float d=dot(b,b)-1.0;",
    "    col=mix(col,vec3(0.82,0.93,0.98),clamp(1.0-d*8.0,0.0,1.0)*uD.w);",
    "  }",
    "  gl_FragColor=vec4(col,1.0);",
    "}"
  ].join("");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uR = gl.getUniformLocation(prog, "uR");
  var uP = gl.getUniformLocation(prog, "uP");
  var uD = gl.getUniformLocation(prog, "uD");

  var dprCap = mobile ? 0.75 : 1;
  var pixelCap = mobile ? 70000 : 180000;
  var frameMs = mobile ? 1000 / 18 : 1000 / 28;
  var w = 0, h = 0, onScreen = true, running = false, last = 0, acc = 0, t0 = 0, resizeTimer = 0;

  function pose(t) {
    var cyc = t % 9;
    if (cyc > 2.4) return [0, -0.4, 0, 0];
    var u = cyc / 2.3;
    var up = Math.sin(u * Math.PI);
    return [(-0.9 + 1.8 * u), (-0.16 + up * 0.5), 0.4, 1];
  }
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    var nw = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    var nh = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (nw * nh > pixelCap) {
      var s = Math.sqrt(pixelCap / (nw * nh));
      nw = Math.max(1, Math.floor(nw * s));
      nh = Math.max(1, Math.floor(nh * s));
    }
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
  function draw(now) {
    if (!w || !h) return;
    var t = (now - t0) / 1000;
    var p = pose(t);
    gl.uniform2f(uR, w, h);
    gl.uniform4f(uP, t * 0.7, 0, 0, 0);
    gl.uniform4f(uD, p[0], p[1], p[2], p[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    acc += now - last;
    last = now;
    if (acc < frameMs) return;
    acc = 0;
    draw(now);
  }
  function sync() {
    var want = !document.hidden && onScreen;
    if (want && !running) {
      running = true;
      last = performance.now();
      if (!t0) t0 = last;
      requestAnimationFrame(loop);
    } else if (!want) running = false;
  }
  function boot() {
    resize();
    t0 = performance.now();
    draw(t0);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = !!(entries[0] && entries[0].isIntersecting);
        sync();
      }, { rootMargin: "0px" }).observe(canvas);
    }
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); if (running) draw(performance.now()); }, 200);
    }, { passive: true });
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); running = false; }, false);
    sync();
  }
  var idle = window.requestIdleCallback || function (fn) { setTimeout(fn, 400); };
  idle(boot, { timeout: 1200 });
})();
