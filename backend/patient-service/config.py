
from urllib.parse import quote_plus
import os

class Config:

    # SQL Server Configuration
    DB_SERVER = r"LAPTOP-C2KQL5SD\SQLEXPRESS"
    DB_NAME = "GentleCareDB"
    DB_DRIVER = "ODBC Driver 17 for SQL Server"

    connection_string = (
        f"DRIVER={{{DB_DRIVER}}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_NAME};"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )

    SQLALCHEMY_DATABASE_URI = (
        "mssql+pyodbc:///?odbc_connect="
        + quote_plus(connection_string)
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Authentication Configuration
    SECRET_KEY = os.environ.get(
        "FLASK_SECRET_KEY",
        "gentle-care-development-secret"
    )

    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY",
        "gentle-care-jwt-development-secret"
    )

    JWT_ACCESS_TOKEN_EXPIRES = 3600
