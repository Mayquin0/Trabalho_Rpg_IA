'use strict';
// ═══════════════════════════════════════════════════════════
//  FICHA.JS — Lógica da ficha de personagem (Ordem Paranormal)
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
//  ESTADO DO PERSONAGEM
// ─────────────────────────────────────────────
let char = {
    name: 'Novo Agente', player: '', class: 'combatente',
    origin: '', nex: 5,
    attrs: { agi:1, str:1, int:1, pre:1, vig:1 },
    skills: {},          // {id: {training:0, outros:0}}
    currentPV: 0, currentPE: 0, currentSAN: 0,
    defBonus: 0, speed: 9, protection: '', resistances: '',
    prestigio: 0, portrait: '',
    attacks: [], abilities: [], techniques: [], dominio: null,
    rituals: [], inventory: [],
    desc: { notes:'', appearance:'', personality:'', history:'', objective:'' }
};
SKILLS_DATA.forEach(s => { char.skills[s.id] = { training:0, outros:0 }; });

// ─────────────────────────────────────────────
//  CÁLCULOS
// ─────────────────────────────────────────────
const nexLevel = () => NEX_VALUES.indexOf(char.nex);
const cls      = ()  => CLASSES_DATA[char.class];
const attr     = (k) => char.attrs[k] || 0;

function maxPV()  {
    const c = cls(), lv = nexLevel(), v = attr(c.pvAttr);
    return c.pvBase + v + lv * (c.pvGain + v);
}
function maxPE()  {
    const c = cls(), lv = nexLevel(), p = attr(c.peAttr);
    return c.peBase + p + lv * (c.peGain + p);
}
function maxSAN() { const c = cls(); return c.sanBase + nexLevel() * c.sanGain; }
function peRound(){ return nexLevel() + 1; }
function defense(){
    let base = 10 + attr('agi') + (parseInt(char.defBonus) || 0);
    const ori = ALL_ORIGINS.find(o => o.name === char.origin);
    if (ori && ori.defBonus) base += ori.defBonus;
    return base;
}
function bloqueio(){
    const sk = char.skills['fortitude'];
    if (!sk || sk.training === 0) return '—';
    return TRAINING_BONUS[sk.training] + (sk.outros || 0);
}
function esquiva(){
    const sk = char.skills['reflexos'];
    if (!sk || sk.training === 0) return '—';
    return defense() + TRAINING_BONUS[sk.training] + (sk.outros || 0);
}
function skillBonus(id){ const s = char.skills[id]; return TRAINING_BONUS[s.training] + (s.outros || 0); }
function skillDice(id){
    const skill = SKILLS_DATA.find(s => s.id === id);
    const v = attr(skill.attr);
    return v === 0 ? '2d20↓' : `${v}d20`;
}
function expectedTrained(){ return cls().trainedCount(attr('int')); }
function countTrained(){ return Object.values(char.skills).filter(s => s.training > 0).length; }

// ─────────────────────────────────────────────
//  PENTAGON
// ─────────────────────────────────────────────
function drawPentagon() {
    const cv = document.getElementById('penta-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const cx = W/2, cy = H/2;
    const R = Math.min(W,H) * 0.38;
    ctx.clearRect(0,0,W,H);

    function vertex(i, scale = 1) {
        const a = -Math.PI/2 + (2*Math.PI/5)*i;
        return { x: cx + scale*R*Math.cos(a), y: cy + scale*R*Math.sin(a) };
    }
    // Grid rings
    for (let l = 1; l <= 5; l++) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const p = vertex(i, l/5);
            i === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y);
        }
        ctx.closePath();
        ctx.strokeStyle = l===5 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    // Axis lines
    for (let i = 0; i < 5; i++) {
        const p = vertex(i);
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.stroke();
    }
    // Filled area — ATTR_ORDER = ['agi','str','int','pre','vig']
    ctx.beginPath();
    ATTR_ORDER.forEach((k, i) => {
        const v = attr(k), p = vertex(i, Math.max(v,0)/5);
        i === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(240,136,62,0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(240,136,62,0.7)';
    ctx.lineWidth = 2; ctx.stroke();
    // Dots
    ATTR_ORDER.forEach((k, i) => {
        const v = attr(k), p = vertex(i, Math.max(v,0)/5);
        ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2);
        ctx.fillStyle = ATTR_COLOR[k]; ctx.fill();
    });
}

// ─────────────────────────────────────────────
//  UI UPDATE — STATS
// ─────────────────────────────────────────────
function updateStats() {
    char.defBonus = parseInt(document.getElementById('def-bonus-input')?.value) || 0;
    char.speed    = parseInt(document.getElementById('speed-input')?.value) || 9;
    char.protection  = document.getElementById('protection-input')?.value || '';
    char.resistances = document.getElementById('resistances-input')?.value || '';

    const mPV = maxPV(), mPE = maxPE(), mSAN = maxSAN();
    char.currentPV  = Math.min(char.currentPV,  mPV);
    char.currentPE  = Math.min(char.currentPE,  mPE);
    char.currentSAN = Math.min(char.currentSAN, mSAN);

    setEl('pv-display',  `${char.currentPV} / ${mPV}`);
    setEl('pe-display',  `${char.currentPE} / ${mPE}`);
    setEl('san-display', `${char.currentSAN} / ${mSAN}`);
    fillBar('pv-fill',  char.currentPV,  mPV);
    fillBar('pe-fill',  char.currentPE,  mPE);
    fillBar('san-fill', char.currentSAN, mSAN);

    setEl('pe-round-val', peRound());
    setEl('def-val',  defense());
    setEl('blq-val',  bloqueio());
    setEl('esq-val',  esquiva());
    setEl('def-formula', `= 10 + AGI(${attr('agi')}) + bôn.(${char.defBonus})`);

    // Proficiencies
    const profs = cls().proficiencies || [];
    const pfEl = document.getElementById('prof-tags');
    if (pfEl) pfEl.innerHTML = profs.map(p=>`<span class="prof-tag">${p}</span>`).join('');

    // Skill count
    setEl('trained-count', `${countTrained()} / ${expectedTrained()}`);

    // Attr circles
    ATTR_ORDER.forEach(k => {
        setEl(`val-${k}`, attr(k));
        const ring = document.getElementById(`ring-${k}`);
        if (ring) ring.style.borderColor = ATTR_COLOR[k];
    });

    autoSave();
}

function fillBar(id, val, max) {
    const el = document.getElementById(id);
    if (el) el.style.width = (max > 0 ? (val/max)*100 : 0) + '%';
}
function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ─────────────────────────────────────────────
//  UI UPDATE — SKILLS TABLE
// ─────────────────────────────────────────────
function updateSkillsTable() {
    const tb = document.getElementById('skills-body');
    if (!tb) return;
    const ori = ALL_ORIGINS.find(o => o.name === char.origin) || { skills:[] };
    tb.innerHTML = '';
    SKILLS_DATA.forEach(skill => {
        const sk = char.skills[skill.id];
        const disabled = skill.trainedOnly && sk.training === 0;
        const isOriginSkill = ori.skills.includes(skill.id);
        const bonus = skillBonus(skill.id);
        const tr = document.createElement('tr');
        if (disabled) tr.className = 'disabled-skill';
        if (sk.training > 0) tr.classList.add('trained-row');
        if (isOriginSkill) tr.classList.add('origin-row');
        tr.innerHTML = `
            <td class="skill-name-cell">
                ${skill.name}${skill.carga?'<sup class="mark-carga">♦</sup>':''}${skill.trainedOnly?'<sup class="mark-trained">★</sup>':''}
            </td>
            <td><span class="attr-pip attr-pip-${skill.attr}">${ATTR_ABBR[skill.attr]}</span></td>
            <td class="dice-cell">${skillDice(skill.id)}</td>
            <td>
                <select class="train-sel" data-id="${skill.id}" onchange="onTrainChange(this)">
                    ${TRAINING_NAMES.map((n,i)=>`<option value="${i}"${sk.training===i?' selected':''}>${n}</option>`).join('')}
                </select>
            </td>
            <td class="bonus-cell">+${TRAINING_BONUS[sk.training]}</td>
            <td><input type="number" class="outros-inp" data-id="${skill.id}" value="${sk.outros||0}" onchange="onOutrosChange(this)"></td>
            <td class="total-cell ${sk.training>0?'total-trained':''}">+${bonus}</td>
            <td><button class="roll-btn" onclick="rollSkill('${skill.id}')"${disabled?' disabled':''}>🎲</button></td>`;
        tb.appendChild(tr);
    });
}

// ─────────────────────────────────────────────
//  ORIGIN INFO BOX
// ─────────────────────────────────────────────
function updateOriginBox() {
    const box = document.getElementById('origin-info-box');
    if (!box) return;
    const ori = ALL_ORIGINS.find(o => o.name === char.origin);
    if (!ori || !ori.power) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.innerHTML = `<span class="origin-src">[${ori.source}] ${ori.name}</span>
        <p class="origin-power">${sanitize(ori.power)}</p>
        ${ori.skills.length ? `<p class="origin-skills">Perícias: <strong>${ori.skills.map(id=>SKILLS_DATA.find(s=>s.id===id)?.name||id).join(', ')}</strong></p>` : ''}`;
}

// ─────────────────────────────────────────────
//  PATENTE
// ─────────────────────────────────────────────
function updatePatente() {
    char.prestigio = parseInt(document.getElementById('prestigio-input')?.value) || 0;
    let pt = PATENTES[0];
    PATENTES.forEach(p => { if (char.prestigio >= p.min) pt = p; });
    setEl('patente-name', pt.name);
    setEl('patente-credito', pt.credito);
    setEl('patente-limites', pt.limites);
    autoSave();
}

// ─────────────────────────────────────────────
//  EVENTOS
// ─────────────────────────────────────────────
function changeAttr(k, delta) {
    const nv = attr(k) + delta;
    if (nv < 0 || nv > 5) return;
    char.attrs[k] = nv;
    drawPentagon();
    updateStats();
    updateSkillsTable();
}
function changeStat(stat, delta) {
    const mx = { pv: maxPV, pe: maxPE, san: maxSAN };
    const key = `current${stat.toUpperCase()}`;
    char[key] = Math.min(mx[stat](), Math.max(0, char[key] + delta));
    updateStats();
}
function onClassChange() {
    char.class = document.getElementById('char-class').value;
    char.currentPV = maxPV(); char.currentPE = maxPE(); char.currentSAN = maxSAN();
    updateStats(); updateSkillsTable();
}
function onNexChange() {
    char.nex = parseInt(document.getElementById('char-nex').value);
    char.currentPV = maxPV(); char.currentPE = maxPE(); char.currentSAN = maxSAN();
    updateStats();
}
function onOriginChange() {
    char.origin = document.getElementById('char-origin').value;
    updateOriginBox();
    updateSkillsTable();
    updateStats();
}
function onHeaderChange() {
    char.name   = document.getElementById('char-name').value;
    char.player = document.getElementById('player-name').value;
    autoSave();
}
function onTrainChange(el) {
    char.skills[el.dataset.id].training = parseInt(el.value);
    updateSkillsTable(); updateStats();
}
function onOutrosChange(el) {
    char.skills[el.dataset.id].outros = parseInt(el.value) || 0;
    updateSkillsTable(); autoSave();
}
function onDescChange() {
    ['notes','appearance','personality','history','objective'].forEach(k => {
        const el = document.getElementById(`desc-${k}`);
        if (el) char.desc[k] = el.value;
    });
    autoSave();
}

// ─────────────────────────────────────────────
//  TABS
// ─────────────────────────────────────────────
function switchTab(id, btn) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + id)?.classList.add('active');
    if (btn) btn.classList.add('active');
}
let currentAbilityCat = 'classe';
function switchAbilityCat(cat, btn) {
    currentAbilityCat = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const titles = { classe:'Habilidades de Classe', tecnica:'Técnicas Inatas', dominio:'Expansão de Domínio' };
    setEl('ability-cat-title', titles[cat] || cat);
    renderAbilities();
}

// ─────────────────────────────────────────────
//  DICE ROLLER
// ─────────────────────────────────────────────
function rollSkill(id) {
    const skill = SKILLS_DATA.find(s => s.id === id);
    const v = attr(skill.attr);
    const n = v === 0 ? 2 : v;
    const rolls = Array.from({length:n}, () => Math.floor(Math.random()*20)+1);
    const best  = v === 0 ? Math.min(...rolls) : Math.max(...rolls);
    const bonus = skillBonus(id);
    const total = best + bonus;
    const tag   = v === 0 ? ' (pior)' : '';
    toast(`🎲 <strong>${skill.name}</strong>: [${rolls.join(', ')}]${tag} = ${best} + ${bonus} = <b class="roll-result">${total}</b>`);
}
function rollDice(expr) {
    // Parses "2d6+3" or "1d4" etc.
    const m = expr.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!m) return { total: parseInt(expr)||0, detail: expr };
    const n = parseInt(m[1]), d = parseInt(m[2]), mod = parseInt(m[3]||'0');
    const rolls = Array.from({length:n}, ()=>Math.floor(Math.random()*d)+1);
    return { total: rolls.reduce((a,b)=>a+b,0)+mod, detail:`[${rolls.join('+')}]${mod?`+${mod}`:''}` };
}
function rollAttack(idx) {
    const atk = char.attacks[idx];
    if (!atk) return;
    const dmgRoll = rollDice(atk.damage || '1d4');
    const critNum = parseInt(atk.critico) || 20;
    const atkRoll = Math.floor(Math.random()*20)+1;
    const isCrit  = atkRoll >= critNum;
    const finalDmg = isCrit ? dmgRoll.total*(atk.multiplicador||2) : dmgRoll.total;
    let msg = `⚔️ <strong>${sanitize(atk.name)}</strong>: ${isCrit?'<b class="crit">CRÍTICO!</b> ':''}<span>Ataque ${atkRoll}${atk.atk_bonus>0?` +${atk.atk_bonus}`:''}${isCrit?` × ${atk.multiplicador||2}`:''}</span> | Dano ${dmgRoll.detail} = <b class="roll-result">${finalDmg}</b>`;
    if (atk.dano_extra && atk.dano_extra.length) {
        atk.dano_extra.forEach(e => {
            const er = rollDice(e.dado || '1d4');
            msg += ` + <em>${sanitize(e.tipo)||'extra'}</em> ${er.detail}=<b>${isCrit?er.total*(atk.multiplicador||2):er.total}</b>`;
        });
    }
    toast(msg);
    if (window.showRollPopup) showRollPopup(finalDmg, `Ataque: ${atkRoll}${isCrit?' 💥 CRÍTICO':''}`, sanitize(atk.name));
}

// ─────────────────────────────────────────────
//  RENDER — ATTACKS
// ─────────────────────────────────────────────
function renderAttacks() {
    const el = document.getElementById('attacks-list');
    if (!el) return;
    if (!char.attacks.length) { el.innerHTML = empty('⚔️','Nenhum ataque. Clique em + Adicionar.'); return; }
    el.innerHTML = char.attacks.map((a, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <span class="item-name">⚔️ ${sanitize(a.name)}</span>
                <div class="item-actions">
                    <button class="ic-btn" onclick="rollAttack(${i})" title="Rolar">🎲</button>
                    <button class="ic-btn" onclick="openAttackModal(${i})" title="Editar">✏️</button>
                    <button class="ic-btn danger" onclick="removeItem('attacks',${i})">🗑️</button>
                </div>
            </div>
            <div class="item-detail">
                <span class="detail-tag">${sanitize(a.damage||'—')}</span>
                <span class="detail-tag">Crit ${a.critico||20}/×${a.multiplicador||2}</span>
                <span class="detail-tag">${sanitize(a.damage_type||'—')}</span>
                ${a.pericia?`<span class="detail-tag">${sanitize(a.pericia)}</span>`:''}
                ${a.alcance?`<span class="detail-tag">${sanitize(a.alcance)}</span>`:''}
                ${a.atk_bonus?`<span class="detail-tag">+${a.atk_bonus} bônus</span>`:''}
            </div>
            ${a.notes?`<p class="item-notes">${sanitize(a.notes)}</p>`:''}
            ${a.dano_extra && a.dano_extra.length ? `<p class="item-notes">Dano extra: ${a.dano_extra.map(e=>`${sanitize(e.dado)} ${sanitize(e.tipo)}`).join(' | ')}</p>` : ''}
        </div>`).join('');
}

// ─────────────────────────────────────────────
//  RENDER — ABILITIES
// ─────────────────────────────────────────────
function renderAbilities() {
    const el = document.getElementById('abilities-list');
    if (!el) return;
    const cat = currentAbilityCat;

    if (cat === 'tecnica') {
        if (!char.techniques.length) { el.innerHTML = empty('✦','Nenhuma técnica. Adicione técnicas inatas únicas do seu personagem.'); return; }
        el.innerHTML = char.techniques.map((t,i) => abilityCard(t, i, 'techniques')).join('');
    } else if (cat === 'dominio') {
        if (!char.dominio) { el.innerHTML = `<div class="dominio-slot">${empty('🌀','Expansão de Domínio não definida.')}<button class="btn btn-accent" style="margin:8px auto;display:block" onclick="openExpansaoModal()">Definir Expansão de Domínio</button></div>`; return; }
        el.innerHTML = `<div class="dominio-card">
            <div class="item-card-header"><span class="item-name" style="color:#bc8cff">🌀 ${sanitize(char.dominio.name)}</span>
            <button class="ic-btn" onclick="openExpansaoModal()">✏️</button></div>
            <p class="item-notes">${sanitize(char.dominio.desc)}</p>
            ${char.dominio.pe_cost?`<span class="detail-tag">${char.dominio.pe_cost} PE</span>`:''}
        </div>`;
    } else {
        if (!char.abilities.length) { el.innerHTML = empty('✨','Nenhuma habilidade. Clique em + Adicionar para ver as habilidades do sistema.'); return; }
        el.innerHTML = char.abilities.map((a,i) => abilityCard(a, i, 'abilities')).join('');
    }
}

function abilityCard(a, i, arr) {
    const peBadge = a.pe > 0 ? `<span class="detail-tag pe-tag">${a.pe} PE</span>` : '';
    return `<div class="item-card">
        <div class="item-card-header">
            <span class="item-name">✨ ${sanitize(a.name)}</span>
            <div class="item-actions">
                <button class="ic-btn danger" onclick="removeItem('${arr}',${i})">🗑️</button>
            </div>
        </div>
        <div class="item-detail collapse-toggle" onclick="toggleCollapse(this)">
            ${peBadge}${a.action?`<span class="detail-tag">${sanitize(a.action)}</span>`:''}
            ${a.source?`<span class="detail-tag src-tag">${sanitize(a.source)}</span>`:''}
            <span class="collapse-arrow">▾</span>
        </div>
        <div class="item-desc-body">
            <p class="item-notes">${sanitize(a.desc)}</p>
        </div>
    </div>`;
}

// ─────────────────────────────────────────────
//  RENDER — RITUALS
// ─────────────────────────────────────────────
function renderRituals() {
    const el = document.getElementById('rituals-list');
    if (!el) return;
    if (!char.rituals.length) { el.innerHTML = empty('🔮','Nenhum ritual. Clique em + Adicionar.'); return; }
    el.innerHTML = char.rituals.map((r,i) => {
        const pe = CIRCLE_PE[parseInt(r.circulo)||0] || 1;
        return `<div class="item-card">
            <div class="item-card-header">
                <span class="item-name">🔮 ${sanitize(r.name)}</span>
                <div class="item-actions">
                    <button class="ic-btn" onclick="openRitualModal(${i})">✏️</button>
                    <button class="ic-btn danger" onclick="removeItem('rituals',${i})">🗑️</button>
                </div>
            </div>
            <div class="item-detail">
                <span class="detail-tag elem-tag">${sanitize(r.elemento||'—')}</span>
                <span class="detail-tag">${CIRCLES[r.circulo]||'1° Círculo'}</span>
                <span class="detail-tag pe-tag">${pe} PE</span>
                ${r.execucao?`<span class="detail-tag">${sanitize(r.execucao)}</span>`:''}
                ${r.alcance?`<span class="detail-tag">${sanitize(r.alcance)}</span>`:''}
                ${r.resistencia&&r.resistencia!=='Nenhuma'?`<span class="detail-tag">${sanitize(r.resistencia)}</span>`:''}
            </div>
            ${r.desc?`<p class="item-notes collapse-toggle" onclick="toggleCollapse(this)">${sanitize(r.desc)} <span class="collapse-arrow">▾</span></p>`:''}
        </div>`;
    }).join('');
}

// ─────────────────────────────────────────────
//  RENDER — INVENTORY
// ─────────────────────────────────────────────
function renderInventory() {
    const el = document.getElementById('inventory-list');
    if (!el) return;
    if (!char.inventory.length) { el.innerHTML = empty('📦','Nenhum item. Clique em + Adicionar.'); return; }
    const cats = ['Cat 0','Cat I','Cat II','Cat III','Cat IV'];
    el.innerHTML = char.inventory.map((item,i) => `
        <div class="item-card${item.equipado?' equipped-card':''}">
            <div class="item-card-header">
                <label class="equip-label">
                    <input type="checkbox" ${item.equipado?'checked':''} onchange="toggleEquip(${i})">
                    <span class="item-name">${sanitize(item.name)}</span>
                </label>
                <div class="item-actions">
                    <button class="ic-btn" onclick="openItemModal(${i})">✏️</button>
                    <button class="ic-btn danger" onclick="removeItem('inventory',${i})">🗑️</button>
                </div>
            </div>
            <div class="item-detail">
                <span class="detail-tag">${cats[parseInt(item.categoria)||0]}</span>
                <span class="detail-tag">${item.espacos||1} espaço${(item.espacos||1)>1?'s':''}</span>
            </div>
            ${item.desc?`<p class="item-notes">${sanitize(item.desc)}</p>`:''}
        </div>`).join('');
}

// ─────────────────────────────────────────────
//  MODAL SYSTEM
// ─────────────────────────────────────────────
let modalSaveCallback = null;
function openBaseModal(title, bodyHTML, saveCallback) {
    modalSaveCallback = saveCallback;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    const saveBtn = document.getElementById('modal-save-btn');
    if (saveBtn) saveBtn.style.display = '';   // sempre restaura antes de abrir
    document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    modalSaveCallback = null;
}
function closeModalOutside(e) { if (e.target === document.getElementById('modal-overlay')) closeModal(); }
function saveModal() { if (modalSaveCallback) modalSaveCallback(); }

// ─────────────────────────────────────────────
//  MODAL — ATTACKS
// ─────────────────────────────────────────────
function openAttackModal(idx) {
    const a = idx !== undefined ? char.attacks[idx] : null;
    openBaseModal(a ? 'Editar Ataque' : 'Novo Ataque', buildAttackForm(a), () => {
        const val = (id) => document.getElementById(id)?.value || '';
        const intVal = (id) => parseInt(document.getElementById(id)?.value) || 0;
        const newAtk = {
            name: val('atk-name'), damage: val('atk-damage'),
            critico: intVal('atk-critico') || 20, multiplicador: intVal('atk-multi') || 2,
            atk_bonus: intVal('atk-bonus'), damage_type: val('atk-type'),
            alcance: val('atk-alcance'), pericia: val('atk-pericia'),
            dmg_attr: val('atk-attr'), notes: val('atk-notes'),
            dano_extra: collectDanoExtra()
        };
        if (!newAtk.name) { toast('⚠️ Nome obrigatório.'); return; }
        if (idx !== undefined) char.attacks[idx] = newAtk; else char.attacks.push(newAtk);
        renderAttacks(); autoSave(); closeModal();
    });
}
function buildAttackForm(a) {
    const v = (x) => a ? (x||'') : '';
    const n = (x, def) => a ? (x!==undefined?x:def) : def;
    const typeOpts = DAMAGE_TYPES.map(t=>`<option${(a?.damage_type||'')==t?' selected':''}>${t}</option>`).join('');
    const skillOpts = ATTACK_SKILLS.map(s=>`<option${(a?.pericia||'')==s?' selected':''}>${s}</option>`).join('');
    const attrOpts  = DAMAGE_ATTRS.map(s=>`<option${(a?.dmg_attr||'')==s?' selected':''}>${s}</option>`).join('');
    const extras = (a?.dano_extra||[]).map((e,i)=>danoExtraRow(e.dado,e.tipo,i)).join('');
    return `
    <div class="mf-row">
        <div class="mf-col"><label>Nome*</label><input id="atk-name" type="text" value="${sanitize(v(a?.name))}"></div>
    </div>
    <div class="mf-row">
        <div class="mf-col"><label>Dano</label><input id="atk-damage" type="text" value="${sanitize(v(a?.damage)||'1d4')}" placeholder="ex: 1d8+2"></div>
        <div class="mf-col"><label>Crítico</label><input id="atk-critico" type="number" value="${n(a?.critico,20)}" min="2" max="20"></div>
        <div class="mf-col"><label>Multiplicador</label><input id="atk-multi" type="number" value="${n(a?.multiplicador,2)}" min="2"></div>
    </div>
    <div class="mf-row">
        <div class="mf-col"><label>Ataque Bônus</label><input id="atk-bonus" type="number" value="${n(a?.atk_bonus,0)}"></div>
        <div class="mf-col"><label>Tipo de Dano</label><select id="atk-type"><option value="">—</option>${typeOpts}</select></div>
    </div>
    <div class="mf-row">
        <div class="mf-col"><label>Alcance</label><input id="atk-alcance" type="text" value="${sanitize(v(a?.alcance))||'Corpo a corpo'}" ></div>
        <div class="mf-col"><label>Perícia</label><select id="atk-pericia"><option value="">—</option>${skillOpts}</select></div>
        <div class="mf-col"><label>Attr. Dano</label><select id="atk-attr"><option value="">—</option>${attrOpts}</select></div>
    </div>
    <div>
        <label>Dano Extra <button type="button" class="btn btn-sm" onclick="addDanoExtraRow()" style="float:right">+ Adicionar</button></label>
        <div id="dano-extra-list">${extras}</div>
    </div>
    <div class="mf-row"><div class="mf-col"><label>Notas</label><textarea id="atk-notes" rows="2">${sanitize(v(a?.notes))}</textarea></div></div>`;
}
function danoExtraRow(dado, tipo, i) {
    return `<div class="dano-extra-row" id="extra-row-${i}">
        <input type="text" class="extra-dado" value="${sanitize(dado||'1d4')}" placeholder="dado">
        <input type="text" class="extra-tipo" value="${sanitize(tipo||'')}" placeholder="tipo">
        <button type="button" class="ic-btn danger" onclick="document.getElementById('extra-row-${i}').remove()">✕</button>
    </div>`;
}
let _extraIdx = 100;
function addDanoExtraRow() {
    const list = document.getElementById('dano-extra-list');
    if (!list) return;
    const i = _extraIdx++;
    list.insertAdjacentHTML('beforeend', danoExtraRow('','',i));
}
function collectDanoExtra() {
    const rows = document.querySelectorAll('.dano-extra-row');
    return Array.from(rows).map(r => ({
        dado: r.querySelector('.extra-dado')?.value || '1d4',
        tipo: r.querySelector('.extra-tipo')?.value || ''
    })).filter(e => e.dado);
}

// ─────────────────────────────────────────────
//  MODAL — ABILITY BROWSER
// ─────────────────────────────────────────────
function openAbilityBrowserModal() {
    const cat = currentAbilityCat;
    if (cat === 'tecnica') { openCustomAbilityModal(null, 'tecnica'); return; }
    if (cat === 'dominio') { openExpansaoModal(); return; }

    // Build browser modal
    const clsList = [...new Set(CLASS_ABILITIES.filter(a=>a.type==='Classe').map(a=>a.cls))];
    const charClass = char.class;
    const filterBtns = clsList.map(c => {
        const info = CLASSES_DATA[c];
        const isCharClass = c === charClass;
        return `<button class="filter-btn${isCharClass?' active':' active'}" data-cls="${c}" onclick="filterAbilities(this)" style="${isCharClass?`border-color:${info?.color||'var(--accbdr)'};color:${info?.color||'var(--accent)'}`:''}">${info?.label||c}</button>`;
    }).join('');
    const abilityList = CLASS_ABILITIES.filter(a => a.type === 'Classe').map((a,i) => `
        <div class="ab-item" data-cls="${a.cls}">
            <div class="ab-hdr" onclick="this.nextElementSibling.classList.toggle('open')">
                <span class="ab-name">${sanitize(a.name)}</span>
                <div style="display:flex;gap:4px;align-items:center">
                    ${a.pe?`<span class="detail-tag pe-tag">${a.pe} PE</span>`:''}
                    <span class="detail-tag">${sanitize(a.action)}</span>
                    <span class="detail-tag src-tag">${sanitize(a.source)}</span>
                    <button class="btn btn-accent btn-sm" onclick="event.stopPropagation();addAbilityFromBrowser(${CLASS_ABILITIES.indexOf(a)})">+</button>
                    <span class="ab-arrow">▸</span>
                </div>
            </div>
            <div class="ab-desc">${sanitize(a.desc)}</div>
        </div>`).join('');

    openBaseModal('Adicionar Habilidades',
        `<div>
            <p style="font-size:.72rem;color:var(--muted);margin-bottom:6px">Classe atual: <strong style="color:var(--accent)">${CLASSES_DATA[charClass]?.label||charClass}</strong></p>
            <div class="filter-bar">${filterBtns}</div>
            <input type="text" id="ab-search" placeholder="🔍 Buscar habilidade..." oninput="filterAbilitiesBySearch(this.value)" style="width:100%;padding:6px 10px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:4px;margin-bottom:8px">
            <div id="ab-list" style="max-height:400px;overflow-y:auto">${abilityList}</div>
        </div>`, null);
    document.getElementById('modal-save-btn').style.display = 'none';
    // Realça a classe do personagem: esconde as outras por padrão
    document.querySelectorAll('.ab-item').forEach(el => {
        el.style.display = el.dataset.cls === charClass ? '' : 'none';
    });
    // Reflete nos botões de filtro
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cls === charClass);
    });
}
function filterAbilities(btn) {
    const cls = btn.dataset.cls;
    btn.classList.toggle('active');
    const active = Array.from(document.querySelectorAll('.filter-btn.active')).map(b=>b.dataset.cls);
    document.querySelectorAll('.ab-item').forEach(el => {
        el.style.display = active.includes(el.dataset.cls) ? '' : 'none';
    });
}
function filterAbilitiesBySearch(q) {
    const lq = q.toLowerCase();
    document.querySelectorAll('.ab-item').forEach(el => {
        const name = el.querySelector('.ab-name')?.textContent.toLowerCase() || '';
        const desc = el.querySelector('.ab-desc')?.textContent.toLowerCase() || '';
        el.style.display = (name.includes(lq) || desc.includes(lq)) ? '' : 'none';
    });
}
function addAbilityFromBrowser(dataIdx) {
    const a = CLASS_ABILITIES[dataIdx];
    if (!a) return;
    char.abilities.push({ name: a.name, pe: a.pe, action: a.action, desc: a.desc, source: a.source, type: a.type });
    renderAbilities(); autoSave();
    toast(`✅ ${sanitize(a.name)} adicionado!`);
}
window.filterAbilities = filterAbilities;
window.filterAbilitiesBySearch = filterAbilitiesBySearch;
window.addAbilityFromBrowser = addAbilityFromBrowser;

// ─────────────────────────────────────────────
//  MODAL — CUSTOM ABILITY / TÉCNICA INATA
// ─────────────────────────────────────────────
function openCustomAbilityModal(idx, catOverride) {
    const arr = catOverride === 'tecnica' ? char.techniques : char.abilities;
    const a = idx !== undefined ? arr[idx] : null;
    const title = catOverride === 'tecnica' ? (a ? 'Editar Técnica Inata' : 'Nova Técnica Inata') : (a ? 'Editar Habilidade' : 'Nova Habilidade');
    const placeholder = catOverride === 'tecnica' ? 'Descreva como sua técnica inata funciona...' : 'Descreva a habilidade...';
    openBaseModal(title, `
        <div class="mf-row"><div class="mf-col"><label>Nome*</label><input id="cust-name" type="text" value="${sanitize(a?.name||'')}"></div></div>
        <div class="mf-row">
            <div class="mf-col"><label>Custo PE</label><input id="cust-pe" type="number" value="${a?.pe||0}" min="0"></div>
            <div class="mf-col"><label>Ação</label><select id="cust-action">
                ${['Livre','Padrão','Movimento','Completa','Reação','Passiva','Variável'].map(o=>`<option${(a?.action||'')==o?' selected':''}>${o}</option>`).join('')}
            </select></div>
        </div>
        <div class="mf-row"><div class="mf-col"><label>Descrição</label><textarea id="cust-desc" rows="4" placeholder="${placeholder}">${sanitize(a?.desc||'')}</textarea></div></div>`,
    () => {
        const name = document.getElementById('cust-name')?.value;
        if (!name) { toast('⚠️ Nome obrigatório.'); return; }
        const obj = {
            name, pe: parseInt(document.getElementById('cust-pe')?.value)||0,
            action: document.getElementById('cust-action')?.value,
            desc: document.getElementById('cust-desc')?.value,
            source: catOverride === 'tecnica' ? 'Inata' : 'Custom',
            type: catOverride === 'tecnica' ? 'TecnicaInata' : 'Costume'
        };
        if (idx !== undefined) arr[idx] = obj; else arr.push(obj);
        renderAbilities(); autoSave(); closeModal();
    });
    document.getElementById('modal-save-btn').style.display = '';
}

// ─────────────────────────────────────────────
//  MODAL — EXPANSÃO DE DOMÍNIO
// ─────────────────────────────────────────────
function openExpansaoModal() {
    const d = char.dominio;
    openBaseModal(d ? 'Editar Expansão de Domínio' : 'Definir Expansão de Domínio', `
        <div class="mf-row"><div class="mf-col"><label>Nome do Domínio*</label><input id="dom-name" type="text" value="${sanitize(d?.name||'')}" placeholder="Ex: Esfera Mágica Infernal"></div></div>
        <div class="mf-row"><div class="mf-col"><label>Custo de PE</label><input id="dom-pe" type="number" value="${d?.pe_cost||0}" min="0"></div></div>
        <div class="mf-row"><div class="mf-col"><label>Descrição do Efeito</label><textarea id="dom-desc" rows="4" placeholder="Descreva o efeito do seu domínio interno...">${sanitize(d?.desc||'')}</textarea></div></div>
        <p style="color:var(--muted);font-size:.8rem;margin-top:4px">A Expansão de Domínio manifesta o Domínio Interno do feiticeiro, aprisionando o alvo. As técnicas do conjurador são aprimoradas e não podem ser esquivadas.</p>`,
    () => {
        const name = document.getElementById('dom-name')?.value;
        if (!name) { toast('⚠️ Nome obrigatório.'); return; }
        char.dominio = {
            name, pe_cost: parseInt(document.getElementById('dom-pe')?.value)||0,
            desc: document.getElementById('dom-desc')?.value
        };
        renderAbilities(); autoSave(); closeModal();
    });
}

// ─────────────────────────────────────────────
//  MODAL — RITUALS
// ─────────────────────────────────────────────
function openRitualModal(idx) {
    const r = idx !== undefined ? char.rituals[idx] : null;
    const circleOpts = CIRCLES.map((c,i)=>`<option value="${i}"${r&&parseInt(r.circulo)===i?' selected':''}>${c} — ${CIRCLE_PE[i]} PE</option>`).join('');
    const elemOpts   = ['—',...ELEMENTS].map(e=>`<option${(r?.elemento||'')==e?' selected':''}>${e}</option>`).join('');
    openBaseModal(r ? 'Editar Ritual' : 'Novo Ritual', `
        <div class="mf-row"><div class="mf-col"><label>Nome*</label><input id="rit-name" type="text" value="${sanitize(r?.name||'')}"></div></div>
        <div class="mf-row">
            <div class="mf-col"><label>Círculo</label><select id="rit-circle">${circleOpts}</select></div>
            <div class="mf-col"><label>Elemento</label><select id="rit-elem">${elemOpts}</select></div>
        </div>
        <div class="mf-row">
            <div class="mf-col"><label>Execução</label><select id="rit-exec">
                ${['Padrão','Completa','Ritual'].map(o=>`<option${(r?.execucao||'')==o?' selected':''}>${o}</option>`).join('')}
            </select></div>
            <div class="mf-col"><label>Alcance</label><select id="rit-range">
                ${['Pessoal','Toque','Curto (9m)','Médio (30m)','Longo (90m)','Ilimitado'].map(o=>`<option${(r?.alcance||'')==o?' selected':''}>${o}</option>`).join('')}
            </select></div>
        </div>
        <div class="mf-row">
            <div class="mf-col"><label>Alvo/Área</label><input id="rit-target" type="text" value="${sanitize(r?.alvo||'')}"></div>
            <div class="mf-col"><label>Duração</label><select id="rit-dur">
                ${['Instantânea','Cena','Sustentada','Permanente'].map(o=>`<option${(r?.duracao||'')==o?' selected':''}>${o}</option>`).join('')}
            </select></div>
        </div>
        <div class="mf-row">
            <div class="mf-col"><label>Resistência</label><select id="rit-res">
                ${['Nenhuma','Fortitude','Reflexos','Vontade'].map(o=>`<option${(r?.resistencia||'')==o?' selected':''}>${o}</option>`).join('')}
            </select></div>
        </div>
        <div class="mf-row"><div class="mf-col"><label>Descrição</label><textarea id="rit-desc" rows="3">${sanitize(r?.desc||'')}</textarea></div></div>`,
    () => {
        const name = document.getElementById('rit-name')?.value;
        if (!name) { toast('⚠️ Nome obrigatório.'); return; }
        const obj = {
            name, circulo: parseInt(document.getElementById('rit-circle')?.value)||0,
            elemento: document.getElementById('rit-elem')?.value,
            execucao: document.getElementById('rit-exec')?.value,
            alcance:  document.getElementById('rit-range')?.value,
            alvo:     document.getElementById('rit-target')?.value,
            duracao:  document.getElementById('rit-dur')?.value,
            resistencia: document.getElementById('rit-res')?.value,
            desc:     document.getElementById('rit-desc')?.value
        };
        if (idx !== undefined) char.rituals[idx] = obj; else char.rituals.push(obj);
        renderRituals(); autoSave(); closeModal();
    });
}

// ─────────────────────────────────────────────
//  MODAL — INVENTORY
// ─────────────────────────────────────────────
function openItemModal(idx) {
    const it = idx !== undefined ? char.inventory[idx] : null;
    const catOpts = ['Cat 0','Cat I','Cat II','Cat III','Cat IV'].map((c,i)=>`<option value="${i}"${it&&parseInt(it.categoria)===i?' selected':''}>${c}</option>`).join('');
    openBaseModal(it ? 'Editar Item' : 'Novo Item', `
        <div class="mf-row"><div class="mf-col"><label>Nome*</label><input id="item-name" type="text" value="${sanitize(it?.name||'')}"></div></div>
        <div class="mf-row">
            <div class="mf-col"><label>Categoria</label><select id="item-cat">${catOpts}</select></div>
            <div class="mf-col"><label>Espaços</label><input id="item-espacos" type="number" value="${it?.espacos||1}" min="0"></div>
        </div>
        <div class="mf-row"><div class="mf-col"><label>Descrição</label><textarea id="item-desc" rows="2">${sanitize(it?.desc||'')}</textarea></div></div>`,
    () => {
        const name = document.getElementById('item-name')?.value;
        if (!name) { toast('⚠️ Nome obrigatório.'); return; }
        const obj = {
            name, categoria: parseInt(document.getElementById('item-cat')?.value)||0,
            espacos: parseInt(document.getElementById('item-espacos')?.value)||1,
            desc: document.getElementById('item-desc')?.value,
            equipado: it?.equipado||false
        };
        if (idx !== undefined) char.inventory[idx] = obj; else char.inventory.push(obj);
        renderInventory(); autoSave(); closeModal();
    });
}

// ─────────────────────────────────────────────
//  COLLAPSE TOGGLE
// ─────────────────────────────────────────────
function toggleCollapse(el) {
    const body = el.parentElement.querySelector('.item-desc-body');
    if (body) { body.classList.toggle('open'); }
    const arr = el.querySelector('.collapse-arrow');
    if (arr) arr.textContent = body?.classList.contains('open') ? '▴' : '▾';
}
window.toggleCollapse = toggleCollapse;

// ─────────────────────────────────────────────
//  CRUD HELPERS
// ─────────────────────────────────────────────
function removeItem(arr, idx) {
    char[arr].splice(idx, 1);
    if (arr === 'attacks')   renderAttacks();
    if (arr === 'abilities') renderAbilities();
    if (arr === 'techniques'){ currentAbilityCat='tecnica'; renderAbilities(); }
    if (arr === 'rituals')   renderRituals();
    if (arr === 'inventory') renderInventory();
    autoSave();
}
function toggleEquip(idx) {
    char.inventory[idx].equipado = !char.inventory[idx].equipado;
    renderInventory(); autoSave();
}

// ─────────────────────────────────────────────
//  PORTRAIT
// ─────────────────────────────────────────────
function changePortrait() {
    document.getElementById('portrait-file').click();
}
function onPortraitFile(input) {
    const f = input.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => {
        char.portrait = e.target.result;
        document.getElementById('portrait-img').src = e.target.result;
        autoSave();
    };
    reader.readAsDataURL(f);
    input.value = '';
}

// ─────────────────────────────────────────────
//  SAVE / LOAD
// ─────────────────────────────────────────────
let _saveTimer = null;
function autoSave() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
        try { localStorage.setItem('op_char_v2', JSON.stringify(char)); } catch(e) {}
    }, 400);
}
function loadFromStorage() {
    try {
        const raw = localStorage.getItem('op_char_v2');
        if (!raw) return false;
        const data = JSON.parse(raw);
        Object.assign(char, data);
        if (!char.attrs)     char.attrs = { agi:1,str:1,int:1,pre:1,vig:1 };
        if (!char.skills)    char.skills = {};
        if (!char.desc)      char.desc   = {};
        if (!char.attacks)   char.attacks = [];
        if (!char.abilities) char.abilities = [];
        if (!char.techniques)char.techniques = [];
        if (!char.rituals)   char.rituals = [];
        if (!char.inventory) char.inventory = [];
        if (!char.rituaisAtivos) char.rituaisAtivos = [];
        SKILLS_DATA.forEach(s => { if (!char.skills[s.id]) char.skills[s.id]={training:0,outros:0}; });
        return true;
    } catch(e) { return false; }
}
function exportChar() {
    const b = new Blob([JSON.stringify(char,null,2)], {type:'application/json'});
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u; a.download = (char.name||'personagem').replace(/[^\w]/g,'_')+'.json';
    a.click(); URL.revokeObjectURL(u);
    toast('💾 Ficha exportada com sucesso!');
}
function importChar(input) {
    const f = input.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = e => {
        try {
            Object.assign(char, JSON.parse(e.target.result));
            SKILLS_DATA.forEach(s => { if (!char.skills[s.id]) char.skills[s.id]={training:0,outros:0}; });
            syncUI();
            toast('📂 Ficha importada!');
        } catch { toast('❌ Erro ao importar: arquivo inválido.'); }
    };
    r.readAsText(f);
    input.value = '';
}

// ─────────────────────────────────────────────
//  SYNC UI ← STATE
// ─────────────────────────────────────────────
function syncUI() {
    const s = (id, v) => { const el=document.getElementById(id); if(el) el.value = v||''; };
    s('char-name',  char.name);
    s('player-name',char.player);
    s('char-class', char.class);
    s('char-origin',char.origin);
    s('char-nex',   char.nex);
    s('def-bonus-input', char.defBonus);
    s('speed-input',     char.speed);
    s('protection-input',char.protection);
    s('resistances-input',char.resistances);
    s('prestigio-input', char.prestigio);
    ['notes','appearance','personality','history','objective'].forEach(k => {
        s(`desc-${k}`, char.desc[k]);
    });
    if (char.portrait) {
        const img = document.getElementById('portrait-img');
        if (img) img.src = char.portrait;
    }
    drawPentagon();
    updateStats();
    updateSkillsTable();
    updateOriginBox();
    updatePatente();
    renderAttacks();
    renderAbilities();
    renderRituals();
    renderInventory();
}

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
function toast(msg) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(()=>t.classList.add('fade-out'),3200);
    setTimeout(()=>t.remove(),3500);
}

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────
function sanitize(s) {
    if (!s && s !== 0) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}
function empty(icon, msg) {
    return `<div class="empty-state"><span>${icon}</span><p>${msg}</p></div>`;
}

// ─────────────────────────────────────────────
//  KEYBOARD SHORTCUTS
// ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); autoSave(); toast('💾 Salvo!'); }
});

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
function init() {
    // Populate NEX
    const nexSel = document.getElementById('char-nex');
    NEX_VALUES.forEach(n => { const o=document.createElement('option'); o.value=n; o.textContent=n+'%'; nexSel.appendChild(o); });

    // Populate Origins
    const oriSel = document.getElementById('char-origin');
    ALL_ORIGINS.forEach(o => { const opt=document.createElement('option'); opt.value=o.name; opt.textContent=o.source?`[${o.source}] ${o.name}`:o.name; oriSel.appendChild(opt); });

    // Populate Classes
    const clsSel = document.getElementById('char-class');
    Object.entries(CLASSES_DATA).forEach(([k,v]) => { const o=document.createElement('option'); o.value=k; o.textContent=v.label; clsSel.appendChild(o); });

    const loaded = loadFromStorage();
    if (!loaded) {
        char.currentPV = maxPV(); char.currentPE = maxPE(); char.currentSAN = maxSAN();
    }
    syncUI();
}

document.addEventListener('DOMContentLoaded', init);
