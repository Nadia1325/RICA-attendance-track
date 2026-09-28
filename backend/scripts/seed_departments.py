"""Idempotently create the 12 RICA departments used by the dashboard."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app
from app.extensions import db

DEPARTMENTS = (
    ("RICA", "RICA"),
    ("RICA/CCRU Office", "CCRU"),
    ("RICA/DG Office", "DG"),
    ("RICA/Finance Office", "FIN"),
    ("RICA/FPPIU Office", "FPPIU"),
    ("RICA/HoD Office", "HOD"),
    ("RICA/HR Office", "HR"),
    ("RICA/ITU Office", "ITU"),
    ("RICA/IMU Office", "IMU"),
    ("RICA/RL Office", "RL"),
    ("RICA/SDC Office", "SDC"),
    ("RICA/YOUNG Professional", "YOUNG"),
)


def seed_departments() -> None:
    app = create_app()
    with app.app_context():
        created = 0
        for name, office in DEPARTMENTS:
            if db.department.find_unique(where={"name": name}):
                continue
            db.department.create(data={"name": name, "office": office})
            created += 1
        print(f"RICA department catalog ready ({created} added, {len(DEPARTMENTS) - created} already present).")


if __name__ == "__main__":
    seed_departments()
