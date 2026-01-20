import requests
from api.services.fx_cache import FxRateCache

"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, SavingEvent, RewardLedger
from api.models import Group, GroupMember, SharedExpense, SharedExpenseSplit
from api.utils import generate_sitemap, APIException
from api.services.split_balance import build_splits_for_expense, calculate_group_balances
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

fx_cache = FxRateCache(ttl_seconds=600)
FRANKFURTER_LATEST_URL = "https://api.frankfurter.app/latest"



@api.route('/fx/rates', methods=['GET'])
def fx_rates():
    base = request.args.get('base', 'USD').upper().strip()

    cached = fx_cache.get(base)
    if cached:
        return jsonify({
            "base": base,
            "source": "cache",
            "data": cached
        }), 200

    try:
        r = requests.get(FRANKFURTER_LATEST_URL, params={"base": base}, timeout=10)
        r.raise_for_status()
        data = r.json()

        fx_cache.set(base, data)

        return jsonify({
            "base": base,
            "source": "api",
            "data": data
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "No se pudieron obtener las tasas de cambio",
            "details": str(e)
        }), 500


@api.route('/fx/convert', methods=['GET'])
def fx_convert():
    from_currency = request.args.get('from', 'USD').upper().strip()
    to_currency = request.args.get('to', 'EUR').upper().strip()
    amount_raw = request.args.get('amount', '1').strip()

    try:
        amount = float(amount_raw)
        if amount < 0:
            return jsonify({"error": "amount no puede ser negativo"}), 400
    except ValueError:
        return jsonify({"error": "amount debe ser un número"}), 400

    cached = fx_cache.get(from_currency)
    if not cached:
        try:
            r = requests.get(FRANKFURTER_LATEST_URL, params={"base": from_currency}, timeout=10)
            r.raise_for_status()
            cached = r.json()
            fx_cache.set(from_currency, cached)
        except requests.exceptions.RequestException as e:
            return jsonify({
                "error": "No se pudo convertir (falló al obtener tasas)",
                "details": str(e)
            }), 500

    rates = cached.get("rates", {})
    rate = rates.get(to_currency)

    if rate is None:
        return jsonify({
            "error": f"No existe tasa para convertir de {from_currency} a {to_currency}"
        }), 400

    result = round(amount * rate, 2)

    return jsonify({
        "from": from_currency,
        "to": to_currency,
        "amount": amount,
        "rate": rate,
        "result": result
    }), 200



def calculate_credits(amount_usd: float) -> int:
    return int(amount_usd // 10)


@api.route("/savings", methods=["POST"])
def create_saving():
    body = request.get_json() or {}
    user_id = body.get("user_id")
    amount = body.get("amount")
    currency = (body.get("currency") or "USD").upper().strip()

    if not user_id:
        return jsonify({"error": "user_id es requerido"}), 400

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "user_id inválido"}), 400

   
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user no existe"}), 404

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"error": "amount debe ser mayor que 0"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "amount debe ser un número"}), 400

    if currency != "USD":
        return jsonify({"error": "MVP: por ahora solo aceptamos USD"}), 400

    credits = calculate_credits(amount)

    saving_event = SavingEvent(user_id=user_id, amount=amount, currency=currency)
    db.session.add(saving_event)

    if credits > 0:
        ledger = RewardLedger(
            user_id=user_id,
            credits_delta=credits,
            reason="Ahorro",
            saving_amount=amount,
            currency=currency
        )
        db.session.add(ledger)

    db.session.commit()

    return jsonify({
        "saving_event": saving_event.serialize(),
        "credits_earned": credits
    }), 201


@api.route("/rewards/balance", methods=["GET"])
def rewards_balance():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id es requerido"}), 400

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "user_id inválido"}), 400

    rows = RewardLedger.query.filter_by(user_id=user_id).all()
    total_credits = sum(r.credits_delta for r in rows)
    value_usd = round(total_credits * 0.10, 2)

    return jsonify({
        "user_id": user_id,
        "credits": total_credits,
        "value_usd": value_usd
    }), 200


@api.route("/rewards/history", methods=["GET"])
def rewards_history():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id es requerido"}), 400

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "user_id inválido"}), 400

    rows = RewardLedger.query.filter_by(user_id=user_id).order_by(RewardLedger.id.desc()).all()

    return jsonify({
        "user_id": user_id,
        "history": [r.serialize() for r in rows]
    }), 200


@api.route("/finscore", methods=["GET"])
def finscore():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id es requerido"}), 400

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "user_id inválido"}), 400

    rows = RewardLedger.query.filter_by(user_id=user_id).all()
    total_credits = sum(r.credits_delta for r in rows)

    if total_credits < 50:
        level = 1
    elif total_credits < 150:
        level = 2
    elif total_credits < 300:
        level = 3
    else:
        level = 4

    return jsonify({
        "user_id": user_id,
        "score": total_credits,
        "level": level,
        "credits": total_credits
    }), 200



@api.route("/groups", methods=["POST"])
def create_group():
    body = request.get_json() or {}
    name = (body.get("name") or "").strip()
    owner_id = body.get("owner_id")

    if not name:
        return jsonify({"error": "name es requerido"}), 400
    if not owner_id:
        return jsonify({"error": "owner_id es requerido"}), 400

    try:
        owner_id = int(owner_id)
    except ValueError:
        return jsonify({"error": "owner_id inválido"}), 400

   
    owner = User.query.get(owner_id)
    if not owner:
        return jsonify({"error": "owner_id no existe en user"}), 404

    group = Group(name=name, owner_id=owner_id)
    db.session.add(group)
    db.session.commit()

    member = GroupMember(group_id=group.id, user_id=owner_id, role="owner")
    db.session.add(member)
    db.session.commit()

    return jsonify({
        "group": group.serialize(),
        "owner_member": member.serialize()
    }), 201


@api.route("/groups", methods=["GET"])
def list_groups():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id es requerido"}), 400

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "user_id inválido"}), 400

    memberships = GroupMember.query.filter_by(user_id=user_id).all()
    group_ids = [m.group_id for m in memberships]

    if len(group_ids) == 0:
        return jsonify({"user_id": user_id, "groups": []}), 200

    groups = Group.query.filter(Group.id.in_(group_ids)).all()

    return jsonify({
        "user_id": user_id,
        "groups": [g.serialize() for g in groups]
    }), 200


@api.route("/groups/<int:group_id>/members", methods=["POST"])
def add_group_member(group_id):
    body = request.get_json() or {}
    user_id = body.get("user_id")
    role = (body.get("role") or "member").strip()

    if not user_id:
        return jsonify({"error": "user_id es requerido"}), 400

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "user_id inválido"}), 400

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user no existe"}), 404

    exists = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if exists:
        return jsonify({"error": "este usuario ya es miembro del grupo"}), 409

    member = GroupMember(group_id=group_id, user_id=user_id, role=role)
    db.session.add(member)
    db.session.commit()

    return jsonify({"member": member.serialize()}), 201


@api.route("/groups/<int:group_id>", methods=["GET"])
def get_group_detail(group_id):
    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    members = GroupMember.query.filter_by(group_id=group_id).all()
    expenses = SharedExpense.query.filter_by(group_id=group_id).order_by(SharedExpense.id.desc()).all()

    expense_ids = [e.id for e in expenses]
    splits = []
    if expense_ids:
        splits = SharedExpenseSplit.query.filter(SharedExpenseSplit.shared_expense_id.in_(expense_ids)).all()

    return jsonify({
        "group": group.serialize(),
        "members": [m.serialize() for m in members],
        "shared_expenses": [e.serialize() for e in expenses],
        "splits": [s.serialize() for s in splits]
    }), 200



@api.route("/groups/<int:group_id>/shared-expenses", methods=["POST"])
def create_shared_expense(group_id):
    body = request.get_json() or {}

    created_by = body.get("created_by")
    title = (body.get("title") or "").strip()
    total_amount = body.get("total_amount")
    currency = (body.get("currency") or "USD").upper().strip()
    split_method = (body.get("split_method") or "equal").lower().strip()

    if not created_by:
        return jsonify({"error": "created_by es requerido"}), 400
    if not title:
        return jsonify({"error": "title es requerido"}), 400
    if total_amount is None:
        return jsonify({"error": "total_amount es requerido"}), 400

    try:
        created_by = int(created_by)
    except ValueError:
        return jsonify({"error": "created_by inválido"}), 400

    try:
        total_amount = float(total_amount)
        if total_amount <= 0:
            return jsonify({"error": "total_amount debe ser > 0"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "total_amount debe ser un número"}), 400

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=created_by).first()
    if not is_member:
        return jsonify({"error": "created_by no pertenece a este grupo"}), 400

  
    try:
        splits_data = build_splits_for_expense(
            total_amount=total_amount,
            split_method=split_method,
            participants=body.get("participants"),
            splits=body.get("splits"),
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    
    split_user_ids = list({int(s["user_id"]) for s in splits_data})

    members_count = GroupMember.query.filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id.in_(split_user_ids)
    ).count()

    if members_count != len(split_user_ids):
        return jsonify({"error": "Uno o más user_id del split no pertenecen al grupo"}), 400

   
    expense = SharedExpense(
        group_id=group_id,
        created_by=created_by,
        title=title,
        total_amount=total_amount,
        currency=currency
    )

    db.session.add(expense)
    db.session.flush() 

    splits_to_create = []
    for s in splits_data:
        splits_to_create.append(
            SharedExpenseSplit(
                shared_expense_id=expense.id,
                user_id=int(s["user_id"]),
                amount=float(s["amount"])
            )
        )

    for sp in splits_to_create:
        db.session.add(sp)

    db.session.commit()

    return jsonify({
        "shared_expense": expense.serialize(),
        "splits": [sp.serialize() for sp in splits_to_create]
    }), 201


@api.route("/groups/<int:group_id>/balances", methods=["GET"])
def group_balances(group_id):
    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    
    expenses_rows = SharedExpense.query.filter_by(group_id=group_id).all()

    expenses = [
        {"id": e.id, "created_by": e.created_by, "total_amount": float(e.total_amount)}
        for e in expenses_rows
    ]

   
    expense_ids = [e["id"] for e in expenses]
    splits_rows = []
    if expense_ids:
        splits_rows = SharedExpenseSplit.query.filter(
            SharedExpenseSplit.shared_expense_id.in_(expense_ids)
        ).all()

    splits_by_expense = {}
    for s in splits_rows:
        splits_by_expense.setdefault(s.shared_expense_id, []).append({
            "user_id": s.user_id,
            "amount": float(s.amount)
        })

  
    result = calculate_group_balances(
        expenses=expenses,
        splits_by_expense=splits_by_expense
    )

    return jsonify({
        "group_id": group_id,
        **result
    }), 200