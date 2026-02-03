import requests
from sqlalchemy import func
from datetime import datetime, date
from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

from api.models import (
    db, User, SavingEvent, RewardLedger,
    Group, GroupMember, SharedExpense, SharedExpenseSplit,
    Gasto
)
from api.services.fx_cache import FxRateCache
from api.services.split_balance import build_splits_for_expense, calculate_group_balances

api = Blueprint("api", __name__)

fx_cache = FxRateCache(ttl_seconds=600)
FRANKFURTER_LATEST_URL = "https://api.frankfurter.app/latest"
COINGECKO_GLOBAL_URL = "https://api.coingecko.com/api/v3/global"
COINGECKO_SIMPLE_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price"


def get_current_user():
    raw = get_jwt_identity()
    if raw is None:
        return None, None

    try:
        user_id = int(raw)
    except (TypeError, ValueError):
        return None, None

    user = User.query.get(user_id)
    return user_id, user


def require_group_member(group_id: int, user_id: int):
    return GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()


def require_group_owner(group_id: int, user_id: int):
    return GroupMember.query.filter_by(group_id=group_id, user_id=user_id, role="owner").first()


def calculate_credits(amount_usd: float) -> int:
    return int(amount_usd // 10)


def is_group_owner(group_id: int, user_id: int) -> bool:
    return require_group_owner(group_id, user_id) is not None


def can_manage_shared_expense(expense: SharedExpense, user_id: int) -> bool:
    return expense.created_by == user_id or is_group_owner(expense.group_id, user_id)


def parse_iso_date(value):
    if value is None:
        return None
    if isinstance(value, date):
        return value
    s = str(value).strip()
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return None


@api.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Backend conectado ✅"}), 200



@api.route("/auth/register", methods=["POST"])
def register():
    body = request.get_json() or {}
    email = (body.get("email") or "").strip().lower()
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""

    if not email or not username or not password:
        return jsonify({"error": "email, username y password son requeridos"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email ya existe"}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username ya existe"}), 409

    user = User(
        email=email,
        username=username,
        password_hash=generate_password_hash(password),
        is_active=True,
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.serialize(), "token": token}), 201


@api.route("/auth/login", methods=["POST"])
def login():
    body = request.get_json() or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email y password son requeridos"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "credenciales inválidas"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.serialize(), "token": token}), 200


@api.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id, user = get_current_user()
    if not user_id or not user:
        return jsonify({"error": "token inválido o user no existe"}), 401
    return jsonify({"user": user.serialize()}), 200



@api.route("/fx/rates", methods=["GET"])
def fx_rates():
    base = request.args.get("base", "USD").upper().strip()
    cached = fx_cache.get(base)
    if cached:
        return jsonify({"base": base, "source": "cache", "data": cached}), 200

    try:
        r = requests.get(FRANKFURTER_LATEST_URL, params={"base": base}, timeout=10)
        r.raise_for_status()
        data = r.json()
        fx_cache.set(base, data)
        return jsonify({"base": base, "source": "api", "data": data}), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "No se pudieron obtener las tasas de cambio", "details": str(e)}), 500


@api.route("/fx/convert", methods=["GET"])
def fx_convert():
    from_currency = request.args.get("from", "USD").upper().strip()
    to_currency = request.args.get("to", "EUR").upper().strip()
    amount_raw = request.args.get("amount", "1").strip()

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
            return jsonify({"error": "No se pudo convertir (falló al obtener tasas)", "details": str(e)}), 500

    rates = cached.get("rates", {})
    rate = rates.get(to_currency)
    if rate is None:
        return jsonify({"error": f"No existe tasa para convertir de {from_currency} a {to_currency}"}), 400

    result = round(amount * rate, 2)
    return jsonify({"from": from_currency, "to": to_currency, "amount": amount, "rate": rate, "result": result}), 200



@api.route("/savings", methods=["POST"])
@jwt_required()
def create_saving():
    body = request.get_json() or {}
    user_id, user = get_current_user()
    if not user_id or not user:
        return jsonify({"error": "token inválido o user no existe"}), 401

    amount = body.get("amount")
    currency = (body.get("currency") or "USD").upper().strip()

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
            currency=currency,
        )
        db.session.add(ledger)

    db.session.commit()
    return jsonify({"saving_event": saving_event.serialize(), "credits_earned": credits}), 201


@api.route("/savings/total", methods=["GET"])
@jwt_required()
def savings_total():
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    rows = SavingEvent.query.filter_by(user_id=user_id).all()
    total = round(sum(float(r.amount) for r in rows), 2)

    return jsonify({"user_id": user_id, "total_savings": total, "currency": "USD"}), 200


@api.route("/rewards/balance", methods=["GET"])
@jwt_required()
def rewards_balance():
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    rows = RewardLedger.query.filter_by(user_id=user_id).all()
    total_credits = sum(r.credits_delta for r in rows)
    value_usd = round(total_credits * 0.10, 2)
    return jsonify({"user_id": user_id, "credits": total_credits, "value_usd": value_usd}), 200


@api.route("/rewards/history", methods=["GET"])
@jwt_required()
def rewards_history():
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    rows = RewardLedger.query.filter_by(user_id=user_id).order_by(RewardLedger.id.desc()).all()
    return jsonify({"user_id": user_id, "history": [r.serialize() for r in rows]}), 200


@api.route("/finscore", methods=["GET"])
@jwt_required()
def finscore():
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

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

    return jsonify({"user_id": user_id, "score": total_credits, "level": level, "credits": total_credits}), 200



@api.route("/groups", methods=["POST"])
@jwt_required()
def create_group():
    body = request.get_json() or {}
    name = (body.get("name") or "").strip()
    owner_id, owner = get_current_user()
    if not owner_id or not owner:
        return jsonify({"error": "token inválido o owner no existe"}), 401
    if not name:
        return jsonify({"error": "name es requerido"}), 400

    group = Group(name=name, owner_id=owner_id)
    db.session.add(group)
    db.session.commit()

    member = GroupMember(group_id=group.id, user_id=owner_id, role="owner")
    db.session.add(member)
    db.session.commit()

    return jsonify({"group": group.serialize(), "owner_member": member.serialize()}), 201


@api.route("/groups", methods=["GET"])
@jwt_required()
def list_groups():
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    memberships = GroupMember.query.filter_by(user_id=user_id).all()
    group_ids = [m.group_id for m in memberships]

    if not group_ids:
        return jsonify({"user_id": user_id, "groups": []}), 200

    groups = Group.query.filter(Group.id.in_(group_ids)).all()
    return jsonify({"user_id": user_id, "groups": [g.serialize() for g in groups]}), 200


@api.route("/groups/<int:group_id>", methods=["DELETE"])
@jwt_required()
def delete_group(group_id):
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    if not require_group_owner(group_id, user_id):
        return jsonify({"error": "Solo el owner puede eliminar el grupo"}), 403

    expenses = SharedExpense.query.filter_by(group_id=group_id).all()
    expense_ids = [e.id for e in expenses]

    if expense_ids:
        SharedExpenseSplit.query.filter(
            SharedExpenseSplit.shared_expense_id.in_(expense_ids)
        ).delete(synchronize_session=False)

    SharedExpense.query.filter_by(group_id=group_id).delete(synchronize_session=False)
    GroupMember.query.filter_by(group_id=group_id).delete(synchronize_session=False)

    db.session.delete(group)
    db.session.commit()

    return jsonify({"ok": True, "deleted_group_id": group_id}), 200


@api.route("/groups/<int:group_id>/members", methods=["POST"])
@jwt_required()
def add_group_member(group_id):
    body = request.get_json() or {}
    current_user_id, _ = get_current_user()
    if not current_user_id:
        return jsonify({"error": "token inválido"}), 401

    if not require_group_owner(group_id, current_user_id):
        return jsonify({"error": "Solo el owner puede agregar miembros"}), 403

    user_id_to_add = body.get("user_id")
    role = (body.get("role") or "member").strip()

    if not user_id_to_add:
        return jsonify({"error": "user_id es requerido"}), 400

    try:
        user_id_to_add = int(user_id_to_add)
    except ValueError:
        return jsonify({"error": "user_id inválido"}), 400

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    user = User.query.get(user_id_to_add)
    if not user:
        return jsonify({"error": "user no existe"}), 404

    exists = GroupMember.query.filter_by(group_id=group_id, user_id=user_id_to_add).first()
    if exists:
        return jsonify({"error": "este usuario ya es miembro del grupo"}), 409

    member = GroupMember(group_id=group_id, user_id=user_id_to_add, role=role)
    db.session.add(member)
    db.session.commit()
    return jsonify({"member": member.serialize()}), 201


@api.route("/groups/<int:group_id>", methods=["GET"])
@jwt_required()
def get_group_detail(group_id):
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    if not require_group_member(group_id, user_id):
        return jsonify({"error": "No perteneces a este grupo"}), 403

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
        "splits": [s.serialize() for s in splits],
    }), 200


@api.route("/groups/<int:group_id>/shared-expenses", methods=["POST"])
@jwt_required()
def create_shared_expense(group_id):
    body = request.get_json() or {}
    created_by, _ = get_current_user()
    if not created_by:
        return jsonify({"error": "token inválido"}), 401

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404
    if not require_group_member(group_id, created_by):
        return jsonify({"error": "No perteneces a este grupo"}), 403

    title = (body.get("title") or "").strip()
    total_amount = body.get("total_amount")
    currency = (body.get("currency") or "USD").upper().strip()
    split_method = (body.get("split_method") or "equal").lower().strip()

    
    if split_method == "custom":
        split_method = "amount"

    if not title:
        return jsonify({"error": "title es requerido"}), 400
    if total_amount is None:
        return jsonify({"error": "total_amount es requerido"}), 400

    try:
        total_amount = float(total_amount)
        if total_amount <= 0:
            return jsonify({"error": "total_amount debe ser > 0"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "total_amount debe ser un número"}), 400

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
        currency=currency,
        date=datetime.utcnow(),
    )
    db.session.add(expense)
    db.session.flush()

    splits_to_create = [
        SharedExpenseSplit(
            shared_expense_id=expense.id,
            user_id=int(s["user_id"]),
            amount=float(s["amount"]),
        ) for s in splits_data
    ]
    db.session.add_all(splits_to_create)
    db.session.commit()

    return jsonify({
        "shared_expense": expense.serialize(),
        "splits": [sp.serialize() for sp in splits_to_create],
    }), 201


@api.route("/groups/<int:group_id>/shared-expenses", methods=["GET"])
@jwt_required()
def list_shared_expenses(group_id):
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    if not require_group_member(group_id, user_id):
        return jsonify({"error": "No perteneces a este grupo"}), 403

    expenses = SharedExpense.query.filter_by(group_id=group_id).order_by(SharedExpense.id.desc()).all()
    expense_ids = [e.id for e in expenses]

    splits = []
    if expense_ids:
        splits = SharedExpenseSplit.query.filter(
            SharedExpenseSplit.shared_expense_id.in_(expense_ids)
        ).all()

    return jsonify({
        "group_id": group_id,
        "shared_expenses": [e.serialize() for e in expenses],
        "splits": [s.serialize() for s in splits],
    }), 200


@api.route("/groups/<int:group_id>/balances", methods=["GET"])
@jwt_required()
def group_balances(group_id):
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404
    if not require_group_member(group_id, user_id):
        return jsonify({"error": "No perteneces a este grupo"}), 403

    expenses_rows = SharedExpense.query.filter_by(group_id=group_id).all()
    expenses = [{"id": e.id, "created_by": e.created_by, "total_amount": float(e.total_amount)} for e in expenses_rows]
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
            "amount": float(s.amount),
        })

    result = calculate_group_balances(expenses=expenses, splits_by_expense=splits_by_expense)

    members = GroupMember.query.filter_by(group_id=group_id).all()
    members_payload = []
    for m in members:
        u = User.query.get(m.user_id)
        members_payload.append({
            "user_id": m.user_id,
            "role": m.role,
            "email": u.email if u else None,
            "username": u.username if u else None
        })

    return jsonify({"group_id": group_id, "members": members_payload, **result}), 200


@api.route("/groups/<int:group_id>/shared-expenses/<int:expense_id>", methods=["DELETE"])
@jwt_required()
def delete_shared_expense(group_id, expense_id):
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    if not require_group_member(group_id, user_id):
        return jsonify({"error": "No perteneces a este grupo"}), 403

    expense = SharedExpense.query.filter_by(id=expense_id, group_id=group_id).first()
    if not expense:
        return jsonify({"error": "shared_expense no existe"}), 404

    if not can_manage_shared_expense(expense, user_id):
        return jsonify({"error": "No tienes permisos para borrar este gasto"}), 403

    SharedExpenseSplit.query.filter_by(shared_expense_id=expense.id).delete(synchronize_session=False)
    db.session.delete(expense)
    db.session.commit()

    return jsonify({"ok": True, "deleted_id": expense_id}), 200


@api.route("/groups/<int:group_id>/shared-expenses/<int:expense_id>", methods=["PUT"])
@jwt_required()
def update_shared_expense(group_id, expense_id):
    body = request.get_json() or {}
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "group no existe"}), 404

    if not require_group_member(group_id, user_id):
        return jsonify({"error": "No perteneces a este grupo"}), 403

    expense = SharedExpense.query.filter_by(id=expense_id, group_id=group_id).first()
    if not expense:
        return jsonify({"error": "shared_expense no existe"}), 404

    if not can_manage_shared_expense(expense, user_id):
        return jsonify({"error": "No tienes permisos para editar este gasto"}), 403

    title = (body.get("title") or expense.title).strip()
    currency = (body.get("currency") or expense.currency).upper().strip()
    split_method = (body.get("split_method") or "equal").lower().strip()

    if split_method == "custom":
        split_method = "amount"

    total_amount_raw = body.get("total_amount", expense.total_amount)

    if not title:
        return jsonify({"error": "title es requerido"}), 400

    try:
        total_amount = float(total_amount_raw)
        if total_amount <= 0:
            return jsonify({"error": "total_amount debe ser > 0"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "total_amount debe ser un número"}), 400

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

    expense.title = title
    expense.total_amount = total_amount
    expense.currency = currency

    SharedExpenseSplit.query.filter_by(shared_expense_id=expense.id).delete(synchronize_session=False)
    new_splits = [
        SharedExpenseSplit(
            shared_expense_id=expense.id,
            user_id=int(s["user_id"]),
            amount=float(s["amount"]),
        ) for s in splits_data
    ]
    db.session.add_all(new_splits)
    db.session.commit()

    return jsonify({
        "shared_expense": expense.serialize(),
        "splits": [sp.serialize() for sp in new_splits]
    }), 200



@api.route("/gasto", methods=["GET"])
@jwt_required()
def get_gastos():
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    rows = Gasto.query.filter_by(user_id=user_id).order_by(Gasto.id.desc()).all()
    return jsonify([g.serialize() for g in rows]), 200


@api.route("/gasto/<int:gasto_id>", methods=["GET"])
@jwt_required()
def get_gasto_id(gasto_id):
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    gasto = Gasto.query.filter_by(id=gasto_id, user_id=user_id).first()
    if not gasto:
        return jsonify({"error": "Gasto no encontrado"}), 404
    return jsonify(gasto.serialize()), 200


@api.route("/gasto", methods=["POST"])
@jwt_required()
def create_gasto():
    body = request.get_json() or {}
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    gasto_txt = (body.get("gasto") or "").strip()
    tipo = (body.get("tipo") or "").strip()
    descripcion = (body.get("descripcion") or "").strip() or None
    monto = body.get("monto")
    fecha_raw = body.get("fecha")

    if not gasto_txt or not tipo:
        return jsonify({"error": "gasto y tipo son requeridos"}), 400

    try:
        monto = float(monto)
        if monto <= 0:
            return jsonify({"error": "monto debe ser > 0"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "monto inválido"}), 400

    fecha = parse_iso_date(fecha_raw)
    if not fecha:
        return jsonify({"error": "fecha inválida, usa YYYY-MM-DD"}), 400

    nuevo = Gasto(
        user_id=user_id,
        gasto=gasto_txt,
        tipo=tipo,
        descripcion=descripcion,
        monto=monto,
        fecha=fecha,
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify(nuevo.serialize()), 201


@api.route("/gasto/<int:gasto_id>", methods=["DELETE"])
@jwt_required()
def delete_gasto(gasto_id):
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    gasto = Gasto.query.filter_by(id=gasto_id, user_id=user_id).first()
    if not gasto:
        return jsonify({"error": "Gasto no encontrado"}), 404

    db.session.delete(gasto)
    db.session.commit()
    return jsonify({"ok": True, "deleted_id": gasto_id}), 200


@api.route("/gasto/<int:gasto_id>", methods=["PUT"])
@jwt_required()
def update_gasto(gasto_id):
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    gasto = Gasto.query.filter_by(id=gasto_id, user_id=user_id).first()
    if not gasto:
        return jsonify({"error": "Gasto no encontrado"}), 404

    body = request.get_json() or {}

    if "gasto" in body:
        gasto.gasto = (body.get("gasto") or "").strip() or gasto.gasto
    if "tipo" in body:
        gasto.tipo = (body.get("tipo") or "").strip() or gasto.tipo
    if "descripcion" in body:
        desc = (body.get("descripcion") or "").strip()
        gasto.descripcion = desc or None
    if "monto" in body:
        try:
            m = float(body.get("monto"))
            if m <= 0:
                return jsonify({"error": "monto debe ser > 0"}), 400
            gasto.monto = m
        except (TypeError, ValueError):
            return jsonify({"error": "monto inválido"}), 400
    if "fecha" in body:
        f = parse_iso_date(body.get("fecha"))
        if not f:
            return jsonify({"error": "fecha inválida, usa YYYY-MM-DD"}), 400
        gasto.fecha = f

    db.session.commit()
    return jsonify(gasto.serialize()), 200

# actualizo nueva api

def month_start_utc(dt: datetime):
    return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

@api.route("/market", methods=["GET"])
@jwt_required()
def market():
  
   
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    out = {"source": "live", "fx": {}, "crypto": {}}

   
    try:
        r = requests.get(FRANKFURTER_LATEST_URL, params={"base": "USD"}, timeout=10)
        r.raise_for_status()
        data = r.json()
        usd_eur = data.get("rates", {}).get("EUR")
        out["fx"]["usd_eur"] = round(float(usd_eur), 4) if usd_eur else None
        
        out["fx"]["eur_usd"] = round(1 / float(usd_eur), 4) if usd_eur else None
    except Exception as e:
        out["fx"]["error"] = str(e)

    
    try:
        params = {
            "ids": "bitcoin,ethereum",
            "vs_currencies": "usd",
            "include_24hr_change": "true",
        }
        r = requests.get(COINGECKO_SIMPLE_PRICE_URL, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()

        btc = data.get("bitcoin", {})
        eth = data.get("ethereum", {})
        out["crypto"]["btc_usd"] = round(float(btc.get("usd", 0)), 2) if btc.get("usd") else None
        out["crypto"]["btc_24h"] = round(float(btc.get("usd_24h_change", 0)), 2) if "usd_24h_change" in btc else None
        out["crypto"]["eth_usd"] = round(float(eth.get("usd", 0)), 2) if eth.get("usd") else None
        out["crypto"]["eth_24h"] = round(float(eth.get("usd_24h_change", 0)), 2) if "usd_24h_change" in eth else None

       
        try:
            rg = requests.get(COINGECKO_GLOBAL_URL, timeout=10)
            rg.raise_for_status()
            g = rg.json().get("data", {})
            out["crypto"]["btc_dominance"] = round(float(g.get("market_cap_percentage", {}).get("btc", 0)), 2)
        except Exception:
            pass

    except Exception as e:
        out["crypto"]["error"] = str(e)

    return jsonify(out), 200


@api.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
   
    user_id, _ = get_current_user()
    if not user_id:
        return jsonify({"error": "token inválido"}), 401

    now = datetime.utcnow()
    start_month = month_start_utc(now)

    
    gastos_total = db.session.query(func.coalesce(func.sum(Gasto.monto), 0.0)).filter(
        Gasto.user_id == user_id
    ).scalar()

    
    start_month_date = start_month.date()

    gastos_mes = db.session.query(func.coalesce(func.sum(Gasto.monto), 0.0)).filter(
        Gasto.user_id == user_id,
        Gasto.fecha >= start_month_date
    ).scalar()

    
    ahorros_total = db.session.query(func.coalesce(func.sum(SavingEvent.amount), 0.0)).filter(
        SavingEvent.user_id == user_id
    ).scalar()

    ahorros_mes = db.session.query(func.coalesce(func.sum(SavingEvent.amount), 0.0)).filter(
        SavingEvent.user_id == user_id,
        SavingEvent.created_at >= start_month  
    ).scalar()

    
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

    
    gastos_tipo_rows = db.session.query(
        Gasto.tipo,
        func.coalesce(func.sum(Gasto.monto), 0.0)
    ).filter(
        Gasto.user_id == user_id
    ).group_by(Gasto.tipo).all()

    gastos_por_tipo = [{"tipo": t or "Otros", "total": float(s)} for (t, s) in gastos_tipo_rows]

    
    last_rows = Gasto.query.filter_by(user_id=user_id).order_by(Gasto.fecha.desc()).limit(500).all()
    bucket = {}
    for g in last_rows:
        if not g.fecha:
            continue
        key = g.fecha.strftime("%Y-%m")
        bucket[key] = bucket.get(key, 0.0) + float(g.monto or 0.0)

    months_sorted = sorted(bucket.keys())[-6:]
    gastos_por_mes = [{"month": m, "total": round(bucket[m], 2)} for m in months_sorted]

    
    memberships = GroupMember.query.filter_by(user_id=user_id).all()
    group_ids = [m.group_id for m in memberships]
    groups_out = []

    if group_ids:
        groups = Group.query.filter(Group.id.in_(group_ids)).all()

        for g in groups:
           
            expenses_rows = SharedExpense.query.filter_by(group_id=g.id).all()
            expenses = [{"id": e.id, "created_by": e.created_by, "total_amount": float(e.total_amount)} for e in expenses_rows]
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
                    "amount": float(s.amount),
                })

            result = calculate_group_balances(expenses=expenses, splits_by_expense=splits_by_expense)
            net_map = result.get("net", {})  # keys pueden ser str
            net_me = net_map.get(str(user_id), 0) if isinstance(net_map, dict) else 0

            
            suggested = None
            for tr in result.get("transfers", []):
                if tr.get("from_user_id") == user_id or tr.get("to_user_id") == user_id:
                    suggested = tr
                    break

            groups_out.append({
                "group_id": g.id,
                "name": g.name,
                "net_me": float(net_me),
                "suggested_transfer": suggested
            })

    payload = {
        "totals": {
            "gastos_total": float(gastos_total or 0),
            "gastos_mes": float(gastos_mes or 0),
            "ahorros_total": float(ahorros_total or 0),
            "ahorros_mes": float(ahorros_mes or 0),
            "credits": int(total_credits),
            "finscore_level": int(level),
        },
        "groups": groups_out,
        "charts": {
            "gastos_por_tipo": gastos_por_tipo,
            "gastos_por_mes": gastos_por_mes,
        }
    }

    return jsonify(payload), 200