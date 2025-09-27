const rules = [
  {
    name: 'Greeting',
    match: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    response: "Hello! I'm a rule-based bot. Ask me about opening hours, contact, or say 'help'."
  },
  {
    name: 'Help',
    match: ['help', 'what can you do', 'commands'],
    response: 'I can answer: say "hours", "contact", "pricing", or "location".'
  },
  {
    name: 'Hours',
    match: text => /hours|open|opening|time/i.test(text),
    response: "We're open Mon-Fri 9:30 AM — 6:30 PM. Closed on public holidays."
  },
  {
    name: 'Contact',
    match: ['contact', 'phone', 'call', 'email'],
    response: 'You can reach us at +1 (555) 123-4567 or email support@example.com.'
  },
  {
    name: 'Pricing',
    match: text => /price|cost|how much|fees?/i.test(text),
    response: 'Our basic plan starts at $9.99/month. For teams, email sales@example.com.'
  },
  {
    name: 'Location',
    match: ['where', 'location', 'address', 'find'],
    response: 'We are located at 123 Example St, Sample City.'
  },
  {
    name: 'Default',
    match: () => true,
    response: "Sorry, I didn't understand that. Try 'help'."
  }
];

const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const showRulesBtn = document.getElementById('showRulesBtn');
const rulesListEl = document.getElementById('rulesList');

function renderRules(){
  rulesListEl.innerHTML = '';
  rules.forEach((r, i) =>{
    const div = document.createElement('div');
    div.className='rule';
    const keywords = typeof r.match === 'function' ? 'function' : (Array.isArray(r.match) ? r.match.join(', ') : r.match);
    div.innerHTML = `<strong>${i+1}. ${r.name}</strong><small>match: ${escapeHtml(String(keywords))}</small><small>response: ${escapeHtml(r.response)}</small>`;
    rulesListEl.appendChild(div);
  })
}

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function appendBubble(text, who='bot'){
  const b = document.createElement('div');
  b.className = 'bubble '+(who==='user'?'user':'bot');
  b.textContent = text;
  messagesEl.appendChild(b);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function findResponse(text){
  const lower = text.toLowerCase();
  for(const r of rules){
    if(typeof r.match === 'function'){
      try{ if(r.match(text)) return r.response }catch(e){}
    } else if(Array.isArray(r.match)){
      for(const kw of r.match){ if(lower.includes(kw.toLowerCase())) return r.response }
    } else if(typeof r.match === 'string'){
      if(lower.includes(r.match.toLowerCase())) return r.response
    }
  }
  return null;
}

function sendMessage(){
  const text = inputEl.value.trim();
  if(!text) return;
  appendBubble(text,'user');
  inputEl.value='';
  setTimeout(()=>{
    const res = findResponse(text) || 'Hmm... no rule for that.';
    appendBubble(res,'bot');
  }, 500);
}

inputEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendMessage() } });
sendBtn.addEventListener('click', sendMessage);
clearBtn.addEventListener('click', ()=>{ messagesEl.innerHTML=''; appendBubble("Hello! I'm your rule-based bot. Say 'help' to start.",'bot') });
showRulesBtn.addEventListener('click', ()=>{ alert('Open the right-hand panel to view rules. Edit rules in script.js.') });

renderRules();
appendBubble("Hello! I'm your rule-based bot. Say 'help' to see what I can do.",'bot');