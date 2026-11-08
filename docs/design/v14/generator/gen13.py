import math, os
OUT = '/Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v13.1/mocks'
ASSETS = '/Volumes/NithinSameer/Personal/Mahagathe/Mahgate(app)/assets'
os.makedirs(OUT, exist_ok=True)
EMBLEM = f'file://{ASSETS}/brand/mahagathe-emblem.png'
PH = {k: f'file://{ASSETS}/photos/{v}' for k, v in dict(
    abhyudaya='abhyudaya-elders.jpg', adhyaya='adhyaya-children.jpg', ayuri='ayuri-elders.jpg',
    bhandara='bhandara-food.jpg', samriddhi='samriddhi-sewing.jpg').items()}

INDIGO, INDIGO2, LAMP = '#1F2347', '#2B3160', '#F2B544'
LEAF, LEAFEDGE, INK = '#E7D3A8', '#C9AE78', '#2A1E14'
LAT, LATSOFT, RED = '#9C3D22', '#F3E2D9', '#C20000'
LIME, TEXT2, LINE = '#FBFAF7', '#6A5B50', '#E6E0D6'
ONDARK2 = '#B9BCD9'

CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=Eczar:wght@400;500;600;700&family=Mukta:wght@400;500;600;700&display=block');
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: #ddd; }}
.ph {{ width: 390px; min-height: 844px; background: {LIME}; color: {INK}; font-family: Mukta, sans-serif; font-size: 16px; line-height: 1.55; position: relative; overflow: hidden; display: flex; flex-direction: column; }}
.ez {{ font-family: Eczar, serif; }}
a {{ color: inherit; text-decoration: none; }}
.btn {{ display: flex; align-items: center; justify-content: center; gap: 8px; height: 54px; border-radius: 14px; background: {RED}; color: #fff; font-weight: 600; font-size: 17px; }}
.btn2 {{ display: inline-flex; align-items: center; gap: 6px; height: 44px; padding: 0 16px; border-radius: 14px; border: 1.5px solid currentColor; font-weight: 600; font-size: 15px; }}
.lnk {{ font-weight: 600; font-size: 15px; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; }}
.leaf {{ position: relative; border-radius: 16px; background: {LEAF}; background-image: repeating-linear-gradient(0deg, rgba(120,90,40,.07) 0 1px, transparent 1px 7px); border: 1px solid {LEAFEDGE}; }}
.hole {{ position: absolute; top: 50%; width: 9px; height: 9px; margin-top: -4.5px; border-radius: 50%; background: {LIME}; box-shadow: inset 0 1px 2px rgba(0,0,0,.35); }}
"""

def svg(d, s=22, c='currentColor', sw=1.8, fill='none'):
    return f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="{fill}" stroke="{c}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>'
I = dict(
    back='<path d="M15 5l-7 7 7 7"/>', play='<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    lock='<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    check='<path d="M5 12.5l4.5 4.5L19 7.5"/>', down='<path d="M6 9l6 6 6-6"/>',
    share='<path d="M12 4v11M7.5 8.5L12 4l4.5 4.5M5 14v5h14v-5"/>', save='<path d="M7 4h10v16l-5-4-5 4z"/>',
    pin='<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    home='<path d="M4 11l8-6.5 8 6.5V20H4z"/>',
    lampi='<path d="M12 3.5c1.4 1.8 2.3 3 2.3 4.4a2.3 2.3 0 0 1-4.6 0c0-1.4.9-2.6 2.3-4.4z"/><path d="M4.5 13h15c0 3.2-3.4 5.5-7.5 5.5S4.5 16.2 4.5 13z"/>',
    leafi='<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>',
    people='<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M15.5 6a3 3 0 0 1 0 6M17 14.5a5.5 5.5 0 0 1 3.5 4.5"/>',
    bell='<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    globe='<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.6 2.4 14.4 0 17M12 3.5c-2.4 2.6-2.4 14.4 0 17"/>',
)

def ring(done, size, total=40, center=True, sub='sittings'):
    c = size / 2; r = size / 2 - max(6, size * .05); dot = max(2.6, size / 44)
    out = ''
    for i in range(total):
        a = -math.pi / 2 + 2 * math.pi * i / total
        x, y = c + r * math.cos(a), c + r * math.sin(a)
        if i < done:
            out += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{dot*1.7:.1f}" fill="{LAMP}" opacity=".16"/><circle cx="{x:.1f}" cy="{y:.1f}" r="{dot:.1f}" fill="{LAMP}"/>'
        else:
            out += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{dot*.8:.1f}" fill="none" stroke="{ONDARK2}" stroke-opacity=".55" stroke-width="1"/>'
    inner = ''
    if center:
        inner = (f'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;">'
                 f'<span class="ez" style="font-size:{size*.27:.0f}px;font-weight:600;line-height:1;">{done}</span>'
                 f'<span style="font-size:{max(13,size*.062):.0f}px;color:{ONDARK2};margin-top:{size*.02:.0f}px;">of {total} {sub}</span></div>')
    return (f'<div style="position:relative;width:{size}px;height:{size}px;flex-shrink:0;" role="img" aria-label="{done} of {total} sittings">'
            f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}">{out}</svg>{inner}</div>')

def tabbar(active, dark=False):
    tabs = [('Home', 'home', INK), ('Practice', 'lampi', INDIGO), ('Wisdom', 'leafi', '#8A6A2E'), ('Sangha', 'people', LAT)]
    bg = INDIGO if dark else '#fff'; bd = 'rgba(255,255,255,.1)' if dark else LINE
    items = ''
    for name, ic, col in tabs:
        on = name == active
        colr = (LAMP if dark else col) if on else (ONDARK2 if dark else '#75685E')
        bar = f'<span style="position:absolute;top:0;left:50%;width:28px;margin-left:-14px;height:3px;border-radius:0 0 3px 3px;background:{colr};"></span>' if on else ''
        items += (f'<a style="position:relative;flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding-top:9px;color:{colr};font-size:12.5px;font-weight:{600 if on else 500};" '
                  f'{"aria-current=page" if on else ""}>{bar}{svg(I[ic], 24, sw=2 if on else 1.7)}{name}</a>')
    return f'<nav style="margin-top:auto;height:78px;display:flex;background:{bg};border-top:1px solid {bd};padding-bottom:18px;">{items}</nav>'

def page(name, body, bg=LIME, color=INK):
    html = f'<!doctype html><html><head><meta charset="utf-8"><title>{name}</title><style>{CSS}</style></head><body><div class="ph" style="background:{bg};color:{color};">{body}</div></body></html>'
    open(f'{OUT}/{name}.html', 'w').write(html)

def backpill(label, dark=False):
    bg = 'rgba(255,255,255,.1)' if dark else 'rgba(42,30,20,.06)'
    return f'<a style="display:inline-flex;align-items:center;gap:4px;height:40px;padding:0 14px 0 8px;border-radius:20px;background:{bg};font-weight:600;font-size:15px;">{svg(I["back"], 20, sw=2.2)}{label}</a>'

def leafstrip(inner, pad='16px 22px 16px 30px'):
    return f'<div class="leaf" style="padding:{pad};"><span class="hole" style="left:11px"></span><span class="hole" style="right:11px"></span>{inner}</div>'

def segs(done, total, cur=None, col=INK, off='rgba(42,30,20,.18)'):
    s = ''
    for i in range(total):
        c = col if i < done else (LAT if cur is not None and i == cur else off)
        s += f'<span style="flex:1;height:4px;border-radius:2px;background:{c};"></span>'
    return f'<div style="display:flex;gap:3px;" role="img" aria-label="{done} of {total} episodes read">{s}</div>'

TOP = '<div style="height:54px;flex-shrink:0;"></div>'

# ── Welcome ───────────────────────────────────────────────────────────────
page('V13Welcome', f"""
{TOP}
<div style="display:flex;justify-content:flex-end;padding:6px 20px;"><a style="display:inline-flex;align-items:center;gap:6px;color:{ONDARK2};font-size:15px;">{svg(I['globe'],18)}English{svg(I['down'],16)}</a></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:30px 28px 0;text-align:center;">
  <div style="position:relative;width:290px;height:290px;">
    {ring(1, 290, center=False)}
    <div style="position:absolute;inset:50px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(242,181,68,.18);">
      <img src="{EMBLEM}" style="height:150px;" alt="Mahagathe emblem"></div>
  </div>
  <h1 class="ez" style="margin:30px 0 0;font-size:44px;font-weight:600;line-height:1.05;letter-spacing:-.01em;">Mahagathe</h1>
  <p class="ez" style="margin:8px 0 0;font-size:21px;color:{LAMP};">सत्यं वद धर्मं चर</p>
  <p style="margin:16px 0 0;font-size:17px;line-height:1.5;color:{ONDARK2};max-width:300px;">Sit each day, read the words of the Most Venerable Mahamuni and follow the Mahabharata, with the sangha of Mahagathe Ashram.</p>
</div>
<div style="padding:28px 24px 40px;display:flex;flex-direction:column;gap:14px;align-items:center;">
  <a class="btn" style="width:100%;">Begin your practice</a>
  <a style="font-weight:600;color:#fff;height:44px;display:flex;align-items:center;">Look around first</a>
</div>
""", bg=INDIGO, color='#fff')

# ── Home ──────────────────────────────────────────────────────────────────
page('V13Home', f"""
{TOP}
<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 20px 0;">
  <h1 class="ez" style="margin:0;font-size:30px;font-weight:600;line-height:1.15;">Good morning, Arjun</h1>
  <a aria-label="Profile and settings" style="width:44px;height:44px;border-radius:50%;background:{LATSOFT};color:{LAT};display:flex;align-items:center;justify-content:center;font-family:Eczar;font-weight:600;font-size:19px;">A</a>
</div>
<div style="padding:18px 16px 0;">
  <div style="background:{INDIGO};border-radius:20px;padding:20px;color:#fff;">
    <div style="display:flex;align-items:center;gap:18px;">
      {ring(10, 112, sub='lit')}
      <div>
        <p style="margin:0;font-size:14px;color:{ONDARK2};">Your Mandala</p>
        <p class="ez" style="margin:2px 0 0;font-size:24px;font-weight:600;line-height:1.2;">Sitting 11 of 40</p>
        <p style="margin:4px 0 0;font-size:15px;color:{ONDARK2};">Introductory Samatha, about 7 minutes</p>
      </div>
    </div>
    <a class="btn" style="margin-top:18px;">{svg(I['play'],18)}Begin sitting 11</a>
  </div>
</div>
<div style="padding:30px 24px 0;">
  <p class="ez" style="margin:0;font-size:27px;line-height:1.3;font-weight:500;">“Steadiness in practice gives clarity in life.”</p>
  <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:15px;color:{TEXT2};">Mahamuni’s word for today</span>
    <a class="lnk">What it means</a>
  </div>
</div>
<div style="padding:30px 16px 0;">
  {leafstrip(f'''
    <div style="display:flex;gap:14px;align-items:center;">
      <span class="ez" style="font-size:30px;line-height:1;color:{LAT};width:66px;flex-shrink:0;text-align:center;">आदि</span>
      <div style="flex:1;min-width:0;">
        <p style="margin:0;font-size:14px;color:#6B5330;">The Mahabharata, Ādi Parva</p>
        <p class="ez" style="margin:0;font-size:20px;font-weight:600;line-height:1.25;">The Churning of the Ocean</p>
      </div>
    </div>
    <div style="margin:14px 0 12px;">{segs(2, 10, cur=2)}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:14px;color:#6B5330;">Episode 3 of 10, 8 minutes</span>
      <a class="lnk">Continue reading</a>
    </div>''')}
</div>
<div style="padding:32px 24px 8px;">
  <h2 class="ez" style="margin:0 0 6px;font-size:21px;font-weight:600;">This week at the ashram</h2>
  {''.join(f'''<a style="display:flex;align-items:center;gap:16px;padding:12px 0;{'border-top:1px solid '+LINE+';' if k else ''}">
      <span style="width:52px;height:56px;border-radius:12px;background:{LATSOFT};color:{LAT};display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1;">
        <span style="font-size:13px;font-weight:600;">{d}</span><span class="ez" style="font-size:22px;font-weight:600;">{n}</span></span>
      <span style="flex:1;"><span style="display:block;font-weight:600;font-size:16px;">{t}</span><span style="font-size:14px;color:{TEXT2};">{s}</span></span></a>'''
      for k, (d, n, t, s) in enumerate([('Sun', '9', 'Sunday group sitting', '6:30 AM, online'), ('Sat', '15', 'Yuva Chetana class', '4 PM at the ashram. You’re going')]))}
</div>
{tabbar('Home')}
""")

# ── Practice ──────────────────────────────────────────────────────────────
steps = [
    ('Introductory Samatha', 'Calm-abiding meditation. Open to everyone.', 'open'),
    ('Attahasa', 'Preparation', 'lock'), ('Nischara Dhyana', 'Silent sitting', 'lock'),
    ('Samatha Kriya', 'The core practice', 'lock'), ('Mahagathe Mantra', 'Mantra', 'lock')]
path = ''
for i, (t, s, st) in enumerate(steps):
    last = i == len(steps) - 1
    node = (f'<span style="width:34px;height:34px;border-radius:50%;background:{LAMP};color:{INDIGO};display:flex;align-items:center;justify-content:center;font-family:Eczar;font-weight:700;font-size:16px;">{i+1}</span>' if st == 'open' else
            f'<span style="width:34px;height:34px;border-radius:50%;border:1.5px solid rgba(185,188,217,.5);color:{ONDARK2};display:flex;align-items:center;justify-content:center;font-family:Eczar;font-weight:600;font-size:16px;">{i+1}</span>')
    line = '' if last else f'<span style="position:absolute;left:16.5px;top:38px;bottom:-6px;width:1.5px;background:rgba(185,188,217,.3);"></span>'
    right = f'<span style="color:{LAMP};font-size:14px;font-weight:600;">Practising</span>' if st == 'open' else svg(I['lock'], 18, c=ONDARK2)
    path += f'<div style="position:relative;display:flex;gap:16px;align-items:flex-start;padding-bottom:18px;">{line}{node}<div style="flex:1;padding-top:3px;"><p style="margin:0;font-weight:600;font-size:17px;color:#fff;">{t}</p><p style="margin:0;font-size:14px;color:{ONDARK2};">{s}</p></div><div style="padding-top:6px;">{right}</div></div>'
page('V13Practice', f"""
{TOP}
<div style="padding:4px 24px 0;"><h1 class="ez" style="margin:0;font-size:33px;font-weight:600;">Practice</h1></div>
<div style="display:flex;flex-direction:column;align-items:center;padding:18px 24px 0;text-align:center;">
  {ring(10, 236, sub='lamps lit')}
  <p style="margin:16px 0 0;font-size:16px;color:{ONDARK2};max-width:290px;">Each sitting lights one lamp of your Mandala. Thirty to go, at your own pace.</p>
  <a class="lnk" style="margin-top:6px;color:#fff;">How the Mandala works</a>
  <a class="btn" style="width:100%;margin-top:22px;">{svg(I['play'],18)}Begin sitting 11</a>
</div>
<div style="padding:36px 24px 6px;">
  <h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">The path of practice</h2>
  <p style="margin:4px 0 20px;font-size:15px;color:{ONDARK2};">Five practices, in order. The later four are given in person, then practised here.</p>
  {path}
  <a class="btn2" style="color:{LAMP};margin-top:2px;">Learn in person at Dhyanodaya</a>
</div>
<div style="margin:26px 24px 28px;padding:16px 0;border-top:1px solid rgba(185,188,217,.2);display:flex;align-items:center;gap:14px;">
  <span style="color:{ONDARK2};">{svg(I['bell'],22)}</span>
  <span style="flex:1;"><span style="display:block;font-weight:600;">Daily reminder</span><span style="font-size:14px;color:{ONDARK2};">6:00 AM</span></span>
  <span style="width:50px;height:30px;border-radius:15px;background:{LAMP};position:relative;"><span style="position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;background:{INDIGO};"></span></span>
</div>
{tabbar('Practice', dark=True)}
""", bg=INDIGO, color='#fff')

# ── Mandala ───────────────────────────────────────────────────────────────
rules = [('One sitting counts each day.', 'Sit more if you like; the lamp lights once.'),
         ('There is no deadline.', 'A missed day changes nothing. Come back when you can.'),
         ('At forty, the Mandala is complete.', 'Then you can begin another.')]
page('V13Mandala', f"""
{TOP}
<div style="padding:0 16px;">{backpill('Practice', dark=True)}</div>
<div style="display:flex;flex-direction:column;align-items:center;padding:14px 24px 0;text-align:center;">
  <h1 class="ez" style="margin:0;font-size:30px;font-weight:600;">Your Mandala</h1>
  <p style="margin:2px 0 18px;font-size:15px;color:{ONDARK2};">Begun 26 October. Last sitting yesterday.</p>
  {ring(10, 300, sub='lamps lit')}
</div>
<div style="padding:30px 24px 0;">
  {''.join(f'<div style="display:flex;gap:14px;padding:12px 0;{"border-top:1px solid rgba(185,188,217,.18);" if k else ""}"><span style="color:{LAMP};margin-top:2px;">{svg(I["lampi"],20)}</span><span><span style="display:block;font-weight:600;font-size:16px;">{a}</span><span style="font-size:15px;color:{ONDARK2};">{b}</span></span></div>' for k,(a,b) in enumerate(rules))}
</div>
<div style="padding:22px 24px 40px;margin-top:auto;"><a class="btn">{svg(I['play'],18)}Begin sitting 11</a></div>
""", bg=INDIGO, color='#fff')

# ── Player ────────────────────────────────────────────────────────────────
flame = f'''<svg width="150" height="190" viewBox="0 0 150 190" aria-hidden="true">
  <defs><radialGradient id="g" cx="50%" cy="38%" r="50%"><stop offset="0" stop-color="{LAMP}" stop-opacity=".45"/><stop offset="1" stop-color="{LAMP}" stop-opacity="0"/></radialGradient></defs>
  <circle cx="75" cy="70" r="70" fill="url(#g)"/>
  <path d="M75 28c12 16 19 27 19 39a19 19 0 0 1-38 0c0-12 7-23 19-39z" fill="{LAMP}"/>
  <path d="M75 50c5 7 8 12 8 17a8 8 0 0 1-16 0c0-5 3-10 8-17z" fill="#FFF3D6"/>
  <path d="M28 112h94c0 22-21 38-47 38s-47-16-47-38z" fill="none" stroke="{LAMP}" stroke-width="2"/>
  <path d="M60 150l-8 18h46l-8-18" fill="none" stroke="{LAMP}" stroke-width="2"/></svg>'''
page('V13Player', f"""
{TOP}
<div style="padding:0 16px;"><a style="display:inline-flex;align-items:center;gap:6px;height:44px;font-weight:600;color:{ONDARK2};">{svg(I['down'],20,sw=2.2)}Close</a></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:30px 28px 0;">
  {flame}
  <p style="margin:24px 0 0;font-size:15px;color:{LAMP};">Sitting 11 of 40</p>
  <h1 class="ez" style="margin:2px 0 0;font-size:33px;font-weight:600;line-height:1.15;">Introductory Samatha</h1>
  <p style="margin:14px 0 0;font-size:17px;line-height:1.55;color:{ONDARK2};max-width:290px;">Sit upright, let the eyes close, and follow Mahamuni’s voice.</p>
</div>
<div style="padding:0 28px 54px;">
  <div style="height:4px;border-radius:2px;background:rgba(185,188,217,.25);position:relative;"><span style="position:absolute;left:-7px;top:-6px;width:16px;height:16px;border-radius:50%;background:#fff;"></span></div>
  <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:14px;color:{ONDARK2};"><span>0:00</span><span>7:12</span></div>
  <div style="display:flex;justify-content:center;margin-top:18px;"><a aria-label="Play" style="width:80px;height:80px;border-radius:50%;background:{LAMP};color:{INDIGO};display:flex;align-items:center;justify-content:center;">{svg(I['play'],32)}</a></div>
</div>
""", bg=INDIGO, color='#fff')

# ── Wisdom ────────────────────────────────────────────────────────────────
themes = [('Inner life', 31), ('Work', 24), ('Family', 19), ('Conduct', 22)]
parvas = [('I', 'आदि', 'Ādi Parva', 'The bard, the serpent sacrifice, the Kuru line', 'You’re on episode 3 of 10', True),
          ('II', 'सभा', 'Sabhā Parva', 'The hall and the game of dice', 'Coming in December', False),
          ('III', 'आरण्यक', 'Āraṇyaka Parva', 'The years in the forest', 'Coming next year', False)]
leaves = ''
for k, (rn, dv, t, s, st, on) in enumerate(parvas):
    op = '1' if on else '.62'
    leaves += f'''<div style="margin-top:{10 if k else 0}px;opacity:{op};">{leafstrip(f"""
      <div style="display:flex;align-items:center;gap:14px;">
        <span class="ez" style="width:74px;flex-shrink:0;text-align:center;font-size:{28 if len(dv)<4 else 20}px;line-height:1.1;color:{LAT};">{dv}</span>
        <div style="flex:1;min-width:0;"><p class="ez" style="margin:0;font-size:19px;font-weight:600;line-height:1.2;">{rn}. {t}</p><p style="margin:2px 0 0;font-size:14px;color:#6B5330;">{s}</p>
        <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:{LAT if on else '#6B5330'};">{st}</p></div></div>""", pad='14px 20px 14px 28px')}</div>'''
page('V13Wisdom', f"""
<div style="background:{LEAF};background-image:repeating-linear-gradient(0deg, rgba(120,90,40,.07) 0 1px, transparent 1px 7px);padding:54px 24px 26px;border-bottom:1px solid {LEAFEDGE};">
  <h1 class="ez" style="margin:4px 0 18px;font-size:33px;font-weight:600;">Wisdom</h1>
  <p class="ez" style="margin:0;font-size:28px;line-height:1.3;font-weight:500;">“Steadiness in practice gives clarity in life.”</p>
  <p style="margin:10px 0 0;font-size:15px;color:#6B5330;">Mahamuni’s word for today, in his own words</p>
  <div style="display:flex;gap:18px;align-items:center;margin-top:16px;"><a class="btn2" style="color:{INK};">Read what it means</a><a class="lnk">Sit with it</a></div>
</div>
<div style="padding:24px 24px 0;">
  <h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">Earlier words, by theme</h2>
  <p class="ez" style="margin:8px 0 0;font-size:20px;line-height:1.7;">{' '.join(f'<a style="white-space:nowrap;border-bottom:1.5px solid {LEAFEDGE};margin-right:12px;">{t} <span style="font-family:Mukta;font-size:14px;color:{TEXT2};">{n}</span></a>' for t,n in themes)}</p>
</div>
<div style="padding:34px 16px 0;">
  <div style="padding:0 8px;display:flex;align-items:baseline;justify-content:space-between;">
    <h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">The Mahabharata</h2><a class="lnk">All 18 parvas</a></div>
  <p style="margin:4px 8px 14px;font-size:15px;color:{TEXT2};">Retold from the critical edition, one short episode at a time.</p>
  {leaves}
</div>
<a style="margin:30px 16px 28px;display:flex;align-items:center;gap:16px;padding:16px;border-radius:16px;background:{LATSOFT};">
  <img src="{EMBLEM}" style="height:58px;" alt="">
  <span style="flex:1;"><span class="ez" style="display:block;font-size:19px;font-weight:600;">Our lineage</span><span style="font-size:14px;color:{TEXT2};">Seventy heads of the Paramparā, from the founding ācārya to the Most Venerable Mahamuni</span></span>
</a>
{tabbar('Wisdom')}
""")

# ── Mahabharata series ────────────────────────────────────────────────────
eps = ['The Bard at Naimiṣa', 'The Serpent Sacrifice', 'The Churning of the Ocean', 'Garuḍa and the Nectar', 'The Kuru Line',
       'Śantanu and Gaṅgā', 'The Vow of Bhīṣma', 'Satyavatī', 'The Birth of the Princes', 'The House of Lac']
rows = ''
for i, t in enumerate(eps):
    st = 'done' if i < 2 else ('cur' if i == 2 else 'next')
    mark = (f'<span style="color:{TEXT2};">{svg(I["check"],20,sw=2.2)}</span>' if st == 'done' else
            f'<span style="font-size:14px;font-weight:600;color:{LAT};">Continue</span>' if st == 'cur' else
            f'<span style="font-size:14px;color:{TEXT2};">8 min</span>')
    rows += (f'<a style="display:flex;align-items:center;gap:14px;padding:13px 0;border-top:1px solid {LINE};{"" if st!="done" else "opacity:.7;"}">'
             f'<span class="ez" style="width:28px;font-size:19px;font-weight:600;color:{LAT if st=="cur" else TEXT2};">{i+1}</span>'
             f'<span class="ez" style="flex:1;font-size:18px;font-weight:{600 if st=="cur" else 500};">{t}</span>{mark}</a>')
page('V13Mahabharata', f"""
<div style="background:{LEAF};background-image:repeating-linear-gradient(0deg, rgba(120,90,40,.07) 0 1px, transparent 1px 7px);padding:54px 16px 24px;border-bottom:1px solid {LEAFEDGE};">
  {backpill('Wisdom')}
  <div style="padding:16px 8px 0;">
    <p class="ez" style="margin:0;font-size:54px;line-height:1.1;color:{LAT};">महाभारत</p>
    <h1 class="ez" style="margin:2px 0 0;font-size:30px;font-weight:600;">The Mahabharata</h1>
    <p style="margin:8px 0 0;font-size:16px;color:#5B4628;max-width:320px;">The great story, retold from the BORI critical edition in eighteen parvas. Each episode takes about eight minutes.</p>
  </div>
</div>
<div style="padding:24px 24px 0;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;"><h2 class="ez" style="margin:0;font-size:22px;font-weight:600;">I. Ādi Parva</h2><span style="font-size:14px;color:{TEXT2};">2 of 10 read</span></div>
  <p style="margin:2px 0 12px;font-size:15px;color:{TEXT2};">The beginning: the bard at Naimiṣa, the serpent sacrifice and the Kuru line.</p>
  {segs(2, 10, cur=2)}
  <div style="margin-top:14px;">{rows}</div>
  <a class="btn" style="margin-top:16px;">Continue: The Churning of the Ocean</a>
  <a class="lnk" style="display:block;text-align:center;margin-top:14px;">Start again from episode 1</a>
</div>
<div style="padding:34px 24px 36px;">
  <h2 class="ez" style="margin:0 0 4px;font-size:20px;font-weight:600;">Still to come</h2>
  {''.join(f'<div style="display:flex;gap:14px;padding:11px 0;border-top:1px solid {LINE};color:{TEXT2};"><span class="ez" style="width:34px;font-weight:600;">{r}</span><span class="ez" style="flex:1;font-size:17px;color:{INK};">{n}</span><span style="font-size:14px;">{w}</span></div>' for r,n,w in [('II','Sabhā Parva','December'),('III','Āraṇyaka Parva','2027'),('IV','Virāṭa Parva','2027'),('V','Udyoga Parva','2027')])}
  <p style="margin:10px 0 0;font-size:14px;color:{TEXT2};">and thirteen more parvas, released in order.</p>
</div>
""")

# ── Episode ───────────────────────────────────────────────────────────────
page('V13Episode', f"""
<div style="background:{LEAF};background-image:repeating-linear-gradient(0deg, rgba(120,90,40,.07) 0 1px, transparent 1px 7px);padding:54px 16px 20px;border-bottom:1px solid {LEAFEDGE};">
  <div style="display:flex;justify-content:space-between;align-items:center;">{backpill('Ādi Parva')}<a aria-label="Text size" class="ez" style="font-size:19px;font-weight:600;padding:8px;">Aa</a></div>
  <div style="padding:14px 8px 0;">
    <p style="margin:0;font-size:15px;color:#5B4628;">Episode 3 of 10, about 8 minutes</p>
    <h1 class="ez" style="margin:4px 0 12px;font-size:33px;font-weight:600;line-height:1.15;">The Churning of the Ocean</h1>
    {segs(2, 10, cur=2)}
  </div>
</div>
<div class="ez" style="padding:26px 26px 0;font-size:18.5px;line-height:1.72;">
  <p style="margin:0 0 18px;">The gods were weary, and the demons were strong. So Viṣṇu gave them a counsel that neither side expected: work together, and churn the ocean of milk for the nectar of immortality.</p>
  <p style="margin:0 0 18px;">They took Mount Mandara for a churning rod and the serpent Vāsuki for a rope. The demons seized the head, the gods the tail, and the great ocean began to turn.</p>
  <p style="margin:0;color:{TEXT2};font-size:16px;font-family:Mukta;">[Episode text continues, as approved]</p>
</div>
<p style="margin:22px 26px 0;font-size:14px;color:{TEXT2};">From the BORI critical edition, Ādi Parva 1.15–17</p>
<div style="margin:24px 16px 0;padding:20px;border-radius:16px;background:{LATSOFT};">
  <p style="margin:0;font-size:15px;color:{LAT};font-weight:600;">To reflect on</p>
  <p class="ez" style="margin:6px 0 0;font-size:20px;line-height:1.45;">Gods and demons could only win the nectar together. Where in your life does it take both sides?</p>
  <a class="lnk" style="display:inline-block;margin-top:10px;">Two more questions</a>
</div>
<div style="padding:26px 16px 40px;"><a class="btn">Next: Garuḍa and the Nectar</a></div>
""")

# ── Vakyam ────────────────────────────────────────────────────────────────
page('V13Vakyam', f"""
<div style="background:{LEAF};background-image:repeating-linear-gradient(0deg, rgba(120,90,40,.07) 0 1px, transparent 1px 7px);padding:54px 16px 30px;border-bottom:1px solid {LEAFEDGE};">
  <div style="display:flex;justify-content:space-between;align-items:center;">{backpill('Wisdom')}<a aria-label="Save" style="padding:10px;">{svg(I['save'],22)}</a></div>
  <div style="padding:26px 10px 0;">
    <p style="margin:0;font-size:15px;color:#5B4628;">Inner life, 7 November</p>
    <p class="ez" style="margin:10px 0 0;font-size:36px;line-height:1.25;font-weight:500;">“Steadiness in practice gives clarity in life.”</p>
    <p style="margin:16px 0 0;font-size:15px;font-weight:600;">Mahamuni’s own words</p>
  </div>
</div>
<div style="padding:26px 26px 0;">
  <h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">In simple words</h2>
  <p style="margin:8px 0 0;font-size:17px;line-height:1.6;">When you sit a little every day, the mind settles. A settled mind sees the day as it is, and choices become easier.</p>
</div>
<div style="padding:22px 26px 0;display:flex;gap:22px;">
  <a style="display:inline-flex;gap:6px;align-items:center;font-weight:600;">{svg(I['share'],20)}Share</a>
  <a style="display:inline-flex;gap:6px;align-items:center;font-weight:600;color:{TEXT2};">Source and report</a>
</div>
<div style="padding:30px 26px 0;">
  <h2 class="ez" style="margin:0;font-size:19px;font-weight:600;">More on inner life</h2>
  {''.join(f'<a class="ez" style="display:block;padding:12px 0;border-top:1px solid {LINE};font-size:18px;line-height:1.4;">“{q}”<span style="display:block;font-family:Mukta;font-size:14px;color:{TEXT2};margin-top:2px;">{d}</span></a>' for q,d in [('[An earlier word on inner life, as approved]','3 November'),('[Another earlier word, as approved]','28 October')])}
</div>
<div style="padding:26px 16px 40px;margin-top:auto;"><a class="btn">Sit with it, 7 minutes</a></div>
""")

# ── Sangha ────────────────────────────────────────────────────────────────
seva = [('adhyaya', 'Adhyaya', 'Learning for children'), ('ayuri', 'Āyuri', 'Care for elders'),
        ('bhandara', 'Bhaṇḍāra', 'Food for all'), ('samriddhi', 'Samṛddhi', 'Skills and livelihood')]
page('V13Sangha', f"""
<div style="position:relative;height:350px;background:url('{PH['abhyudaya']}') center 30%/cover;">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 30%);"></div>
  <h1 class="ez" style="position:absolute;left:24px;top:52px;margin:0;font-size:33px;font-weight:600;color:#fff;">Sangha</h1>
  <div style="position:absolute;left:16px;bottom:-34px;width:84px;height:92px;border-radius:14px;background:{LAT};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05;box-shadow:0 6px 18px rgba(80,25,10,.25);">
    <span style="font-size:15px;font-weight:600;">Dec</span><span class="ez" style="font-size:38px;font-weight:600;">20</span><span style="font-size:13px;">Sunday</span></div>
</div>
<div style="padding:46px 24px 0;">
  <p style="margin:0;font-size:15px;color:{LAT};font-weight:600;">The next gathering</p>
  <h2 class="ez" style="margin:2px 0 0;font-size:28px;font-weight:600;line-height:1.2;">Abhyudaya 2026</h2>
  <p style="margin:6px 0 0;font-size:16px;color:{TEXT2};">All day at Mahagathe Ashram. Open to everyone; 140 places left.</p>
  <a class="btn" style="margin-top:16px;">Register for Abhyudaya</a>
</div>
<div style="padding:34px 24px 0;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;"><h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">Coming up</h2><a class="lnk">Full calendar</a></div>
  {''.join(f'''<a style="display:flex;align-items:center;gap:16px;padding:12px 0;border-top:{'1px solid '+LINE if k else 'none'};margin-top:{6 if not k else 0}px;">
      <span style="width:52px;text-align:center;color:{LAT};line-height:1.1;"><span style="display:block;font-size:13px;font-weight:600;">{m}</span><span class="ez" style="font-size:24px;font-weight:600;">{n}</span></span>
      <span style="flex:1;"><span style="display:block;font-weight:600;">{t}</span><span style="font-size:14px;color:{TEXT2};">{s}</span></span></a>'''
      for k,(m,n,t,s) in enumerate([('Sun','8','Sunday group sitting','6:30 AM, online, for enrolled sādhakas'),('Sat','14','Yuva Chetana class','4 PM at the ashram, ages 13–24. You’re going')]))}
</div>
<div style="padding:34px 0 0;">
  <div style="padding:0 24px;"><h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">Our seva</h2>
  <p style="margin:2px 0 14px;font-size:15px;color:{TEXT2};">Four kinds of service the sangha does every week.</p></div>
  <div style="display:flex;gap:12px;overflow:hidden;padding:0 24px;">
    {''.join(f'<a style="flex-shrink:0;width:200px;"><div style="height:130px;border-radius:12px;background:url(&#39;{PH[k]}&#39;) center/cover;"></div><p class="ez" style="margin:10px 0 0;font-size:19px;font-weight:600;line-height:1.2;">{n}</p><p style="margin:0;font-size:14px;color:{TEXT2};">{s}</p></a>' for k,n,s in seva)}
  </div>
</div>
<div style="margin:30px 16px 28px;padding:20px;border-radius:16px;background:{LATSOFT};display:flex;align-items:center;gap:16px;">
  <span style="flex:1;"><span class="ez" style="display:block;font-size:20px;font-weight:600;">Give dāna</span><span style="font-size:15px;color:{TEXT2};">Support the seva by UPI. A receipt comes by SMS.</span></span>
  <a class="btn2" style="color:{LAT};">Give</a>
</div>
{tabbar('Sangha')}
""")

# ── Give ──────────────────────────────────────────────────────────────────
amts = ['₹101', '₹501', '₹1,001', 'Other']
page('V13Donate', f"""
{TOP}
<div style="padding:0 16px;">{backpill('Sangha')}</div>
<div style="padding:16px 24px 0;">
  <h1 class="ez" style="margin:0;font-size:33px;font-weight:600;">Give dāna</h1>
</div>
<a style="margin:16px 16px 0;display:flex;align-items:center;gap:14px;padding:12px;border-radius:16px;background:{LATSOFT};">
  <span style="width:64px;height:64px;border-radius:12px;background:url(&#39;{PH['bhandara']}&#39;) center/cover;flex-shrink:0;"></span>
  <span style="flex:1;"><span style="display:block;font-size:14px;color:{TEXT2};">Your gift goes to</span><span class="ez" style="font-size:19px;font-weight:600;">Bhaṇḍāra, food for all</span></span>
  <span class="lnk" style="color:{LAT};margin-right:6px;">Change</span>
</a>
<div style="padding:28px 24px 0;">
  <h2 class="ez" style="margin:0 0 14px;font-size:21px;font-weight:600;">How much would you like to give?</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    {''.join(f'<a role="radio" aria-checked="{"true" if a=="₹501" else "false"}" style="height:76px;border-radius:14px;border:{"2px solid "+LAT if a=="₹501" else "1.5px solid "+LINE};background:{LATSOFT if a=="₹501" else "#fff"};display:flex;align-items:center;justify-content:center;" class="ez"><span style="font-size:{26 if a!="Other" else 20}px;font-weight:600;color:{LAT if a=="₹501" else INK};">{a}</span></a>' for a in amts)}
  </div>
  <p style="margin:14px 0 0;font-size:15px;color:{TEXT2};">₹501 feeds about twenty people at the Sunday bhaṇḍāra. <span style="color:{TEXT2};">[figure to confirm]</span></p>
</div>
<div style="padding:28px 16px 0;margin-top:auto;">
  <a class="btn">Give ₹501 with UPI</a>
  <p style="margin:12px 0 0;text-align:center;font-size:14px;color:{TEXT2};">Paid securely through your UPI app. Receipt by SMS.</p>
  <a class="lnk" style="display:block;text-align:center;margin:12px 0 36px;">Giving from outside India</a>
</div>
""")

# ── Profile ───────────────────────────────────────────────────────────────
def tog(on):
    return f'<span style="width:50px;height:30px;border-radius:15px;background:{INDIGO if on else "#C9BFB5"};position:relative;flex-shrink:0;"><span style="position:absolute;{"right" if on else "left"}:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff;"></span></span>'
rem = [('Daily sitting', '6:00 AM', True), ('Mahamuni’s word', 'Off, 7:00 AM', False), ('Gatherings I’m going to', 'The day before', True)]
page('V13Profile', f"""
{TOP}
<div style="padding:0 16px;">{backpill('Home')}</div>
<div style="margin:18px 16px 0;padding:18px;border-radius:20px;background:{INDIGO};color:#fff;display:flex;align-items:center;gap:16px;">
  {ring(10, 78, center=False)}
  <span style="flex:1;"><span class="ez" style="display:block;font-size:24px;font-weight:600;">Arjun</span><span style="font-size:15px;color:{ONDARK2};">10 lamps lit in this Mandala</span></span>
  <a class="lnk" style="color:#fff;">Edit</a>
</div>
<div style="padding:30px 24px 0;">
  <h2 class="ez" style="margin:0 0 4px;font-size:21px;font-weight:600;">Reminders</h2>
  {''.join(f'<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-top:{"1px solid "+LINE if k else "none"};"><span style="flex:1;"><span style="display:block;font-weight:600;">{t}</span><span style="font-size:14px;color:{TEXT2};">{s}</span></span>{tog(o)}</div>' for k,(t,s,o) in enumerate(rem))}
</div>
<div style="padding:22px 24px 0;">
  <h2 class="ez" style="margin:0 0 4px;font-size:21px;font-weight:600;">Settings</h2>
  {''.join(f'<a style="display:flex;align-items:center;padding:14px 0;border-top:{"1px solid "+LINE if k else "none"};"><span style="flex:1;font-weight:600;">{t}</span><span style="color:{TEXT2};font-size:15px;">{v}</span></a>' for k,(t,v) in enumerate([('Language','English'),('Your data and account','')]))}
</div>
<a style="margin:20px 24px 40px;font-weight:600;color:{LAT};">Sign out</a>
""")
print('ok', len(os.listdir(OUT)))
