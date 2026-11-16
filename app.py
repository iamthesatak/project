from __future__ import annotations

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Demo data lives in memory so the prototype works immediately without a database.
EMPLOYEES = [
    {"id": 1, "name": "Aarav Mehta", "title": "Chief Executive Officer", "department": "Executive", "level": "Executive", "manager_id": None, "email": "aarav.mehta@northstar.example", "location": "Mumbai", "bio": "Sets company direction and builds a culture where people can do their best work.", "color": "violet"},
    {"id": 2, "name": "Priya Nair", "title": "Chief People Officer", "department": "People & Culture", "level": "Leadership", "manager_id": 1, "email": "priya.nair@northstar.example", "location": "Mumbai", "bio": "Leads people strategy, talent development, and a thoughtful employee experience.", "color": "rose"},
    {"id": 3, "name": "Kabir Shah", "title": "Chief Technology Officer", "department": "Technology", "level": "Leadership", "manager_id": 1, "email": "kabir.shah@northstar.example", "location": "Bengaluru", "bio": "Guides technology strategy and the teams building our products.", "color": "blue"},
    {"id": 4, "name": "Ananya Rao", "title": "VP, Talent Acquisition", "department": "People & Culture", "level": "Management", "manager_id": 2, "email": "ananya.rao@northstar.example", "location": "Mumbai", "bio": "Helps teams find and welcome people who will thrive here.", "color": "amber"},
    {"id": 5, "name": "Rohan Iyer", "title": "VP, People Operations", "department": "People & Culture", "level": "Management", "manager_id": 2, "email": "rohan.iyer@northstar.example", "location": "Pune", "bio": "Makes core people processes clear, dependable, and employee-friendly.", "color": "teal"},
    {"id": 6, "name": "Meera Kapoor", "title": "Engineering Director", "department": "Technology", "level": "Management", "manager_id": 3, "email": "meera.kapoor@northstar.example", "location": "Bengaluru", "bio": "Builds high-performing engineering teams and reliable systems.", "color": "blue"},
    {"id": 7, "name": "Ishita Sen", "title": "Talent Partner", "department": "People & Culture", "level": "Individual contributor", "manager_id": 4, "email": "ishita.sen@northstar.example", "location": "Mumbai", "bio": "Partners with hiring managers to make recruitment human and inclusive.", "color": "rose"},
    {"id": 8, "name": "Dev Malhotra", "title": "Learning & Development Lead", "department": "People & Culture", "level": "Individual contributor", "manager_id": 5, "email": "dev.malhotra@northstar.example", "location": "Remote", "bio": "Creates learning experiences that help people grow into their next chapter.", "color": "amber"},
    {"id": 9, "name": "Nisha Verma", "title": "People Operations Specialist", "department": "People & Culture", "level": "Individual contributor", "manager_id": 5, "email": "nisha.verma@northstar.example", "location": "Pune", "bio": "Supports onboarding, employee records, and day-to-day people operations.", "color": "teal"},
    {"id": 10, "name": "Arjun Bose", "title": "Engineering Manager", "department": "Technology", "level": "Management", "manager_id": 6, "email": "arjun.bose@northstar.example", "location": "Bengaluru", "bio": "Supports a product engineering team from planning through delivery.", "color": "blue"},
]


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/employees")
def get_employees():
    return jsonify(EMPLOYEES)


@app.post("/api/employees")
def add_employee():
    data = request.get_json(silent=True) or {}
    required = ("name", "title", "department", "level", "email", "location")
    missing = [field for field in required if not str(data.get(field, "")).strip()]
    if missing:
        return jsonify({"error": "Please complete all required fields."}), 400
    try:
        manager_id = int(data["manager_id"]) if data.get("manager_id") else None
    except (TypeError, ValueError):
        return jsonify({"error": "Choose a valid manager."}), 400
    if manager_id is not None and not any(person["id"] == manager_id for person in EMPLOYEES):
        return jsonify({"error": "The selected manager was not found."}), 400
    colors = ["violet", "rose", "blue", "amber", "teal"]
    person = {
        "id": max((person["id"] for person in EMPLOYEES), default=0) + 1,
        "name": str(data["name"]).strip(), "title": str(data["title"]).strip(),
        "department": str(data["department"]).strip(), "level": str(data["level"]).strip(),
        "manager_id": manager_id, "email": str(data["email"]).strip(),
        "location": str(data["location"]).strip(), "bio": str(data.get("bio", "")).strip() or "A valued member of the Northstar team.",
        "color": colors[(len(EMPLOYEES)) % len(colors)],
    }
    EMPLOYEES.append(person)
    return jsonify(person), 201


@app.get("/api/stats")
def get_stats():
    people = [p for p in EMPLOYEES if p["department"] == "People & Culture"]
    return jsonify({"total": len(EMPLOYEES), "people_team": len(people), "departments": len({p["department"] for p in EMPLOYEES}), "leaders": sum(p["level"] in ("Executive", "Leadership") for p in EMPLOYEES)})


if __name__ == "__main__":
    app.run(debug=True)
