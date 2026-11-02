
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token

from app import db
from app.models import Staff, Patient, Bill
main_bp = Blueprint("main", __name__)


# ==========================================
# HEALTH CHECK
# ==========================================

@main_bp.route("/health", methods=["GET"])
def health_check():

    return jsonify({
        "status": "success",
        "message": "Gentle Care API is running"
    }), 200


# ==========================================
# STAFF LOGIN
# ==========================================

@main_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "status": "error",
            "message": "Username and password are required"
        }), 400

    staff = Staff.query.filter_by(
        Username=username
    ).first()

    if not staff or not staff.IsActive:
        return jsonify({
            "status": "error",
            "message": "Invalid username or password"
        }), 401

    if not check_password_hash(staff.PasswordHash, password):
        return jsonify({
            "status": "error",
            "message": "Invalid username or password"
        }), 401

    token = create_access_token(
        identity=str(staff.StaffId)
    )

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "access_token": token,
        "staff": {
            "id": staff.StaffId,
            "name": staff.FullName,
            "username": staff.Username,
            "role": staff.Role
        }
    }), 200


# ==========================================
# ADD NEW PATIENT
# ==========================================

@main_bp.route("/patients", methods=["POST"])
def add_patient():

    data = request.get_json(silent=True) or {}

    required_fields = [
        "fullName",
        "dateOfBirth",
        "gender",
        "phone",
        "address",
        "city"
    ]

    for field in required_fields:

        if not str(data.get(field) or "").strip():

            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    try:

        patient = Patient(

            FullName=data["fullName"].strip(),

            DateOfBirth=data["dateOfBirth"],

            Gender=data["gender"],

            BloodGroup=data.get("bloodGroup") or None,

            Phone=data["phone"].strip(),

            Email=data.get("email") or None,

            Address=data["address"].strip(),

            City=data["city"].strip(),

            EmergencyContact=data.get("emergencyContact") or None,

            MedicalHistory=data.get("medicalHistory") or None,

            IsViewed=False
        )

        db.session.add(patient)
        db.session.commit()

        return jsonify({

            "status": "success",

            "message": "Patient registered successfully",

            "patient": {
                "patientId": patient.PatientId,
                "fullName": patient.FullName,
                "phone": patient.Phone
            }

        }), 201

    except Exception as error:

        db.session.rollback()

        print("Patient registration error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to save patient. Please try again."
        }), 500


# ==========================================
# GET ALL PATIENTS + DASHBOARD COUNTS
# ==========================================

@main_bp.route("/patients", methods=["GET"])
def get_patients():

    try:

        patients = Patient.query.order_by(
            Patient.PatientId.desc()
        ).all()

        total_patients = Patient.query.count()

        recent_patients = Patient.query.filter_by(
            IsViewed=False
        ).count()

        active_records = total_patients

        patient_list = []

        for patient in patients:

            patient_list.append({

                "patientId": patient.PatientId,

                "fullName": patient.FullName,

                "dateOfBirth": (
                    patient.DateOfBirth.isoformat()
                    if patient.DateOfBirth else None
                ),

                "gender": patient.Gender,

                "bloodGroup": patient.BloodGroup,

                "phone": patient.Phone,

                "email": patient.Email,

                "address": patient.Address,

                "city": patient.City,

                "emergencyContact": patient.EmergencyContact,

                "medicalHistory": patient.MedicalHistory,

                "isViewed": patient.IsViewed,

                "createdAt": (
                    patient.CreatedAt.isoformat()
                    if patient.CreatedAt else None
                )
            })

        return jsonify({

            "status": "success",

            "total": total_patients,

            "recent": recent_patients,

            "activeRecords": active_records,

            "patients": patient_list

        }), 200

    except Exception as error:

        print("Get patients error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to retrieve patients"
        }), 500


# ==========================================
# GET SINGLE PATIENT DETAILS
# ==========================================

@main_bp.route("/patients/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):

    try:

        patient = db.session.get(Patient, patient_id)

        if not patient:

            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        return jsonify({

            "status": "success",

            "patient": {

                "patientId": patient.PatientId,

                "fullName": patient.FullName,

                "dateOfBirth": (
                    patient.DateOfBirth.isoformat()
                    if patient.DateOfBirth else None
                ),

                "gender": patient.Gender,

                "bloodGroup": patient.BloodGroup,

                "phone": patient.Phone,

                "email": patient.Email,

                "address": patient.Address,

                "city": patient.City,

                "emergencyContact": patient.EmergencyContact,

                "medicalHistory": patient.MedicalHistory,

                "isViewed": patient.IsViewed,

                "createdAt": (
                    patient.CreatedAt.isoformat()
                    if patient.CreatedAt else None
                )
            }

        }), 200

    except Exception as error:

        print("Get patient details error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to retrieve patient details"
        }), 500


# ==========================================
# MARK PATIENT RECORD AS VIEWED
# ==========================================

@main_bp.route("/patients/<int:patient_id>/viewed", methods=["PUT"])
def mark_patient_viewed(patient_id):

    try:

        patient = db.session.get(Patient, patient_id)

        if not patient:

            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        patient.IsViewed = True

        db.session.commit()

        return jsonify({

            "status": "success",

            "message": "Patient record marked as viewed",

            "patientId": patient.PatientId,

            "isViewed": patient.IsViewed

        }), 200

    except Exception as error:

        db.session.rollback()

        print("Mark patient viewed error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to update patient record"
        }), 500

# ==========================================
# UPDATE PATIENT DETAILS
# ==========================================

@main_bp.route("/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):

    data = request.get_json(silent=True) or {}

    try:
        patient = db.session.get(Patient, patient_id)

        if not patient:
            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        required_fields = [
            "fullName",
            "dateOfBirth",
            "gender",
            "phone",
            "address",
            "city"
        ]

        for field in required_fields:
            if not str(data.get(field) or "").strip():
                return jsonify({
                    "status": "error",
                    "message": f"{field} is required"
                }), 400

        patient.FullName = data["fullName"].strip()
        patient.DateOfBirth = data["dateOfBirth"]
        patient.Gender = data["gender"]
        patient.BloodGroup = data.get("bloodGroup") or None
        patient.Phone = data["phone"].strip()
        patient.Email = data.get("email") or None
        patient.Address = data["address"].strip()
        patient.City = data["city"].strip()
        patient.EmergencyContact = data.get("emergencyContact") or None
        patient.MedicalHistory = data.get("medicalHistory") or None

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Patient information updated successfully",
            "patientId": patient.PatientId
        }), 200

    except Exception as error:
        db.session.rollback()
        print("Update patient error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to update patient information"
        }), 500


# ==========================================
# DELETE PATIENT
# ==========================================

@main_bp.route("/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):

    try:
        patient = db.session.get(Patient, patient_id)

        if not patient:
            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        db.session.delete(patient)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Patient record deleted successfully",
            "patientId": patient_id
        }), 200

    except Exception as error:
        db.session.rollback()
        print("Delete patient error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to delete patient record"
        }), 500
        

# ==========================================
# BILLING - HELPER
# ==========================================

def serialize_bill(bill):
    return {
        "billId": bill.BillId,
        "patientId": bill.PatientId,
        "patientName": bill.patient.FullName,
        "description": bill.Description,
        "amount": float(bill.Amount),
        "paymentStatus": bill.PaymentStatus,
        "paymentMethod": bill.PaymentMethod,
        "billDate": (
            bill.BillDate.isoformat()
            if bill.BillDate else None
        )
    }


# ==========================================
# CREATE NEW BILL
# ==========================================

@main_bp.route("/bills", methods=["POST"])
def create_bill():

    data = request.get_json(silent=True) or {}

    patient_id = data.get("patientId")
    description = str(data.get("description") or "").strip()
    payment_status = str(data.get("paymentStatus") or "").strip()
    payment_method = str(data.get("paymentMethod") or "").strip() or None

    if not patient_id or not description or not data.get("amount"):
        return jsonify({
            "status": "error",
            "message": "Patient, description and amount are required"
        }), 400

    if payment_status not in ["Paid", "Pending", "Partially Paid"]:
        return jsonify({
            "status": "error",
            "message": "Invalid payment status"
        }), 400

    try:
        amount = float(data["amount"])

        if amount <= 0:
            raise ValueError("Amount must be greater than zero")

        patient = db.session.get(Patient, int(patient_id))

        if not patient:
            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        bill = Bill(
            PatientId=patient.PatientId,
            Description=description,
            Amount=amount,
            PaymentStatus=payment_status,
            PaymentMethod=payment_method
        )

        db.session.add(bill)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Bill created successfully",
            "bill": serialize_bill(bill)
        }), 201

    except (ValueError, TypeError):
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Please enter a valid amount and patient ID"
        }), 400

    except Exception as error:
        db.session.rollback()
        print("Create bill error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to create bill"
        }), 500


# ==========================================
# GET ALL BILLS
# ==========================================

@main_bp.route("/bills", methods=["GET"])
def get_bills():

    try:
        bills = Bill.query.order_by(
            Bill.BillId.desc()
        ).all()

        return jsonify({
            "status": "success",
            "totalBills": len(bills),
            "bills": [
                serialize_bill(bill)
                for bill in bills
            ]
        }), 200

    except Exception as error:
        print("Get bills error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to retrieve bills"
        }), 500


# ==========================================
# GET BILLS FOR ONE PATIENT
# ==========================================

@main_bp.route("/patients/<int:patient_id>/bills", methods=["GET"])
def get_patient_bills(patient_id):

    try:
        patient = db.session.get(Patient, patient_id)

        if not patient:
            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        bills = Bill.query.filter_by(
            PatientId=patient_id
        ).order_by(
            Bill.BillId.desc()
        ).all()

        return jsonify({
            "status": "success",
            "patientId": patient_id,
            "patientName": patient.FullName,
            "totalBills": len(bills),
            "bills": [
                serialize_bill(bill)
                for bill in bills
            ]
        }), 200

    except Exception as error:
        print("Get patient bills error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to retrieve patient bills"
        }), 500


# ==========================================
# UPDATE BILL PAYMENT STATUS
# ==========================================

@main_bp.route("/bills/<int:bill_id>/status", methods=["PUT"])
def update_bill_status(bill_id):

    data = request.get_json(silent=True) or {}

    payment_status = str(
        data.get("paymentStatus") or ""
    ).strip()

    allowed_statuses = [
        "Paid",
        "Pending",
        "Partially Paid"
    ]

    if payment_status not in allowed_statuses:
        return jsonify({
            "status": "error",
            "message": "Invalid payment status"
        }), 400

    try:
        bill = db.session.get(Bill, bill_id)

        if not bill:
            return jsonify({
                "status": "error",
                "message": "Bill not found"
            }), 404

        bill.PaymentStatus = payment_status

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Payment status updated successfully",
            "bill": serialize_bill(bill)
        }), 200

    except Exception as error:
        db.session.rollback()
        print("Update bill status error:", error)

        return jsonify({
            "status": "error",
            "message": "Unable to update payment status"
        }), 500

