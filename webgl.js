/* Sóng không gọi sin GPU. Pha tính trên CPU, pixel chỉ parabol bậc 2.
   Mobile: 1 lớp. Desktop: 2 lớp. Cá heo vẫn là uniform. */
(function () {
  if (window.__gsSea) return;
  var canvas = document.getElementById("seaStage");
  if (!canvas) return;
  window.__gsSea = true;

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = matchMedia("(max-width: 768px)").matches || matchMedia("(pointer: coarse)").matches;
  var gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: mobile ? "low-power" : "high-performance",
    preserveDrawingBuffer: false
  });
  if (!gl) return;

  var vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";
  var fs = [
    "precision mediump float;",
    "uniform vec2 uR;",
    "uniform float uT;",
    "uniform float uQ;",
    "uniform vec4 uD;",
    "uniform vec4 uP;",
    "float fsin(float x){",
    "  x=x*0.1591549;",
    "  x=x-floor(x+0.5);",
    "  return x*(1.273239-abs(x)*1.273239);",
    "}",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/uR; uv=uv*2.0-1.0; uv.x*=uR.x/uR.y;",
    "  float w=fsin(uv.x*1.7+uP.x)*0.045;",
    "  w+=fsin(uv.x*3.1+uP.y)*0.016*uQ;",
    "  float seaY=-0.18+w;",
    "  float sea=clamp((seaY+0.02-uv.y)*28.0,0.0,1.0);",
    "  vec3 col=mix(vec3(0.04,0.16,0.32),vec3(0.02,0.08,0.16),uv.y);",
    "  col=mix(col,mix(vec3(0.0,0.32,0.52),vec3(0.01,0.08,0.18),clamp((seaY-uv.y)*1.4,0.0,1.0)),sea);",
    "  col+=vec3(0.55,0.75,0.9)*clamp(1.0-abs(uv.y-seaY)*40.0,0.0,1.0)*0.35*sea;",
    "  vec2 q=uv-uD.xy;",
    "  if(abs(q.x)<0.34 && abs(q.y)<0.22 && uD.w>0.01){",
    "    float ca=uD.z, sa=sqrt(max(0.0,1.0-ca*ca))*sign(uD.z+0.001);",
    "    q=vec2(ca*q.x+sa*q.y,-sa*q.x+ca*q.y);",
    "    vec2 b=q/vec2(0.2,0.055);",
    "    float d=dot(b,b)-1.0;",
    "    vec2 n=(q-vec2(0.15,0.01))/vec2(0.07,0.022);",
    "    d=min(d,dot(n,n)-1.0);",
    "    vec2 f=(q-vec2(-0.16,0.02))/vec2(0.07,0.022);",
    "    d=min(d,dot(f,f)-1.0);",
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
  var uQ = gl.getUniformLocation(prog, "uQ");
  var uD = gl.getUniformLocation(prog, "uD");

  var dprCap = mobile ? 1 : 1.25;
  var pixelCap = mobile ? 140000 : 380000;
  var frameMs = mobile ? 1000 / 24 : 1000 / 40;
  var w = 0, h = 0, onScreen = true, running = false, last = 0, acc = 0, t0 = performance.now(), resizeTimer = 0;

  function pose(t) {
    if (reduce) return [-0.05, -0.12, 0.2, 1];
    var cyc = t % 8;
    if (cyc > 2.7) return [0, -0.4, 0, 0];
    var u = cyc / 2.55;
    var up = Math.sin(u * Math.PI);
    return [(-0.92 + 1.87 * u), (-0.16 + up * 0.58), Math.cos(u * Math.PI) * 0.85, 1];
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
    var t = (now - t0) / 1000;
    var p = pose(t);
    gl.uniform2f(uR, w, h);
    gl.uniform4f(uP, t * 0.85, -t * 1.1, 0, 0);
    gl.uniform1f(uQ, mobile ? 0 : 1);
    gl.uniform4f(uD, p[0], p[1], p[2], p[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    acc += now - last;
    last = now;
    if (acc < frameMs) return;
    acc %= frameMs;
    draw(now);
  }
  function sync() {
    var want = !document.hidden && onScreen && !reduce;
    if (want && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(loop);
    } else if (!want) running = false;
  }
  resize();
  draw(performance.now());
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = !!(entries[0] && entries[0].isIntersecting);
      sync();
    }, { rootMargin: "32px" }).observe(canvas);
  }
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 160);
  }, { passive: true });
  canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); running = false; }, false);
  sync();
})();
