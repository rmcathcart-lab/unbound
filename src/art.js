/* ===================== CREATURE ART =====================
 * Each creature is a 200x200 SVG. currentColor = the level colour (rim light, eyes, magic).
 * Body tones come from the page tokens so they sit in the palette. #lb-glow is defined once in the page.
 */
var ART_DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
  '<filter id="lb-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
  '<filter id="lb-glow-big" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
  '<linearGradient id="lb-bone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e0c8"/><stop offset="1" stop-color="#9a8f78"/></linearGradient>' +
  '<linearGradient id="lb-cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2433"/><stop offset="1" stop-color="#0e0b12"/></linearGradient>' +
  '<linearGradient id="lb-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a8f9c"/><stop offset=".5" stop-color="#3c404b"/><stop offset="1" stop-color="#1c1e25"/></linearGradient>' +
  '<radialGradient id="lb-mist" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="currentColor" stop-opacity=".55"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="lb-fire" cx=".5" cy=".8" r=".7"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".35" stop-color="#f0a030"/><stop offset=".75" stop-color="#b3400f"/><stop offset="1" stop-color="#b3400f" stop-opacity="0"/></radialGradient>' +
  '</defs></svg>';

var SIGILS = {
  /* Bone Rat: rat skeleton, hunched, long segmented tail, glowing sockets */
  rat: '<svg viewBox="0 0 200 200"><g>' +
    '<ellipse cx="100" cy="160" rx="70" ry="14" fill="url(#lb-mist)"/>' +
    '<path d="M62 132c-26 4-46 24-40 44" fill="none" stroke="url(#lb-bone)" stroke-width="7" stroke-linecap="round" stroke-dasharray="9 5"/>' +
    '<path d="M64 96c-12 10-18 30-12 44 4 10 16 16 30 18l44 0c16-2 26-12 28-26 2-16-8-34-26-42z" fill="url(#lb-cloth)" stroke="#5a4f66" stroke-width="2"/>' +
    '<g fill="none" stroke="url(#lb-bone)" stroke-width="5" stroke-linecap="round"><path d="M74 106c-2 14 0 28 6 40"/><path d="M90 102c-2 16 0 30 6 44"/><path d="M106 102c-2 16 0 30 4 44"/><path d="M122 104c0 14 0 26 2 38"/><path d="M66 100c22-4 46-4 72 0"/></g>' +
    '<path d="M58 130c-14 16-10 34 6 38" fill="none" stroke="url(#lb-bone)" stroke-width="6" stroke-linecap="round"/><path d="M144 130c12 14 8 30-4 36" fill="none" stroke="url(#lb-bone)" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M112 60c-14 0-26 8-32 20-4 10-2 22 8 30l18 8 40-6c10-4 18-14 16-26-2-14-14-26-30-26z" fill="url(#lb-bone)" stroke="#6b6152" stroke-width="2"/>' +
    '<path d="M146 88l26 10-24 6z" fill="url(#lb-bone)" stroke="#6b6152" stroke-width="2"/>' +
    '<circle cx="88" cy="54" r="14" fill="url(#lb-cloth)" stroke="url(#lb-bone)" stroke-width="4"/><circle cx="120" cy="48" r="14" fill="url(#lb-cloth)" stroke="url(#lb-bone)" stroke-width="4"/>' +
    '<ellipse cx="102" cy="82" rx="9" ry="8" fill="#0c0a10"/><ellipse cx="128" cy="80" rx="8" ry="7" fill="#0c0a10"/>' +
    '<circle cx="102" cy="82" r="4" fill="currentColor" filter="url(#lb-glow)"/><circle cx="128" cy="80" r="3.5" fill="currentColor" filter="url(#lb-glow)"/>' +
    '<path d="M150 100l4 10M158 98l3 10" stroke="#e9e0c8" stroke-width="3" stroke-linecap="round"/>' +
    '</g></svg>',

  /* Gravedigger: hooded skeleton leaning on a shovel */
  skeleton: '<svg viewBox="0 0 200 200"><g>' +
    '<ellipse cx="100" cy="176" rx="64" ry="10" fill="url(#lb-mist)"/>' +
    '<path d="M150 34l-4 140" stroke="#5b4a33" stroke-width="7" stroke-linecap="round"/><path d="M134 168c0-12 6-22 14-24 8 2 14 12 14 24z" fill="url(#lb-metal)" stroke="#20222a" stroke-width="2"/><path d="M142 30h16" stroke="#5b4a33" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M100 40c-30 0-46 22-52 50-6 26-4 56 2 80h96c8-24 8-56 2-82-6-28-20-48-48-48z" fill="url(#lb-cloth)" stroke="#4a4056" stroke-width="2"/>' +
    '<path d="M70 92c-6 20-8 44-4 78M130 92c6 20 8 44 4 78" fill="none" stroke="#3a3144" stroke-width="2"/>' +
    '<path d="M100 36c-22 0-34 16-36 36l10 4h52l10-4c-2-20-14-36-36-36z" fill="url(#lb-cloth)" stroke="#5a4f66" stroke-width="2"/>' +
    '<path d="M80 60c0-16 9-26 20-26s20 10 20 26c0 8-3 14-7 18v8H87v-8c-4-4-7-10-7-18z" fill="url(#lb-bone)" stroke="#6b6152" stroke-width="2"/>' +
    '<ellipse cx="92" cy="64" rx="6" ry="6" fill="#0c0a10"/><ellipse cx="108" cy="64" rx="6" ry="6" fill="#0c0a10"/><circle cx="92" cy="64" r="3" fill="currentColor" filter="url(#lb-glow)"/><circle cx="108" cy="64" r="3" fill="currentColor" filter="url(#lb-glow)"/>' +
    '<path d="M90 80v6M96 80v6M102 80v6M108 80v6" stroke="#6b6152" stroke-width="2"/>' +
    '<g fill="none" stroke="url(#lb-bone)" stroke-width="5" stroke-linecap="round"><path d="M100 96v52"/><path d="M84 104c8 4 24 4 32 0"/><path d="M82 116c10 5 26 5 36 0"/><path d="M84 128c8 4 24 4 32 0"/></g>' +
    '<path d="M76 96l-14 40 20 6" fill="none" stroke="url(#lb-bone)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M124 96l16 30 8 40" fill="none" stroke="url(#lb-bone)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</g></svg>',

  /* Wight Lord: crowned barrow king in a spreading cloak */
  wight: '<svg viewBox="0 0 200 200"><g>' +
    '<ellipse cx="100" cy="178" rx="74" ry="10" fill="url(#lb-mist)"/>' +
    '<path d="M100 56c-40 6-62 40-72 78-4 16-2 30 4 44h136c6-14 8-28 4-44-10-38-32-72-72-78z" fill="url(#lb-cloth)" stroke="#4a4056" stroke-width="2"/>' +
    '<path d="M60 176c10-30 16-56 24-82M140 176c-10-30-16-56-24-82" fill="none" stroke="#3a3144" stroke-width="2"/>' +
    '<path d="M100 104c-8 10-12 26-10 40M100 104c8 10 12 26 10 40" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/>' +
    '<path d="M70 100l6-4 18 8h12l18-8 6 4c-4 22-10 40-30 46-20-6-26-24-30-46z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="2"/>' +
    '<path d="M100 108v34M84 118h32" stroke="currentColor" stroke-width="2" stroke-opacity=".6"/>' +
    '<path d="M78 66c0-18 10-30 22-30s22 12 22 30c0 10-4 16-8 20v10H86V86c-4-4-8-10-8-20z" fill="url(#lb-bone)" stroke="#6b6152" stroke-width="2"/>' +
    '<path d="M70 44l8-24 10 14 12-24 12 24 10-14 8 24z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="2"/><rect x="70" y="42" width="60" height="6" fill="#5f6470"/><circle cx="100" cy="30" r="3.5" fill="currentColor" filter="url(#lb-glow)"/>' +
    '<ellipse cx="91" cy="68" rx="6" ry="6.5" fill="#0c0a10"/><ellipse cx="109" cy="68" rx="6" ry="6.5" fill="#0c0a10"/><circle cx="91" cy="68" r="3.2" fill="currentColor" filter="url(#lb-glow)"/><circle cx="109" cy="68" r="3.2" fill="currentColor" filter="url(#lb-glow)"/>' +
    '<path d="M92 86v7M97 86v7M102 86v7M107 86v7" stroke="#6b6152" stroke-width="2"/>' +
    '<path d="M60 112l-18 30M140 112l18 30" stroke="url(#lb-bone)" stroke-width="5" stroke-linecap="round"/><path d="M40 140l-6 8M42 142l-8 2M42 144l-2 9" stroke="url(#lb-bone)" stroke-width="3" stroke-linecap="round"/><path d="M160 140l6 8M158 142l8 2M158 144l2 9" stroke="url(#lb-bone)" stroke-width="3" stroke-linecap="round"/>' +
    '</g></svg>',

  /* Marsh Wisp: a spirit flame over black water */
  wisp: '<svg viewBox="0 0 200 200"><g>' +
    '<ellipse cx="100" cy="164" rx="60" ry="8" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/><ellipse cx="100" cy="164" rx="34" ry="4" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="2"/>' +
    '<circle cx="100" cy="100" r="62" fill="url(#lb-mist)"/>' +
    '<path d="M100 26c-8 26-40 44-40 80 0 26 18 44 40 44s40-18 40-44c0-36-32-54-40-80z" fill="#161222" fill-opacity=".9" stroke="currentColor" stroke-width="3" filter="url(#lb-glow)"/>' +
    '<path d="M100 60c-6 16-22 28-22 48 0 14 10 24 22 24s22-10 22-24c0-20-16-32-22-48z" fill="currentColor" fill-opacity=".22"/>' +
    '<path d="M62 92c-14-4-26 4-30 16M138 92c14-4 26 4 30 16M70 130c-12 6-18 18-14 30M130 130c12 6 18 18 14 30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-opacity=".7"/>' +
    '<ellipse cx="88" cy="104" rx="7" ry="10" fill="#0c0a10"/><ellipse cx="112" cy="104" rx="7" ry="10" fill="#0c0a10"/><ellipse cx="88" cy="106" rx="3.5" ry="5" fill="currentColor" filter="url(#lb-glow)"/><ellipse cx="112" cy="106" rx="3.5" ry="5" fill="currentColor" filter="url(#lb-glow)"/>' +
    '<path d="M90 130c4 6 16 6 20 0" fill="none" stroke="#0c0a10" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="46" cy="70" r="3" fill="currentColor" filter="url(#lb-glow)"/><circle cx="158" cy="62" r="2.5" fill="currentColor" filter="url(#lb-glow)"/><circle cx="150" cy="150" r="2" fill="currentColor" filter="url(#lb-glow)"/>' +
    '</g></svg>',

  /* Hollow Knight: empty armour, visor lit from within, sword planted */
  knight: '<svg viewBox="0 0 200 200"><g>' +
    '<ellipse cx="100" cy="178" rx="66" ry="10" fill="url(#lb-mist)"/>' +
    '<path d="M144 68h12l-1 70-5 36-5-36z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="1.5"/><path d="M150 70v96" stroke="#b9bfcc" stroke-width="1.2" opacity=".7"/><path d="M134 62h32l-3 8h-26z" fill="#5f6470" stroke="#1c1e25" stroke-width="2"/><path d="M147 40h6v22h-6z" fill="#3b2f22"/><circle cx="150" cy="36" r="5" fill="#5f6470" stroke="#1c1e25" stroke-width="2"/>' +
    '<path d="M58 96c0-10 10-16 22-18h40c12 2 22 8 22 18v70H58z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="2"/>' +
    '<path d="M100 82v84" stroke="#1c1e25" stroke-width="2"/><path d="M70 118c14-6 46-6 60 0M70 140c14-6 46-6 60 0" fill="none" stroke="#1c1e25" stroke-width="2"/>' +
    '<path d="M104 110l-10 18 12 6-8 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-opacity=".9" filter="url(#lb-glow)"/>' +
    '<path d="M44 96c-4-12 4-22 18-22l4 30-14 6z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="2"/><path d="M156 96c4-12-4-22-18-22l-4 30 14 6z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="2"/>' +
    '<path d="M74 44c0-18 12-30 26-30s26 12 26 30v22c0 10-6 16-12 18H86c-6-2-12-8-12-18z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="2"/>' +
    '<path d="M100 14v-8M92 8h16" stroke="#8a8f9c" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M78 56h44v10H78z" fill="#0c0a10"/><path d="M82 61h36" stroke="currentColor" stroke-width="3" stroke-linecap="round" filter="url(#lb-glow)"/>' +
    '<path d="M86 74h28M88 80h24" stroke="#1c1e25" stroke-width="2"/>' +
    '</g></svg>',

  /* Barrow Lich: horned hood, staff with orb, glowing cube phylactery */
  lich: '<svg viewBox="0 0 200 200"><g>' +
    '<ellipse cx="100" cy="178" rx="70" ry="10" fill="url(#lb-mist)"/>' +
    '<path d="M48 40v134" stroke="#3b2f22" stroke-width="6" stroke-linecap="round"/><circle cx="48" cy="34" r="10" fill="#0c0a10" stroke="currentColor" stroke-width="2.5"/><circle cx="48" cy="34" r="4" fill="currentColor" filter="url(#lb-glow-big)"/>' +
    '<path d="M100 50c-34 8-52 44-58 84-2 16 0 30 6 40h104c6-10 8-24 6-40-6-40-24-76-58-84z" fill="url(#lb-cloth)" stroke="#4a4056" stroke-width="2"/>' +
    '<path d="M68 174c8-34 14-62 20-90M132 174c-8-34-14-62-20-90" fill="none" stroke="#3a3144" stroke-width="2"/>' +
    '<path d="M100 42c-22 0-36 16-38 38l12 6h52l12-6c-2-22-16-38-38-38z" fill="url(#lb-cloth)" stroke="#5a4f66" stroke-width="2"/>' +
    '<path d="M74 44c-14-10-18-26-10-40 2 14 10 22 20 26M126 44c14-10 18-26 10-40-2 14-10 22-20 26" fill="url(#lb-bone)" stroke="#6b6152" stroke-width="2"/>' +
    '<path d="M80 66c0-16 9-26 20-26s20 10 20 26c0 8-3 14-7 18v8H87v-8c-4-4-7-10-7-18z" fill="url(#lb-bone)" stroke="#6b6152" stroke-width="2"/>' +
    '<ellipse cx="92" cy="70" rx="6" ry="6.5" fill="#0c0a10"/><ellipse cx="108" cy="70" rx="6" ry="6.5" fill="#0c0a10"/><circle cx="92" cy="70" r="3.2" fill="currentColor" filter="url(#lb-glow)"/><circle cx="108" cy="70" r="3.2" fill="currentColor" filter="url(#lb-glow)"/>' +
    '<path d="M91 86v6M96 86v6M101 86v6M106 86v6" stroke="#6b6152" stroke-width="2"/>' +
    '<path d="M132 114l16-6 16 6v18l-16 6-16-6z" fill="#0c0a10" stroke="currentColor" stroke-width="2"/><path d="M132 114l16 6 16-6M148 120v18" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="148" cy="124" r="14" fill="currentColor" fill-opacity=".25" filter="url(#lb-glow-big)"/>' +
    '<path d="M118 100l14 12" stroke="url(#lb-bone)" stroke-width="5" stroke-linecap="round"/><path d="M82 100l-24 10" stroke="url(#lb-bone)" stroke-width="5" stroke-linecap="round"/>' +
    '</g></svg>',

  /* Vessarion: the archlich, huge crown, cloak like wings, runes orbiting */
  boss: '<svg viewBox="0 0 200 200"><g>' +
    '<ellipse cx="100" cy="182" rx="84" ry="10" fill="url(#lb-mist)"/>' +
    '<circle cx="100" cy="100" r="80" fill="url(#lb-mist)" opacity=".7"/>' +
    '<path d="M100 60c-46 10-72 50-84 96-4 14 0 22 8 22h152c8 0 12-8 8-22-12-46-38-86-84-96z" fill="url(#lb-cloth)" stroke="#4a4056" stroke-width="2"/>' +
    '<path d="M24 176c14-40 30-70 50-92M176 176c-14-40-30-70-50-92M100 100c-6 30-8 52-6 76M100 100c6 30 8 52 6 76" fill="none" stroke="#3a3144" stroke-width="2"/>' +
    '<path d="M62 100l38 60 38-60" fill="none" stroke="currentColor" stroke-width="2" stroke-opacity=".5"/>' +
    '<path d="M60 40l8-30 12 18 10-24 10 20 10-20 10 24 12-18 8 30v10H60z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="2"/><rect x="60" y="48" width="80" height="7" fill="#5f6470"/><circle cx="100" cy="26" r="4" fill="currentColor" filter="url(#lb-glow)"/><circle cx="74" cy="32" r="2.5" fill="currentColor" filter="url(#lb-glow)"/><circle cx="126" cy="32" r="2.5" fill="currentColor" filter="url(#lb-glow)"/>' +
    '<path d="M76 74c0-20 11-32 24-32s24 12 24 32c0 10-4 18-9 22v10H85V96c-5-4-9-12-9-22z" fill="url(#lb-bone)" stroke="#6b6152" stroke-width="2"/>' +
    '<ellipse cx="90" cy="76" rx="7" ry="7.5" fill="#0c0a10"/><ellipse cx="110" cy="76" rx="7" ry="7.5" fill="#0c0a10"/><circle cx="90" cy="76" r="4" fill="currentColor" filter="url(#lb-glow-big)"/><circle cx="110" cy="76" r="4" fill="currentColor" filter="url(#lb-glow-big)"/>' +
    '<path d="M90 96v8M96 96v8M102 96v8M108 96v8" stroke="#6b6152" stroke-width="2"/>' +
    '<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" filter="url(#lb-glow)"><path d="M28 96l6-8 6 8-6 8z"/><path d="M160 84l6-8 6 8-6 8z"/><path d="M40 140l8-4 4 8-8 4z"/><path d="M152 130l8 2-2 8-8-2z"/><path d="M20 120h10M25 115v10"/><path d="M170 112h10M175 107v10"/></g>' +
    '<path d="M70 110l-30 22M130 110l30 22" stroke="url(#lb-bone)" stroke-width="6" stroke-linecap="round"/><path d="M40 132l-8 8M40 132l-10 0M40 132l-2 10" stroke="url(#lb-bone)" stroke-width="3" stroke-linecap="round"/><path d="M160 132l8 8M160 132l10 0M160 132l2 10" stroke="url(#lb-bone)" stroke-width="3" stroke-linecap="round"/>' +
    '</g></svg>',

  /* Bonfire: a sword planted in a coil of bones, ember glow */
  fire: '<svg viewBox="0 0 200 200"><g>' +
    '<ellipse cx="100" cy="166" rx="70" ry="16" fill="url(#lb-fire)" opacity=".5"/>' +
    '<path d="M46 160c10-10 30-14 54-14s44 4 54 14c-10 8-30 12-54 12s-44-4-54-12z" fill="#2a2230" stroke="#4a4056" stroke-width="2"/>' +
    '<g fill="none" stroke="url(#lb-bone)" stroke-width="5" stroke-linecap="round"><path d="M56 154l30-6"/><path d="M118 148l28 8"/><path d="M70 164l26 2"/><path d="M110 166l24-4"/><path d="M62 150l-4-6M86 148l2-6M146 156l4-6M118 148l-2-6"/></g>' +
    '<path d="M100 60c-8 24-34 36-34 66 0 20 14 34 34 34s34-14 34-34c0-30-26-42-34-66z" fill="url(#lb-fire)" filter="url(#lb-glow-big)"/>' +
    '<path d="M100 92c-4 14-16 22-16 38 0 10 6 18 16 18s16-8 16-18c0-16-12-24-16-38z" fill="#ffe9a8" opacity=".85"/>' +
    '<path d="M100 20v120" stroke="url(#lb-metal)" stroke-width="7" stroke-linecap="round"/><path d="M84 52h32l-4 8H88z" fill="url(#lb-metal)" stroke="#1c1e25" stroke-width="2"/><circle cx="100" cy="24" r="6" fill="#5f6470" stroke="#1c1e25" stroke-width="2"/>' +
    '<circle cx="66" cy="70" r="2.5" fill="#f0a030" filter="url(#lb-glow)"/><circle cx="140" cy="52" r="2" fill="#f0a030" filter="url(#lb-glow)"/><circle cx="128" cy="86" r="1.8" fill="#ffe9a8" filter="url(#lb-glow)"/>' +
    '</g></svg>',

  imp: null, hound: null, wyrm: null, sprite: null, golem: null, drake: null, boss2: null,
  thornling: null, mosswight: null, treant: null, barksprite: null, shade: null, rootbound: null, boss3: null,
  scarab: null, ghoul: null, reliquary: null, spider: null, cryptknight: null, sentinel: null, boss4: null,
  toad: null, heron: null, naga: null, lantern: null, wraith: null, hydra: null, boss5: null,
  crab: null, sailor: null, kraken: null, harpy: null, brineknight: null, siren: null, boss6: null,
  goat: null, holdsentry: null, briargolem: null, raven: null, archer: null, warden: null, boss7: null,
  /* Fog: unexplored land marker */
  fog: '<svg viewBox="0 0 200 200"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".8"><path d="M40 96c12-20 36-20 48 0 12-20 36-20 48 0 8-12 24-12 32 0"/><path d="M28 130c12-16 32-16 44 0 12-16 32-16 44 0 12-16 32-16 44 0"/><path d="M56 64c12-16 28-16 40 0 12-16 28-16 40 0"/></g></svg>'
};
if (typeof module !== 'undefined') module.exports = { SIGILS: SIGILS, ART_DEFS: ART_DEFS };
