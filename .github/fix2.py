import pathlib, re, gzip, base64, subprocess
raw = b"".join(pathlib.Path(p).read_bytes() for p in sorted(pathlib.Path("._slices").glob("s*")))
html = gzip.decompress(base64.b64decode(raw)).decode("utf-8")
orig = html

def grab(needle, n=700):
    i = html.find(needle)
    print("##", needle, i)
    if i >= 0:
        print(html[i:i+n].replace("\n", " | ")[:900])

grab("querySelector('.i')")
grab('querySelector(".i")')
grab("rstars")
grab("chatSend")
grab('.ic')

html = html.replace('${"".repeat(o.rated)}', '${"\u2605".repeat(o.rated)}')
html = html.replace('${"".repeat(5-o.rated)}', '${"\u2606".repeat(5-o.rated)}')
send = '<svg class="gsi" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 20 5.2 15 19.4 11.2 13 4 12z"/></svg>'
html = html.replace('id="chatSend" aria-label="G\u1eedi"></button>', 'id="chatSend" aria-label="G\u1eedi">'+send+'</button>')
html = re.sub(r"(querySelector\(\s*['\"]\.i['\"]\s*\))\.textContent", r"\1.innerHTML", html)

# lines that both mention .ic and textContent
lines = []
for ln in html.splitlines():
    if ".ic" in ln and "textContent" in ln:
        print("ICLINE", ln.strip()[:240])
        ln = ln.replace("textContent", "innerHTML")
    lines.append(ln)
html = "\n".join(lines)

scripts = re.findall(r"<script(?![^>]*type=\"application/ld\+json\")(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>", html)
bad = 0
for i,s in enumerate(scripts):
    if len(s.strip())<30: continue
    pathlib.Path("/tmp/chk.js").write_text(s, encoding="utf-8")
    r = subprocess.run(["node","--check","/tmp/chk.js"], capture_output=True, text=True)
    if r.returncode:
        bad += 1
        print("BAD", i, (r.stderr or "")[-300:])
print("app syntax errors", bad, "changed", html!=orig)
if bad:
    raise SystemExit(1)
if html==orig:
    print("UNCHANGED")
else:
    raw = gzip.compress(html.encode(), mtime=0)
    b64 = base64.b64encode(raw).decode()
    assert gzip.decompress(base64.b64decode(b64)).decode()==html
    d = pathlib.Path("._slices")
    for f in d.glob("s*"): f.unlink()
    for i in range(0, len(b64), 1500):
        (d/f"s{i:05d}").write_text(b64[i:i+1500])
    print("CHANGED", "stars", "\u2605" in html, "send", "chatSend" in html)
