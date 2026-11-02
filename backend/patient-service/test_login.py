
import requests
from getpass import getpass

url = "http://127.0.0.1:5000/api/login"

username = input("Enter username: ")
password = getpass("Enter password: ")

response = requests.post(
    url,
    json={
        "username": username,
        "password": password
    }
)

print("\nStatus Code:", response.status_code)
print("Response:", response.json())
