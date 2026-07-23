def test_register_and_login(client):
    # Register user
    reg_resp = client.post("/api/auth/register", json={
        "email": "testuser@example.com",
        "password": "securepassword123",
        "full_name": "Test Engineer"
    })
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test Engineer"

    # Login user
    login_resp = client.post("/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "securepassword123"
    })
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data

    # Read Current User Profile
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "testuser@example.com"
