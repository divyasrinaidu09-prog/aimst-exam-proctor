import https from 'https';
import fs from 'fs';

async function main() {
  const res = await fetch('https://www.hijjas.com/aimst-university/');
  const text = await res.text();
  const re = /https:\/\/www\.hijjas\.com\/wp-content\/uploads\/[^\s"']+\.(?:jpg|webp|png)/g;
  const matches = [...new Set(text.match(re) || [])];
  console.log('Hijjas images count:', matches.length);
  matches.forEach(m => console.log(m));
}
main().catch(console.error);
