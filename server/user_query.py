# just for debugging
from main import app, db, User

with app.app_context():
    # Query the admin user
    user = User.query.filter_by(email="admin@example.com").first()
    if user:
        print(f"User ID: {user.id}")
        print(f"Name: {user.name}")
        print(f"Email: {user.email}")
        print(f"City: {user.city}")
        print(f"Is Old Member: {user.is_old_member}")
        print(f"Has Paid: {user.has_paid}")
        print(f"Date of Registration: {user.date_of_registration}")
        print(f"Password: {user.password}")
    else:
        print("Admin user not found.")