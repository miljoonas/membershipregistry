from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import os

app = Flask(__name__)

# Configure CORS with specific methods and headers
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], supports_credentials=True)

basedir = os.path.abspath(os.path.dirname(__file__))

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key'

db = SQLAlchemy(app)
ma = Marshmallow(app)
jwt = JWTManager(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100), nullable=True)  # Password can be null
    city = db.Column(db.String(50))
    is_old_member = db.Column(db.Boolean, default=False)
    has_paid = db.Column(db.Boolean, default=False)
    date_of_registration = db.Column(db.String(50))

    def __init__(self, name, email, city, is_old_member=False, has_paid=False, date_of_registration=None, password=None):
        self.name = name
        self.email = email
        self.password = password
        self.city = city
        self.is_old_member = is_old_member
        self.has_paid = has_paid
        self.date_of_registration = date_of_registration

# User Schema
class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'email', 'city', 'is_old_member', 'has_paid', 'date_of_registration')

user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Create a new user
@app.route('/user/', methods=['POST'])
def add_user():
    data = request.json
    new_user = User(
        name=data['name'],
        email=data['email'],
        city=data['city'],
        is_old_member=data.get('is_old_member', False),
        has_paid=data.get('has_paid', False),
        date_of_registration=data['date_of_registration']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

# Login route for authentication
@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')
    user = User.query.filter_by(email=email).first()
    # Only allow login if user has a password
    if user and user.password and user.password == password:
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Bad email or password"}), 401

# Get all users (protected route)
@app.route('/user/', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    all_users = User.query.all()
    result = users_schema.dump(all_users)
    return jsonify(result)

# Update a user by ID (protected route)
@app.route('/user/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)
    user.city = data.get("city", user.city)
    user.is_old_member = data.get("is_old_member", user.is_old_member)
    user.has_paid = data.get("has_paid", user.has_paid)

    db.session.commit()
    return user_schema.jsonify(user), 200

# Delete a user by ID (protected route)
@app.route('/user/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"})

# Function to create an initial admin account if it doesn't exist
def create_admin_account():
    admin_email = "admin@example.com"
    existing_admin = User.query.filter_by(email=admin_email).first()
    if not existing_admin:
        admin_user = User(
            name="Admin",
            email=admin_email,
            password="securepassword",  # Only admin has a password
            city="Headquarters",
            is_old_member=True,
            has_paid=True,
            date_of_registration="2024-01-01T00:00:00Z"
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin account created.")
    else:
        print("Admin account already exists.")


# Run the admin creation function at startup
with app.app_context():
    db.create_all()
    create_admin_account()

if __name__ == "__main__":
    app.run(debug=True, port=8080)
