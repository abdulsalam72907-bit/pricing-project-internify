'use strict';
// Single source of truth for plan content and monthly prices.
const plans = [
 {name:'Starter',category:'basic',icon:'◷',description:'A little structure for your next big idea.',monthly:12,features:['1 personal workspace','3 active projects','5 GB file storage','Community support'],cta:'Start creating'},
 {name:'Essential',category:'basic',icon:'▦',description:'Your everyday toolkit, all in one place.',monthly:24,features:['3 team workspaces','Unlimited projects','25 GB file storage','Priority email support'],cta:'Choose Essential'},
 {name:'Pro',category:'premium',icon:'✳',description:'More power for people making moves.',monthly:48,popular:true,features:['10 team workspaces','Unlimited projects','100 GB file storage','Advanced analytics','Priority chat support'],cta:'Go Pro'},
 {name:'Studio',category:'premium',icon:'❖',description:'Big ambitions meet a bigger toolkit.',monthly:80,features:['Unlimited workspaces','Unlimited projects','1 TB file storage','Custom integrations','Dedicated account manager'],cta:'Choose Studio'}
];
let yearly = false;
let category = 'all';
let members = 1;
let selectedPlan = 2;
const cards = document.querySelector('#cards');
const dialog = document.querySelector('#selection-dialog');
function renderPlans() {
 cards.innerHTML = plans.map((plan,index) => {
  const price = yearly ? plan.monthly * .8 : plan.monthly;
  return `<article class="card ${plan.popular?'popular':''} ${selectedPlan===index?'selected':''}" ${category !== 'all' && category !== plan.category ? 'hidden' : ''} aria-label="${plan.name} plan">
  ${plan.popular?'<span class="badge">MOST POPULAR</span>':''}<div class="icon" aria-hidden="true">${plan.icon}</div>
  <h2>${plan.name}</h2><p class="description">${plan.description}</p><div class="price-row"><span class="price">$${Number(price.toFixed(2))}</span><span class="period">/ member / month</span></div>
  <p class="billing-note">${yearly?`$${(price*12).toFixed(2)} billed yearly · Save 20%`:'Billed monthly. Stay flexible.'}</p><button class="cta" data-plan="${index}">${plan.cta}<span aria-hidden="true">↗</span></button>
  <p class="features-title">${index===0?'THE FOUNDATIONS':'EVERYTHING YOU NEED'}</p><ul>${plan.features.map(feature=>`<li>${feature}</li>`).join('')}</ul></article>`;
 }).join('');
 updateInsights();
 document.querySelector('#status').textContent = `${plans.filter(p=>category==='all'||p.category===category).length} plans shown. ${yearly?'Yearly':'Monthly'} billing selected.`;
}
document.querySelector('#billing-toggle').addEventListener('click', event => {
 yearly = !yearly;
 event.currentTarget.setAttribute('aria-checked', String(yearly));
 renderPlans();
});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
 category = button.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(item => {
  const selected = item === button;
  item.classList.toggle('active', selected);
  item.setAttribute('aria-pressed', String(selected));
 });
 renderPlans();
}));
cards.addEventListener('click',event=>{
 const button=event.target.closest('[data-plan]');
 if(!button)return;
 selectedPlan = Number(button.dataset.plan);
 renderPlans();
 const plan=plans[selectedPlan];
 const price=yearly?plan.monthly*.8:plan.monthly;
 document.querySelector('#dialog-title').textContent=`Your ${plan.name} chapter starts here.`;
 document.querySelector('#dialog-detail').textContent=`You selected ${plan.name} at $${Number(price.toFixed(2))}/month, ${yearly?`billed yearly at $${(price*12).toFixed(2)}`:'billed monthly'}. Team estimate: $${(price*members).toFixed(2)}/month for ${members} member(s).`;
 dialog.showModal();
});
dialog.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
function updateInsights(){
 const plan=plans[selectedPlan];
 const monthly=plan.monthly*members*(yearly?.8:1);
 document.querySelector('#insight-title').textContent=`${plan.name} · ${members} ${members===1?'member':'members'}`;
 document.querySelector('#monthly-total').textContent=money(monthly);
 document.querySelector('#annual-total').textContent=money(monthly*12);
 document.querySelector('#payment-note').textContent=yearly?'One upfront yearly payment':'Total across 12 monthly payments';
 document.querySelector('#savings-total').textContent=money(plan.monthly*members*12*.2);
 document.querySelector('#daily-total').textContent=money(monthly/members/30);
 document.querySelector('#seat-count').textContent=members;
 const max=80*members*12;
 document.querySelector('#bars').innerHTML=plans.map((p,i)=>`<button class="chart-row ${i===selectedPlan?'chosen':''}" data-select="${i}" aria-label="Calculate ${p.name} plan"><span>${p.name}</span><div class="bar-pair"><div class="bar monthly" style="width:${p.monthly*members*12/max*100}%"></div><div class="bar annual" style="width:${p.monthly*members*12*.8/max*100}%"></div></div><span>${money(p.monthly*members*12)}<small>${money(p.monthly*members*12*.8)}</small></span></button>`).join('');
}
document.querySelector('#seats').addEventListener('input',e=>{members=Number(e.target.value);updateInsights();});
document.querySelector('#bars').addEventListener('click',e=>{const target=e.target.closest('[data-select]');if(target){selectedPlan=Number(target.dataset.select);renderPlans();}});
document.querySelector('#reset').addEventListener('click',()=>{members=1;selectedPlan=2;yearly=false;document.querySelector('#seats').value=1;document.querySelector('#billing-toggle').setAttribute('aria-checked','false');renderPlans();});
document.querySelector('#export').addEventListener('click',()=>{
 const p=plans[selectedPlan], monthly=p.monthly*members*(yearly?.8:1);
 const rows=[['Plan','Members','Billing','Monthly equivalent USD','12-month cost USD','Potential annual savings USD'],[p.name,members,yearly?'Yearly':'Monthly',monthly.toFixed(2),(monthly*12).toFixed(2),(p.monthly*members*12*.2).toFixed(2)]];
 const url=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='forma-cost-estimate.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 document.querySelector('#status').textContent='Cost estimate downloaded.';
});
renderPlans();
