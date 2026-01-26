# src/api/services/split_balance.py

from typing import List, Dict, Any, Tuple


def build_splits_for_expense(
    *,
    total_amount: float,
    split_method: str,
    participants: List[int] | None = None,
    splits: List[Dict[str, Any]] | None = None
) -> List[Dict[str, Any]]:
   
    split_method = (split_method or "equal").lower().strip()

    if total_amount is None:
        raise ValueError("total_amount es requerido")
    total_amount = float(total_amount)
    if total_amount <= 0:
        raise ValueError("total_amount debe ser > 0")

    if split_method == "equal":
        if not isinstance(participants, list) or len(participants) < 1:
            raise ValueError("participants debe ser una lista con al menos 1 user_id")

      
        participants = list({int(p) for p in participants})
        per_person = round(total_amount / len(participants), 2)

        result = []
        running = 0.0
        for i, uid in enumerate(participants):
            if i == len(participants) - 1:
                amt = round(total_amount - running, 2)
            else:
                amt = per_person
                running = round(running + amt, 2)
            result.append({"user_id": uid, "amount": amt})
        return result

    if split_method == "percent":
        if not isinstance(splits, list) or len(splits) < 1:
            raise ValueError("splits debe ser una lista")

        total_percent = 0.0
        cleaned = []
        for s in splits:
            if "user_id" not in s or "percent" not in s:
                raise ValueError("Cada split debe tener user_id y percent")
            uid = int(s["user_id"])
            pct = float(s["percent"])
            if pct <= 0:
                raise ValueError("percent debe ser > 0")
            cleaned.append({"user_id": uid, "percent": pct})
            total_percent += pct

        total_percent = round(total_percent, 2)
        if total_percent != 100.0:
            raise ValueError(f"La suma de percent debe ser 100. Ahora es {total_percent}")

        result = []
        running = 0.0
        for i, s in enumerate(cleaned):
            uid = s["user_id"]
            pct = s["percent"]
            if i == len(cleaned) - 1:
                amt = round(total_amount - running, 2)
            else:
                amt = round(total_amount * (pct / 100.0), 2)
                running = round(running + amt, 2)
            result.append({"user_id": uid, "amount": amt})
        return result

    if split_method == "amount":
        if not isinstance(splits, list) or len(splits) < 1:
            raise ValueError("splits debe ser una lista")

        cleaned = []
        total_split_amount = 0.0
        for s in splits:
            if "user_id" not in s or "amount" not in s:
                raise ValueError("Cada split debe tener user_id y amount")
            uid = int(s["user_id"])
            amt = float(s["amount"])
            if amt < 0:
                raise ValueError("amount del split no puede ser negativo")
            amt = round(amt, 2)
            cleaned.append({"user_id": uid, "amount": amt})
            total_split_amount += amt

        total_split_amount = round(total_split_amount, 2)
        if total_split_amount != round(total_amount, 2):
            raise ValueError(f"La suma de amounts debe ser {total_amount}. Ahora es {total_split_amount}")

        return cleaned

    raise ValueError("split_method inválido (usa: equal, percent, amount)")


def calculate_group_balances(
    *,
    expenses: List[Dict[str, Any]],
    splits_by_expense: Dict[int, List[Dict[str, Any]]],
) -> Dict[str, Any]:
    """
    expenses: [{"id": 10, "created_by": 1, "total_amount": 50.0}, ...]
    splits_by_expense: {10: [{"user_id":2,"amount":25.0}, ...], ...}
    """
    net: Dict[int, float] = {}

    for exp in expenses:
        exp_id = int(exp["id"])
        payer_id = int(exp["created_by"])
        total = float(exp["total_amount"])

        
        net[payer_id] = net.get(payer_id, 0.0) + total

       
        for sp in splits_by_expense.get(exp_id, []):
            uid = int(sp["user_id"])
            amt = float(sp["amount"])
            net[uid] = net.get(uid, 0.0) - amt

    creditors = []
    debtors = []
    for uid, value in net.items():
        value = round(value, 2)
        if value > 0:
            creditors.append({"user_id": uid, "amount": value})
        elif value < 0:
            debtors.append({"user_id": uid, "amount": abs(value)})

    creditors.sort(key=lambda x: x["amount"], reverse=True)
    debtors.sort(key=lambda x: x["amount"], reverse=True)

    transfers = []
    i = 0
    j = 0
    while i < len(debtors) and j < len(creditors):
        d = debtors[i]
        c = creditors[j]
        pay_amount = round(min(d["amount"], c["amount"]), 2)

        if pay_amount > 0:
            transfers.append({
                "from_user_id": d["user_id"],
                "to_user_id": c["user_id"],
                "amount": pay_amount
            })

        d["amount"] = round(d["amount"] - pay_amount, 2)
        c["amount"] = round(c["amount"] - pay_amount, 2)

        if d["amount"] <= 0:
            i += 1
        if c["amount"] <= 0:
            j += 1

    return {
        "net": {str(k): round(v, 2) for k, v in net.items()},
        "transfers": transfers
    }
