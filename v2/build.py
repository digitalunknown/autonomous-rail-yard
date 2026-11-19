#!/usr/bin/env python3
"""Build v2/index.html: concatenate src/ in order (same as before) and inline the
subset Inter + JetBrains Mono woff2 files at the /*@FONTS@*/ marker so the single
file renders the intended faces offline from file://. Fonts: SIL OFL 1.1."""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parent
def face(fam, f, w):
    b64 = base64.b64encode((root/'fonts'/f).read_bytes()).decode()
    return (f'@font-face{{font-family:"{fam}";font-style:normal;font-weight:{w};font-display:swap;'
            f'src:url(data:font/woff2;base64,{b64}) format("woff2")}}')
fonts = face('Inter','inter.woff2','100 900') + '\n' + face('JetBrains Mono','jbmono.woff2','100 800')
out = ''.join(p.read_text() for p in sorted((root/'src').glob('[0-9]*_*')))
assert '/*@FONTS@*/' in out
out = out.replace('/*@FONTS@*/', fonts)
(root/'index.html').write_text(out)
print('built', root/'index.html', len(out), 'bytes')
