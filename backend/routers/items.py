import json, os
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()
_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "items.json")

with open(_DATA_PATH, encoding="utf-8") as f:
    _ITEMS = json.load(f)


@router.get("/items")
def get_items(
    type: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):
    result = _ITEMS
    if type:
        result = [i for i in result if i.get("type", "").lower() == type.lower()]
    if source:
        result = [i for i in result if i.get("source", "").lower() == source.lower()]
    if q:
        q_lower = q.lower()
        result = [i for i in result if q_lower in i.get("name", "").lower() or q_lower in i.get("desc", "").lower()]
    return result
