'use strict';
// ═══════════════════════════════════════════════════════════
//  FICHA-DATA.JS — Constantes e dados do sistema OP/FM/MF
// ═══════════════════════════════════════════════════════════

const NEX_VALUES = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,99];

const CLASSES_DATA = {
    combatente: {
        label: 'Combatente', short: 'CMB',
        pvBase: 20, peBase: 2, sanBase: 3,
        pvGain: 4,  peGain: 2, sanGain: 3,
        pvAttr: 'vig', peAttr: 'pre',
        trainedCount: (int) => 3 + Math.max(0, int),
        proficiencies: ['Armas Simples', 'Armas Táticas', 'Proteções Leves'],
        color: '#e74c3c'
    },
    especialista: {
        label: 'Especialista', short: 'ESP',
        pvBase: 16, peBase: 3, sanBase: 4,
        pvGain: 3,  peGain: 3, sanGain: 4,
        pvAttr: 'vig', peAttr: 'pre',
        trainedCount: (int) => 7 + Math.max(0, int),
        proficiencies: ['Armas Simples', 'Proteções Leves'],
        color: '#3498db'
    },
    ocultista: {
        label: 'Ocultista', short: 'OCL',
        pvBase: 12, peBase: 4, sanBase: 5,
        pvGain: 2,  peGain: 4, sanGain: 5,
        pvAttr: 'vig', peAttr: 'pre',
        trainedCount: (int) => 5 + Math.max(0, int),
        proficiencies: ['Armas Simples'],
        mandatorySkills: ['ocultismo','vontade'],
        color: '#9b59b6'
    },
    transformado: {
        label: 'Transformado (MF)', short: 'TRF',
        pvBase: 18, peBase: 3, sanBase: 3,
        pvGain: 3,  peGain: 3, sanGain: 3,
        pvAttr: 'vig', peAttr: 'pre',
        trainedCount: (int) => 5 + Math.max(0, int),
        proficiencies: ['Armas Simples'],
        color: '#27ae60'
    },
    feiticeiro: {
        label: 'Feiticeiro (FM)', short: 'FTC',
        pvBase: 14, peBase: 4, sanBase: 4,
        pvGain: 2,  peGain: 4, sanGain: 4,
        pvAttr: 'vig', peAttr: 'pre',
        trainedCount: (int) => 4 + Math.max(0, int),
        proficiencies: ['Armas Simples'],
        color: '#f39c12'
    }
};

// ─────────────────────────────────────────────
//  PERÍCIAS
// ─────────────────────────────────────────────
const SKILLS_DATA = [
    { id:'acrobacia',    name:'Acrobacia',     attr:'agi', trainedOnly:false, carga:true  },
    { id:'adestramento', name:'Adestramento',  attr:'pre', trainedOnly:true,  carga:false },
    { id:'artes',        name:'Artes',         attr:'pre', trainedOnly:true,  carga:false },
    { id:'atletismo',    name:'Atletismo',     attr:'str', trainedOnly:false, carga:false },
    { id:'atualidades',  name:'Atualidades',   attr:'int', trainedOnly:false, carga:false },
    { id:'ciencias',     name:'Ciências',      attr:'int', trainedOnly:true,  carga:false },
    { id:'crime',        name:'Crime',         attr:'agi', trainedOnly:true,  carga:true  },
    { id:'diplomacia',   name:'Diplomacia',    attr:'pre', trainedOnly:false, carga:false },
    { id:'enganacao',    name:'Enganação',     attr:'pre', trainedOnly:false, carga:false },
    { id:'fortitude',    name:'Fortitude',     attr:'vig', trainedOnly:false, carga:false },
    { id:'furtividade',  name:'Furtividade',   attr:'agi', trainedOnly:false, carga:true  },
    { id:'iniciativa',   name:'Iniciativa',    attr:'agi', trainedOnly:false, carga:false },
    { id:'intimidacao',  name:'Intimidação',   attr:'pre', trainedOnly:false, carga:false },
    { id:'intuicao',     name:'Intuição',      attr:'int', trainedOnly:false, carga:false },
    { id:'investigacao', name:'Investigação',  attr:'int', trainedOnly:false, carga:false },
    { id:'luta',         name:'Luta',          attr:'str', trainedOnly:false, carga:false },
    { id:'medicina',     name:'Medicina',      attr:'int', trainedOnly:true,  carga:false },
    { id:'ocultismo',    name:'Ocultismo',     attr:'int', trainedOnly:true,  carga:false },
    { id:'percepcao',    name:'Percepção',     attr:'pre', trainedOnly:false, carga:false },
    { id:'pilotagem',    name:'Pilotagem',     attr:'agi', trainedOnly:true,  carga:false },
    { id:'pontaria',     name:'Pontaria',      attr:'agi', trainedOnly:false, carga:false },
    { id:'profissao',    name:'Profissão',     attr:'int', trainedOnly:true,  carga:false },
    { id:'reflexos',     name:'Reflexos',      attr:'agi', trainedOnly:false, carga:false },
    { id:'religiao',     name:'Religião',      attr:'pre', trainedOnly:true,  carga:false },
    { id:'sobrevivencia',name:'Sobrevivência', attr:'int', trainedOnly:false, carga:false },
    { id:'tatica',       name:'Tática',        attr:'int', trainedOnly:true,  carga:false },
    { id:'tecnologia',   name:'Tecnologia',    attr:'int', trainedOnly:true,  carga:false },
    { id:'vontade',      name:'Vontade',       attr:'pre', trainedOnly:false, carga:false }
];

const TRAINING_BONUS = {0:0, 1:5, 2:10, 3:15};
const TRAINING_NAMES = ['Destreinado','Treinado','Veterano','Expert'];
const ATTR_ABBR   = { agi:'AGI', str:'FOR', int:'INT', pre:'PRE', vig:'VIG' };
const ATTR_LABEL  = { agi:'AGILIDADE', str:'FORÇA', int:'INTELECTO', pre:'PRESENÇA', vig:'VIGOR' };
const ATTR_COLOR  = { agi:'#2ecc71', str:'#e74c3c', int:'#3498db', pre:'#9b59b6', vig:'#f39c12' };
const ATTR_ORDER  = ['agi','str','int','pre','vig'];

// ─────────────────────────────────────────────
//  ORIGENS — OP (Ordem Paranormal base)
// ─────────────────────────────────────────────
const OP_ORIGINS = [
    { name:'Acadêmico',              skills:['ciencias','investigacao'],    defBonus:0, power:'Saber é Poder — Gaste 2 PE para +5 num teste de Intelecto (1×/cena).' },
    { name:'Agente de Saúde',        skills:['intuicao','medicina'],        defBonus:0, power:'Técnica Medicinal — Adiciona Intelecto no total de PV curados.' },
    { name:'Amnésico',               skills:[],                             defBonus:0, power:'Vislumbres do Passado — Teste de INT DT10 para reconhecer locais (1×/missão).' },
    { name:'Artista',                skills:['artes','diplomacia'],         defBonus:0, power:'Magnum Opus — Uma vez por missão, alguém te reconhece.' },
    { name:'Atleta',                 skills:['acrobacia','atletismo'],      defBonus:0, power:'110% — Gaste 2 PE para +5 num teste de AGI ou FOR (1×/cena).' },
    { name:'Criminoso',              skills:['crime','furtividade'],        defBonus:0, power:'O Crime Compensa — Ao final de missão, inclui 1 item extra na próxima.' },
    { name:'Cultista Arrependido',   skills:['enganacao','ocultismo'],      defBonus:0, power:'Traços do Outro Lado — Você possui um poder paranormal à sua escolha.' },
    { name:'Desgarrado',             skills:['fortitude','sobrevivencia'],  defBonus:0, power:'Calejado — +5 pontos de vida.' },
    { name:'Engenheiro',             skills:['profissao','tecnologia'],     defBonus:0, power:'Ferramentas Favoritas — Reduza categoria de um kit de perícia à escolha.' },
    { name:'Executivo',              skills:['diplomacia','profissao'],     defBonus:0, power:'Processo Otimizado — Gaste 2 PE para +5 em teste de perícia estendido.' },
    { name:'Investigador',           skills:['investigacao','percepcao'],   defBonus:0, power:'Faro para Pistas — Gaste 2 PE para +5 em busca de pistas (1×/cena).' },
    { name:'Lutador',                skills:['luta','reflexos'],            defBonus:0, power:'Mão Pesada — +1 em rolagens de dano corpo a corpo.' },
    { name:'Magnata',                skills:['diplomacia','pilotagem'],     defBonus:0, power:'Patrocinador — Limite de crédito sempre uma categoria acima.' },
    { name:'Mercenário',             skills:['iniciativa','intimidacao'],   defBonus:0, power:'Posição de Combate — Gaste 2 PE para ação de movimento extra no 1° turno.' },
    { name:'Militar',                skills:['pontaria','tatica'],          defBonus:0, power:'Para Bellum — +1 em rolagens de dano com armas de fogo.' },
    { name:'Operário',               skills:['fortitude','profissao'],      defBonus:0, power:'Ferramentas da Profissão — Prof. com 1 arma simples/tática + +2 dano.' },
    { name:'Policial',               skills:['percepcao','pontaria'],       defBonus:1, power:'Patrulha — +1 em Defesa.' },
    { name:'Religioso',              skills:['religiao','vontade'],         defBonus:0, power:'Acalentar — Use Religião em vez de Diplomacia. Recupera 1d6 SAN ao acalmar.' },
    { name:'Servidor Público',       skills:['intuicao','vontade'],         defBonus:0, power:'Espírito Cívico — Gaste 1 PE para +2 ao prestar ajuda.' },
    { name:'Teórico da Conspiração', skills:['investigacao','ocultismo'],   defBonus:0, power:'Eu Já Sabia — Gaste 3 PE para ignorar uma perda de SAN (1×/cena).' },
    { name:'T.I.',                   skills:['investigacao','tecnologia'],  defBonus:0, power:'Motor de Busca — Substitua um teste por Tecnologia com internet (2 PE).' },
    { name:'Trabalhador Rural',      skills:['adestramento','sobrevivencia'],defBonus:0,power:'Desbravador — Ignora penalidade de clima ruim e terreno natural.' },
    { name:'Trambiqueiro',           skills:['crime','enganacao'],          defBonus:0, power:'Impostor — Gaste 2 PE para substituir qualquer teste por Enganação (1×/cena).' },
    { name:'Universitário',          skills:['atualidades','investigacao'], defBonus:0, power:'Empenho — Gaste 2 PE para +1d6 em qualquer teste de perícia.' }
].map(o => ({ ...o, source:'OP' }));

// ─────────────────────────────────────────────
//  ORIGENS — MF (Marcas Fragmentadas)
// ─────────────────────────────────────────────
const MF_ORIGINS = [
    { name:'Adestrador',           skills:['adestramento','diplomacia'],  defBonus:0, power:'Um Amigo — Você tem um animal aliado à sua escolha.' },
    { name:'Adepto ao Paranormal', skills:['ocultismo','vontade'],        defBonus:0, power:'Mente Preparada — +5 no teste de Ocultismo para Custo do Paranormal.' },
    { name:'Apostador',            skills:['intuicao','enganacao'],       defBonus:0, power:'Tiro de Sorte — Gaste 2 PE para +5 numa rolagem (50% chance de falhar).' },
    { name:'Escritor Paranormal',  skills:['atualidades','ocultismo'],    defBonus:0, power:'Nas Entrelinhas — Gaste 2 PE; aliados ganham +2 contra criatura identificada.' },
    { name:'Faz-Tudo',             skills:['profissao','tecnologia'],     defBonus:0, power:'Pau para Toda Obra — +5 espaços de inventário.' },
    { name:'Influenciador',        skills:['atualidades','diplomacia'],   defBonus:0, power:'Algoritmo — Ação "Criar Conteúdo" em interlúdio com internet.' },
    { name:'Jornalista',           skills:['diplomacia','enganacao'],     defBonus:0, power:'Fofoca — 1×/sessão, ação de interlúdio para buscar informações do caso.' },
    { name:'Médico 24 Horas',      skills:['medicina','percepcao'],       defBonus:0, power:'Plantão — "Cuidados Prolongados" a partir do grau Treinado.' },
    { name:'Palestrinha',          skills:['diplomacia','enganacao'],     defBonus:0, power:'Mudança de Mindset — Aliados que leram junto ganham 2d6 em vez de 1d6.' },
    { name:'Pesquisador Paranormal',skills:['ocultismo','ciencias'],      defBonus:0, power:'Já Vi Pior — +5 em testes de Presença Perturbadora.' },
    { name:'Piloto',               skills:['pilotagem','iniciativa'],     defBonus:0, power:'Rápido e Furioso — +5 em pilotagem com veículos do tipo escolhido.' },
    { name:'Psicólogo',            skills:['diplomacia','intuicao'],      defBonus:0, power:'Sessão de Terapia — Sessão para até 1 pessoa por Intelecto em interlúdio.' },
    { name:'Químico',              skills:['ciencias','tecnologia'],      defBonus:0, power:'Você Sabe Demais — Cria venenos (DT até 15) em ação de interlúdio.' },
    { name:'Treinador',            skills:['atletismo','luta'],           defBonus:0, power:'Malhe Enquanto Dormem — Aliados que exercitaram juntos ganham 2d6 em vez de 1d6.' },
    { name:'Zelador',              skills:['atletismo','percepcao'],      defBonus:0, power:'Casa Suja Chão Sujo — Gaste 1 PE para +5 em Investigação de resíduos.' }
].map(o => ({ ...o, source:'MF' }));

// ─────────────────────────────────────────────
//  ORIGENS — FM (Feiticeiros e Maldições)
// ─────────────────────────────────────────────
const FM_ORIGINS = [
    { name:'Inato',                     skills:[], defBonus:0, power:'Talento Natural — Recebe 1 Talento e 1 Feitiço adicional com custo reduzido.' },
    { name:'Herdado',                   skills:[], defBonus:0, power:'Herança de Clã — Técnicas e capacidades herdadas da linhagem sanguínea.' },
    { name:'Derivado',                  skills:[], defBonus:0, power:'Energia Antinatural — Aptidão Amaldiçoada de Aura + recuperação de energia 1×/dia.' },
    { name:'Restringido',               skills:[], defBonus:0, power:'Físico Abençoado — Deslocamento +3m, imune a doenças mundanas, resistência a venenos.' },
    { name:'Feto Amaldiçoado Híbrido',  skills:[], defBonus:0, power:'Físico Amaldiçoado — Recebe uma Característica de Anatomia.' },
    { name:'Sem Técnica',               skills:[], defBonus:0, power:'Empenho Implacável — +4 pontos de atributo extras para distribuir.' },
    { name:'Corpo Amaldiçoado Mutante', skills:[], defBonus:0, power:'Mutação Abrupta — Inicia com 3 núcleos que pode alternar.' }
].map(o => ({ ...o, source:'FM' }));

const ALL_ORIGINS = [
    { name:'— sem origem —', source:'', skills:[], defBonus:0, power:'' },
    ...OP_ORIGINS,
    ...MF_ORIGINS,
    ...FM_ORIGINS
];

// ─────────────────────────────────────────────
//  HABILIDADES DE CLASSE
// ─────────────────────────────────────────────
const CLASS_ABILITIES = [
    // ══ COMBATENTE ══
    { name:'Ataque Especial',          cls:'combatente', source:'OP', type:'Classe',    pe:2, action:'Padrão',    desc:'Quando faz um ataque, gaste 2 PE para +5 no teste ou no dano. Com mais NEX, pode gastar 1 PE a mais para novo bônus de +5.' },
    { name:'Acuidade com Arma',        cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'Use AGI em vez de FOR com armas leves corpo a corpo ou arremesso. Pré-req: AGI 2.' },
    { name:'Armamento Pesado',         cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'Recebe proficiência com Armas Pesadas.' },
    { name:'Ataque de Oportunidade',   cls:'combatente', source:'OP', type:'Classe',    pe:1, action:'Reação',    desc:'Quando inimigo sai de espaço adjacente voluntariamente, gaste 1 reação e 1 PE para realizar um ataque.' },
    { name:'Combater com Duas Armas',  cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Padrão',    desc:'Com 2 armas (ao menos 1 leve), faz 2 ataques com –1d em todos os testes de ataque. Pré-req: AGI 3, Luta ou Pontaria treinado.' },
    { name:'Combate Defensivo',        cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'Ao agredir, pode combater defensivamente: –1d nos ataques, +5 em Defesa. Pré-req: INT 2.' },
    { name:'Golpe Demolidor',          cls:'combatente', source:'OP', type:'Classe',    pe:1, action:'Padrão',    desc:'Ao quebrar ou atacar objeto, gaste 1 PE para +2 dados de dano. Pré-req: FOR 2, Luta treinado.' },
    { name:'Golpe Pesado',             cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'O dano das suas armas corpo a corpo aumenta um passo.' },
    { name:'Proteção Pesada',          cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'Recebe proficiência com Proteções Pesadas. (NEX 30%).' },
    { name:'Reflexos Defensivos',      cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'+5 em Defesa e resistências contra inimigos em alcance curto. Pré-req: AGI 2.' },
    { name:'Saque Rápido',             cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Livre',     desc:'Sacar ou guardar itens é ação livre. Recarregar diminui categoria. Pré-req: Iniciativa treinado.' },
    { name:'Segurar o Gatilho',        cls:'combatente', source:'OP', type:'Classe',    pe:1, action:'Padrão',    desc:'Ao acertar com arma de fogo, faça outro ataque pagando PE = nº de ataques já feitos. (NEX 60%).' },
    { name:'Sentido Tático',           cls:'combatente', source:'OP', type:'Classe',    pe:2, action:'Movimento', desc:'Gaste ação de movimento e 2 PE para analisar ambiente (+5 Defesa/resist. até fim da cena). Pré-req: Percepção e Tática.' },
    { name:'Tanque de Guerra',         cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'Com proteção pesada, +2 em Defesa e resistência a dano. Pré-req: Proteção Pesada.' },
    { name:'Tiro Certeiro',            cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'Com arma de disparo, soma AGI no dano e ignora penalidade de alvo em combate corpo a corpo. Pré-req: Pontaria.' },
    { name:'Tiro de Cobertura',        cls:'combatente', source:'OP', type:'Classe',    pe:1, action:'Padrão',    desc:'Gaste 1 PE para forçar alvo a se proteger (Pontaria vs Vontade).' },
    { name:'Transcender',              cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Variável',  desc:'Escolha um poder paranormal. Você o recebe perdendo Sanidade. Pode escolher várias vezes.' },
    { name:'Treinamento em Perícia',   cls:'combatente', source:'OP', type:'Classe',    pe:0, action:'Passiva',   desc:'Torne-se treinado em 2 perícias. Avança para Veterano (NEX 35%) e Expert (NEX 70%). Pode repetir.' },
    // ══ ESPECIALISTA ══
    { name:'Eclético',                 cls:'especialista', source:'OP', type:'Classe',  pe:2, action:'Padrão',    desc:'Gaste 2 PE num teste de perícia para receber benefícios de ser treinado nela.' },
    { name:'Perito',                   cls:'especialista', source:'OP', type:'Classe',  pe:2, action:'Padrão',    desc:'Para 2 perícias treinadas: gaste PE para somar +1d6, +1d8, +1d10 ou +1d12 conforme NEX.' },
    { name:'Balística Avançada',       cls:'especialista', source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'Proficiência com armas táticas de fogo e +2 no dano com elas.' },
    { name:'Conhecimento Aplicado',    cls:'especialista', source:'OP', type:'Classe',  pe:2, action:'Padrão',    desc:'Gaste 2 PE para usar Intelecto em qualquer teste de perícia (exceto Luta e Pontaria). Pré-req: INT 2.' },
    { name:'Hacker',                   cls:'especialista', source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'+5 em Tecnologia para invadir sistemas; hackear vira ação completa. Pré-req: Tecnologia treinado.' },
    { name:'Mãos Rápidas',             cls:'especialista', source:'OP', type:'Classe',  pe:1, action:'Livre',     desc:'Gaste 1 PE para fazer teste de Crime como ação livre. Pré-req: AGI 3, Crime treinado.' },
    { name:'Mochila de Utilidades',    cls:'especialista', source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'Um kit de perícia conta como categoria abaixo e ocupa 1 espaço a menos.' },
    { name:'Movimento Tático',         cls:'especialista', source:'OP', type:'Classe',  pe:1, action:'Movimento', desc:'Gaste 1 PE para ignorar terreno difícil e ganhar deslocamento de escalada. Pré-req: Atletismo.' },
    { name:'Na Trilha Certa',          cls:'especialista', source:'OP', type:'Classe',  pe:1, action:'Padrão',    desc:'Ao achar pistas em investigação, gaste 1 PE para +1d no próximo teste.' },
    { name:'Nerd',                     cls:'especialista', source:'OP', type:'Classe',  pe:2, action:'Padrão',    desc:'Gaste 2 PE para teste de Atualidades DT 20 e receber uma informação útil (1×/cena).' },
    { name:'Ninja Urbano',             cls:'especialista', source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'Proficiência com armas táticas corpo a corpo e +2 no dano com elas.' },
    { name:'Perito em Explosivos',     cls:'especialista', source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'Soma INT na DT dos seus explosivos; pode excluir aliados dos efeitos (INT alvos).' },
    { name:'Pensamento Ágil',          cls:'especialista', source:'OP', type:'Classe',  pe:2, action:'Padrão',    desc:'Gaste 2 PE para ação de investigação adicional (1×/rodada; usa INT).' },
    { name:'Primeira Impressão',       cls:'especialista', source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'+2d no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição da cena.' },
    // ══ OCULTISTA ══
    { name:'Escolhido pelo Outro Lado',cls:'ocultista',    source:'OP', type:'Classe',  pe:0, action:'Variável',  desc:'Você lança rituais de 1° círculo. Começa com 3 rituais de 1° círculo conhecidos.' },
    { name:'Camuflar Ocultismo',       cls:'ocultista',    source:'OP', type:'Classe',  pe:2, action:'Livre',     desc:'Gaste +2 PE ao lançar ritual para fazê-lo sem gesticular ou falar.' },
    { name:'Envolto em Mistério',      cls:'ocultista',    source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'+5 em Enganação e Intimidação contra quem não é treinado em Ocultismo.' },
    { name:'Especialista em Elemento', cls:'ocultista',    source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'Escolha um Elemento. A DT para resistir seus rituais daquele elemento aumenta em +2.' },
    { name:'Ferramentas Paranormais',  cls:'ocultista',    source:'OP', type:'Classe',  pe:0, action:'Padrão',    desc:'Uma vez por cena, ative um equipamento paranormal sem custo de PE.' },
    { name:'Fluxo de Poder',           cls:'ocultista',    source:'OP', type:'Classe',  pe:0, action:'Livre',     desc:'Mantenha dois rituais sustentados ativos com apenas uma ação livre. (NEX 60%).' },
    { name:'Guiado pelo Paranormal',   cls:'ocultista',    source:'OP', type:'Classe',  pe:2, action:'Padrão',    desc:'Gaste 2 PE para realizar uma ação de investigação adicional (1×/cena).' },
    { name:'Identificação Paranormal', cls:'ocultista',    source:'OP', type:'Classe',  pe:0, action:'Passiva',   desc:'+10 em Ocultismo para identificar criaturas, objetos ou rituais.' },
    // ══ TRANSFORMADO (MF) ══
    { name:'Respirar é Obsoleto',      cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'Você não precisa respirar.' },
    { name:'Cambiante',                cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'+5 em Furtividade; pode fazer o teste sem estar previamente escondido.' },
    { name:'Olhos da Noite',           cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'+5 em Percepção para enxergar. Visão no Escuro. Imune à condição Cego.' },
    { name:'Sentidos Quiméricos',      cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'+5 em Percepção para ouvir. Imune à condição Surdo. Pré-req: Olhos da Noite.' },
    { name:'Passo Vertical',           cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'Deslocamento de Escalada igual ao normal (mover assim conta como terreno difícil).' },
    { name:'Movimentação Aguçada',     cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'Ignora terreno difícil.' },
    { name:'Faro Paranormal',          cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Padrão',    desc:'Rolle Ocultismo para detectar o Paranormal. Recebe +5 nesse teste.' },
    { name:'Físico Impossível',        cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'RD 3 em dois tipos à escolha: Eletricidade, Fogo, Frio ou Químico.' },
    { name:'Face Amedrontadora',       cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'+10 e +1d20 em Intimidação quando sua transformação é óbvia.' },
    { name:'Fluidos Tóxicos',          cls:'transformado', source:'MF', type:'Classe',  pe:1, action:'Reação',    desc:'Ao ser acertado em corpo a corpo, gaste 1 PE para causar 1d6 de dano químico no atacante.' },
    { name:'Toque Amaldiçoado',        cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'Seus ataques corpo a corpo causam +1d4 de dano de um elemento à escolha.' },
    { name:'Toque Maldito',            cls:'transformado', source:'MF', type:'Classe',  pe:0, action:'Passiva',   desc:'Aumenta dano do Toque Amaldiçoado para 1d10. Pré-req: Toque Amaldiçoado + afinidade elemental.' },
    // ══ FEITICEIRO (FM) ══
    { name:'Técnica Aprimorada',       cls:'feiticeiro',   source:'FM', type:'Classe',  pe:0, action:'Passiva',   desc:'+5 em Ocultismo para fins de rituais e identificação paranormal. Ao lançar rituais, pode gastar 1 PE extra para elevar a DT em +2.' },
    { name:'Reserva de Energia',       cls:'feiticeiro',   source:'FM', type:'Classe',  pe:0, action:'Passiva',   desc:'Seu PE máximo aumenta em um valor igual ao seu Intelecto. Pré-req: NEX 15%.' },
    { name:'Fluxo Maldito',            cls:'feiticeiro',   source:'FM', type:'Classe',  pe:2, action:'Livre',     desc:'Gaste 2 PE: até o fim do turno, sua próxima ação referente a Técnica Inata ou ritual não provoca ataques de oportunidade.' },
    { name:'Barreira Simples',         cls:'feiticeiro',   source:'FM', type:'Classe',  pe:2, action:'Reação',    desc:'Ao receber dano físico, gaste 2 PE para reduzir o dano em 1d6 + VIG. Pode ser usada 1×/rodada.' },
    { name:'Manifestação Amaldiçoada', cls:'feiticeiro',   source:'FM', type:'Classe',  pe:3, action:'Padrão',    desc:'Ao acertar um ataque com sua Técnica Inata, gaste 3 PE para causar +2d de dano do elemento da técnica e impor a condição Abalado (Fortitude negaça).' },
    { name:'Controle de Energia',      cls:'feiticeiro',   source:'FM', type:'Classe',  pe:0, action:'Passiva',   desc:'Fora de combate, recupera +1 PE por turno. Em combate, ao gastar 4+ PE em um único efeito, recupera 1 PE ao final do turno seguinte.' },
    { name:'Aura de Combate',          cls:'feiticeiro',   source:'FM', type:'Classe',  pe:2, action:'Padrão',    desc:'Declare Aura de Combate: até o fim da cena, seus ataques com a Técnica Inata causam +1d4 de dano do elemento escolhido. Pré-req: NEX 30%.' },
    { name:'Refinamento de Técnica',   cls:'feiticeiro',   source:'FM', type:'Classe',  pe:0, action:'Passiva',   desc:'Ao atingir NEX 35%, escolha uma expansão para sua Técnica Inata (adicione efeito secundário a critério do mestre). Pré-req: NEX 35%.' },
    { name:'Domínio em Gestação',      cls:'feiticeiro',   source:'FM', type:'Classe',  pe:4, action:'Completa',  desc:'Você pode manifestar uma versão parcial do seu Domínio Interno: área de 9m centrada em você; aliados recebem +2 em resistências, inimigos –1d em ataques. Dura 3 rodadas. Pré-req: Expansão de Domínio definida. NEX 50%.' },
    { name:'Transcendência',           cls:'feiticeiro',   source:'FM', type:'Classe',  pe:0, action:'Passiva',   desc:'Ao chegar a 0 PV, role Vontade (DT 15): sucesso te mantém em pé com 1 PV e +4 PE recuperados. Falha: desmaiado normalmente. 1×/missão. NEX 70%.' },
    // ══ UNIVERSAIS / ESPECIAIS ══
    { name:'Expansão de Domínio',      cls:'feiticeiro',   source:'FM', type:'ExpansaoDominio', pe:0, action:'Ação Completa', desc:'Manifesta o Domínio Interno do feiticeiro, aprisionando o alvo. Dentro do domínio, as técnicas do conjurador são aprimoradas e não podem ser esquivadas. Consome quantidade absurda de energia. Única por personagem.' },
    { name:'Poder Paranormal',         cls:'todas',        source:'OP', type:'PoderParanormal',  pe:0, action:'Variável',   desc:'Poder concedido pelo Outro Lado. Descreva o poder e escolha um elemento: Sangue, Morte, Conhecimento, Energia ou Medo.' }
];

// ─────────────────────────────────────────────
//  COMBATE
// ─────────────────────────────────────────────
const DAMAGE_TYPES  = ['Balístico','Corte','Impacto','Perfuração','Fogo','Eletricidade','Frio','Químico','Mental','Paranormal'];
const ATTACK_SKILLS = ['Luta','Pontaria','Atletismo (arremesso)'];
const DAMAGE_ATTRS  = ['Força','Agilidade','Intelecto','Presença','Vigor','Nenhum'];
const ELEMENTS      = ['Sangue','Morte','Conhecimento','Energia','Medo'];
const CIRCLES       = ['1° Círculo','2° Círculo','3° Círculo','4° Círculo'];
const CIRCLE_PE     = [1, 3, 6, 10];

// ─────────────────────────────────────────────
//  PATENTES
// ─────────────────────────────────────────────
const PATENTES = [
    { min:0,   name:'Recruta',              credito:'Baixo',     limites:'Cat I: 2' },
    { min:20,  name:'Operador',             credito:'Médio',     limites:'Cat I: 3 — Cat II: 1' },
    { min:50,  name:'Agente Especial',      credito:'Médio',     limites:'Cat I: 3 — Cat II: 2 — Cat III: 1' },
    { min:100, name:'Oficial de Operações', credito:'Alto',      limites:'Cat I: 3 — Cat II: 3 — Cat III: 2 — Cat IV: 1' },
    { min:200, name:'Agente de Elite',      credito:'Ilimitado', limites:'Cat I: 3 — Cat II: 3 — Cat III: 3 — Cat IV: 2' }
];
