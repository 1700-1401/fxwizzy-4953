import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width': 1440, 'height': 1100})
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('http://localhost:4200')
        await page.wait_for_selector('.chart-canvas svg')
        await page.locator('.chart-panel').screenshot(path='/home/user/fxwizzy/test-chart.png')
        await page.get_by_role('button', name='Risk calculator', exact=True).click()
        assert (await page.locator('.lot-number').inner_text()).replace('\n','').replace(' ','') == '0.08lots'
        await page.get_by_role('spinbutton', name='Risk per trade (%)', exact=True).fill('2')
        assert (await page.locator('.lot-number').inner_text()).replace('\n','').replace(' ','') == '0.16lots'
        await page.get_by_role('button', name='Trade journal', exact=False).click()
        assert await page.locator('.empty-journal').count() == 1
        await page.get_by_role('button', name='Trading playbook', exact=True).click()
        assert await page.locator('.guide-card').count() == 4
        await page.get_by_role('button', name='Chart analyzer', exact=True).click()
        await page.get_by_role('button', name='Upload chart', exact=False).first.click()
        await page.locator('input[type=file]').set_input_files('/home/user/Attachments/grok-imagine-image_a_I_want_u_to_make_a_l_Jb4CeL.jpeg')
        await page.wait_for_selector('.image-list img')
        await page.get_by_role('button', name='Analyze my charts', exact=True).click()
        await page.wait_for_selector('dialog', state='detached', timeout=150000)
        assert 'WAIT' in await page.locator('.direction-banner').inner_text()
        assert await page.locator('.clarification-box').count() == 1
        print('REAL VISION NON-CHART SAFETY:', await page.locator('.insight-content').inner_text())
        await page.get_by_role('button', name='Save analysis to journal', exact=True).click()
        assert 'Saved to journal' in await page.locator('.save-button').inner_text()
        await page.get_by_role('button', name='Trade journal', exact=False).click()
        assert await page.locator('.journal-entry').count() == 1
        await page.reload()
        await page.get_by_role('button', name='Trade journal', exact=False).click()
        assert await page.locator('.journal-entry').count() == 1
        await page.get_by_role('button', name='Open', exact=True).click()
        assert 'WAIT' in await page.locator('.direction-banner').inner_text()
        await page.get_by_role('button', name='Upload chart', exact=False).first.click()
        await page.locator('input[type=file]').set_input_files('/home/user/fxwizzy/test-chart.png')
        await page.get_by_role('textbox', name='Additional chart context', exact=True).fill('Illustrative gold 1H sample chart only. Historical made-up chart to test chart reading, NOT live gold. Only this single timeframe is supplied.')
        await page.get_by_role('button', name='Analyze my charts', exact=True).click()
        await page.wait_for_selector('dialog', state='detached', timeout=150000)
        print('REAL VISION CHART:', await page.locator('.insight-content').inner_text())
        await page.get_by_role('button', name='What confirms this setup?', exact=True).click()
        await page.wait_for_selector('.chat-message.mentor', timeout=90000)
        print('REAL MENTOR:', await page.locator('.chat-message.mentor').inner_text())
        assert len(await page.locator('.chat-message.mentor').inner_text()) > 40
        print('Browser errors:', errors)
        assert not errors
        await browser.close()

asyncio.run(run())