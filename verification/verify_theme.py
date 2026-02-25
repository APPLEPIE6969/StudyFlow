from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    # Go to dashboard or login (Sidebar is likely on dashboard)
    # But login page might redirect if not authenticated.
    # Let's check /login first as it has a background.
    # Actually, Sidebar is only visible if logged in?
    # app/layout.tsx renders children.
    # components/Sidebar.tsx is used in where?
    # Probably in a layout for dashboard.

    # Let's check app/dashboard/layout.tsx if it exists.
    # If not, let's check app/layout.tsx structure.
    # Sidebar seems to be imported in layout? No, usually in dashboard layout.

    # Let's go to /login page and check background there first.
    page.goto("http://localhost:3000/login")

    # Wait for hydration
    page.wait_for_timeout(2000)

    # Check body background color
    body = page.locator("body")
    bg_color = body.evaluate("element => getComputedStyle(element).backgroundColor")
    print(f"Initial background color: {bg_color}")

    # Take screenshot 1
    page.screenshot(path="verification/screenshot_initial.png")

    # How to toggle theme on /login?
    # Login page might not have the sidebar.
    # But maybe there is a way to toggle?
    # If not, I can inject a script to toggle theme?
    # Or navigate to a page with Sidebar.

    # Let's check if Sidebar is present.
    if page.locator("aside").count() > 0:
        print("Sidebar found")
        # Find toggle button
        # It says "Light Mode" if current is dark, or "Dark Mode" if current is light.
        # But wait, button text depends on state.

        # Try to find button with text "Mode"
        toggle_btn = page.get_by_role("button").filter(has_text="Mode").first
        if toggle_btn.is_visible():
            toggle_btn.click()
            page.wait_for_timeout(1000)

            # Check new background
            bg_color_2 = body.evaluate("element => getComputedStyle(element).backgroundColor")
            print(f"New background color: {bg_color_2}")

            page.screenshot(path="verification/screenshot_toggled.png")
    else:
        print("Sidebar not found on login page")
        # Try to simulate theme toggle via script
        # The app uses localStorage 'theme'.
        # We can set localStorage and reload?

        # Set theme to 'dark'
        page.evaluate("localStorage.setItem('theme', 'dark')")
        page.reload()
        page.wait_for_timeout(1000)
        bg_color_dark = body.evaluate("element => getComputedStyle(element).backgroundColor")
        print(f"Forced Dark background color: {bg_color_dark}")
        page.screenshot(path="verification/screenshot_dark.png")

        # Set theme to 'light'
        page.evaluate("localStorage.setItem('theme', 'light')")
        page.reload()
        page.wait_for_timeout(1000)
        bg_color_light = body.evaluate("element => getComputedStyle(element).backgroundColor")
        print(f"Forced Light background color: {bg_color_light}")
        page.screenshot(path="verification/screenshot_light.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
