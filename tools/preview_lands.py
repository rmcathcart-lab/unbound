import json, sys
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1])); out = sys.argv[2]; S = int(sys.argv[3]) if len(sys.argv) > 3 else 6
COL = {0:(74,90,68),1:(70,86,64),2:(122,104,72),3:(40,38,42),4:(36,64,96),5:(90,100,80),6:(214,168,96),8:(255,154,60),9:(10,10,12)}
LV = {'BEG':(127,176,105),'PRG':(111,155,224),'MAS':(176,123,232)}
ims = []
for lid, m in d.items():
    W, H = m['w'], m['h']; im = Image.new('RGB', (W*S, H*S+18), (0,0,0)); dr = ImageDraw.Draw(im)
    for i, v in enumerate(m['t']):
        x, y = i % W, i // W; dr.rectangle([x*S, y*S, x*S+S-1, y*S+S-1], fill=COL.get(v,(255,0,255)))
    def dot(p, c, r=S*0.7): dr.ellipse([p['x']*S+S/2-r, p['y']*S+S/2-r, p['x']*S+S/2+r, p['y']*S+S/2+r], fill=c)
    for p in m['chests']: dr.rectangle([p['x']*S, p['y']*S, p['x']*S+S-1, p['y']*S+S-1], fill=(230,200,60))
    for p in m['pages']: dr.rectangle([p['x']*S, p['y']*S, p['x']*S+S-1, p['y']*S+S-1], fill=(240,240,240))
    for p in m['lairs']: dot(p, LV[p['lv']])
    dot(m['key'], (255,230,0), S); dot(m['boss'], (216,67,58), S*1.2); dot(m['spawn'], (255,154,60), S*1.1)
    dr.text((4, H*S+3), lid + ' ' + m['name'] + ' ' + str(W) + 'x' + str(H), fill=(230,230,230))
    ims.append(im)
cols = 2 if len(ims) > 1 else 1; rows = (len(ims)+cols-1)//cols
cw = max(i.width for i in ims); ch = max(i.height for i in ims)
sheet = Image.new('RGB', (cw*cols+10*(cols-1), ch*rows+10*(rows-1)), (20,20,24))
for k, im in enumerate(ims): sheet.paste(im, ((k%cols)*(cw+10), (k//cols)*(ch+10)))
sheet.save(out)
