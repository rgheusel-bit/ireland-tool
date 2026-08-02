#!/usr/bin/env python3
"""Bundle the app into a single self-contained HTML file.

    python3 build.py              -> dist/ireland-trip-2026.html
    python3 build.py --artifact   -> dist/ireland-trip-preview.html

The default build is the one to hand round: open it by double-clicking,
email it, or drop it on any static host. Fonts and Firebase are left in,
so it looks right and still syncs live between phones.

--artifact additionally strips the Google Fonts <link>s, because a
published Claude artifact runs under a Content-Security-Policy that
blocks external hosts; the CSS already falls back to Georgia/system-ui,
and leaving a blocked request in just fails silently.
"""
import sys
import pathlib

ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"

# Stripped because the Artifact tool supplies its own document shell.
DOC_SHELL = ["<!DOCTYPE html>\n", '<html lang="en">\n', "<head>\n", "</head>\n", "<body>\n"]

FONT_LINKS = [
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n',
    '<link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700'
    '&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">\n',
]

CSS_LINK = '<link rel="stylesheet" href="css/cup.css">'
JS_TAG = '<script src="js/cup.js"></script>'


def require(haystack, needle, label):
    if needle not in haystack:
        raise SystemExit(f"build failed: expected to find {label} in index.html")


def build(artifact: bool) -> pathlib.Path:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "css" / "cup.css").read_text(encoding="utf-8")
    js = (ROOT / "js" / "cup.js").read_text(encoding="utf-8")

    require(html, CSS_LINK, "the cup stylesheet link")
    require(html, JS_TAG, "the cup script tag")
    html = html.replace(CSS_LINK, f"<style>\n{css}\n</style>", 1)
    html = html.replace(JS_TAG, f"<script>\n{js}\n</script>", 1)

    if artifact:
        for frag in DOC_SHELL:
            require(html, frag, repr(frag.strip()))
            html = html.replace(frag, "", 1)
        html = html.replace("\n</body>\n</html>", "\n", 1)
        for link in FONT_LINKS:
            require(html, link, "a font link")
            html = html.replace(link, "", 1)
        for leftover in ("<!DOCTYPE", "<html", "<head>", "</head>", "<body>", "</html>", "fonts.googleapis"):
            if leftover in html:
                raise SystemExit(f"build failed: {leftover!r} survived the artifact strip")

    for leftover in ('href="css/', 'src="js/'):
        if leftover in html:
            raise SystemExit(f"build failed: {leftover!r} left unbundled")

    DIST.mkdir(exist_ok=True)
    out = DIST / ("ireland-trip-preview.html" if artifact else "ireland-trip-2026.html")
    out.write_text(html, encoding="utf-8")
    return out


if __name__ == "__main__":
    artifact = "--artifact" in sys.argv[1:]
    path = build(artifact)
    kb = path.stat().st_size / 1024
    print(f"{path.relative_to(ROOT)}  ({kb:.0f} KB)")
