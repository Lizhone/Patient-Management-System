
from datetime import datetime
from getpass import getpass

from app import create_app, db
from app.models import Staff
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    print("\n--- Gentle Care Admin Setup ---")

    full_name = input("Full name: ").strip()
    username = input("Username: ").strip()
    email = input("Email: ").strip()

    password = getpass("Password (minimum 12 characters): ")
    confirm_password = getpass("Confirm password: ")

    if not full_name or not username or not email:
        print("All fields are required.")
    elif len(password) < 12:
        print("Password must contain at least 12 characters.")
    elif password != confirm_password:
        print("Passwords do not match.")
    elif Staff.query.filter(
        (Staff.Username == username) | (Staff.Email == email)
    ).first():
        print("Username or email already exists.")
    else:
        admin = Staff(
            FullName=full_name,
            Username=username,
            Email=email,
            PasswordHash=generate_password_hash(password),
            Role="ADMIN",
            IsActive=True,
            CreatedAt=datetime.now()
        )

        db.session.add(admin)
        db.session.commit()

        print("\nAdministrator account created successfully!")
        print("Username:", username)
