import os
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    url = "http://localhost:3000"
    print(f"Navigating to {url}")

    try:
        page.goto(url)
    except Exception as e:
        print(f"Error navigating: {e}")
        return

    # Wait for page to load
    page.wait_for_load_state("domcontentloaded")

    # Check initial theme
    html = page.locator("html")
    initial_class = html.get_attribute("class") or ""
    print(f"Initial classes on html: '{initial_class}'")

    # Try to find "Dark Mode" button (means we are in light mode) or "Light Mode" (means we are in dark mode)
    # The button text is dynamic based on theme.

    # If dark mode, text is "Light Mode".
    if "dark" in initial_class:
        print("Initial state is Dark Mode.")
        expected_btn_text = "Light Mode"
    else:
        print("Initial state is Light Mode.")
        expected_btn_text = "Dark Mode"

    # Find the button
    # The Sidebar might be hidden on mobile view if headless browser uses small viewport.
    # Set viewport size to ensure sidebar is visible.
    page.set_viewport_size({"width": 1280, "height": 720})

    # Check if we need to login? App might redirect to login if protected.
    # Sidebar is usually present on dashboard.
    # Let's check where we landed.
    print(f"Current URL: {page.url}")

    if "/login" in page.url:
        print("Redirected to login. Attempting to check theme on login page.")
        # Login page might not have Sidebar.
        # But let's see if we can find any theme toggle.
        # Assuming Login page doesn't have sidebar based on typical designs.
        # I'll try to go to a public page that has Layout/Sidebar?
        # Usually Sidebar is only for authenticated users.
        # The landing page (root) might be public but different layout.
        # Let's check if the root page has a toggle.
        pass

    # Look for button again
    try:
        # Check if button with text exists
        # Use a more specific locator if possible, but text is good for UX verification
        # Wait for potential hydration of text
        page.wait_for_timeout(2000)

        # Check if we can find the text "Dark Mode" or "Light Mode"
        # Since we might be on login page, maybe there is no toggle?
        # If so, we can't verify toggle.
        # But we can verify the script behavior by manually injecting localStorage and reloading?

        # If on login page, let's try to inject localStorage theme='dark' and reload to see if class is applied.
        if "/login" in page.url:
            print("On Login page. Testing script via localStorage injection.")

            # Set localStorage to dark
            print("Setting localStorage.theme = 'dark'")
            page.evaluate("localStorage.setItem('theme', 'dark')")

            print("Reloading...")
            page.reload()
            page.wait_for_load_state("domcontentloaded")

            new_class = html.get_attribute("class") or ""
            print(f"New classes on html: '{new_class}'")

            if "dark" in new_class:
                print("Script correctly applied 'dark' class from localStorage on Login page.")
            else:
                print("Script FAILED to apply 'dark' class.")

            page.screenshot(path="verification/theme_toggled.png")
            return

        # If on dashboard/other page with sidebar
        btn = page.get_by_text(expected_btn_text)
        if btn.count() > 0:
            print(f"Found button with text '{expected_btn_text}'")
            btn.first.click()
            page.wait_for_timeout(1000)

            new_class = html.get_attribute("class") or ""
            print(f"New classes on html: '{new_class}'")

            if "dark" in new_class and "dark" not in initial_class:
                print("Successfully toggled to Dark Mode.")
            elif "dark" not in new_class and "dark" in initial_class:
                print("Successfully toggled to Light Mode.")
            else:
                print("Toggle failed or state didn't change.")

            # Screenshot
            page.screenshot(path="verification/theme_toggled.png")
            print("Screenshot saved.")

            # Reload
            page.reload()
            page.wait_for_load_state("domcontentloaded")
            reloaded_class = html.get_attribute("class") or ""
            print(f"Reloaded classes: '{reloaded_class}'")

            if new_class == reloaded_class:
                print("Persistence verified.")
            else:
                print("Persistence failed.")

        else:
            print(f"Button with text '{expected_btn_text}' not found. Testing script via localStorage injection.")

            # Set localStorage to dark
            print("Setting localStorage.theme = 'dark'")
            page.evaluate("localStorage.setItem('theme', 'dark')")

            print("Reloading...")
            page.reload()
            page.wait_for_load_state("domcontentloaded")

            new_class = html.get_attribute("class") or ""
            print(f"New classes on html: '{new_class}'")

            if "dark" in new_class:
                print("Script correctly applied 'dark' class from localStorage.")
                page.screenshot(path="verification/theme_dark_script.png")
            else:
                print("Script FAILED to apply 'dark' class.")
                page.screenshot(path="verification/theme_fail.png")

    except Exception as e:
        print(f"Error interacting: {e}")
        page.screenshot(path="verification/error.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
