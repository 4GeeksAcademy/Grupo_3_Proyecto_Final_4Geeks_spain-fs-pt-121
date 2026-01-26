"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint
from api.models import db, User, Gasto, FavoritoGasto
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError

api = Blueprint('api', __name__)
CORS(api)


@api.route('/hello', methods=['GET'])
def handle_hello():
    return jsonify({"message": "API funcionando"}), 200


@api.route('/user', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([u.serialize() for u in users]), 200


@api.route('/gasto', methods=['GET'])
def get_gastos():
    gastos = Gasto.query.all()
    return jsonify([g.serialize() for g in gastos]), 200


@api.route('/gasto/<int:gasto_id>', methods=['GET'])
def get_gasto_id(gasto_id):
    gasto = Gasto.query.get(gasto_id)
    if not gasto:
        return jsonify({"msg": "Gasto não encontrado"}), 404

    return jsonify(gasto.serialize()), 200


@api.route('/user/<int:user_id>/favoritos', methods=['GET'])
def get_user_favoritos(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    favoritos = [f.gasto.serialize() for f in user.favoritos_gasto]

    return jsonify({
        "user_id": user.id,
        "favoritos": favoritos
    }), 200


@api.route('/user/<int:user_id>/favoritos/gasto/<int:gasto_id>', methods=['POST'])
def add_favorito_gasto(user_id, gasto_id):

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    gasto = Gasto.query.get(gasto_id)
    if not gasto:
        return jsonify({"msg": "Gasto não encontrado"}), 404

    try:
        favorito = FavoritoGasto(user_id=user_id, gasto_id=gasto_id)
        db.session.add(favorito)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Esse gasto já está nos favoritos"}), 409

    return jsonify({"msg": "Gasto adicionado aos favoritos"}), 201


@api.route('/gasto', methods=['POST'])
def create_gasto():
    body = request.get_json()

    if body is None:
        return jsonify({"error": "Body is empty"}), 400

    nuevo = Gasto(
        gasto=body.get("gasto"),
        tipo=body.get("tipo"),
        descripcion=body.get("descripcion"),
        monto=body.get("monto"),
        fecha=body.get("fecha")
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify(nuevo.serialize()), 201


@api.route('/gasto/<int:id>', methods=['DELETE'])
def delete_gasto(id):
    gasto = Gasto.query.get(id)

    if gasto is None:
        return jsonify({"error": "Gasto não encontrado"}), 404

    db.session.delete(gasto)
    db.session.commit()

    return jsonify({"msg": "Gasto deletado com sucesso"}), 200


@api.route('/gasto/<int:id>', methods=['PUT'])
def update_gasto(id):
    gasto = Gasto.query.get(id)

    if gasto is None:
        return jsonify({"error": "Gasto não encontrado"}), 404

    body = request.get_json()

    gasto.gasto = body.get("gasto", gasto.gasto)
    gasto.tipo = body.get("tipo", gasto.tipo)
    gasto.descripcion = body.get("descripcion", gasto.descripcion)
    gasto.monto = body.get("monto", gasto.monto)
    gasto.fecha = body.get("fecha", gasto.fecha)

    db.session.commit()

    return jsonify(gasto.serialize()), 200
