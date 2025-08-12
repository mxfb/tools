import process from 'node:process'
import { promises as fs } from 'node:fs'
import { exec, execSync } from 'node:child_process'
import prompts from 'prompts'
import semver from 'semver'
import Git from 'simple-git'
import { PKG_JSON, LIB_PKG_JSON, LIB } from '../_config/index.js'

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
    { title: 'Major', description: `(${targetVersionNumbers.major})`, value: 'major' }
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
const libPkgJsonData = await fs.readFile(LIB_PKG_JSON, { encoding: 'utf-8' })
type PkgJson = {
  name?: string | undefined
  version?: string | undefined
  description?: string | undefined
  author?: string | undefined
  license?: string | undefined
  repository?: {
    type: string
    url: string
  }
  type?: string | undefined
  main?: string | undefined
  module?: string | undefined
  scripts?: Record<string, string> | undefined
  dependencies?: Record<string, string> | undefined
  devDependencies?: Record<string, string> | undefined
  peerDependencies?: Record<string, string> | undefined
}
let libPkgJsonObj: PkgJson | null = null
try {
  const parsed = JSON.parse(libPkgJsonData) as PkgJson
  libPkgJsonObj = {
    name: parsed.name,
    version: parsed.version,
    description: parsed.description,
    author: parsed.author,
    license: parsed.license,
    repository: parsed.repository,
    type: parsed.type,
    main: 'index.js',
    module: 'index.js',
    dependencies: parsed.dependencies,
    peerDependencies: parsed.peerDependencies,
    devDependencies: parsed.devDependencies
  }
  await fs.writeFile(
    LIB_PKG_JSON,
    `${JSON.stringify(libPkgJsonObj, null, 2)}\n`,
    { encoding: 'utf-8' }
  )
} catch (err) {
  console.error(`Something went wrong while parsing lib/package.json`)
  process.exit(1)
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Publish from lib
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const { otp } = await prompts({
  name: 'otp',
  type: 'text',
  message: 'Enter your NPM OTP token'
})

await new Promise(resolve => {
  exec(`cd ${LIB} && npm publish --access public --otp=${otp}`, (err, stdout, stderr) => {
    if (err !== null) console.error(err)
    if (stdout !== '') console.log(stdout)
    if (stderr !== '') console.log(stderr)
    resolve(true)
  })
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Prevent npm publish to happen from here
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

console.log('Pre publish: done')
process.exit(1)

