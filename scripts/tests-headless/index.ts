import { spawn } from 'node:child_process'
import puppeteer from 'puppeteer'
import { Time } from '../../src/agnostic/time/index.js'
import { wait } from '../../src/agnostic/async/wait/index.js'
import { timeoutCall } from '../../src/agnostic/async/timeout-call/index.js'

const PORT = process.env.PORT || '3000'

async function run () {
  const servers = spawn('npm', ['run', '_tests:browser'], {
    shell: true,
    env: { ...process.env, PORT }
  })
  await wait(Time.secondsToMs(2))
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.on('console', message => console.log(message.text()))
  try {
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' })
  } catch (error) {
    console.error('Error during headless browser test:', error)
  } finally {
    await browser.close()
    servers.kill()
  }
}

try {
  await timeoutCall(run, Time.minutesToMs(1))
  process.exit(0)
} catch (error) {
  process.exit(1)
}
