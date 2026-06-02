import asyncio
from playwright.async_api import async_playwright
import sys
import os

async def main():
    if len(sys.argv) < 3:
        print("Usage: python capture.py <email> <password>")
        return

    email = sys.argv[1]
    password = sys.argv[2]
    
    # Path to save screenshots
    save_path = os.path.join(os.environ.get('APPDATA', '.'), '..', 'Local', '.gemini', 'antigravity', 'brain', '367cda45-d06b-4626-b3ca-965324fd2e96', 'scratch')
    os.makedirs(save_path, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        # Go to login
        print("Navigating to login page...")
        await page.goto("http://localhost:5173/login")
        await page.wait_for_timeout(2000)
        
        # Take login screenshot
        await page.screenshot(path=os.path.join(save_path, "login_screen.png"))
        
        # Login
        print(f"Logging in as {email}...")
        await page.fill('input[type="email"]', email)
        await page.fill('input[type="password"]', password)
        await page.click('button[type="submit"]')
        
        # Wait for dashboard to load
        await page.wait_for_timeout(3000)
        
        # Take dashboard screenshot
        print("Taking dashboard screenshot...")
        await page.screenshot(path=os.path.join(save_path, "dashboard_screen.png"))
        
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
