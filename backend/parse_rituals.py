"""
Parser de Rituais — Ordem Paranormal
Extrai os blocos de rituais do arquivo de regras e gera rituals.json

Estrutura dos rituais no texto:
  [descrição anterior...]NomeLinha1  ← linha misturada ou sozinha
  [NomeLinha2]                        ← segunda linha do nome (opcional)
   ELEMENTO N                         ← começa com espaço, maiúsculas
  Execução:  ...
  Alcance:   ...
  Alvo:      ...
  Duração:   ...
  [Resistência: ...]
  Descrição do efeito...
"""
import re
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(BASE, "Arquivos limpos", "Ordem_Paranormal_Limpo.txt")
OUT  = os.path.join(BASE, "backend", "data", "rituals.json")

ELEMENTS  = ["SANGUE", "MORTE", "CONHECIMENTO", "ENERGIA", "MEDO"]
ELEM_MAP  = {k: k.title() for k in ELEMENTS}
CIRCLE_PE = [1, 3, 6, 10]

def clean(s: str) -> str:
    return re.sub(r'\s+', ' ', s or '').strip()

def extract_name_from_line(line: str) -> str:
    """
    A linha pode ter texto de descrição seguido do nome do próximo ritual.
    Extrai apenas o fragmento de nome: texto após o último '.' ou '!' ou '?'
    que pareça Title Case sem artigos/preposições minúsculas no meio.
    Se a linha inteira já for um nome puro, retorna ela inteira.
    """
    stripped = line.strip()
    # Se a linha é puramente um nome (curto, Title Case, sem pontuação de frase)
    if len(stripped) < 35 and not re.search(r'[.!?,:;]', stripped):
        return stripped
    # Se contém ponto ou vírgula, pegar tudo após o último '.'
    # (o nome do próximo ritual aparece depois da última frase da descrição)
    parts = re.split(r'[.!?]\s*', stripped)
    candidate = parts[-1].strip() if parts else stripped
    # Verificar se o candidato parece um nome de ritual (Title Case)
    if candidate and candidate[0].isupper():
        return candidate
    return ''

def parse_rituals(text: str) -> list[dict]:
    # Localizar seção de rituais
    start = text.find("DESCRIÇÃO DOS RITUAIS")
    if start == -1:
        start = text.find("RITUAIS")
    section = text[start:start + 200_000]

    lines = section.splitlines()

    ELEM_LINE_RE = re.compile(r'^ (' + '|'.join(ELEMENTS) + r') (\d)\s*$')

    # Encontrar todas as linhas "elemento+círculo"
    elem_positions = []
    for i, line in enumerate(lines):
        m = ELEM_LINE_RE.match(line)
        if m:
            elem_positions.append((i, m.group(1), int(m.group(2))))

    rituals = []
    seen = set()

    for ep_idx, (li, element, circle_num) in enumerate(elem_positions):
        circle = circle_num - 1  # 0-indexed

        # Reconstruir nome olhando para linhas anteriores
        # li-1: pode ser linha pura de nome (ex: "Mental") ou misturada
        # li-2: pode ser linha misturada (ex: "...Requer 4° círculo.Aprimoramento")
        name_parts = []

        line_m1 = lines[li - 1].strip() if li >= 1 else ''
        line_m2 = lines[li - 2].strip() if li >= 2 else ''

        # Ignorar marcadores de página e linhas numéricas
        if re.match(r'^--- P|^\d+$', line_m1):
            line_m1 = ''
        if re.match(r'^--- P|^\d+$', line_m2):
            line_m2 = ''

        frag1 = extract_name_from_line(line_m1) if line_m1 else ''
        frag2 = extract_name_from_line(line_m2) if line_m2 else ''

        # Montar nome: frag2 + frag1
        # frag2 só entra se for curto, Title Case e não for palavra de contexto
        SKIP_WORDS = {'requer', 'se', 'e', 'ou', 'mas', 'com', 'para', 'de',
                      'do', 'da', 'dos', 'das', 'o', 'a', 'os', 'as', 'que'}
        if (frag2 and len(frag2.split()) <= 2 and frag2[0].isupper()
                and frag2.lower().split()[0] not in SKIP_WORDS):
            name = clean(frag2 + ' ' + frag1)
        else:
            name = clean(frag1)

        if not name or name in seen:
            continue
        seen.add(name)

        # Coletar campos (execução, alcance, alvo, duração, resistência)
        fields: dict[str, str] = {}
        field_prefixes = {
            'execu': 'execucao',
            'alcance': 'alcance',
            'alvo': 'alvo',
            'dura': 'duracao',
            'resist': 'resistencia',
        }
        desc_start_line = li + 1

        j = li + 1
        while j < min(li + 25, len(lines)):
            stripped = lines[j].strip()
            matched = False
            for prefix, key in field_prefixes.items():
                if stripped.lower().startswith(prefix) and ':' in stripped:
                    val = re.sub(r'^[^:]+:\s*', '', stripped, flags=re.IGNORECASE)
                    # Próxima linha pode continuar o valor
                    k = j + 1
                    while k < len(lines):
                        nxt = lines[k].strip()
                        if not nxt:
                            break
                        # Para se encontrar outro campo ou elemento
                        if ELEM_LINE_RE.match(lines[k]):
                            break
                        if re.match(r'^(execu|alcance|alvo|dura|resist|verdadeiro|discente)',
                                    nxt, re.IGNORECASE):
                            break
                        val = val.rstrip() + ' ' + nxt
                        k += 1
                    fields[key] = clean(val)
                    desc_start_line = k
                    j = k
                    matched = True
                    break
            if not matched:
                if len(fields) >= 4:
                    desc_start_line = j
                    break
                j += 1

        # Coletar descrição até o próximo ritual
        next_li = elem_positions[ep_idx + 1][0] if ep_idx + 1 < len(elem_positions) else len(lines)
        next_name_start = max(desc_start_line, next_li - 3)

        desc_parts = []
        for j in range(desc_start_line, next_name_start):
            raw = lines[j].strip()
            if not raw:
                continue
            if re.match(r'^--- Pág', raw):
                continue
            if re.match(r'^(Verdadeiro|Discente)\s*\(', raw):
                break
            if ELEM_LINE_RE.match(lines[j]):
                break
            desc_parts.append(raw)

        # A última parte do desc_parts pode ter o início do próximo nome
        # Remover após o último '.' se o final parece um nome
        if desc_parts:
            last = desc_parts[-1]
            if re.search(r'\.[A-ZÁÉÍÓÚ]', last):
                last = re.sub(r'\.[A-ZÁÉÍÓÚ][^.]*$', '', last)
                desc_parts[-1] = last

        desc = clean(' '.join(desc_parts))

        rituals.append({
            "name":        name,
            "elemento":    ELEM_MAP.get(element, element.title()),
            "circulo":     circle,
            "pe":          CIRCLE_PE[min(circle, 3)],
            "execucao":    clean(fields.get('execucao', 'padrão')).capitalize(),
            "alcance":     clean(fields.get('alcance', 'pessoal')).capitalize(),
            "alvo":        clean(fields.get('alvo', '')).capitalize(),
            "duracao":     clean(fields.get('duracao', 'instantânea')).capitalize(),
            "resistencia": clean(fields.get('resistencia', 'Nenhuma')).capitalize(),
            "desc":        desc,
        })

    return rituals


def main():
    with open(SRC, encoding="utf-8", errors="replace") as f:
        text = f.read()

    rituals = parse_rituals(text)
    print(f"[parse_rituals] Extraídos {len(rituals)} rituais.")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(rituals, f, ensure_ascii=False, indent=2)

    print(f"Salvo em {OUT}\n\nLista:")
    for i, r in enumerate(rituals):
        print(f"  {i+1:2d}. [{r['elemento']} {r['circulo']+1}] {r['name']}")


if __name__ == "__main__":
    main()


if __name__ == "__main__":
    main()
