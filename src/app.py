"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_mail import Mail, Message
from flask_migrate import Migrate
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required


app = Flask(__name__)
CORS(app)

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"

static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), "../dist/")

app.url_map.strict_slashes = False


db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////tmp/test.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


app.config["JWT_SECRET_KEY"] = os.getenv("FLASK_APP_KEY", "dev-key")
jwt = JWTManager(app)


MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)


setup_admin(app)
setup_commands(app)


app.register_blueprint(api, url_prefix="/api")


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = "rf.control.financiero@gmail.com"
app.config['MAIL_PASSWORD'] = "nvqi rrqj ivru scqn"

mail = Mail(app)

app.config["JWT_SECRET_KEY"] = "Cl@aveSecr&etaDelAdmini$strad0r!"
jwt = JWTManager(app)

@app.route("/reset-contrasena", methods=["POST"])
def reset_contrasena():
    email = request.json.get('email', None)
    
    token = create_access_token(identity=email)

    msg = Message(subject='Recuperar tu Contraseña', sender='rf.control.financiero@gmail.com', recipients=[email])
    msg.body = 'Dale click para resetear la contraseña:  ' + os.getenv("VITE_FRONTEND_URL") + '/resetear?token=' + token
    mail.send(msg)

    return jsonify({"success": True}), 200

@app.route("/change-contrasena", methods=["POST"])
@jwt_required()
def change_contrasena():
    password = request.json.get("password, none")
    email = get_jwt_identity()

    user = User.query.filter_by(email=email).first()
    if user is None:
        return jsonify({'msg': 'Usuario no existe!'})

    user.password = password
    db.session.add(user)
    db.session.commit()

    return jsonify({"success": True}), 200

@app.route("/")
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, "index.html")


@app.route("/<path:path>", methods=["GET"])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = "index.html"
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response


if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=PORT, debug=True)
