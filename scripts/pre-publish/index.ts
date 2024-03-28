import path from 'node:path'
import { promises as fs } from 'node:fs'
import { execSync } from 'node:child_process'
import prompts from 'prompts'
import semver from 'semver'
import Git from 'simple-git'

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Paths
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const CWD = process.cwd()
const PKG_JSON = path.join(CWD, 'package.json')
const LIB = path.join(CWD, 'lib')
const LIB_PKG_JSON = path.join(LIB, 'package.json')

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Git status
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const git = Git()
const isClean = (await git.status()).isClean()
if (!isClean) {
  console.error('Git working directory must be clean.')
  process.exit(1)
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Read package.json
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const packageJsonData = await fs.readFile(PKG_JSON, { encoding: 'utf-8' })
let currentVersion: string | null = null
try {
  const parsed = JSON.parse(packageJsonData)
  const version = parsed.version
  if (typeof version !== 'string') throw new Error('Could not find the version field inside package.json')
  const versionIsValid = semver.valid(version)
  if (!versionIsValid) throw new Error(`Version number ${version} found in package.json is not valid`)
  currentVersion = version
} catch (err) {
  console.error('Something went wrong reading package.json')
  console.error(err)
  process.exit(1)
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Select target version
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const targetVersionNumbers = {
  patch: semver.inc(currentVersion, 'patch'),
  minor: semver.inc(currentVersion, 'minor'),
  major: semver.inc(currentVersion, 'major')
}

if (Object.values(targetVersionNumbers).some(val => val === null)) {
  console.error('Some target versions are not valid')
  console.error(targetVersionNumbers)
  process.exit(1)
}

const { upgradeType } = await prompts({
  name: 'upgradeType',
  type: 'select',
  message: 'What kind of upgrade is this?',
  choices: [
    { title: 'Patch', description: `(${targetVersionNumbers.patch})`, value: 'patch' },
    { title: 'Minor', description: `(${targetVersionNumbers.minor})`, value: 'minor' },
    { title: 'Minor', description: `(${targetVersionNumbers.major})`, value: 'major' }
  ]
})

if (upgradeType === 'patch') execSync('npm version patch')
else if (upgradeType === 'minor') execSync('npm version minor')
else if (upgradeType === 'major') execSync('npm version major')
else {
  console.error(`Invalid upgrade type: ${upgradeType}`)
  process.exit(1)
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Create lib/package.json
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

await fs.cp(PKG_JSON, LIB_PKG_JSON)

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Prevent npm publish to happen from here
 * (actually publish from lib)
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

console.log('Pre publish: done')
process.exit(1)

