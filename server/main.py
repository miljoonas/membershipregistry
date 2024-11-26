import csv
from io import StringIO
from io import BytesIO
from flask import send_file
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from werkzeug.security import generate_password_hash, check_password_hash

# from sqlalchemy import create_engine

app = Flask(__name__)
cors = CORS(app, origins='*')  # requires fine tuning
basedir = os.path.abspath(os.path.dirname(__file__))

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = 'secret_key'

db = SQLAlchemy(app)
ma = Marshmallow(app)
jwt = JWTManager(app)

# TODO: Create db creation to make app portable
# engine=create_engine('sqlite:///' + os.path.join(basedir, 'db.sqlite'))
# db.Model.metadata.create_all(engine.url) # Probably needs to check if db exists(?)


class User(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(100), unique=True)
  email = db.Column(db.String(100), unique=True)
  city = db.Column(db.String(50))
  is_old_member = db.Column(db.Boolean, default=False)
  has_paid = db.Column(db.Boolean, default=False)
  date_of_registration = db.Column(db.String(50))
  password = db.Column(db.String(100), nullable=True)

  def __init__(self, name, email, city, is_old_member, has_paid, date_of_registration, password=None):
    self.name = name
    self.email = email
    self.city = city
    self.is_old_member = is_old_member
    self.has_paid = has_paid
    self.date_of_registration = date_of_registration
    self.password = password

# User Schema


class UserSchema(ma.Schema):
  class Meta:
    fields = ('id', 'name', 'email', 'city', 'is_old_member',
              'has_paid', 'date_of_registration')


# Init Schema
user_schema = UserSchema()
users_schema = UserSchema(many=True)


@app.route('/user/', methods=['POST'])
def add_user():
  name = request.json['name']
  email = request.json['email']
  city = request.json['city']
  is_old_member = request.json.get('is_old_member', False)
  has_paid = request.json.get('has_paid', False)
  date_of_registration = request.json['date_of_registration']

  new_user = User(name, email, city, is_old_member,
                  has_paid, date_of_registration)
  db.session.add(new_user)
  db.session.commit()

  return user_schema.jsonify(new_user)


@app.route('/user/', methods=['GET'])
def get_users():
  all_users = User.query.all()
  result = users_schema.dump(all_users)
  return jsonify(result)


@app.route('/user/<id>', methods=['GET'])
def get_user(id):
  user = User.query.get(id)
  return user_schema.jsonify(user)


@app.route('/user/<id>', methods=['PUT'])
def update_user(id):
  # TODO: User not found

  # TODO: improvement: use data = request.json to shorten the code

  user = User.query.get(id)
  name = request.json['name']
  email = request.json['email']
  city = request.json['city']
  is_old_member = request.json.get('is_old_member', user.is_old_member)
  has_paid = request.json.get('has_paid', user.has_paid)

  user.name = name
  user.email = email
  user.city = city
  user.is_old_member = is_old_member
  user.has_paid = has_paid

  db.session.commit()

  return user_schema.jsonify(user)


@app.route('/user/<id>', methods=['DELETE'])
def delete_user(id):
  user = User.query.get(id)
  if not user:
    return jsonify({"error": "User not found"}), 404

  db.session.delete(user)
  db.session.commit()
  return jsonify({"message": "User deleted successfully"})


@app.route('/auth', methods=['POST'])
def auth():
  email = request.json.get('email')
  password = request.json.get('password')
  user = User.query.filter_by(email=email).first()
  # Only allow login if user has a password
  if user and user.password and user.password == password:
    access_token = create_access_token(identity=user.id)
    return jsonify({"message": "Login successful", "token": access_token}), 200
  return jsonify({"message": "Invalid email or password"})
  # if status code 401 is returned for axios sees it as error


def create_admin_account():
  admin_email = "admin@test.com"
  existing_admin = User.query.filter_by(email=admin_email).first()
  if not existing_admin:
    admin_user = User(
        name="Admin",
        email=admin_email,
        password="password",  # Only admin has a password
        city="Espoo",
        is_old_member=True,
        has_paid=True,
        date_of_registration="2024-01-01T00:00:00Z"
    )
    db.session.add(admin_user)
    db.session.commit()
    access_token = create_access_token(identity=admin_user.id)
    print("Admin account created.")
  else:
    print("Admin account already exists.")

@app.route('/import_users', methods=['POST'])
def import_users():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        stream = StringIO(file.stream.read().decode("UTF8"))
        csv_reader = csv.DictReader(stream)

        for row in csv_reader:
            name = row.get('name')
            email = row.get('email')
            city = row.get('city')
            is_old_member = row.get('is_old_member', 'False').lower() == 'true'
            has_paid = row.get('has_paid', 'False').lower() == 'true'
            date_of_registration = row.get('date_of_registration')
            password = row.get('password', None)

            if not User.query.filter_by(email=email).first():
                new_user = User(
                    name=name,
                    email=email,
                    city=city,
                    is_old_member=is_old_member,
                    has_paid=has_paid,
                    date_of_registration=date_of_registration,
                    password=password
                )
                db.session.add(new_user)

        db.session.commit()
        return jsonify({"message": "Users imported successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/export_users', methods=['GET'])
def export_users():
    try:
        users = User.query.all()

        # Use StringIO for text processing
        string_io = StringIO()
        writer = csv.writer(string_io)

        # Write CSV header
        writer.writerow(['id', 'name', 'email', 'city', 'is_old_member', 'has_paid', 'date_of_registration', 'password'])

        # Write data rows
        for user in users:
            writer.writerow([
                user.id,
                user.name,
                user.email,
                user.city,
                user.is_old_member,
                user.has_paid,
                user.date_of_registration,
                user.password or ''  # Avoid None values
            ])

        # Convert StringIO data to bytes
        string_io.seek(0)
        csv_data = string_io.getvalue().encode('utf-8')  # Encode as UTF-8
        string_io.close()

        # Use BytesIO to send the file as binary
        return send_file(
            BytesIO(csv_data),
            mimetype="text/csv",
            as_attachment=True,
            download_name="users.csv"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# @app.route('/verify', methods=['POST'])
# @jwt_required()
# def verify():
#   user_id = get_jwt_identity()
#   user = User.query.get(user_id)
#   if user:
#     return jsonify({"status": "logged in", "message": "success"}), 200
#   else:
#     return jsonify({"status": "invalid auth", "message": "error"}), 401


# @app.route('/check-account', methods=['POST'])
# def check_account():
#   email = request.json.get('email')
#   user = User.query.filter_by(email=email).first()
#   return jsonify({
#       "status": "User exists" if user else "User does not exist",
#       "userExists": bool(user),
#   }), 200


# Run the admin creation function at startup
with app.app_context():
  db.create_all()
  create_admin_account()

if __name__ == "__main__":
  app.run(debug=True, port=8080)
