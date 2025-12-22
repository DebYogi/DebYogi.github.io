#!/usr/bin/env node
// Simple contrast checker for site theme values in data/site.json
// Usage: node scripts/check-contrast.js

const fs = require('fs');
const path = require('path');

function hexToRgb(hex){
  if(!hex) return null;
  hex = hex.replace('#','');
  if(hex.length === 3) hex = hex.split('').map(h=>h+h).join('');
  const bigint = parseInt(hex,16);
  return {r:(bigint>>16)&255, g:(bigint>>8)&255, b:bigint&255};
}

function luminance({r,g,b}){
  const srgb = [r/255,g/255,b/255].map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4));
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
}

function contrast(hex1, hex2){
  const a = luminance(hexToRgb(hex1));
  const b = luminance(hexToRgb(hex2));
  const L1 = Math.max(a,b);
  const L2 = Math.min(a,b);
  return (L1+0.05)/(L2+0.05);
}

function check(){
  const file = path.join(__dirname,'..','data','site.json');
  if(!fs.existsSync(file)){ console.error('data/site.json not found'); process.exit(1) }
  const site = JSON.parse(fs.readFileSync(file,'utf8'));
  const theme = site.theme || {};
  const bgLight = theme.background?.light || {};
  const bgDark = theme.background?.dark || {};
  const text = theme.text;
  const mut = theme.muted;
  console.log('Contrast checks (recommended >= 4.5 for normal text, >=3.0 for large text)');

  const checks = [];
  if(bgLight.gradientStart) checks.push({name:'Light backgroundStart vs text', bg:bgLight.gradientStart, fg:bgLight.text || '#0b1220'});
  if(bgLight.surface) checks.push({name:'Light surface vs text', bg:bgLight.surface, fg:bgLight.text || '#0b1220'});
  if(bgDark.gradientStart) checks.push({name:'Dark backgroundStart vs text', bg:bgDark.gradientStart, fg:bgDark.text || (text || '#e8f1f6')});
  if(bgDark.surface) checks.push({name:'Dark surface vs text', bg:bgDark.surface, fg:bgDark.text || (text || '#e8f1f6')});
  checks.push({name:'Primary text vs background start (dark-mode fallback)', bg: theme.gradientStart || '#061523', fg: text || '#e6f2f7'});
  // additional checks: accent vs text, link vs surface, button foreground vs accent
  if(theme.accent) {
    checks.push({name:'Accent vs text (default text)', bg: theme.accent, fg: text || '#e8f1f6'});
    if(theme.background?.light?.text) checks.push({name:'Accent vs light-mode text', bg: theme.accent, fg: theme.background.light.text});
    if(theme.background?.dark?.text) checks.push({name:'Accent vs dark-mode text', bg: theme.accent, fg: theme.background.dark.text});
  }
  if(theme.link) checks.push({name:'Link vs surface', bg: theme.link, fg: theme.background?.dark?.surface || theme.surface || '#0c2530'});
  // compute button fore if present in theme, else use defaults
  checks.push({name:'Button foreground vs accent (assume dark #052326)', bg: theme.accent || '#56c2d6', fg: '#052326'});
  checks.push({name:'Button foreground vs accent (assume white #ffffff)', bg: theme.accent || '#56c2d6', fg: '#ffffff'});

  checks.forEach(c => {
    try{
      const ratio = contrast(c.bg, c.fg).toFixed(2);
      const pass = ratio >= 4.5 ? 'PASS' : (ratio >= 3 ? 'AA-large' : 'FAIL');
      console.log(`${c.name}: ${c.bg} on ${c.fg} — ratio ${ratio} — ${pass}`);
    }catch(e){
      console.warn('Could not compute for', c);
    }
  });
}

check();
