from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import os

# from sqlalchemy import create_engine

app = Flask(__name__)
cors = CORS(app, origins='*') # requires fine tuning
basedir = os.path.abspath(os.path.dirname(__file__))

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)

ma = Marshmallow(app)

### TODO: Create db creation to make app portable
# engine=create_engine('sqlite:///' + os.path.join(basedir, 'db.sqlite'))
# db.Model.metadata.create_all(engine.url) # Probably needs to check if db exists(?)


class User(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(100), unique=True) # sama nimi voi olla ongelma(?)
  email = db.Column(db.String(100), unique=True)
  city = db.Column(db.String(50))
  is_old_member = db.Column(db.Boolean, default=False)
  has_paid = db.Column(db.Boolean, default=False)
  date_of_registration = db.Column(db.String(50)) # TODO: convert to db.Datetime? for now the date is in ISO string format.

  def __init__(self, name, email, city, is_old_member, has_paid, date_of_registration):
    self.name = name
    self.email = email
    self.city = city
    self.is_old_member = is_old_member
    self.has_paid = has_paid
    self.date_of_registration = date_of_registration

# User Schema
class UserSchema(ma.Schema):
  class Meta:
    fields = ('id', 'name', 'email', 'city', 'is_old_member', 'has_paid', 'date_of_registration')

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
  date_of_registration = request.json['date_of_registration'] # TODO: Timezone accuract needed

  new_user = User(name, email, city, is_old_member, has_paid, date_of_registration)
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

if __name__ == "__main__":
  app.run(debug=True, port=8080)