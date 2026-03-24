from jose import jwt

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password


def test_password_hash_and_verify_roundtrip() -> None:
    plain = "demo1234"
    hashed = get_password_hash(plain)

    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_create_access_token_contains_subject() -> None:
    token = create_access_token("demo@example.com")
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])

    assert payload["sub"] == "demo@example.com"
    assert "exp" in payload
