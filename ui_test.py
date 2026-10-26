import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True, executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        page=await browser.new_page(viewport={'width':390,'height':844})
        await page.goto('http://localhost:4200')
        assert await page.title() == 'Fxwizzy — Your Trading Edge'
        assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
        await page.get_by_role('button', name='Open navigation').click()
        await page.get_by_role('button', name='Risk calculator', exact=True).click()
        assert (await page.locator('.lot-number').inner_text()).replace(' ','') == '0.08lots'
        await page.get_by_role('button', name='Open navigation').click()
        await page.get_by_role('button', name='Chart analyzer', exact=True).click()
        await page.get_by_role('button',name='Upload chart',exact=False).first.click()
        await page.wait_for_selector('dialog[open]')
        assert await page.get_by_role('button',name='Analyze my charts',exact=True).is_disabled()
        await page.locator('input[type=file]').set_input_files({'name':'invalid.txt','mimeType':'text/plain','buffer':b'not an image'})
        assert 'PNG' in await page.locator('.error-message').inner_text()
        await page.evaluate("Object.defineProperty(navigator.mediaDevices,'getDisplayMedia',{value:undefined, configurable:true})")
        await page.get_by_role('button',name='Capture screen',exact=True).click()
        assert 'not supported' in await page.locator('.error-message').inner_text()
        await page.locator('input[type=file]').set_input_files(['/home/user/fxwizzy/test-chart.png','/home/user/fxwizzy/test-chart.png'])
        await page.wait_for_selector('.image-list > div:nth-child(2) img')
        assert await page.locator('.image-list img').count() == 2
        await page.get_by_role('button',name='Remove chart 2',exact=True).click()
        assert await page.locator('.image-list img').count() == 1
        await page.get_by_role('button',name='Close upload dialog',exact=True).click()
        await page.get_by_role('button',name='Workspace preferences',exact=True).click()
        await page.get_by_role('spinbutton',name='Default risk ceiling (%)').fill('1.5')
        await page.get_by_role('button',name='Save preferences',exact=True).click()
        assert await page.evaluate("localStorage.getItem('fxwizzy-risk')") == '1.5'
        await page.screenshot(path='/home/user/fxwizzy-mobile-final.png',full_page=True)
        print('Mobile layout, navigation, image validation, multi-image selection, capture fallback, preferences: passed')
        await browser.close()

asyncio.run(run())