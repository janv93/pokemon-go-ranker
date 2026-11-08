// Usage: node build.js <gamemaster.min.json> <rocketLineups.json> [gamemasterDate] [lineupsDate]
// Injects compacted fallback data into app.html -> index.html (GitHub Pages) and artifact.html (preview)
const fs=require('fs'),path=require('path');const root=__dirname;
const src=fs.readFileSync(path.join(root,'app.html'),'utf8');
const tf=src.match(/\/\/<transform>([\s\S]*?)\/\/<\/transform>/)[1];
const {compactGM,compactRocket}=new Function(tf+';return {compactGM,compactRocket};')();
const gm=compactGM(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));
const rk=compactRocket(JSON.parse(fs.readFileSync(process.argv[3],'utf8')));
// optional 4th/5th args: ISO commit dates of the gamemaster and lineups files
const gmt=process.argv[4]||new Date().toISOString(),rkt=process.argv[5]||new Date().toISOString();
const J=o=>JSON.stringify(o).replace(/</g,'\\u003c');
const iv=fs.readFileSync(path.join(root,'iv.js'),'utf8');
let out=src.replace('<script src="iv.js"></script>',()=>'<script>\n'+iv+'</script>').replace('/*GM*/null/*/GM*/',()=>J(gm)).replace('/*RK*/null/*/RK*/',()=>J(rk))
 .replace("/*GMT*/''/*/GMT*/",()=>J(gmt)).replace("/*RKT*/''/*/RKT*/",()=>J(rkt));
fs.writeFileSync(path.join(root,'index.html'),out);
// artifact variant: page content only (host adds the document skeleton)
const head=out.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>\n?|<meta name="viewport"[^>]*>\n?|<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n?/g,'');
const body=out.match(/<body>([\s\S]*?)<\/body>/)[1];
fs.writeFileSync(path.join(root,'artifact.html'),head.trim()+'\n'+body.trim()+'\n');
console.log('pokemon',gm.p.length,'fast moves',Object.keys(gm.m).length,'grunts',rk.g.length,'bytes',out.length);
