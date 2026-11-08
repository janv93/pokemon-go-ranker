// Usage: node build.js <gamemaster.min.json> <rocketLineups.json> <raids.json> <GAME_MASTER.json> [gamemasterDate] [lineupsDate] [raidsDate] [raidMovesDate]
// Injects compacted fallback data into app.html -> index.html (GitHub Pages) and artifact.html (preview)
const fs=require('fs'),path=require('path');const root=__dirname;
const src=fs.readFileSync(path.join(root,'app.html'),'utf8');
const tf=src.match(/\/\/<transform>([\s\S]*?)\/\/<\/transform>/)[1];
const {compactGM,compactRocket,compactRaids,compactRaidMoves}=new Function(tf+';return {compactGM,compactRocket,compactRaids,compactRaidMoves};')();
const read=i=>JSON.parse(fs.readFileSync(process.argv[i],'utf8'));
const gm=compactGM(read(2)),rk=compactRocket(read(3)),rd=compactRaids(read(4)),rm=compactRaidMoves(read(5));
const now=new Date().toISOString(),[gmt,rkt,rdt,rmt]=[6,7,8,9].map(i=>process.argv[i]||now);
const section=name=>src.match(new RegExp('//<'+name+'>([\\s\\S]*?)//</'+name+'>'))[1];
const {overallSaved,dataKey}=new Function('GM','RM',section('calc')+section('raid')+';return {overallSaved,dataKey};')(gm,rm);
const ro={k:dataKey(),rows:overallSaved()};
const J=o=>JSON.stringify(o).replace(/</g,'\\u003c');
const iv=fs.readFileSync(path.join(root,'iv.js'),'utf8');
let out=src.replace('<script src="iv.js"></script>',()=>'<script>\n'+iv+'</script>').replace('/*GM*/null/*/GM*/',()=>J(gm)).replace('/*RK*/null/*/RK*/',()=>J(rk))
 .replace('/*RD*/null/*/RD*/',()=>J(rd)).replace('/*RM*/null/*/RM*/',()=>J(rm)).replace('/*RO*/null/*/RO*/',()=>J(ro))
 .replace("/*GMT*/''/*/GMT*/",()=>J(gmt)).replace("/*RKT*/''/*/RKT*/",()=>J(rkt)).replace("/*RDT*/''/*/RDT*/",()=>J(rdt)).replace("/*RMT*/''/*/RMT*/",()=>J(rmt));
fs.writeFileSync(path.join(root,'index.html'),out);
// artifact variant: page content only (host adds the document skeleton)
const head=out.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>\n?|<meta name="viewport"[^>]*>\n?|<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n?/g,'');
const body=out.match(/<body>([\s\S]*?)<\/body>/)[1];
fs.writeFileSync(path.join(root,'artifact.html'),head.trim()+'\n'+body.trim()+'\n');
console.log('pokemon',gm.p.length,'moves',Object.keys(gm.m).length,'grunts',rk.g.length,'raid bosses',rd.b.length,'raid moves',Object.keys(rm).length,'overall rows',ro.rows.length,'bytes',out.length);
