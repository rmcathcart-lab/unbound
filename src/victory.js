/* Lord of Lore victory medallion: the pack's runtime (lorebound-lord-of-lore-and-map-icons/runtime/victory.js),
 * unchanged except that the two faces come from ART_IMG['ui-lord-front'] and ART_IMG['ui-lord-back']. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LoreboundVictory=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TITLE='Lord of Lore',DURATION=2000,FRAMES=48,FPS=24,THICKNESS=30,RADIUS=180;
function sample(progress){
 if(!Number.isFinite(progress))throw new TypeError('Progress must be finite.');
 const p=Math.max(0,Math.min(1,progress)),ease=p*p*p*(p*(p*6-15)+10),angle=720*ease,rad=angle*Math.PI/180,cos=Math.cos(rad);
 const glow=p<=0||p>=1?0:1.3*Math.pow(Math.sin(Math.PI*p),.8)*(.52+.48*Math.exp(-Math.pow((p-.74)/.2,2)));
 return {progress:p,angle,face:cos>=0?'front':'back',scaleX:Math.abs(cos),edgeWidth:THICKNESS*Math.abs(Math.sin(rad)),title:TITLE,level:null,glow,done:p>=1};
}
function star(ctx,x,y,size,alpha){ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;ctx.fillStyle='#ffe3a1';ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.2,-size*.2);ctx.lineTo(size,0);ctx.lineTo(size*.2,size*.2);ctx.lineTo(0,size);ctx.lineTo(-size*.2,size*.2);ctx.lineTo(-size,0);ctx.lineTo(-size*.2,-size*.2);ctx.closePath();ctx.fill();ctx.restore();}
function draw(ctx,images,progress,size=512){const s=sample(progress);ctx.save();ctx.clearRect(0,0,size,size);ctx.scale(size/512,size/512);const g=s.glow;
 if(g>0){const aura=ctx.createRadialGradient(256,256,144,256,256,249);aura.addColorStop(0,'rgba(222,165,60,0)');aura.addColorStop(.36,'rgba(242,188,85,'+Math.min(.38,g*.29)+')');aura.addColorStop(.72,'rgba(193,122,39,'+Math.min(.18,g*.13)+')');aura.addColorStop(1,'rgba(193,122,39,0)');ctx.fillStyle=aura;ctx.fillRect(0,0,512,512);ctx.save();ctx.translate(256,256);ctx.rotate(progress*Math.PI*.3);ctx.strokeStyle='rgba(229,184,100,'+Math.min(.64,g*.5)+')';ctx.lineWidth=1.35;ctx.beginPath();ctx.arc(0,0,198,.13,2.25);ctx.arc(0,0,198,2.52,4.64);ctx.arc(0,0,211,4.76,6.05);ctx.stroke();ctx.restore();for(let i=0;i<10;i++){const a=(i/10*2*Math.PI)+progress*.8,r=201+13*Math.sin(i*2.31+progress*6);star(ctx,256+Math.cos(a)*r,256+Math.sin(a)*r,3.3+(i%3)*1.3,Math.min(1,g*(.48+.3*Math.sin(i+progress*9)**2)));}}
 // Orthographic projection of a solid cylinder, not a flattened image.
 const theta=s.angle*Math.PI/180,c=Math.cos(theta),sn=Math.sin(theta),a=THICKNESS/2*sn;
 const faceOffset=(c>=0?1:-1)*a;
 drawEdge(ctx,theta,{metal:[205,170,103]});
 const texture=s.face==='front'?images.front:images.back;
 if(texture&&s.scaleX>.0001){ctx.save();ctx.translate(256+faceOffset,256);ctx.scale(s.scaleX,1);ctx.drawImage(texture,-256,-256,512,512);ctx.restore();}
 if(g>.1&&s.face==='front'){const glint=ctx.createLinearGradient(85,105,320,320);glint.addColorStop(0,'rgba(255,237,187,0)');glint.addColorStop(.52,'rgba(255,237,187,'+Math.min(.55,g*.33)+')');glint.addColorStop(1,'rgba(255,237,187,0)');ctx.save();ctx.translate(256+faceOffset,256);ctx.scale(s.scaleX,1);ctx.strokeStyle=glint;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,176,-2.9,-.55);ctx.stroke();ctx.restore();}
 ctx.restore();return s;}
function drawEdge(ctx,theta,tier){
 const c=Math.cos(theta),sn=Math.sin(theta),sine=Math.abs(sn);
 if(sine<.000001)return;
 const a=THICKNESS/2*sn,sign=sn>=0?-1:1,steps=144;
 const point=(phi,z)=>({x:256+sign*RADIUS*Math.cos(phi)*c+z*sn,y:256+RADIUS*Math.sin(phi)});
 const tone=(light)=>'rgb('+tier.metal.map(v=>Math.round(Math.min(255,Math.max(0,v*light)))).join(',')+')';
 // Each strip represents a segment of the visible cylindrical circumference.
 // Small overlapping boundaries avoid subpixel cracks at output sizes.
 for(let i=0;i<steps;i++){
  const lo=-Math.PI/2+i*Math.PI/steps,hi=Math.min(Math.PI/2,lo+Math.PI/steps+.0015),mid=(lo+hi)/2;
  const nx=sign*Math.cos(mid)*c,ny=Math.sin(mid),nz=-sign*Math.cos(mid)*sn;
  const light=.27+.57*Math.max(0,-.44*nx-.55*ny+.7*nz)+.25*Math.pow(Math.max(0,-.35*nx-.25*ny+.9*nz),18);
  const q=[point(lo,-THICKNESS/2),point(lo,THICKNESS/2),point(hi,THICKNESS/2),point(hi,-THICKNESS/2)];
  ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);for(let j=1;j<4;j++)ctx.lineTo(q[j].x,q[j].y);ctx.closePath();ctx.fillStyle=tone(light);ctx.fill();
 }
 // Reeding runs across the metal edge, with narrow raised rims at both faces.
 for(let i=1;i<72;i++){
  const phi=-Math.PI/2+i*Math.PI/72,p=point(phi,-THICKNESS*.38),q=point(phi,THICKNESS*.38);
  ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.lineWidth=.68;ctx.strokeStyle='rgba(22,15,9,'+(i%3===0?.62:.32)+')';ctx.stroke();
 }
 for(const z of [-THICKNESS/2,-THICKNESS*.37,THICKNESS*.37,THICKNESS/2]){
  ctx.beginPath();for(let i=0;i<=steps;i++){const p=point(-Math.PI/2+i*Math.PI/steps,z);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}
  ctx.lineWidth=Math.abs(z)===THICKNESS/2?1.55:.8;ctx.strokeStyle=tone(Math.abs(z)===THICKNESS/2?1.09:.62);ctx.stroke();
 }
}
function mount(canvas,options={}){
 if(!canvas||!canvas.getContext)throw new TypeError('A canvas element is required.');
 const ctx=canvas.getContext('2d'),images={},base=(options.assetBase||'').replace(/\/?$/,'/');
 const url=path=>base==='/'?path:base+path;
 const reduced=options.reducedMotion===undefined?(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches):!!options.reducedMotion;
 let destroyed=false,busy=false,raf=null,finish=null,serial=0;
 function paint(p){const state=draw(ctx,images,p,canvas.width);if(options.onUpdate)options.onUpdate(state);return state;}
 function load(key,path){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve(im)};im.onerror=()=>reject(new Error('Cannot load victory medallion: '+im.src));const art=typeof ART_IMG!=='undefined'?ART_IMG[key==='front'?'ui-lord-front':'ui-lord-back']:null;im.src=art||url(path);});}
 function cancel(){serial++;if(raf!==null)cancelAnimationFrame(raf);raf=null;busy=false;if(finish){finish({cancelled:true});finish=null;}}
 const ready=Promise.all([load('front','medallion/lord-of-lore.png'),load('back','art/lord-of-lore-back.png')]).then(()=>{if(!destroyed)paint(1);});
 async function showStill(){if(destroyed)throw new Error('Medallion is destroyed.');cancel();const token=serial;await ready;if(token!==serial||destroyed)return {cancelled:true};paint(1);return {cancelled:false};}
 async function play(playOptions={}){
  if(destroyed)throw new Error('Medallion is destroyed.');
  const duration=playOptions.duration===undefined?DURATION:playOptions.duration;
  if(!Number.isFinite(duration)||duration<=0)throw new RangeError('Duration must be a positive number of milliseconds.');
  cancel();const token=serial;busy=true;try{await ready;}catch(e){if(token===serial)busy=false;throw e;}
  if(token!==serial||destroyed)return {cancelled:true};
  if(reduced){busy=false;paint(1);return {cancelled:false};}
  return new Promise(resolve=>{finish=resolve;let start=null;const tick=now=>{if(token!==serial||destroyed)return;if(start===null)start=now;const p=Math.min(1,(now-start)/duration);paint(p);if(p===1){busy=false;raf=null;finish=null;resolve({cancelled:false});}else raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);});
 }
 return {ready,play,showStill,get busy(){return busy},destroy(){cancel();destroyed=true;}};
}
return {TITLE,DURATION,FRAMES,FPS,THICKNESS,RADIUS,sample,draw,mount};
});
