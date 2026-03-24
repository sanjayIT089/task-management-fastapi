from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "demo1234"
DEMO_FULL_NAME = "Demo User"


def seed_demo_user_if_empty() -> bool:
    if settings.app_env.lower() != "development":
        raise RuntimeError("Seeding is only allowed in development environment.")

    db = SessionLocal()
    try:
        has_users = db.query(User.id).first() is not None
        if has_users:
            return False

        demo_user = User(
            email=DEMO_EMAIL,
            hashed_password=get_password_hash(DEMO_PASSWORD),
            full_name=DEMO_FULL_NAME,
            is_active=True,
        )
        db.add(demo_user)
        db.commit()
        return True
    finally:
        db.close()


if __name__ == "__main__":
    created = seed_demo_user_if_empty()
    if created:
        print(f"Created demo user: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    else:
        print("Skipped seeding: users table is not empty.")
