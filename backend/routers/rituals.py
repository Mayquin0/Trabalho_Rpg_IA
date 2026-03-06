import json, os
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()
_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "rituals.json")

with open(_DATA_PATH, encoding="utf-8") as f:
    _RITUALS = json.load(f)


@router.get("/rituals")
def get_rituals(
    elemento: Optional[str] = Query(None),
    circulo: Optional[int] = Query(None),
    q: Optional[str] = Query(None),
):
    result = _RITUALS
    if elemento:
        result = [r for r in result if r.get("elemento", "").lower() == elemento.lower()]
    if circulo is not None:
        result = [r for r in result if r.get("circulo") == circulo]
    if q:
        q_lower = q.lower()
        result = [r for r in result if q_lower in r.get("name", "").lower() or q_lower in r.get("desc", "").lower()]
    return result


@router.get("/rituals/{name}")
def get_ritual(name: str):
    for r in _RITUALS:
        if r["name"].lower() == name.lower():
            return r
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Ritual não encontrado")
