
from app import db


class Staff(db.Model):

    __tablename__ = "Staff"

    StaffId = db.Column(db.Integer, primary_key=True)
    FullName = db.Column(db.String(100), nullable=False)
    Username = db.Column(db.String(100), nullable=False, unique=True)
    Email = db.Column(db.String(150), nullable=False, unique=True)
    PasswordHash = db.Column(db.String(255), nullable=False)
    Role = db.Column(db.String(30), nullable=False)
    IsActive = db.Column(db.Boolean, nullable=False)
    CreatedAt = db.Column(db.DateTime, nullable=False)


class Patient(db.Model):

    __tablename__ = "Patients"

    PatientId = db.Column(db.Integer, primary_key=True)
    FullName = db.Column(db.String(150), nullable=False)
    DateOfBirth = db.Column(db.Date, nullable=False)
    Gender = db.Column(db.String(20), nullable=False)
    BloodGroup = db.Column(db.String(5), nullable=True)
    Phone = db.Column(db.String(20), nullable=False)
    Email = db.Column(db.String(150), nullable=True)
    Address = db.Column(db.String(500), nullable=False)
    City = db.Column(db.String(100), nullable=False)
    EmergencyContact = db.Column(db.String(20), nullable=True)
    MedicalHistory = db.Column(db.Text, nullable=True)

    CreatedAt = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("GETDATE()")
    )

    IsViewed = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        server_default=db.text("0")
    )


class Bill(db.Model):

    __tablename__ = "Bills"

    BillId = db.Column(db.Integer, primary_key=True)

    PatientId = db.Column(
        db.Integer,
        db.ForeignKey("Patients.PatientId"),
        nullable=False
    )

    Description = db.Column(db.String(500), nullable=False)

    Amount = db.Column(db.Numeric(10, 2), nullable=False)

    PaymentStatus = db.Column(db.String(30), nullable=False)

    PaymentMethod = db.Column(db.String(30), nullable=True)

    BillDate = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("GETDATE()")
    )

    patient = db.relationship("Patient", backref="bills")
