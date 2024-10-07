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
  name = db.Column(db.String(100), unique=True) # Sama nimi voi olla ongelma
  state = db.Column(db.String(50)) # Kotikunta

  def __init__(self, name, state):
    self.name = name
    self.state = state

# User Schema
class UserSchema(ma.Schema):
  class Meta:
    fields = ('id', 'name', 'state')

# Init Schema
user_schema = UserSchema()
users_schema = UserSchema(many=True)

@app.route('/user/', methods=['POST'])
def add_user():
    name = request.json['name']
    state = request.json['state']

    new_user = User(name, state)
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
  return jsonify(user)

@app.route('/user/<id>', methods=['PUT'])
def update_user(id):
  user = User.query.get(id)
  name = request.json['name']
  state = request.json['state']

  user.name = name
  user.state = state

  db.session.commit()

  return user_schema.jsonify(user)

@app.route('/user/<id>', methods=['DELETE'])
def delete_user(id):
  user = User.query.get(id)
  db.session.delete(user)

  db.session.commit()
  return jsonify(user)

if __name__ == "__main__":
  app.run(debug=True, port=8080)