from app.services.checker import normalize_url, check_link_status

def test_normalize_url():
    base = "https://example.com/docs/index.html"
    assert normalize_url(base, "/about") == "https://example.com/about"
    assert normalize_url(base, "page2.html") == "https://example.com/docs/page2.html"
    assert normalize_url(base, "javascript:void(0)") is None
    assert normalize_url(base, "mailto:admin@example.com") is None
    assert normalize_url(base, "#section1") is None

def test_check_link_status_valid():
    status_code, err = check_link_status("https://example.com")
    # example.com should return HTTP 200 OK
    assert status_code in (200, 301, 302, None)
