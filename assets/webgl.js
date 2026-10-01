/* Sân khấu biển: 1 quad, sóng Gerstner rút gọn, cá heo nhảy theo nhịp 8 giây rồi nghỉ. */
(function () {
  if (window.__gsSea) return;
  var canvas = document.getElementById('seaStage');
  if (!canvas) return;
  window.__gsSea = true;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = canvas.getContext('webgl', {alpha:false, antialias:false, depth:false, stencil:false, powerPreference:'high-performance', preserveDrawingBuffer:false});
  if (!gl) return;
  var vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
  var fs = ['precision mediump float;','uniform vec2 uR;uniform float uT;uniform float uM;','float wave(float x,float t){float w=sin(x*1.7+t*0.85)*0.045;w+=sin(x*3.1-t*1.15)*0.022;w+=sin(x*5.4+t*0.55)*0.01;return w;}','float ell(vec2 p,vec2 r){p/=r;return (length(p)-1.0)*min(r.x,r.y);}','void main(){','vec2 uv=(gl_FragCoord.xy/uR)*2.0-1.0; uv.x*=uR.x/max(uR.y,1.0);','float t=uT*uM;','vec3 sky=mix(vec3(0.03,0.09,0.16),vec3(0.05,0.28,0.48),smoothstep(-0.2,0.85,uv.y));','sky+=vec3(0.35,0.62,0.85)*exp(-pow(uv.x+0.15,2.0)*1.4)*exp(-pow(uv.y-0.42,2.0)*3.0)*0.35;','float seaY=-0.18+wave(uv.x,t);','float sea=smoothstep(seaY+0.012,seaY-0.02,uv.y);','vec3 water=mix(vec3(0.0,0.28,0.48),vec3(0.02,0.10,0.22),smoothstep(seaY,seaY-0.7,uv.y));','float crest=smoothstep(0.02,0.0,abs(uv.y-seaY));','water+=vec3(0.75,0.9,1.0)*crest*0.55;','vec3 col=mix(sky,water,sea);','float cyc=mod(t,8.0);','float u=clamp(cyc/2.55,0.0,1.0);','float up=sin(u*3.14159);','vec2 dp=vec2(mix(-0.92,0.95,u),-0.16+up*0.58);','float ang=cos(u*3.14159)*0.85;','float ca=cos(ang),sa=sin(ang);','vec2 q=uv-dp; q=vec2(ca*q.x+sa*q.y,-sa*q.x+ca*q.y);','float body=ell(q,vec2(0.20,0.055));','float nose=ell(q-vec2(0.16,0.012),vec2(0.07,0.022));','vec2 tq=q-vec2(-0.16,0.0);','float flap=sin(t*7.0)*0.35*(0.35+0.65*up);','float c2=cos(flap),s2=sin(flap);','vec2 f1=vec2(c2*tq.x+s2*tq.y,-s2*tq.x+c2*tq.y);','float tail=ell(f1-vec2(-0.07,0.045),vec2(0.075,0.018));','float tail2=ell(f1-vec2(-0.06,-0.03),vec2(0.06,0.016));','float fin=ell(q-vec2(-0.02,0.05),vec2(0.045,0.028));','float d=min(min(body,nose),min(tail,min(tail2,fin)));','float show=1.0-smoothstep(2.45,2.7,cyc);','if(uM<0.5){show=1.0;}','float mask=smoothstep(0.012,0.0,d)*show;','vec3 skin=mix(vec3(0.75,0.9,0.98),vec3(0.0,0.55,0.82),smoothstep(-0.04,0.06,q.y));','col=mix(col,skin,mask);','float eye=smoothstep(0.012,0.0,length(q-vec2(0.10,0.018)));','col=mix(col,vec3(0.04,0.08,0.12),eye*show);','float splash=exp(-abs(uv.x-dp.x)*18.0)*exp(-abs(uv.y+0.16)*22.0)*show*(step(u,0.12)+step(0.88,u));','col+=vec3(0.8,0.92,1.0)*splash*0.7;','gl_FragColor=vec4(col,1.0);}'].join('\n');
  function sh(type, src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  var prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return;gl.useProgram(prog);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var uR=gl.getUniformLocation(prog,'uR'),uT=gl.getUniformLocation(prog,'uT'),uM=gl.getUniformLocation(prog,'uM');
  var mobile=matchMedia('(max-width: 768px)').matches,dprCap=mobile?1.25:1.5,frameMs=mobile?1000/30:1000/45,w=0,h=0,running=!document.hidden,last=0,acc=0,t0=performance.now();
  function resize(){var dpr=Math.min(window.devicePixelRatio||1,dprCap);var nw=Math.max(1,Math.floor(canvas.clientWidth*dpr));var nh=Math.max(1,Math.floor(canvas.clientHeight*dpr));if(nw===w&&nh===h)return;w=nw;h=nh;canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
  function draw(now){gl.uniform2f(uR,w,h);gl.uniform1f(uT,(now-t0)/1000);gl.uniform1f(uM,reduce?0:1);gl.drawArrays(gl.TRIANGLES,0,6);}
  function loop(now){if(!running)return;requestAnimationFrame(loop);acc+=now-last;last=now;if(acc<frameMs)return;acc=0;resize();draw(now);}
  resize();draw(performance.now());if(!reduce){last=performance.now();requestAnimationFrame(loop);}
  document.addEventListener('visibilitychange',function(){running=!document.hidden&&!reduce;if(running){last=performance.now();requestAnimationFrame(loop);}});
  window.addEventListener('resize',resize,{passive:true});
})();
