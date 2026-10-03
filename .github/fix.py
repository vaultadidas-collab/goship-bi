import pathlib, re, gzip, base64, subprocess, sys
html_path = pathlib.Path("/tmp/work.html")
raw = b"".join(pathlib.Path(p).read_bytes() for p in sorted(pathlib.Path("._slices").glob("s*")))
html = gzip.decompress(base64.b64decode(raw)).decode("utf-8")
orig = html
report = []

def show(label, needle, n=220):
    i = html.find(needle)
    report.append("## " + label + " @" + str(i))
    if i < 0:
        report.append("MISSING")
        return
    report.append(html[max(0,i-80):i+n].replace("\n"," ")[:400])

show("title", "<title>")
show("desc", 'name="description"')
show("ogtitle", 'property="og:title"')
show("canonical", "canonical")
show("keywords", "keywords")
show("jsonurl", "vaultadidas-collab.github.io/goship-bi/")
show("nang", "N\u1eafng \u0111\u1eb9p")
show("veh", 'name:"Xe \u00f4m"')
show("veh2", "Xe \u00f4m")
show("chatSend", "chatSend")
show("repeat", ".repeat(")
show("trustb", "C\u1ecdc ho\u00e0n")
show("big", 'class="big"')
show("ic2", 'class="ic2"')
show("gsi", "function gsi")
report.append("gsi calls %d" % html.count("gsi("))
report.append("empty b %d" % html.count("<b></b>"))
report.append("return empty %d" % html.count('return["","'))
report.append("orb %s" % ("orb o1" in html))

scripts = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>", html)
report.append("inline scripts %d" % len(scripts))
bad = 0
for i,s in enumerate(scripts):
    if len(s.strip()) < 20:
        continue
    pathlib.Path("/tmp/chk.js").write_text(s, encoding="utf-8")
    r = subprocess.run(["node","--check","/tmp/chk.js"], capture_output=True, text=True)
    if r.returncode != 0:
        bad += 1
        err = (r.stderr or r.stdout or "")
        report.append("SYNTAX %d %s" % (i, err[-500:].replace("\n"," | ")))
report.append("syntax errors %d" % bad)

# fixes
def svg(name, size):
    # reuse gsi at runtime in HTML by inlining a tiny known set
    paths = {
      "send": '<path d="M4 12 20 5.2 15 19.4 11.2 13 4 12z"/>',
      "lock": '<rect x="6" y="10.2" width="12" height="8.6" rx="1.5"/><path d="M8.4 10.2V8a3.6 3.6 0 0 1 7.2 0v2.2"/>',
      "cash": '<rect x="3.2" y="6.5" width="17.6" height="11" rx="1.6"/><circle cx="12" cy="12" r="2.1"/>',
      "chat": '<path d="M5 6h14v8.5H9.2L5 18V6z"/>',
      "clock": '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.4l2.8 1.8"/>',
    }
    return ('<svg class="gsi" viewBox="0 0 24 24" width="%d" height="%d" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>' % (size, size, paths[name]))

html2 = html.replace('"".repeat(o.rated)', '"\u2605".repeat(o.rated)')
html2 = html2.replace('"".repeat(5-o.rated)', '"\u2606".repeat(5-o.rated)')
html2 = html2.replace('id="chatSend" aria-label="G\u1eedi"></button>', 'id="chatSend" aria-label="G\u1eedi">%s</button>' % svg("send", 18))
html2 = html2.replace('lb.textContent=en?" VI":"EN"', 'lb.textContent=en?"VI":"EN"')
html2 = html2.replace('lb.textContent=en?"VI":"EN"', 'lb.textContent=en?"VI":"EN"')
# weather blanks
for emo_label, name, label in [
    ("N\u1eafng \u0111\u1eb9p","sun"),
    ("\u00cdt m\u00e2y","partly"),
    ("Nhi\u1ec1u m\u00e2y","cloud"),
    ("S\u01b0\u01a1ng m\u00f9","fog"),
    ("M\u01b0a ph\u00f9n","rain"),
    ("M\u01b0a r\u00e0o","rain"),
    ("M\u01b0a","rain"),
    ("D\u00f4ng","storm"),
]:
    old = 'return["","%s"]' % emo_label
    new = 'return[gsi("%s",22),"%s"]' % (name, emo_label)
    c = html2.count(old)
    if c:
        html2 = html2.replace(old, new)
        report.append("fixed weather %s x%d" % (label, c))
html2 = html2.replace('return["",""]', 'return[gsi("partly",22),""]')

if html2 != html:
    report.append("html changed by fixes")
    # recheck syntax
    scripts = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>", html2)
    bad2 = 0
    for i,s in enumerate(scripts):
        if len(s.strip()) < 20: continue
        pathlib.Path("/tmp/chk.js").write_text(s, encoding="utf-8")
        r = subprocess.run(["node","--check","/tmp/chk.js"], capture_output=True, text=True)
        if r.returncode:
            bad2 += 1
            report.append("POST SYNTAX %d %s" % (i, (r.stderr or "")[-300:].replace("\n"," | ")))
    report.append("post syntax errors %d" % bad2)
    if bad2:
        report.append("NOT COMMITTING fixes because syntax broke")
        html2 = html
else:
    report.append("no text fixes applied")

pathlib.Path("/tmp/report.txt").write_text("\n".join(report), encoding="utf-8")
print("\n".join(report))
if html2 != orig:
    raw = gzip.compress(html2.encode("utf-8"), mtime=0)
    b64 = base64.b64encode(raw).decode()
    assert gzip.decompress(base64.b64decode(b64)).decode()==html2
    d = pathlib.Path("._slices")
    for f in d.glob("s*"):
        f.unlink()
    for i in range(0, len(b64), 1500):
        (d/("s%05d"%i)).write_text(b64[i:i+1500])
    pathlib.Path("/tmp/changed").write_text("1")
    print("CHANGED")
else:
    print("UNCHANGED")
