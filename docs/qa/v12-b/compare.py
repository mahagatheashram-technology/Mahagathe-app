"""Create 1× side-by-side comparisons from the 2× CDP captures and locked mocks."""
import os
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
WORK = Path(os.environ.get('V12_WORK', '/Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12b'))
OUT = ROOT / 'docs/qa/v12-b'
NAMES = ['Welcome', 'Setup', 'Wisdom', 'Vakyam', 'Episode', 'Sangha', 'Parampara', 'Donate']

for name in NAMES:
    reference = Image.open(ROOT / f'docs/design/v12/screenshots/V12{name}.png').convert('RGB')
    actual = Image.open(WORK / f'screenshots/{name}.png').convert('RGB')
    assert actual.size == (780, 1688), f'{name}: capture must be 390×844 at DPR 2'
    reference = reference.resize((390, round(reference.height * 390 / reference.width)), Image.Resampling.LANCZOS)
    actual = actual.resize((390, 844), Image.Resampling.LANCZOS)
    comparison = Image.new('RGB', (780, 870), 'white')
    comparison.paste(reference.crop((0, 0, 390, 844)), (0, 26))
    comparison.paste(actual, (390, 26))
    draw = ImageDraw.Draw(comparison)
    draw.text((10, 6), 'v12 reference', fill='black')
    draw.text((400, 6), 'implementation', fill='black')
    comparison.save(OUT / f'{name}-comparison.png', optimize=True)

for name in ['Episode-end', 'Vakyam-source', 'Vakyam-report', 'Sangha-gathering', 'Donate-selected', 'Donate-success']:
    actual = Image.open(WORK / f'screenshots/{name}.png').convert('RGB')
    actual.resize((390, 844), Image.Resampling.LANCZOS).save(OUT / f'{name}.png', optimize=True)
print('Saved eight 1× comparisons and six supporting flow captures.')
