"""Tests for the /tasks endpoints."""


def test_get_my_tasks_unauthorized(client):
    """GET /tasks/my without a token must return 401."""
    response = client.get("/tasks/my")
    assert response.status_code == 401


def test_complete_task_unauthorized(client):
    """PUT /tasks/{id}/complete without a token must return 401."""
    response = client.put("/tasks/1/complete")
    assert response.status_code == 401
