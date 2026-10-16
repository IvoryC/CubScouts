const R=['L','T','W','B','We','A'];
const N={L:'Lion',T:'Tiger',W:'Wolf',B:'Bear',We:'Webelos',A:'Arrow of Light'};
const NS={L:'Lion',T:'Tiger',W:'Wolf',B:'Bear',We:'Webelos',A:'AOL'};
const SITE='https://www.scouting.org/';
const advUrl=(t,r)=>SITE+'cub-scout-adventures/'+LOOPS[t.id][r][0]+'/';
const loopImg=(t,r)=>SITE+'wp-content/uploads/'+LOOPS[t.id][r][1];


const $=id=>document.getElementById(id);
let cur=THEMES[0];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

// ---- Adventure picker: a listbox dropdown, required adventures first (pale gold), then electives
const pickBtn=$('pickBtn'),pickList=$('pickList');
const optId=t=>'opt-'+t.id;
let activeIdx=0,typed='',typedAt=0;
function buildPicker(){
  let h='',grp='';
  THEMES.forEach(t=>{
    if(t.kind!==grp){grp=t.kind;h+='<li class="grp" role="presentation">'+(grp==='Required'?'Required adventures':'Elective adventures')+'</li>'}
    h+='<li role="option" id="'+optId(t)+'" data-id="'+t.id+'" class="opt'+(t.kind==='Required'?' req':'')+'"><span>'+esc(t.name)+'</span><span class="tag">'+t.kind+'</span></li>';
  });
  pickList.innerHTML=h;
}
function syncPicker(){
  $('pickCur').textContent=cur.name;
  $('pickTag').textContent=cur.kind;
  pickBtn.classList.toggle('req',cur.kind==='Required');
  pickList.querySelectorAll('[role=option]').forEach(o=>o.setAttribute('aria-selected',o.dataset.id===cur.id));
  $('panel').setAttribute('aria-label',cur.name+' adventure crosswalk');
}
const opts=()=>[...pickList.querySelectorAll('[role=option]')];
function setActive(i){
  const o=opts();activeIdx=Math.max(0,Math.min(o.length-1,i));
  o.forEach((x,j)=>x.classList.toggle('active',j===activeIdx));
  pickList.setAttribute('aria-activedescendant',o[activeIdx].id);
  o[activeIdx].scrollIntoView({block:'nearest'});
}
function openPicker(){
  pickList.hidden=false;pickBtn.setAttribute('aria-expanded','true');
  setActive(THEMES.indexOf(cur));pickList.focus();
}
function closePicker(refocus){
  if(pickList.hidden)return;
  pickList.hidden=true;pickBtn.setAttribute('aria-expanded','false');
  if(refocus)pickBtn.focus();
}
function choose(id){
  closePicker(true);
  if(id!==cur.id)location.hash=id;
}
pickBtn.addEventListener('click',()=>pickList.hidden?openPicker():closePicker(true));
pickBtn.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();openPicker()}
});
pickList.addEventListener('click',e=>{const o=e.target.closest('[role=option]');if(o)choose(o.dataset.id)});
pickList.addEventListener('mousemove',e=>{const o=e.target.closest('[role=option]');if(o){const i=opts().indexOf(o);if(i!==activeIdx)setActive(i)}});
pickList.addEventListener('keydown',e=>{
  const o=opts();
  if(e.key==='ArrowDown'){e.preventDefault();setActive(activeIdx+1)}
  else if(e.key==='ArrowUp'){e.preventDefault();setActive(activeIdx-1)}
  else if(e.key==='Home'){e.preventDefault();setActive(0)}
  else if(e.key==='End'){e.preventDefault();setActive(o.length-1)}
  else if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(o[activeIdx].dataset.id)}
  else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closePicker(true)}
  else if(e.key==='Tab'){closePicker(false)}
  else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){
    const now=Date.now();typed=(now-typedAt<700?typed:'')+e.key.toLowerCase();typedAt=now;
    const hit=o.findIndex((x,j)=>j>=(typed.length>1?activeIdx:activeIdx+1)&&x.firstChild.textContent.toLowerCase().startsWith(typed))
      ;const i=hit>=0?hit:o.findIndex(x=>x.firstChild.textContent.toLowerCase().startsWith(typed));
    if(i>=0)setActive(i);
  }
});
document.addEventListener('click',e=>{if(!pickList.hidden&&!e.target.closest('.picker'))closePicker(false)});
buildPicker();

['a','b'].forEach(id=>R.forEach(r=>$(id).add(new Option(N[r],r))));
$('a').value='B';$('b').value='W';

function render(){
  const t=cur;
  syncPicker();
  $('title').textContent=t.name;
  $('sub').textContent=t.kind+' adventures'+(t.id==='bobcat'?'':' — '+R.map(r=>t.adv[r]).join(', '));
  $('capTitle').textContent=t.name+' ('+t.kind.toLowerCase()+') requirements by rank';
  let h='<th class="sk" scope="col">Skill</th>';
  R.forEach(r=>{
    const lab=N[r]+': '+t.adv[r];
    h+='<th scope="col"><a class="loopimg" href="'+advUrl(t,r)+'" target="_blank" rel="noopener" title="'+esc(lab+' (opens scouting.org)')+'" aria-label="'+esc(lab+', opens scouting.org')+'"><img src="'+loopImg(t,r)+'" crossorigin="anonymous" alt="'+esc(lab)+' belt loop" width="48" height="64"></a>'+(t.id==='bobcat'?'':'<span class="adv">'+esc(t.adv[r])+'</span>')+'</th>'});
  $('head').innerHTML=h;
  let body='';
  t.rows.forEach(([k,m],ri)=>{
    const n=Object.keys(m).length, cls=n===6?'al':n>1?'sh':'un';
    body+='<tr><td class="sk"><button type="button" class="rowname" data-ri="'+ri+'" aria-expanded="false" aria-controls="detail" title="Show activities for every rank">'+esc(k)+'</button></td>';
    R.forEach(r=>{
      if(m[r]){const tip=N[r]+' req '+m[r][0]+(m[r][1]?': '+m[r][1]:'');
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
  const row=t.rows[ri],[num,note]=row[1][r];
  const adv=ACTIVITIES[LOOPS[t.id][r][0]]||{};
  let h='<section class="dsec"><div class="dh"><img class="dloop" src="'+loopImg(t,r)+'" alt="">'
    +'<div style="flex:1;min-width:0"><h3>'+esc(N[r]+' · '+t.adv[r]+' · requirement '+num)+'</h3>'
    +'<p class="meta">'+esc(row[0])+' · <a href="'+advUrl(t,r)+'" target="_blank" rel="noopener">Open the full adventure page</a></p></div></div>';
  if(note)h+='<div class="dreq"><span class="cellnote">'+esc(N[r]+': '+note)+'</span></div>';
  reqNums(num).forEach(q=>{
    const e=adv[q];
    h+='<div class="dreq"><h4>Requirement '+esc(q)+'</h4>';
    if(!e)h+='<p class="none">No activity list found for this requirement. Check the adventure page.</p>';
    else{
      h+='<p class="req-text">'+esc(e.text)+'</p>';
      h+=e.acts.length?'<div class="tiles">'+e.acts.map(tile).join('')+'</div>':'<p class="none">No activities are listed for this requirement.</p>';
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
