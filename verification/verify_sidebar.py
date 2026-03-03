from playwright.sync_api import Page, expect, sync_playwright

def test_sidebar_quizzes_link(page: Page):
    page.goto("http://localhost:3000/test-sidebar")

    # Wait for sidebar to load
    page.wait_for_selector("aside")

    # Find the Quizzes link in the sidebar
    quizzes_link = page.locator("aside a[href='/quizzes']")

    # Verify the href is correct
    href = quizzes_link.get_attribute("href")
    assert href == "/quizzes", f"Expected href '/quizzes', got '{href}'"

    print("Link is correct!")

    # Take a screenshot
    page.screenshot(path="verification/sidebar.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_sidebar_quizzes_link(page)
        finally:
            browser.close()
