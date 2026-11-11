import { chromium } from '@playwright/test'

const BASE = 'http://localhost:3000'
const PET = 'd8809657-a44b-4234-a2d8-6304ede33bee'

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => { if (['error','warning'].includes(m.type())) console.log(`[c.${m.type()}]`, m.text()) })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))

// Login
await page.goto(`${BASE}/login`)
await page.locator('input[type=email]').fill('admin@aumigo.local')
await page.locator('input[type=password]').fill('ChangeMe123!')
await page.getByRole('button', { name: 'Entrar' }).click()
await page.waitForTimeout(3000)
console.log('after login url:', page.url())

await page.goto(`${BASE}/pets/${PET}/apply`)
await page.waitForLoadState('networkidle')
await page.waitForTimeout(1000)
console.log('apply url:', page.url())

const fill = async (ph, v) => {
  try { await page.getByPlaceholder(ph).first().fill(v); console.log('filled', ph) }
  catch (e) { console.log('FAIL fill', ph, e.message.split('\n')[0]) }
}
await fill('000.000.000-00', '11144477735')
await fill('(11) 99999-9999', '11999999999')
await fill('Ex.: 30', '30')
// CEP input
try { await page.getByPlaceholder(/\d{5}-?\d{3}|CEP|00000-000/).first().fill('01001000'); console.log('filled CEP') }
catch { try { await page.locator('input#\\:cep, input[name=zipCode]').fill('01001000') } catch(e){ console.log('FAIL cep', e.message.split('\n')[0]) } }
await page.waitForTimeout(3500) // cep autofill

// Number (no placeholder) - find the Número field's input via label
try { await page.getByLabel('Número', { exact: false }).first().fill('100'); console.log('filled Número') }
catch (e) { console.log('FAIL Número', e.message.split('\n')[0]) }

// Radios by visible label
const clickLabel = async (txt) => {
  try { await page.getByText(txt, { exact: true }).first().click(); console.log('clicked', txt) }
  catch (e) { console.log('FAIL click', txt, e.message.split('\n')[0]) }
}
await clickLabel('Casa')           // home
// For the yes/no groups, click the label associated with each radio id
for (const id of ['isRental-nao','firstPet-sim','hasFinancialConditions-sim']) {
  try { await page.locator(`label[for="${id}"]`).click(); console.log('radio', id) }
  catch (e) { console.log('FAIL radio', id, e.message.split('\n')[0]) }
}

// hints/errors state
const hints = await page.locator('text=/Selecione|Informe|Idade|Mensagem muito/').allTextContents()
console.log('hints/errors present:', hints.slice(0,25))

// Submit
await page.getByRole('button', { name: 'Enviar candidatura' }).click()
await page.waitForTimeout(2000)

const termsVisible = await page.getByText('Antes de enviar sua candidatura').isVisible().catch(() => false)
console.log('>>> TERMS DIALOG VISIBLE:', termsVisible)
const errorsAfter = await page.locator('text=/Selecione|Informe/').allTextContents()
console.log('errors after submit:', errorsAfter.slice(0,25))
const toasts = await page.locator('[data-sonner-toast]').allTextContents()
console.log('toasts:', toasts)

await page.screenshot({ path: '/tmp/apply-after-submit.png', fullPage: true })
await browser.close()
