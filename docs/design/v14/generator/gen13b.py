from gen13 import *

PORTRAIT = 'file:///Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v13.1/ref/mahamuni.jpg'
def avatar(size, ring_col=None):
    # square crop of 440px centred on the face (450, 500) in the 900x1600 original
    k = size / 560
    bd = f'box-shadow:0 0 0 2px {ring_col};' if ring_col else ''
    return (f'<span role="img" aria-label="Mahamuni" style="flex-shrink:0;display:inline-block;width:{size}px;height:{size}px;border-radius:50%;{bd}'
            f'background:url(&#39;{PORTRAIT}&#39;) {-(450-280)*k:.1f}px {-(470-280)*k:.1f}px/{900*k:.1f}px auto no-repeat;"></span>')
def attribution(text, col, size=34):
    return f'<div style="display:flex;align-items:center;gap:10px;">{avatar(size)}<span style="font-size:15px;color:{col};">{text}</span></div>'

XI = '<path d="M7 7l10 10M17 7L7 17"/>'
SEARCH_I = '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'
LEAFBG = f'background:{LEAF};background-image:repeating-linear-gradient(0deg, rgba(120,90,40,.07) 0 1px, transparent 1px 7px);'

def searchbar(value=None):
    txt = (f'<span style="flex:1;color:{INK};font-size:16px;">{value}</span><span aria-label="Clear" style="color:{TEXT2};">{svg(XI,18)}</span>' if value else
           f'<span style="flex:1;color:#6F5B3B;font-size:16px;">Search, or ask a question</span>')
    return f'<div role="search" style="display:flex;align-items:center;gap:10px;height:52px;padding:0 14px;border-radius:14px;background:#FFFDF6;border:1.5px solid {LEAFEDGE};">{svg(SEARCH_I,20,c="#6B5330",sw=2)}{txt}</div>'

M = dict(
    wheel='<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="2.5"/>' + ''.join(f'<path d="M{16+2.5*math.cos(a):.1f} {16+2.5*math.sin(a):.1f}L{16+11*math.cos(a):.1f} {16+11*math.sin(a):.1f}"/>' for a in [k*math.pi/4 for k in range(8)]),
    bow='<path d="M9 4c9 4 9 20 0 24"/><path d="M9 4v24"/><path d="M5 16h22M23 12.5l4 3.5-4 3.5"/>',
    ash='<path d="M5 11h22M4 16h24M5 21h22"/><circle cx="16" cy="16" r="2.4" fill="#E0463A" stroke="none"/>',
    yantra='<rect x="5" y="5" width="22" height="22"/><path d="M16 8l8 14H8z"/><circle cx="16" cy="17" r="2"/>',
)
def cover(dv, en, col, motif, state, on=False, dvsize=27):
    return f'''<a style="display:block;min-width:0;">
  <div style="position:relative;height:196px;">
    <div style="position:absolute;left:6px;right:-2px;top:10px;bottom:-6px;border-radius:6px;{LEAFBG}border:1px solid {LEAFEDGE};"></div>
    <div style="position:absolute;left:3px;right:1px;top:5px;bottom:-3px;border-radius:6px;{LEAFBG}border:1px solid {LEAFEDGE};"></div>
    <div style="position:absolute;inset:0 4px 0 0;border-radius:6px;background:{col};color:#fff;padding:14px;display:flex;flex-direction:column;overflow:hidden;">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">{M[motif]}</svg>
      <span style="position:absolute;left:0;right:0;top:44%;height:2px;background:rgba(255,236,200,.55);"></span>
      <span style="position:absolute;left:22px;top:calc(44% - 5px);width:12px;height:12px;border-radius:50%;background:#EBD9B4;"></span>
      <span class="ez" style="margin-top:auto;font-size:{dvsize}px;line-height:1.1;">{dv}</span>
      <span style="font-size:14px;font-weight:600;opacity:.92;margin-top:2px;">{en}</span>
    </div>
  </div>
  <p style="margin:12px 0 0;font-size:14px;{'font-weight:600;color:'+LAT if on else 'color:'+TEXT2};">{state}</p></a>'''

shelf = ''.join([
    cover('महाभारत', 'The Mahabharata', LAT, 'wheel', 'Reading, episode 3', on=True),
    cover('रामायण', 'The Rāmāyaṇa', '#4C6639', 'bow', '7 kāṇḍas, from January'),
    cover('पाशुपत', 'Pāśupata Śaivism', '#5E5A57', 'ash', '[Series, as approved]'),
    cover('भारतीय ज्ञान', 'Indian knowledge systems', '#9A6B12', 'yantra', 'Session 1 free', dvsize=23),
])

page('V13Wisdom', f"""
<div style="{LEAFBG}padding:54px 20px 24px;border-bottom:1px solid {LEAFEDGE};">
  <h1 class="ez" style="margin:4px 4px 14px;font-size:33px;font-weight:600;">Wisdom</h1>
  {searchbar()}
  <p class="ez" style="margin:22px 4px 0;font-size:26px;line-height:1.3;font-weight:500;">“Steadiness in practice gives clarity in life.”</p>
  <div style="margin:12px 4px 0;">{attribution('Mahamuni’s word for today', '#5B4628')}</div>
  <div style="display:flex;gap:18px;align-items:center;margin:14px 4px 0;"><a class="btn2" style="color:{INK};">Read what it means</a><a class="lnk">Sit with it</a></div>
</div>
<div style="padding:26px 16px 0;">
  <h2 class="ez" style="margin:0 8px 12px;font-size:21px;font-weight:600;">Continue reading</h2>
  {leafstrip(f'''
    <div style="display:flex;gap:14px;align-items:center;">
      <span class="ez" style="font-size:30px;line-height:1;color:{LAT};width:66px;flex-shrink:0;text-align:center;">आदि</span>
      <div style="flex:1;min-width:0;"><p style="margin:0;font-size:14px;color:#6B5330;">The Mahabharata, Ādi Parva</p>
      <p class="ez" style="margin:0;font-size:20px;font-weight:600;line-height:1.25;">The Churning of the Ocean</p></div></div>
    <div style="margin:14px 0 12px;">{segs(2, 10, cur=2)}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:14px;color:#6B5330;">Episode 3 of 10</span><a class="lnk">Continue</a></div>''')}
</div>
<div style="padding:32px 24px 0;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;"><h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">Mahamuni’s words</h2><a class="lnk">All 96 Vākyams</a></div>
  {''.join(f'<a style="display:block;padding:13px 0;border-top:{"1px solid "+LINE if k else "none"};margin-top:{8 if not k else 0}px;"><span class="ez" style="display:block;font-size:18.5px;line-height:1.4;">“{q}”</span><span style="font-size:14px;color:{TEXT2};">{d}</span></a>' for k,(q,d) in enumerate([('Do your work as an offering, and the work itself becomes your teacher.','Work, yesterday'),('A home is held together by patience more than by walls.','Family, 5 November')]))}
</div>
<div style="padding:34px 24px 0;">
  <h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">Series</h2>
  <p style="margin:2px 0 16px;font-size:15px;color:{TEXT2};">Long readings, taken one short episode at a time.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px 16px;">{shelf}</div>
  <a style="margin-top:26px;display:flex;align-items:center;gap:14px;padding:14px 0;border-top:1px solid {LINE};border-bottom:1px solid {LINE};">
    <span class="ez" style="width:48px;height:48px;border-radius:12px;background:{RED};color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;">७</span>
    <span style="flex:1;"><span style="display:block;font-size:14px;color:{TEXT2};">Also from Mahagathe</span><span class="ez" style="display:block;font-size:19px;font-weight:600;line-height:1.2;">Saptagita</span><span style="font-size:14px;color:{TEXT2};">Seven verses of the Gita a day. Opens the Saptagita app.</span></span>
    <span style="color:{TEXT2};">{svg('<path d="M9 5l7 7-7 7"/>',20,sw=2)}</span>
  </a>
</div>
<a style="margin:34px 16px 28px;display:flex;align-items:center;gap:16px;padding:16px;border-radius:16px;background:{LATSOFT};">
  {avatar(58)}
  <span style="flex:1;"><span class="ez" style="display:block;font-size:19px;font-weight:600;">Our lineage</span><span style="font-size:14px;color:{TEXT2};">Seventy heads of the Paramparā, from the founding ācārya to the Most Venerable Mahamuni</span></span>
</a>
{tabbar('Wisdom')}
""")

# ── Catalogue of Gurudev's words ──────────────────────────────────────────
chips = [('All', '', True), ('Inner life', '', False), ('Work', '', False), ('Family', '', False), ('Conduct', '', False)]
chiprow = ''.join(f'<a role="radio" aria-checked="{"true" if on else "false"}" style="flex-shrink:0;display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 14px;border-radius:20px;{"background:"+INK+";color:#fff;" if on else "border:1.5px solid "+LEAFEDGE+";"}font-weight:600;font-size:15px;">{t}<span style="font-weight:400;font-size:13px;opacity:.75;">{n}</span></a>' for t,n,on in chips)
def word(q, meta, first=False):
    return f'<a style="display:flex;gap:12px;padding:14px 0;border-top:{"none" if first else "1px solid "+LINE};"><span style="flex:1;"><span class="ez" style="display:block;font-size:19px;line-height:1.4;">{q}</span><span style="font-size:14px;color:{TEXT2};">{meta}</span></span><span style="color:{TEXT2};padding-top:4px;">{svg(I["save"],20)}</span></a>'
nov = [('“Steadiness in practice gives clarity in life.”', 'Inner life, today'),
       ('“Do your work as an offering, and the work itself becomes your teacher.”', 'Work, 6 November'),
       ('“A home is held together by patience more than by walls.”', 'Family, 5 November'),
       ('“Speak the truth, walk in dharma.”', 'Conduct, 4 November')]
octw = [('[A word on inner life, as approved]', 'Inner life, 31 October'), ('[A word on work, as approved]', 'Work, 30 October')]
page('V13Words', f"""
<div style="{LEAFBG}padding:54px 16px 18px;border-bottom:1px solid {LEAFEDGE};">
  {backpill('Wisdom')}
  <h1 class="ez" style="margin:14px 8px 2px;font-size:30px;font-weight:600;">Mahamuni’s words</h1>
  <p style="margin:0 8px 14px;font-size:15px;color:#5B4628;">96 Vākyams, newest first. Each one reviewed by the content authority.</p>
  <div style="padding:0 4px;">{searchbar()}</div>
  <div style="display:flex;gap:8px;overflow:hidden;margin:14px 4px 0;" role="radiogroup" aria-label="Theme">{chiprow}</div>
</div>
<div style="padding:22px 24px 0;">
  <h2 class="ez" style="margin:0 0 4px;font-size:18px;font-weight:600;color:{TEXT2};">November 2026</h2>
  {''.join(word(q,m,k==0) for k,(q,m) in enumerate(nov))}
</div>
<div style="padding:18px 24px 36px;">
  <h2 class="ez" style="margin:0 0 4px;font-size:18px;font-weight:600;color:{TEXT2};">October 2026</h2>
  {''.join(word(q,m,k==0) for k,(q,m) in enumerate(octw))}
</div>
""")

# ── Search by meaning ─────────────────────────────────────────────────────
res = [('“Do your work as an offering, and the work itself becomes your teacher.”', 'Work, 6 November'),
       ('“Steadiness in practice gives clarity in life.”', 'Inner life, today'),
       ('“A home is held together by patience more than by walls.”', 'Family, 5 November')]
page('V13Search', f"""
<div style="{LEAFBG}padding:54px 16px 16px;border-bottom:1px solid {LEAFEDGE};">
  {backpill('Wisdom')}
  <div style="margin:14px 4px 0;">{searchbar('staying calm when work is stressful')}</div>
  <p style="margin:10px 8px 0;font-size:14px;color:#5B4628;">Searching by meaning across 96 Vākyams and 10 episodes</p>
</div>
<div style="padding:22px 24px 0;">
  <h2 class="ez" style="margin:0 0 4px;font-size:21px;font-weight:600;">Closest in meaning</h2>
  {''.join(word(q,m,k==0) for k,(q,m) in enumerate(res))}
</div>
<div style="padding:22px 16px 0;">
  <h2 class="ez" style="margin:0 8px 12px;font-size:21px;font-weight:600;">From the series</h2>
  {leafstrip(f'''<div style="display:flex;gap:14px;align-items:center;">
      <span class="ez" style="font-size:30px;line-height:1;color:{LAT};width:66px;flex-shrink:0;text-align:center;">आदि</span>
      <div style="flex:1;min-width:0;"><p style="margin:0;font-size:14px;color:#6B5330;">The Mahabharata, episode 7</p>
      <p class="ez" style="margin:0;font-size:19px;font-weight:600;line-height:1.25;">The Vow of Bhīṣma</p></div></div>''')}
</div>
<div style="margin:28px 24px 0;padding:16px 0 0;border-top:1px solid {LINE};">
  <p style="margin:0;font-size:15px;color:{TEXT2};">Only Mahamuni’s approved Vākyams and the published series appear here. Nothing is written by AI.</p>
  <a class="lnk" style="display:inline-block;margin:10px 0 36px;">Browse by theme instead</a>
</div>
""")

# ── Series (generic, opened from the shelf) ───────────────────────────────
page('V13Series', f"""
<div style="background:#4C6639;color:#fff;padding:54px 16px 26px;position:relative;overflow:hidden;">
    <a style="display:inline-flex;align-items:center;gap:4px;height:40px;padding:0 14px 0 8px;border-radius:20px;background:rgba(255,255,255,.14);font-weight:600;font-size:15px;">{svg(I["back"],20,sw=2.2)}Wisdom</a>
  <div style="padding:18px 8px 0;position:relative;">
    <svg width="44" height="44" viewBox="0 0 32 32" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">{M['bow']}</svg>
    <p class="ez" style="margin:8px 0 0;font-size:50px;line-height:1.1;">रामायण</p>
    <h1 class="ez" style="margin:0;font-size:30px;font-weight:600;">The Rāmāyaṇa</h1>
    <p style="margin:8px 0 0;font-size:16px;color:#E3EAD8;max-width:320px;">Vālmīki’s Rāmāyaṇa in seven kāṇḍas, retold one short episode at a time. [Description, as approved]</p>
  </div>
</div>
<div style="padding:26px 24px 0;">
  <h2 class="ez" style="margin:0 0 6px;font-size:21px;font-weight:600;">The seven kāṇḍas</h2>
  {''.join(f'<div style="display:flex;gap:14px;align-items:center;padding:13px 0;border-top:{"1px solid "+LINE if k else "none"};"><span class="ez" style="width:28px;font-size:19px;font-weight:600;color:#4C6639;">{k+1}</span><span class="ez" style="flex:1;font-size:18px;">{n}</span><span style="font-size:14px;color:{TEXT2};">{w}</span></div>' for k,(n,w) in enumerate([('Bāla Kāṇḍa','January'),('Ayodhyā Kāṇḍa','February'),('Araṇya Kāṇḍa','Later in 2027'),('Kiṣkindhā Kāṇḍa',''),('Sundara Kāṇḍa',''),('Yuddha Kāṇḍa',''),('Uttara Kāṇḍa','')]))}
</div>
<div style="padding:22px 16px 40px;margin-top:auto;">
  <a class="btn">{svg(I['bell'],20)}Tell me when episode 1 is out</a>
</div>
""")
print('b ok')
