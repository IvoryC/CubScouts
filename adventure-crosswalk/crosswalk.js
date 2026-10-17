const R=['L','T','W','B','We','A'];
const N={L:'Lion',T:'Tiger',W:'Wolf',B:'Bear',We:'Webelos',A:'Arrow of Light'};
const NS={L:'Lion',T:'Tiger',W:'Wolf',B:'Bear',We:'Webelos',A:'AOL'};
const SITE='https://www.scouting.org/';
// A rank can have no adventure in a theme, one, or several (LOOPS holds a [slug, image] pair or a list of pairs).
const advList=(t,r)=>{const v=LOOPS[t.id][r];return v?(Array.isArray(v[0])?v:[v]):[]};
const advNames=(t,r)=>t.adv[r]?[].concat(t.adv[r]):[];
// Themes with a `link` (the range adventures) have no per-adventure pages, so every rank links to that one document.
const advUrl=(t,r,k=0)=>t.link||SITE+'cub-scout-adventures/'+advList(t,r)[k][0]+'/';
const loopImg=(t,r,k=0)=>SITE+'wp-content/uploads/'+advList(t,r)[k][1];
Object.assign(ACTIVITIES,RANGE_REQS);


const $=id=>document.getElementById(id);
let cur=THEMES[0];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

// ---- Pickers: two listbox dropdowns. "Theme" lists the themes (required first, in pale gold, then electives, then range).
// "Adventure name" lists every adventure by rank; choosing one just selects the theme it belongs to and shows its name.
const KIND_SUB={Required:'Required adventures',Elective:'Elective theme',Range:'Range and target sports'};
const GROUPS={Required:['Required adventures',''],Elective:['Elective themes',''],Range:['Range and target sports','Council and district events only']};
const RANK_NAME=r=>N[r];

// Wires one dropdown: open/close, arrow keys, Home/End, Enter/Space, Escape, type-ahead, mouse.
// selectedIndex(): option index to start on when opening; onChoose(optionElement): called with the chosen option.
function wireListbox(btn,list,selectedIndex,onChoose){
  let activeIdx=0,typed='',typedAt=0;
  const opts=()=>[...list.querySelectorAll('[role=option]')];
  function setActive(i){
    const o=opts();activeIdx=Math.max(0,Math.min(o.length-1,i));
    o.forEach((x,j)=>x.classList.toggle('active',j===activeIdx));
    list.setAttribute('aria-activedescendant',o[activeIdx].id);
    o[activeIdx].scrollIntoView({block:'nearest'});
  }
  function open(){
    pickers.forEach(p=>{if(p.list!==list)p.close(false)});
    list.hidden=false;btn.setAttribute('aria-expanded','true');
    setActive(Math.max(0,selectedIndex()));list.focus();
  }
  function close(refocus){
    if(list.hidden)return;
    list.hidden=true;btn.setAttribute('aria-expanded','false');
    if(refocus)btn.focus();
  }
  function choose(el){close(true);onChoose(el)}
  btn.addEventListener('click',()=>list.hidden?open():close(true));
  btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open()}});
  list.addEventListener('click',e=>{const o=e.target.closest('[role=option]');if(o)choose(o)});
  list.addEventListener('mousemove',e=>{const o=e.target.closest('[role=option]');if(o){const i=opts().indexOf(o);if(i!==activeIdx)setActive(i)}});
  list.addEventListener('keydown',e=>{
    const o=opts();
    if(e.key==='ArrowDown'){e.preventDefault();setActive(activeIdx+1)}
    else if(e.key==='ArrowUp'){e.preventDefault();setActive(activeIdx-1)}
    else if(e.key==='Home'){e.preventDefault();setActive(0)}
    else if(e.key==='End'){e.preventDefault();setActive(o.length-1)}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(o[activeIdx])}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true)}
    else if(e.key==='Tab'){close(false)}
    else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){
      const now=Date.now();typed=(now-typedAt<700?typed:'')+e.key.toLowerCase();typedAt=now;
      const starts=x=>x.firstChild.textContent.toLowerCase().startsWith(typed);
      const hit=o.findIndex((x,j)=>j>=(typed.length>1?activeIdx:activeIdx+1)&&starts(x));
      const i=hit>=0?hit:o.findIndex(starts);
      if(i>=0)setActive(i);
    }
  });
  const p={list,close};pickers.push(p);return p;
}
const pickers=[];
document.addEventListener('click',e=>{pickers.forEach(p=>{if(!p.list.hidden&&!p.list.closest('.picker').contains(e.target))p.close(false)})});

// -- Theme dropdown
const pickBtn=$('pickBtn'),pickList=$('pickList'),advBtn=$('advBtn'),advMenu=$('advList');
let advSel=null; // {theme, rank, k, name}: set when the theme was reached through the Adventure name dropdown
function buildThemePicker(){
  let h='',grp='';
  THEMES.forEach(t=>{
    if(t.kind!==grp){grp=t.kind;h+='<li class="grp" role="presentation">'+GROUPS[grp][0]+(GROUPS[grp][1]?'<small>'+GROUPS[grp][1]+'</small>':'')+'</li>'}
    h+='<li role="option" id="opt-'+t.id+'" data-id="'+t.id+'" class="opt'+(t.kind==='Required'?' req':'')+'"><span>'+esc(t.name)+'</span><span class="tag">'+t.kind+'</span></li>';
  });
  pickList.innerHTML=h;
}
// -- Adventure name dropdown: one section per rank, adventures A to Z, each tagged with its theme
function buildAdvPicker(){
  const byName=(a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base',ignorePunctuation:true});
  let h='';
  R.forEach(r=>{
    const items=[];
    THEMES.forEach(t=>advNames(t,r).forEach((name,k)=>items.push({t,k,name})));
    items.sort(byName);
    h+='<li class="grp" role="presentation">'+esc(RANK_NAME(r))+'</li>';
    items.forEach(({t,k,name})=>{
      h+='<li role="option" id="adv-'+r+'-'+t.id+'-'+k+'" data-theme="'+t.id+'" data-rank="'+r+'" data-k="'+k+'" class="opt'+(t.kind==='Required'?' req':'')+'"><span>'+esc(name)+'</span><span class="tag">'+esc(t.name)+'</span></li>';
    });
  });
  advMenu.innerHTML=h;
}
function syncPicker(){
  $('pickCur').textContent=cur.name;
  $('pickTag').textContent=cur.kind;
  pickBtn.classList.toggle('req',cur.kind==='Required');
  pickList.querySelectorAll('[role=option]').forEach(o=>o.setAttribute('aria-selected',o.dataset.id===cur.id));
  // the Adventure name box shows a name only while it is what led to the current theme
  if(advSel&&advSel.theme!==cur.id)advSel=null;
  const ac=$('advCur');
  ac.textContent=advSel?advSel.name:'Find by adventure name…';
  ac.classList.toggle('ph',!advSel);
  $('advTag').textContent=advSel?N[advSel.rank]:'';
  advBtn.classList.toggle('req',!!advSel&&cur.kind==='Required');
  advMenu.querySelectorAll('[role=option]').forEach(o=>o.setAttribute('aria-selected',!!advSel&&o.id==='adv-'+advSel.rank+'-'+advSel.theme+'-'+advSel.k));
  $('panel').setAttribute('aria-label',cur.name+' adventure crosswalk');
}
wireListbox(pickBtn,pickList,()=>THEMES.indexOf(cur),o=>{
  advSel=null;                       // choosing a theme directly blanks the Adventure name box
  if(o.dataset.id!==cur.id)location.hash=o.dataset.id;else syncPicker();
});
wireListbox(advBtn,advMenu,()=>advSel?[...advMenu.querySelectorAll('[role=option]')].findIndex(o=>o.id==='adv-'+advSel.rank+'-'+advSel.theme+'-'+advSel.k):0,o=>{
  advSel={theme:o.dataset.theme,rank:o.dataset.rank,k:+o.dataset.k,name:o.firstChild.textContent};
  if(advSel.theme!==cur.id)location.hash=advSel.theme;else syncPicker();
});
buildThemePicker();buildAdvPicker();

['a','b'].forEach(id=>R.forEach(r=>$(id).add(new Option(N[r],r))));
$('a').value='B';$('b').value='W';

function render(){
  const t=cur;
  syncPicker();
  $('title').textContent=t.name;
  $('sub').textContent=KIND_SUB[t.kind]+(t.id==='bobcat'?'':' — '+[...new Set(R.flatMap(r=>advNames(t,r)))].join(', '));
  $('themeNote').textContent=t.note||'';
  $('themeNote').hidden=!t.note;
  $('capTitle').textContent=t.name+' ('+t.kind.toLowerCase()+') requirements by rank';
  let h='<th class="sk" scope="col">Skill</th>';
  R.forEach(r=>{
    const names=advNames(t,r);
    if(!names.length){h+='<th scope="col"><span class="adv" aria-label="'+esc(N[r]+': no adventure in this theme')+'">&mdash;</span></th>';return}
    const multi=names.length>1;
    h+='<th scope="col"><div class="loopset'+(multi?' multi':'')+'">'+names.map((nm,k)=>{
      const lab=N[r]+': '+nm;
      return '<a class="loopimg" href="'+advUrl(t,r,k)+'" target="_blank" rel="noopener" title="'+esc(lab+' (opens scouting.org)')+'" aria-label="'+esc(lab+', opens scouting.org')+'"><img src="'+loopImg(t,r,k)+'" crossorigin="anonymous" alt="'+esc(lab)+' belt loop" width="48" height="64"></a>'}).join('')+'</div>'
      +(t.id==='bobcat'?'':names.map(nm=>'<span class="adv">'+esc(nm)+'</span>').join(''))+'</th>'});
  $('head').innerHTML=h;
  let body='';
  t.rows.forEach(([k,m],ri)=>{
    const n=Object.keys(m).length, cls=n===6?'al':n>1?'sh':'un';
    body+='<tr><td class="sk"><button type="button" class="rowname" data-ri="'+ri+'" aria-expanded="false" aria-controls="detail" title="Show activities for every rank">'+esc(k)+'</button></td>';
    R.forEach(r=>{
      if(m[r]){const nm=advNames(t,r);const tip=N[r]+(nm.length>1?' ('+nm[m[r][2]||0]+')':'')+' req '+m[r][0]+(m[r][1]?': '+m[r][1]:'');
        body+='<td><button type="button" class="c '+cls+'" data-ri="'+ri+'" data-r="'+r+'" title="'+esc(tip+' (tap for activities)')+'" aria-label="'+esc(tip+', show activities')+'" aria-expanded="false" aria-controls="detail">'+esc(m[r][0])+'</button></td>';}
      else body+='<td></td>';
    });
    body+='</tr>';
  });
  $('body').innerHTML=body;
  $('foot').textContent=t.foot||'';
  $('foot').style.display=t.foot?'':'none';
  $('status').textContent='';$('shotBox').innerHTML='';
  closeDetail();
  compare();
}

// "1, 3" and "3–5" style requirement labels -> ['1','3'] / ['3','4','5']
function reqNums(n){
  const p=String(n).split(/\s*[–-]\s*/);
  if(p.length===2&&/^\d+$/.test(p[0])&&/^\d+$/.test(p[1])){const o=[];for(let i=+p[0];i<=+p[1];i++)o.push(String(i));return o}
  return String(n).split(/\s*,\s*/);
}
const dots=(label,v)=>'<span class="dots" role="img" aria-label="'+label+' '+v+' of 5">'+[1,2,3,4,5].map(i=>'<i'+(i<=v?' class="on"':'')+'></i>').join('')+'</span>';
function tile(a){
  const rows=[];
  if(a.place)rows.push('<div><span>'+esc(a.place)+'</span></div>');
  [['Energy level',a.energy],['Supplies',a.supplies],['Prep time',a.prep]].forEach(([l,v])=>{if(v)rows.push('<div><span>'+l+'</span>'+dots(l,v)+'</div>')});
  return '<div class="tile"><div class="tt"><a href="'+esc(a.url)+'" target="_blank" rel="noopener">'+esc(a.title)+'</a></div>'+(rows.length?'<div class="tm">'+rows.join('')+'</div>':'')+'</div>';
}
let openEls=[],openKey=null,openTrigger=null;
function closeDetail(refocus){
  const d=$('detail');d.hidden=true;d.innerHTML='';
  openEls.forEach(b=>b.setAttribute('aria-expanded','false'));
  const tr=openTrigger;openEls=[];openKey=null;openTrigger=null;
  if(refocus&&tr&&document.body.contains(tr))tr.focus();
}
function section(t,ri,r){
  const row=t.rows[ri],[num,note,k=0]=row[1][r];
  const adv=ACTIVITIES[advList(t,r)[k][0]]||{};
  let h='<section class="dsec"><div class="dh"><img class="dloop" src="'+loopImg(t,r,k)+'" alt="">'
    +'<div style="flex:1;min-width:0"><h3>'+esc(N[r]+' · '+advNames(t,r)[k]+' · requirement '+num)+'</h3>'
    +'<p class="meta">'+esc(row[0])+' · <a href="'+advUrl(t,r,k)+'" target="_blank" rel="noopener">'+(t.link?'Open the lesson plan (PDF)':'Open the full adventure page')+'</a></p></div></div>';
  if(note)h+='<div class="dreq"><span class="cellnote">'+esc(N[r]+': '+note)+'</span></div>';
  reqNums(num).forEach(q=>{
    const e=adv[q];
    h+='<div class="dreq"><h4>Requirement '+esc(q)+'</h4>';
    if(!e)h+='<p class="none">No activity list found for this requirement. Check the adventure page.</p>';
    else{
      h+='<p class="req-text">'+esc(e.text)+'</p>';
      h+=e.acts.length?'<div class="tiles">'+e.acts.map(tile).join('')+'</div>':'<p class="none">'+esc(t.noActs||'No activities are listed for this requirement.')+'</p>';
    }
    h+='</div>';
  });
  return h+'</section>';
}
// items: [[rowIndex, rank], ...]; els: the buttons to mark as open; trigger: the button to refocus on close.
function openDetail(key,items,els,trigger,align){
  if(openKey===key){closeDetail(true);return}
  closeDetail(false);
  openKey=key;openEls=els;openTrigger=trigger;
  els.forEach(b=>b.setAttribute('aria-expanded','true'));
  const d=$('detail');
  d.innerHTML=items.map(([ri,r])=>section(cur,ri,r)).join('')+'<button type="button" class="dclose" id="dclose">Close</button>';
  d.hidden=false;
  $('dclose').addEventListener('click',()=>closeDetail(true));
  d.focus({preventScroll:true});
  d.scrollIntoView({block:align,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
$('body').addEventListener('click',e=>{
  const c=e.target.closest('button.c');
  if(c){openDetail('c'+c.dataset.ri+c.dataset.r,[[+c.dataset.ri,c.dataset.r]],[c],c,'nearest');return}
  const n=e.target.closest('button.rowname');
  if(n){
    const ri=+n.dataset.ri,m=cur.rows[ri][1];
    const ranks=R.filter(r=>m[r]); // R is ordered youngest to oldest
    const cells=[...n.closest('tr').querySelectorAll('button.c')];
    openDetail('r'+ri,ranks.map(r=>[ri,r]),[n,...cells],n,'start');
  }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&openKey)closeDetail(true)});

function li(k,m,rs){
  const d=rs.filter(r=>m[r]&&m[r][1]).map(r=>NS[r]+': '+m[r][1]);
  return '<li>'+esc(k)+(d.length?' <span class="note">('+esc(d.join('; '))+')</span>':'')+'</li>';
}
function compare(){
  const x=$('a').value,y=$('b').value,t=cur;
  let B='',A='',C='',nb=0,na=0,nc=0;
  t.rows.forEach(([k,m])=>{
    if(m[x]&&m[y]){B+=li(k,m,[x,y]);nb++}
    else if(m[x]){A+=li(k,m,[x]);na++}
    else if(m[y]){C+=li(k,m,[y]);nc++}
  });
  $('lb').innerHTML=B||'<li class="note">Nothing shared</li>';
  $('la').innerHTML=A||'<li class="note">Nothing extra</li>';
  $('lc').innerHTML=C||'<li class="note">Nothing extra</li>';
  $('hb').textContent='Both ('+nb+')';
  $('ha').textContent='Only '+N[x]+' ('+na+')';
  $('hc').textContent='Only '+N[y]+' ('+nc+')';
  $('ov').textContent=x===y?'Pick two different ranks':nb+' overlapping skills';
}
$('a').addEventListener('change',compare);$('b').addEventListener('change',compare);

function route(){
  const id=(location.hash||'').slice(1);
  cur=THEMES.find(t=>t.id===id)||THEMES[0];
  render();
}
window.addEventListener('hashchange',route);

$('copy').addEventListener('click',async()=>{
  const st=$('status');
  if(typeof html2canvas!=='function'){st.textContent="The image tool didn't load. Reload the page and try again.";return}
  st.textContent='Making the image…';
  const bg=getComputedStyle($('cap')).backgroundColor;
  try{
    const canvas=await html2canvas($('cap'),{backgroundColor:bg,scale:2,useCORS:true,windowWidth:1100,
      onclone:doc=>{
        const c=doc.getElementById('cap');c.style.width='900px';c.style.padding='20px';
        doc.getElementById('capTitle').style.display='block';
        c.querySelector('.scroll').style.overflow='visible';
        c.querySelectorAll('.rowname').forEach(b=>{b.style.textDecoration='none'});
        const lg=c.querySelector('.legend span:last-child');if(lg)lg.textContent='Numbers are requirement numbers.';
      }});
    const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
    let copied=false;
    try{
      if(navigator.clipboard&&window.ClipboardItem){
        await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);copied=true;
      }
    }catch(e){copied=false}
    const url=URL.createObjectURL(blob);
    if(copied){
      st.textContent='Chart copied. Paste it into an email, doc, or message.';
      $('shotBox').innerHTML='';
    }else{
      st.textContent="Your browser blocked direct copying, so here's the image instead.";
      $('shotBox').innerHTML='<div class="shot"><strong>Right-click (or long-press) the image to copy or save it.</strong><img alt="'+esc(cur.name)+' requirements chart" src="'+url+'"></div>';
    }
  }catch(e){
    st.textContent="Couldn't make the image. Try again, or take a screenshot of the chart.";
  }
});

route();
