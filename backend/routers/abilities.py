from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

# Dados das habilidades de classe (espelha CLASS_ABILITIES em ficha-data.js)
_ABILITIES = [
    # COMBATENTE
    {"name":"Ataque Especial",           "cls":"combatente",  "source":"OP","type":"Classe",          "pe":2,  "action":"Padrão",    "desc":"Quando faz um ataque, gaste 2 PE para +5 no teste ou no dano. Com mais NEX, pode gastar 1 PE a mais para novo bônus de +5."},
    {"name":"Acuidade com Arma",         "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Use AGI em vez de FOR com armas leves corpo a corpo ou arremesso. Pré-req: AGI 2."},
    {"name":"Armamento Pesado",          "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Recebe proficiência com Armas Pesadas."},
    {"name":"Ataque de Oportunidade",    "cls":"combatente",  "source":"OP","type":"Classe",          "pe":1,  "action":"Reação",    "desc":"Quando inimigo sai de espaço adjacente voluntariamente, gaste 1 reação e 1 PE para realizar um ataque."},
    {"name":"Combater com Duas Armas",   "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Padrão",    "desc":"Com 2 armas (ao menos 1 leve), faz 2 ataques com –1d em todos os testes de ataque. Pré-req: AGI 3, Luta ou Pontaria treinado."},
    {"name":"Combate Defensivo",         "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Ao agredir, pode combater defensivamente: –1d nos ataques, +5 em Defesa. Pré-req: INT 2."},
    {"name":"Golpe Demolidor",           "cls":"combatente",  "source":"OP","type":"Classe",          "pe":1,  "action":"Padrão",    "desc":"Ao quebrar ou atacar objeto, gaste 1 PE para +2 dados de dano. Pré-req: FOR 2, Luta treinado."},
    {"name":"Golpe Pesado",              "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"O dano das suas armas corpo a corpo aumenta um passo."},
    {"name":"Proteção Pesada",           "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Recebe proficiência com Proteções Pesadas. (NEX 30%)."},
    {"name":"Reflexos Defensivos",       "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+5 em Defesa e resistências contra inimigos em alcance curto. Pré-req: AGI 2."},
    {"name":"Saque Rápido",              "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Livre",     "desc":"Sacar ou guardar itens é ação livre. Recarregar diminui categoria. Pré-req: Iniciativa treinado."},
    {"name":"Segurar o Gatilho",         "cls":"combatente",  "source":"OP","type":"Classe",          "pe":1,  "action":"Padrão",    "desc":"Ao acertar com arma de fogo, faça outro ataque pagando PE = nº de ataques já feitos. (NEX 60%)."},
    {"name":"Sentido Tático",            "cls":"combatente",  "source":"OP","type":"Classe",          "pe":2,  "action":"Movimento", "desc":"Gaste ação de movimento e 2 PE para analisar ambiente (+5 Defesa/resist. até fim da cena). Pré-req: Percepção e Tática."},
    {"name":"Tanque de Guerra",          "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Com proteção pesada, +2 em Defesa e resistência a dano. Pré-req: Proteção Pesada."},
    {"name":"Tiro Certeiro",             "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Com arma de disparo, soma AGI no dano e ignora penalidade de alvo em combate corpo a corpo. Pré-req: Pontaria."},
    {"name":"Tiro de Cobertura",         "cls":"combatente",  "source":"OP","type":"Classe",          "pe":1,  "action":"Padrão",    "desc":"Gaste 1 PE para forçar alvo a se proteger (Pontaria vs Vontade)."},
    {"name":"Transcender",               "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Variável",  "desc":"Escolha um poder paranormal. Você o recebe perdendo Sanidade. Pode escolher várias vezes."},
    {"name":"Treinamento em Perícia",    "cls":"combatente",  "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Torne-se treinado em 2 perícias. Avança para Veterano (NEX 35%) e Expert (NEX 70%). Pode repetir."},
    # ESPECIALISTA
    {"name":"Eclético",                  "cls":"especialista","source":"OP","type":"Classe",          "pe":2,  "action":"Padrão",    "desc":"Gaste 2 PE num teste de perícia para receber benefícios de ser treinado nela."},
    {"name":"Perito",                    "cls":"especialista","source":"OP","type":"Classe",          "pe":2,  "action":"Padrão",    "desc":"Para 2 perícias treinadas: gaste PE para somar +1d6, +1d8, +1d10 ou +1d12 conforme NEX."},
    {"name":"Balística Avançada",        "cls":"especialista","source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Proficiência com armas táticas de fogo e +2 no dano com elas."},
    {"name":"Conhecimento Aplicado",     "cls":"especialista","source":"OP","type":"Classe",          "pe":2,  "action":"Padrão",    "desc":"Gaste 2 PE para usar Intelecto em qualquer teste de perícia (exceto Luta e Pontaria). Pré-req: INT 2."},
    {"name":"Hacker",                    "cls":"especialista","source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+5 em Tecnologia para invadir sistemas; hackear vira ação completa. Pré-req: Tecnologia treinado."},
    {"name":"Mãos Rápidas",              "cls":"especialista","source":"OP","type":"Classe",          "pe":1,  "action":"Livre",     "desc":"Gaste 1 PE para fazer teste de Crime como ação livre. Pré-req: AGI 3, Crime treinado."},
    {"name":"Mochila de Utilidades",     "cls":"especialista","source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Um kit de perícia conta como categoria abaixo e ocupa 1 espaço a menos."},
    {"name":"Movimento Tático",          "cls":"especialista","source":"OP","type":"Classe",          "pe":1,  "action":"Movimento", "desc":"Gaste 1 PE para ignorar terreno difícil e ganhar deslocamento de escalada. Pré-req: Atletismo."},
    {"name":"Na Trilha Certa",           "cls":"especialista","source":"OP","type":"Classe",          "pe":1,  "action":"Padrão",    "desc":"Ao achar pistas em investigação, gaste 1 PE para +1d no próximo teste."},
    {"name":"Nerd",                      "cls":"especialista","source":"OP","type":"Classe",          "pe":2,  "action":"Padrão",    "desc":"Gaste 2 PE para teste de Atualidades DT 20 e receber uma informação útil (1×/cena)."},
    {"name":"Perito em Explosivos",      "cls":"especialista","source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Soma INT na DT dos seus explosivos; pode excluir aliados dos efeitos (INT alvos)."},
    {"name":"Pensamento Ágil",           "cls":"especialista","source":"OP","type":"Classe",          "pe":2,  "action":"Padrão",    "desc":"Gaste 2 PE para ação de investigação adicional (1×/rodada; usa INT)."},
    {"name":"Primeira Impressão",        "cls":"especialista","source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+2d no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição da cena."},
    # OCULTISTA
    {"name":"Escolhido pelo Outro Lado", "cls":"ocultista",   "source":"OP","type":"Classe",          "pe":0,  "action":"Variável",  "desc":"Você lança rituais de 1° círculo. Começa com 3 rituais de 1° círculo conhecidos."},
    {"name":"Camuflar Ocultismo",        "cls":"ocultista",   "source":"OP","type":"Classe",          "pe":2,  "action":"Livre",     "desc":"Gaste +2 PE ao lançar ritual para fazê-lo sem gesticular ou falar."},
    {"name":"Envolto em Mistério",       "cls":"ocultista",   "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+5 em Enganação e Intimidação contra quem não é treinado em Ocultismo."},
    {"name":"Especialista em Elemento",  "cls":"ocultista",   "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Escolha um Elemento. A DT para resistir seus rituais daquele elemento aumenta em +2."},
    {"name":"Ferramentas Paranormais",   "cls":"ocultista",   "source":"OP","type":"Classe",          "pe":0,  "action":"Padrão",    "desc":"Uma vez por cena, ative um equipamento paranormal sem custo de PE."},
    {"name":"Fluxo de Poder",            "cls":"ocultista",   "source":"OP","type":"Classe",          "pe":0,  "action":"Livre",     "desc":"Mantenha dois rituais sustentados ativos com apenas uma ação livre. (NEX 60%)."},
    {"name":"Guiado pelo Paranormal",    "cls":"ocultista",   "source":"OP","type":"Classe",          "pe":2,  "action":"Padrão",    "desc":"Gaste 2 PE para realizar uma ação de investigação adicional (1×/cena)."},
    {"name":"Identificação Paranormal",  "cls":"ocultista",   "source":"OP","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+10 em Ocultismo para identificar criaturas, objetos ou rituais."},
    # TRANSFORMADO
    {"name":"Respirar é Obsoleto",       "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Você não precisa respirar."},
    {"name":"Cambiante",                 "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+5 em Furtividade; pode fazer o teste sem estar previamente escondido."},
    {"name":"Olhos da Noite",            "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+5 em Percepção para enxergar. Visão no Escuro. Imune à condição Cego."},
    {"name":"Sentidos Quiméricos",       "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+5 em Percepção para ouvir. Imune à condição Surdo. Pré-req: Olhos da Noite."},
    {"name":"Passo Vertical",            "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Deslocamento de Escalada igual ao normal (mover assim conta como terreno difícil)."},
    {"name":"Movimentação Aguçada",      "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Ignora terreno difícil."},
    {"name":"Faro Paranormal",           "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Padrão",    "desc":"Rolle Ocultismo para detectar o Paranormal. Recebe +5 nesse teste."},
    {"name":"Físico Impossível",         "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"RD 3 em dois tipos à escolha: Eletricidade, Fogo, Frio ou Químico."},
    {"name":"Face Amedrontadora",        "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+10 e +1d20 em Intimidação quando sua transformação é óbvia."},
    {"name":"Fluidos Tóxicos",           "cls":"transformado","source":"MF","type":"Classe",          "pe":1,  "action":"Reação",    "desc":"Ao ser acertado em corpo a corpo, gaste 1 PE para causar 1d6 de dano químico no atacante."},
    {"name":"Toque Amaldiçoado",         "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Seus ataques corpo a corpo causam +1d4 de dano de um elemento à escolha."},
    {"name":"Toque Maldito",             "cls":"transformado","source":"MF","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Aumenta dano do Toque Amaldiçoado para 1d10. Pré-req: Toque Amaldiçoado + afinidade elemental."},
    # FEITICEIRO
    {"name":"Técnica Aprimorada",        "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"+5 em Ocultismo para fins de rituais e identificação paranormal."},
    {"name":"Reserva de Energia",        "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Seu PE máximo aumenta em um valor igual ao seu Intelecto. Pré-req: NEX 15%."},
    {"name":"Fluxo Maldito",             "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":2,  "action":"Livre",     "desc":"Gaste 2 PE: até o fim do turno, sua próxima ação referente a Técnica Inata ou ritual não provoca ataques de oportunidade."},
    {"name":"Barreira Simples",          "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":2,  "action":"Reação",    "desc":"Ao receber dano físico, gaste 2 PE para reduzir o dano em 1d6 + VIG. Pode ser usada 1×/rodada."},
    {"name":"Manifestação Amaldiçoada",  "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":3,  "action":"Padrão",    "desc":"Ao acertar um ataque com sua Técnica Inata, gaste 3 PE para causar +2d de dano do elemento e impor a condição Abalado."},
    {"name":"Controle de Energia",       "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Fora de combate, recupera +1 PE por turno. Em combate, ao gastar 4+ PE em um único efeito, recupera 1 PE ao final do turno seguinte."},
    {"name":"Aura de Combate",           "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":2,  "action":"Padrão",    "desc":"Declare Aura de Combate: até o fim da cena, seus ataques com a Técnica Inata causam +1d4 de dano do elemento escolhido. Pré-req: NEX 30%."},
    {"name":"Refinamento de Técnica",    "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Ao atingir NEX 35%, escolha uma expansão para sua Técnica Inata. Pré-req: NEX 35%."},
    {"name":"Domínio em Gestação",       "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":4,  "action":"Completa",  "desc":"Manifesta versão parcial do seu Domínio Interno. Dura 3 rodadas. Pré-req: Expansão de Domínio definida. NEX 50%."},
    {"name":"Transcendência",            "cls":"feiticeiro",  "source":"FM","type":"Classe",          "pe":0,  "action":"Passiva",   "desc":"Ao chegar a 0 PV, role Vontade DT 15: sucesso = 1 PV e +4 PE. 1×/missão. NEX 70%."},
    {"name":"Expansão de Domínio",       "cls":"feiticeiro",  "source":"FM","type":"ExpansaoDominio", "pe":0,  "action":"Ação Completa","desc":"Manifesta o Domínio Interno do feiticeiro. Única por personagem."},
    {"name":"Poder Paranormal",          "cls":"todas",       "source":"OP","type":"PoderParanormal", "pe":0,  "action":"Variável",  "desc":"Poder concedido pelo Outro Lado. Descreva o poder e escolha um elemento."},
]


@router.get("/abilities")
def get_abilities(
    cls: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):
    result = _ABILITIES
    if cls:
        result = [a for a in result if a["cls"].lower() == cls.lower() or a["cls"] == "todas"]
    if type:
        result = [a for a in result if a["type"].lower() == type.lower()]
    if source:
        result = [a for a in result if a["source"].lower() == source.lower()]
    if q:
        q_lower = q.lower()
        result = [a for a in result if q_lower in a["name"].lower() or q_lower in a["desc"].lower()]
    return result
