from gen13b import *
import datetime as dt

CHEV = '<path d="M9 5l7 7-7 7"/>'
TURMERIC, FOREST = '#9A6B12', '#4C6639'
SATTVA, RAJAS, TAMAS = '#FFFDF6', '#B5341F', INK
DARKLEAF = '#5B4628'

def wd(y, m, d):
    return dt.date(y, m, d).strftime('%a')

def review(text, dark=False):
    col = LAMP if dark else '#7A5200'
    bg = 'rgba(242,181,68,.10)' if dark else '#FFF4D6'
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:8px;border:1.5px dashed {col};background:{bg};'
            f'color:{col};font-size:13px;font-weight:600;line-height:1.3;">{text}</span>')

def photo_todo(label, h, radius=12):
    return (f'<div style="height:{h}px;border-radius:{radius}px;background:{LAT};background-image:repeating-linear-gradient(135deg, rgba(255,255,255,.06) 0 2px, transparent 2px 14px);'
            f'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#F6DCCF;text-align:center;padding:0 24px;">'
            f'<span style="width:74px;height:74px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;"><img src="{EMBLEM}" style="height:52px;" alt=""></span>'
            f'<span style="font-size:14px;font-weight:600;">{label}</span></div>')

# rope of the three gunas: guna means strand; strand thickness follows the share
def rope(pcts, w=300, h=70, amp=None):
    amp = amp or h * .26
    cy = h / 2; lam = w / 2.5
    order = [('sattva', SATTVA), ('rajas', RAJAS), ('tamas', TAMAS)]
    paths = ''
    for k, (g, col) in enumerate(order):
        sw = 4 + pcts[g] * .34 * (h / 70)
        pts = ' '.join(f'{x:.1f},{cy + amp*math.sin(2*math.pi*x/lam + k*2*math.pi/3):.1f}' for x in range(12, w - 11, 3))
        if g == 'sattva':
            paths += f'<polyline points="{pts}" fill="none" stroke="{LEAFEDGE}" stroke-width="{sw+3:.1f}" stroke-linecap="round" stroke-linejoin="round"/>'
        paths += f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="{sw:.1f}" stroke-linecap="round" stroke-linejoin="round"/>'
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true">{paths}</svg>'

RES = dict(sattva=34, rajas=42, tamas=24)

# ── Home: sitting, the Yakṣa's question with the story, Mahamuni's word ──
def yaksha_block(state):
    opts = ['Time', 'The mind', 'A rumour']
    if state == 'ask':
        body = f'''
      <p class="ez" style="margin:8px 0 0;font-size:31px;line-height:1.2;font-weight:600;">What is swifter than the wind?</p>
      <p style="margin:6px 0 16px;font-size:15px;color:{DARKLEAF};">Make your guess, then see how Yudhiṣṭhira answered.</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        {''.join(f'<a role="radio" aria-checked="false" style="height:50px;border-radius:14px;background:#FFFDF6;border:1.5px solid {LEAFEDGE};display:flex;align-items:center;padding:0 16px;font-weight:600;font-size:17px;">{o}</a>' for o in opts)}
      </div>
      <a class="lnk" style="display:inline-block;margin-top:12px;color:{DARKLEAF};">Just show me</a>'''
    else:
        body = f'''
      <p class="ez" style="margin:8px 0 0;font-size:22px;line-height:1.25;font-weight:500;color:{DARKLEAF};">What is swifter than the wind?</p>
      <div style="margin-top:12px;display:flex;align-items:center;gap:12px;">
        <span style="width:34px;height:34px;border-radius:50%;background:{FOREST};color:#fff;display:flex;align-items:center;justify-content:center;">{svg(I['check'],20,sw=2.4)}</span>
        <span style="font-size:15px;font-weight:600;color:{FOREST};">You guessed it</span></div>
      <p class="ez" style="margin:10px 0 0;font-size:38px;line-height:1.1;font-weight:600;color:{LAT};">The mind.</p>
      <p style="margin:6px 0 0;font-size:14px;color:{DARKLEAF};">Yudhiṣṭhira’s answer, Āraṇyaka Parva 3.297 [verse to confirm]</p>
      <p class="ez" style="margin:14px 0 0;font-size:19px;line-height:1.5;">Nothing outruns a thought. Today, notice where yours runs before you follow it. <span style="font-family:Mukta;font-size:14px;color:{DARKLEAF};">[draft, to approve]</span></p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;">
        <a class="btn2" style="color:{INK};white-space:nowrap;">{svg(I['share'],18)}Share as a story</a>
        <span style="font-size:14px;color:{DARKLEAF};text-align:right;">New question<br>tomorrow</span></div>'''
    return f'''
<div style="padding:24px 16px 0;">
  <div class="leaf" style="padding:22px 26px 0 30px;overflow:hidden;">
    <span class="hole" style="left:11px;top:44px;"></span><span class="hole" style="right:11px;top:44px;"></span>
    <div style="display:flex;align-items:center;gap:10px;">
      <svg width="30" height="16" viewBox="0 0 30 16" fill="none" stroke="{LAT}" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M1 5c3.5-3 7-3 10.5 0s7 3 10.5 0 5-2.5 7-1"/><path d="M1 12c3.5-3 7-3 10.5 0s7 3 10.5 0 5-2.5 7-1"/></svg>
      <span style="font-size:15px;font-weight:600;color:{LAT};">The Yakṣa’s question</span>
    </div>
    {body}
    <a style="margin:20px -26px 0 -30px;padding:14px 26px 16px 30px;border-top:1px solid {LEAFEDGE};display:flex;align-items:center;gap:12px;background:rgba(255,253,246,.35);">
      <span class="ez" style="font-size:22px;line-height:1;color:{LAT};">आदि</span>
      <span style="flex:1;min-width:0;"><span style="display:block;font-size:13px;color:{DARKLEAF};">Your story, episode 3 of 10</span><span class="ez" style="display:block;font-size:17px;font-weight:600;line-height:1.2;">The Churning of the Ocean</span></span>
      <span class="lnk">Continue</span>
    </a>
  </div>
</div>'''

def home(name, state):
    page(name, f"""
{TOP}
<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 20px 0;">
  <h1 class="ez" style="margin:0;font-size:30px;font-weight:600;line-height:1.15;">Good morning, Arjun</h1>
  <a aria-label="Profile and settings" style="width:44px;height:44px;border-radius:50%;background:{LATSOFT};color:{LAT};display:flex;align-items:center;justify-content:center;font-family:Eczar;font-weight:600;font-size:19px;">A</a>
</div>
<div style="padding:18px 16px 0;">
  <div style="background:{INDIGO};border-radius:20px;padding:18px 18px 18px;color:#fff;display:flex;align-items:center;gap:16px;">
    {ring(10, 92, sub='lit')}
    <div style="flex:1;">
      <p class="ez" style="margin:0;font-size:21px;font-weight:600;line-height:1.2;">Sitting 11 of 40</p>
      <p style="margin:2px 0 10px;font-size:14px;color:{ONDARK2};">Samatha meditation, 7 min</p>
      <a class="btn" style="height:46px;font-size:16px;">{svg(I['play'],16)}Begin sitting</a>
    </div>
  </div>
</div>
{yaksha_block(state)}
<div style="padding:28px 24px 24px;">
  <p class="ez" style="margin:0;font-size:25px;line-height:1.3;font-weight:500;">“Steadiness in practice gives clarity in life.”</p>
  <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;">
    {attribution('Mahamuni’s word for today', TEXT2, 32)}
    <a class="lnk">What it means</a>
  </div>
</div>
{tabbar('Home')}
""")
home('V13Home', 'ask')
home('V131HomeAnswer', 'answer')

# ── Yakṣa share card (9:16 story) ──
page('V131YakshaCard', f"""
<div style="flex:1;display:flex;align-items:center;justify-content:center;background:#2B2622;padding:24px 0;">
  <div class="leaf" style="width:330px;height:587px;border-radius:22px;padding:40px 34px 30px;display:flex;flex-direction:column;">
    <span class="hole" style="left:13px;top:60px;"></span><span class="hole" style="right:13px;top:60px;"></span>
    <span style="font-size:15px;font-weight:600;color:{LAT};">The Yakṣa asked</span>
    <p class="ez" style="margin:10px 0 0;font-size:34px;line-height:1.15;font-weight:600;">What is swifter than the wind?</p>
    <svg style="margin:26px 0;" width="60" height="18" viewBox="0 0 30 16" fill="none" stroke="{LAT}" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M1 5c3.5-3 7-3 10.5 0s7 3 10.5 0 5-2.5 7-1"/><path d="M1 12c3.5-3 7-3 10.5 0s7 3 10.5 0 5-2.5 7-1"/></svg>
    <span style="font-size:15px;font-weight:600;color:{LAT};">Yudhiṣṭhira answered</span>
    <p class="ez" style="margin:6px 0 0;font-size:52px;line-height:1;font-weight:600;color:{LAT};">The mind.</p>
    <p style="margin:12px 0 0;font-size:14px;color:{DARKLEAF};">Mahabharata, Āraṇyaka Parva 3.297</p>
    <div style="margin-top:auto;display:flex;align-items:center;gap:12px;padding-top:16px;border-top:1px solid {LEAFEDGE};">
      <span style="width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;"><img src="{EMBLEM}" style="height:30px;" alt=""></span>
      <span><span class="ez" style="display:block;font-size:17px;font-weight:600;line-height:1.1;">Mahagathe</span><span style="font-size:13px;color:{DARKLEAF};">A new question every day</span></span>
    </div>
  </div>
</div>
""", bg='#2B2622')

# ── Gunometer ──
GITA14 = 'Gita, chapter 14'
page('V131GunaInvite', f"""
<div style="{LEAFBG}flex:1;display:flex;flex-direction:column;padding:54px 24px 40px;">
  <div style="display:flex;justify-content:flex-end;"><a style="height:44px;display:flex;align-items:center;font-weight:600;color:{DARKLEAF};">Later</a></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <p style="margin:0;font-size:15px;font-weight:600;color:{LAT};">Gunometer</p>
    <p class="ez" style="margin:6px 0 0;font-size:62px;line-height:1;color:{LAT};">गुण</p>
    <h1 class="ez" style="margin:10px 0 0;font-size:36px;font-weight:600;line-height:1.1;">Find your guna</h1>
    <p style="margin:12px 0 0;font-size:17px;line-height:1.55;color:#4A3920;max-width:320px;">Guṇa means a strand. Sattva, rajas and tamas are woven through everyone, in different measure. Twenty-five short questions show which strand runs strongest in you.</p>
    <div style="margin:26px -4px 0;">{rope(RES, 330, 80)}</div>
    <div style="margin-top:22px;display:flex;flex-direction:column;gap:10px;font-size:15px;color:#4A3920;">
      <span style="display:flex;gap:10px;align-items:center;">{svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',20)}About five minutes</span>
      <span style="display:flex;gap:10px;align-items:center;">{svg(I['save'],20)}Your result stays in your profile</span>
      <span style="display:flex;gap:10px;align-items:center;">{svg('<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',20)}Take it again whenever you like</span>
    </div>
  </div>
  <a class="btn">Begin</a>
</div>
""", bg=LEAF)

likert = ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always']
page('V131GunaQuestion', f"""
<div style="{LEAFBG}flex:1;display:flex;flex-direction:column;padding:54px 20px 34px;">
  <div style="display:flex;align-items:center;gap:12px;">
    <a aria-label="Previous question" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:22px;background:rgba(42,30,20,.06);">{svg(I['back'],20,sw=2.2)}</a>
    <div style="flex:1;">{segs(11, 25, cur=11, col=LAT, off='rgba(42,30,20,.16)')}</div>
    <span style="font-size:14px;font-weight:600;color:{DARKLEAF};">12 of 25</span>
  </div>
  <div style="padding:46px 6px 0;">
    <p style="margin:0;font-size:15px;color:{DARKLEAF};">Over the last four weeks, how often was this true for you?</p>
    <p class="ez" style="margin:14px 0 0;font-size:30px;line-height:1.25;font-weight:500;">My mood rose and fell with results, feedback or recognition.</p>
  </div>
  <div role="radiogroup" style="margin-top:auto;display:flex;flex-direction:column;gap:10px;">
    {''.join(f'<a role="radio" aria-checked="{"true" if o=="Often" else "false"}" style="height:54px;border-radius:14px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-weight:600;font-size:17px;{"background:"+INK+";color:#fff;" if o=="Often" else "background:#FFFDF6;border:1.5px solid "+LEAFEDGE+";"}">{o}{svg(I["check"],20,sw=2.4) if o=="Often" else ""}</a>' for o in likert)}
  </div>
  <div style="margin-top:14px;text-align:center;">{review('Question wording needs content review')}</div>
</div>
""", bg=LEAF)

def bar3(p):
    segs_ = [('sattva', SATTVA), ('rajas', RAJAS), ('tamas', TAMAS)]
    return ('<div style="display:flex;height:14px;border-radius:7px;overflow:hidden;border:1px solid ' + LEAFEDGE + ';">' +
            ''.join(f'<span style="width:{p[g]}%;background:{c};"></span>' for g, c in segs_) + '</div>')

sections = [('How it shows up', 'You decide fast, enjoy a challenge and like to see progress.'),
            ('Work that suits you', 'Execution, leadership under pressure, fast-moving teams'),
            ('Food and daily rhythm', 'Energising meals, active mornings, real recovery'),
            ('What to watch for', 'Long waits, vague goals, burning out without rest')]
page('V131GunaResult', f"""
<div style="{LEAFBG}padding:54px 16px 26px;border-bottom:1px solid {LEAFEDGE};">
  <div style="display:flex;justify-content:space-between;align-items:center;">{backpill('Profile')}<a aria-label="Share" style="padding:10px;">{svg(I['share'],22)}</a></div>
  <div style="padding:18px 8px 0;">
    <p style="margin:0;font-size:15px;color:{DARKLEAF};">Your Gunometer, taken 12 November</p>
    <div style="display:flex;align-items:baseline;gap:14px;margin-top:4px;">
      <h1 class="ez" style="margin:0;font-size:52px;font-weight:600;line-height:1;color:{RAJAS};">Rajas</h1>
      <span class="ez" style="font-size:36px;color:{RAJAS};opacity:.8;">रजस्</span>
    </div>
    <p style="margin:6px 0 0;font-size:16px;color:#4A3920;">Your strongest strand, with sattva close behind.</p>
    <div style="margin:18px -6px 0;">{rope(RES, 342, 74)}</div>
    <div style="margin-top:14px;">{bar3(RES)}</div>
    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:15px;">
      <span><b>Sattva</b> {RES['sattva']}%</span><span style="color:{RAJAS};"><b>Rajas</b> {RES['rajas']}%</span><span><b>Tamas</b> {RES['tamas']}%</span></div>
  </div>
</div>
<div style="padding:24px 24px 0;">
  <h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">What this means</h2>
  <p style="margin:8px 0 0;font-size:17px;line-height:1.6;">You tend to work best through motion, challenge and visible results. Your energy runs high, and you thrive when there is something to build or win.</p>
  <div style="margin-top:10px;">{review('Result text needs content review')}</div>
</div>
<div style="padding:18px 24px 0;">
  {''.join(f'<a style="display:flex;align-items:center;gap:12px;padding:14px 0;border-top:1px solid {LINE};"><span style="flex:1;"><span class="ez" style="display:block;font-size:18px;font-weight:600;">{t}</span><span style="font-size:14px;color:{TEXT2};">{s}</span></span><span style="color:{TEXT2};">{svg(I["down"],20,sw=2)}</span></a>' for t,s in sections)}
</div>
<a style="margin:16px 16px 0;display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:16px;background:{LATSOFT};">
  <span class="ez" style="width:44px;height:44px;border-radius:12px;background:{RED};color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:600;">७</span>
  <span style="flex:1;"><span class="ez" style="display:block;font-size:17px;font-weight:600;">The three gunas in the Gita</span><span style="font-size:14px;color:{TEXT2};">{GITA14}, in the Saptagita app</span></span>
</a>
<div style="padding:22px 16px 36px;display:flex;flex-direction:column;align-items:center;gap:10px;">
  <a class="btn2" style="color:{INK};width:100%;justify-content:center;">Take it again</a>
  <span style="font-size:14px;color:{TEXT2};">Your new result replaces this one.</span>
</div>
""")

page('V131GunaCard', f"""
<div style="flex:1;display:flex;align-items:center;justify-content:center;background:#2B2622;padding:24px 0;">
  <div class="leaf" style="width:330px;height:587px;border-radius:22px;padding:40px 30px 30px;display:flex;flex-direction:column;">
    <span style="font-size:15px;font-weight:600;color:{LAT};">My guna</span>
    <p class="ez" style="margin:8px 0 0;font-size:64px;line-height:1;font-weight:600;color:{RAJAS};">Rajas</p>
    <p class="ez" style="margin:4px 0 0;font-size:34px;color:{RAJAS};opacity:.8;">रजस्</p>
    <div style="margin:28px -8px 0;">{rope(RES, 286, 96)}</div>
    <div style="margin-top:18px;">{bar3(RES)}</div>
    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:15px;"><span>Sattva {RES['sattva']}</span><span style="color:{RAJAS};font-weight:600;">Rajas {RES['rajas']}</span><span>Tamas {RES['tamas']}</span></div>
    <p class="ez" style="margin:22px 0 0;font-size:19px;line-height:1.4;">Motion, challenge and visible results.</p>
    <div style="margin-top:auto;display:flex;align-items:center;gap:12px;padding-top:16px;border-top:1px solid {LEAFEDGE};">
      <span style="width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;"><img src="{EMBLEM}" style="height:30px;" alt=""></span>
      <span><span class="ez" style="display:block;font-size:17px;font-weight:600;line-height:1.1;">Gunometer by Mahagathe</span><span style="font-size:13px;color:{DARKLEAF};">Find yours in the Mahagathe app</span></span>
    </div>
  </div>
</div>
""", bg='#2B2622')

# Profile with the guna
rem = [('Daily sitting', '6:00 AM', True), ('Mahamuni’s word', 'Off, 7:00 AM', False), ('Gatherings I’m going to', 'The day before', True)]
page('V13Profile', f"""
{TOP}
<div style="padding:0 16px;">{backpill('Home')}</div>
<div style="margin:18px 16px 0;padding:18px;border-radius:20px;background:{INDIGO};color:#fff;display:flex;align-items:center;gap:16px;">
  {ring(10, 78, center=False)}
  <span style="flex:1;"><span class="ez" style="display:block;font-size:24px;font-weight:600;">Arjun</span><span style="font-size:15px;color:{ONDARK2};">10 lamps lit in this Mandala</span></span>
  <a class="lnk" style="color:#fff;">Edit</a>
</div>
<a style="margin:12px 16px 0;display:block;padding:16px 18px 14px;border-radius:20px;{LEAFBG}border:1px solid {LEAFEDGE};">
  <div style="display:flex;align-items:center;gap:12px;">
    <span style="flex:1;"><span style="display:block;font-size:14px;color:{DARKLEAF};">Your guna, from the Gunometer</span>
    <span style="display:flex;align-items:baseline;gap:10px;"><span class="ez" style="font-size:28px;font-weight:600;color:{RAJAS};line-height:1.15;">Rajas</span><span style="font-size:14px;color:{DARKLEAF};">taken 12 November</span></span></span>
    <span style="color:{DARKLEAF};">{svg(CHEV,22,sw=2)}</span>
  </div>
  <div style="margin:8px -4px 0;">{rope(RES, 320, 40)}</div>
</a>
<div style="padding:28px 24px 0;">
  <h2 class="ez" style="margin:0 0 4px;font-size:21px;font-weight:600;">Reminders</h2>
  {''.join(f'<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-top:{"1px solid "+LINE if k else "none"};"><span style="flex:1;"><span style="display:block;font-weight:600;">{t}</span><span style="font-size:14px;color:{TEXT2};">{s}</span></span>{tog(o)}</div>' for k,(t,s,o) in enumerate(rem))}
</div>
<div style="padding:22px 24px 0;">
  <h2 class="ez" style="margin:0 0 4px;font-size:21px;font-weight:600;">Settings</h2>
  {''.join(f'<a style="display:flex;align-items:center;padding:14px 0;border-top:{"1px solid "+LINE if k else "none"};"><span style="flex:1;font-weight:600;">{t}</span><span style="color:{TEXT2};font-size:15px;">{v}</span></a>' for k,(t,v) in enumerate([('Language','English'),('Your data and account','')]))}
</div>
<a style="margin:20px 24px 40px;font-weight:600;color:{LAT};">Sign out</a>
""")

# ── Practice: Samatha, then Dhyanbhaari after the class ──
steps = [('Samatha meditation', 'Calm-abiding meditation. Open to everyone.', 'open'),
         ('Dhyanbhaari', 'Learned in person. Unlocks here after you attend the class.', 'lock')]
path = ''
for i, (t, s, st) in enumerate(steps):
    last = i == len(steps) - 1
    node = (f'<span style="width:34px;height:34px;border-radius:50%;background:{LAMP};color:{INDIGO};display:flex;align-items:center;justify-content:center;font-family:Eczar;font-weight:700;font-size:16px;">{i+1}</span>' if st == 'open' else
            f'<span style="width:34px;height:34px;border-radius:50%;border:1.5px solid rgba(185,188,217,.5);color:{ONDARK2};display:flex;align-items:center;justify-content:center;font-family:Eczar;font-weight:600;font-size:16px;">{i+1}</span>')
    line = '' if last else f'<span style="position:absolute;left:16.5px;top:38px;bottom:-6px;width:1.5px;background:rgba(185,188,217,.3);"></span>'
    right = f'<span style="color:{LAMP};font-size:14px;font-weight:600;">Practising</span>' if st == 'open' else svg(I['lock'], 18, c=ONDARK2)
    path += f'<div style="position:relative;display:flex;gap:16px;align-items:flex-start;padding-bottom:22px;">{line}{node}<div style="flex:1;padding-top:3px;"><p style="margin:0;font-weight:600;font-size:17px;color:#fff;">{t}</p><p style="margin:0;font-size:14px;color:{ONDARK2};">{s}</p></div><div style="padding-top:6px;">{right}</div></div>'
page('V13Practice', f"""
{TOP}
<div style="padding:4px 24px 0;"><h1 class="ez" style="margin:0;font-size:33px;font-weight:600;">Practice</h1></div>
<div style="display:flex;flex-direction:column;align-items:center;padding:18px 24px 0;text-align:center;">
  {ring(10, 236, sub='lamps lit')}
  <p style="margin:16px 0 0;font-size:16px;color:{ONDARK2};max-width:290px;">Each sitting lights one lamp of your Mandala. Thirty to go, at your own pace.</p>
  <div style="margin-top:10px;">{review('Mandala rule needs teachers’ review (D-23)', dark=True)}</div>
  <a class="btn" style="width:100%;margin-top:20px;">{svg(I['play'],18)}Begin sitting 11</a>
</div>
<div style="padding:36px 24px 6px;">
  <h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">The path of practice</h2>
  <p style="margin:4px 0 20px;font-size:15px;color:{ONDARK2};">Begin with Samatha. Dhyanbhaari is given in a class, then practised here.</p>
  {path}
  <div style="margin:-4px 0 0 50px;padding:16px;border-radius:14px;background:{INDIGO2};">
    <p style="margin:0;font-weight:600;color:#fff;">Next Dhyanbhaari class</p>
    <p style="margin:2px 0 12px;font-size:14px;color:{ONDARK2};">[Date and place, as announced]</p>
    <a class="btn2" style="color:{LAMP};">See classes</a>
  </div>
  <div style="margin:14px 0 0 50px;">{review('Path labels and order need sign-off', dark=True)}</div>
</div>
<div style="margin:26px 24px 28px;padding:16px 0;border-top:1px solid rgba(185,188,217,.2);display:flex;align-items:center;gap:14px;">
  <span style="color:{ONDARK2};">{svg(I['bell'],22)}</span>
  <span style="flex:1;"><span style="display:block;font-weight:600;">Daily reminder</span><span style="font-size:14px;color:{ONDARK2};">6:00 AM</span></span>
  <span style="width:50px;height:30px;border-radius:15px;background:{LAMP};position:relative;"><span style="position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;background:{INDIGO};"></span></span>
</div>
{tabbar('Practice', dark=True)}
""", bg=INDIGO, color='#fff')

# Mandala: rules with the review tag
rules = [('One sitting counts each day.', 'Sit more if you like; the lamp lights once.'),
         ('There is no deadline.', 'A missed day changes nothing. Come back when you can.'),
         ('At forty, the Mandala is complete.', 'Then you can begin another.')]
page('V13Mandala', f"""
{TOP}
<div style="padding:0 16px;">{backpill('Practice', dark=True)}</div>
<div style="display:flex;flex-direction:column;align-items:center;padding:14px 24px 0;text-align:center;">
  <h1 class="ez" style="margin:0;font-size:30px;font-weight:600;">Your Mandala</h1>
  <p style="margin:2px 0 18px;font-size:15px;color:{ONDARK2};">Begun 26 October. Last sitting yesterday.</p>
  {ring(10, 290, sub='lamps lit')}
</div>
<div style="padding:26px 24px 0;">
  {review('These three rules need teachers’ review (D-23)', dark=True)}
  <div style="margin-top:6px;">
  {''.join(f'<div style="display:flex;gap:14px;padding:12px 0;{"border-top:1px solid rgba(185,188,217,.18);" if k else ""}"><span style="color:{LAMP};margin-top:2px;">{svg(I["lampi"],20)}</span><span><span style="display:block;font-weight:600;font-size:16px;">{a}</span><span style="font-size:15px;color:{ONDARK2};">{b}</span></span></div>' for k,(a,b) in enumerate(rules))}
  </div>
</div>
<div style="padding:18px 24px 40px;margin-top:auto;"><a class="btn">{svg(I['play'],18)}Begin sitting 11</a></div>
""", bg=INDIGO, color='#fff')

# ── Sangha: events here, programs, seva with vibhāga ──
seva = [('adhyaya', 'Adhyaya', 'Learning for children'), ('ayuri', 'Āyuri', 'Care for elders'),
        ('bhandara', 'Bhaṇḍāra', 'Food for all'), ('samriddhi', 'Samṛddhi', 'Skills and livelihood')]
ev = [(2026, 11, 8, 'Sunday group sitting', '6:30 AM, online, for enrolled sādhakas'),
      (2026, 11, 14, 'Yuva Chetana class', '4 PM at the ashram, ages 13–24. You’re going')]
page('V13Sangha', f"""
<div style="position:relative;">
  {photo_todo('[Ashram or Abhyudaya anniversary photo to come]', 330, 0)}
  <h1 class="ez" style="position:absolute;left:24px;top:52px;margin:0;font-size:33px;font-weight:600;color:#fff;">Sangha</h1>
  <div style="position:absolute;left:16px;bottom:-34px;width:84px;height:92px;border-radius:14px;background:#fff;color:{LAT};display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05;box-shadow:0 6px 18px rgba(80,25,10,.25);">
    <span style="font-size:15px;font-weight:600;">Dec</span><span class="ez" style="font-size:38px;font-weight:600;">20</span><span style="font-size:13px;">{dt.date(2026,12,20).strftime('%A')}</span></div>
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
      <span style="width:52px;text-align:center;color:{LAT};line-height:1.1;"><span style="display:block;font-size:13px;font-weight:600;">{wd(y,m,d)}</span><span class="ez" style="font-size:24px;font-weight:600;">{d}</span></span>
      <span style="flex:1;"><span style="display:block;font-weight:600;">{t}</span><span style="font-size:14px;color:{TEXT2};">{s}</span></span></a>'''
      for k,(y,m,d,t,s) in enumerate(ev))}
</div>
<div style="padding:34px 16px 0;">
  <h2 class="ez" style="margin:0 8px;font-size:21px;font-weight:600;">Programs</h2>
  <p style="margin:2px 8px 14px;font-size:15px;color:{TEXT2};">Ways to learn and grow with the ashram.</p>
  <a style="display:block;border-radius:16px;overflow:hidden;background:{LAT};color:#fff;">
    <div style="padding:20px 20px 18px;background-image:repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 2px, transparent 2px 14px);">
      <p class="ez" style="margin:0;font-size:36px;line-height:1.1;color:#F6DCCF;">युवा चेतना</p>
      <p class="ez" style="margin:4px 0 0;font-size:24px;font-weight:600;">Yuva Chetana</p>
      <p style="margin:4px 0 14px;font-size:15px;color:#F6DCCF;">Gen Z guides, for ages 13–24. [Description to come]</p>
      <span class="btn2" style="color:#fff;">Meet Yuva Chetana</span>
    </div>
  </a>
  {''.join(f'<a style="display:flex;align-items:center;gap:14px;padding:14px 8px;border-bottom:1px solid {LINE};"><span class="ez" style="font-size:20px;color:{LAT};width:84px;flex-shrink:0;">{dv}</span><span style="flex:1;"><span style="display:block;font-weight:600;">{n}</span><span style="font-size:14px;color:{TEXT2};">{s}</span></span><span style="color:{TEXT2};">{svg(CHEV,20,sw=2)}</span></a>' for dv,n,s in [('बाल','Bala Chetana','For children. [Description to come]'),('ध्यानोदय','Dhyanodaya','Meditation classes. [Description to come]')])}
</div>
<div style="padding:34px 0 0;">
  <div style="padding:0 24px;"><h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">Our seva</h2>
  <p style="margin:2px 0 14px;font-size:15px;color:{TEXT2};">Four kinds of service the sangha does every week.</p></div>
  <div style="display:flex;gap:12px;overflow:hidden;padding:0 24px;">
    {''.join(f'<a style="flex-shrink:0;width:200px;"><div style="height:130px;border-radius:12px;background:url(&#39;{PH[k]}&#39;) center/cover;"></div><p style="margin:10px 0 0;font-size:13px;font-weight:600;color:{LAT};">[Vibhāga, to confirm]</p><p class="ez" style="margin:0;font-size:19px;font-weight:600;line-height:1.2;">{n}</p><p style="margin:0;font-size:14px;color:{TEXT2};">{s}</p></a>' for k,n,s in seva)}
  </div>
</div>
<div style="margin:30px 16px 28px;padding:20px;border-radius:16px;background:{LATSOFT};display:flex;align-items:center;gap:16px;">
  <span style="flex:1;"><span class="ez" style="display:block;font-size:20px;font-weight:600;">Give dāna</span><span style="font-size:15px;color:{TEXT2};">Support the seva by UPI. A receipt comes by SMS.</span></span>
  <a class="btn2" style="color:{LAT};">Give</a>
</div>
{tabbar('Sangha')}
""")

# Yuva Chetana program page
page('V131Program', f"""
<div style="background:{LAT};color:#fff;padding:54px 16px 24px;background-image:repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 2px, transparent 2px 14px);">
  <a style="display:inline-flex;align-items:center;gap:4px;height:40px;padding:0 14px 0 8px;border-radius:20px;background:rgba(255,255,255,.14);font-weight:600;font-size:15px;">{svg(I["back"],20,sw=2.2)}Sangha</a>
  <div style="padding:18px 8px 0;">
    <p class="ez" style="margin:0;font-size:50px;line-height:1.1;color:#F6DCCF;">युवा चेतना</p>
    <h1 class="ez" style="margin:2px 0 0;font-size:32px;font-weight:600;">Yuva Chetana</h1>
    <p style="margin:6px 0 0;font-size:17px;color:#F6DCCF;">Gen Z guides. For ages 13–24.</p>
  </div>
</div>
<div style="padding:16px 16px 0;">{photo_todo('[Yuva Chetana photos to come]', 200)}</div>
<div style="padding:22px 24px 0;">
  <p style="margin:0;font-size:17px;line-height:1.6;">[What Yuva Chetana is, in two or three sentences, as approved.]</p>
  <div style="margin-top:10px;">{review('Copy and photos to come from the team')}</div>
</div>
<div style="padding:24px 24px 0;">
  <h2 class="ez" style="margin:0 0 4px;font-size:21px;font-weight:600;">What we do</h2>
  {''.join(f'<div style="display:flex;gap:14px;padding:13px 0;border-top:{"1px solid "+LINE if k else "none"};"><span class="ez" style="width:24px;font-size:19px;font-weight:600;color:{LAT};">{k+1}</span><span style="flex:1;"><span style="display:block;font-weight:600;">[Activity {k+1}]</span><span style="font-size:14px;color:{TEXT2};">[One line on it]</span></span></div>' for k in range(3))}
</div>
<div style="margin:18px 16px 0;padding:16px 18px;border-radius:16px;background:{LATSOFT};display:flex;align-items:center;gap:16px;">
  <span style="width:52px;text-align:center;color:{LAT};line-height:1.1;"><span style="display:block;font-size:13px;font-weight:600;">{wd(2026,11,14)}</span><span class="ez" style="font-size:26px;font-weight:600;">14</span></span>
  <span style="flex:1;"><span style="display:block;font-weight:600;">Next class</span><span style="font-size:14px;color:{TEXT2};">4 PM at Mahagathe Ashram</span></span>
</div>
<div style="padding:22px 16px 40px;margin-top:auto;"><a class="btn">Join the next class</a></div>
""")

# IKS series: session 1 free, the rest need access
def smark(st):
    if st == 'free':
        return f'<span style="font-size:14px;font-weight:600;color:{FOREST};">Free</span>'
    return f'<span style="color:{TEXT2};">{svg(I["lock"],18)}</span>'
sess = [('[Session 1 title]', 'free'), ('[Session 2 title]', 'lock'), ('[Session 3 title]', 'lock'), ('[Session 4 title]', 'lock'), ('[Session 5 title]', 'lock')]
page('V131IKS', f"""
<div style="background:{TURMERIC};color:#fff;padding:54px 16px 26px;">
  <a style="display:inline-flex;align-items:center;gap:4px;height:40px;padding:0 14px 0 8px;border-radius:20px;background:rgba(255,255,255,.16);font-weight:600;font-size:15px;">{svg(I["back"],20,sw=2.2)}Wisdom</a>
  <div style="padding:18px 8px 0;">
    <svg width="44" height="44" viewBox="0 0 32 32" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">{M['yantra']}</svg>
    <p class="ez" style="margin:8px 0 0;font-size:44px;line-height:1.15;">भारतीय ज्ञान</p>
    <h1 class="ez" style="margin:0;font-size:30px;font-weight:600;">Indian knowledge systems</h1>
    <p style="margin:8px 0 0;font-size:16px;color:#FBEBC8;max-width:320px;">[What the series covers, as approved.] The first session is free.</p>
  </div>
</div>
<div style="padding:24px 24px 0;">
  <h2 class="ez" style="margin:0 0 6px;font-size:21px;font-weight:600;">Sessions</h2>
  {''.join(f'<div style="display:flex;gap:14px;align-items:center;padding:13px 0;border-top:{"1px solid "+LINE if k else "none"};{"" if st=="free" else "opacity:.72;"}"><span class="ez" style="width:26px;font-size:19px;font-weight:600;color:{TURMERIC if st=="free" else TEXT2};">{k+1}</span><span class="ez" style="flex:1;font-size:18px;">{t}</span>{smark(st)}</div>' for k,(t,st) in enumerate(sess))}
</div>
<div style="padding:20px 16px 0;"><a class="btn">{svg(I['play'],18)}Watch session 1, free</a></div>
<div style="margin:18px 16px 0;padding:18px;border-radius:16px;border:1.5px solid {LINE};background:#fff;">
  <p class="ez" style="margin:0;font-size:19px;font-weight:600;">Sessions 2 to 5</p>
  <p style="margin:2px 0 12px;font-size:15px;color:{TEXT2};">Open the whole series on this account.</p>
  <a class="btn2" style="color:{INK};">Get access to the full series</a>
  <div style="margin-top:12px;">{review('How access is paid for is still to be decided')}</div>
</div>
<div style="height:36px;"></div>
""")

# ── Lineage, with the portrait ──
PORTRAIT_HDR = f"background:url(&#39;{PORTRAIT}&#39;) 0 -26px/390px auto no-repeat;"
page('V131Lineage', f"""
<div style="position:relative;height:470px;{PORTRAIT_HDR}">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 62%,rgba(20,10,4,.78) 100%);"></div>
  <div style="position:absolute;left:16px;top:54px;"><a style="display:inline-flex;align-items:center;gap:4px;height:40px;padding:0 14px 0 8px;border-radius:20px;background:rgba(0,0,0,.28);color:#fff;font-weight:600;font-size:15px;">{svg(I["back"],20,sw=2.2)}Wisdom</a></div>
  <div style="position:absolute;left:24px;right:24px;bottom:22px;color:#fff;">
    <p style="margin:0;font-size:15px;color:#F6DCCF;">Seventieth Mahādhibhū of the Rudra Sampradāya</p>
    <h1 class="ez" style="margin:2px 0 0;font-size:34px;font-weight:600;line-height:1.1;">Most Venerable Mahamuni</h1>
  </div>
</div>
<div style="padding:22px 24px 0;">
  <p style="margin:0;font-size:17px;line-height:1.6;">[A short introduction to Mahamuni, as approved.] Every teaching in this app comes from this lineage, handed from teacher to student for seventy generations.</p>
</div>
<div style="padding:26px 24px 0;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;"><h2 class="ez" style="margin:0;font-size:21px;font-weight:600;">The Paramparā</h2><a class="lnk">All seventy</a></div>
  {''.join(f'<div style="display:flex;gap:14px;align-items:center;padding:13px 0;border-top:{"1px solid "+LINE if k else "none"};margin-top:{6 if not k else 0}px;"><span class="ez" style="width:34px;font-size:19px;font-weight:600;color:{LAT};">{n}</span><span style="flex:1;"><span class="ez" style="display:block;font-size:18px;{"font-weight:600;" if k==0 else ""}">{t}</span><span style="font-size:14px;color:{TEXT2};">{s}</span></span></div>' for k,(n,t,s) in enumerate([('70','Mahamuni','The present Mahādhibhū'),('69','[Name, as approved]','[Years]'),('68','[Name, as approved]','[Years]'),('1','[The founding ācārya]','[Years]')]))}
</div>
<div style="height:36px;"></div>
""")

# Vākyam: attribution with the portrait
s = open(f'{OUT}/V13Vakyam.html').read()
s = s.replace('<p style="margin:16px 0 0;font-size:15px;font-weight:600;">Mahamuni’s own words</p>',
              f'<div style="margin-top:16px;">{attribution("Mahamuni’s own words", INK, 34)}</div>')
open(f'{OUT}/V13Vakyam.html', 'w').write(s)
print('c ok', sorted(os.listdir(OUT)))
