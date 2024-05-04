import os from 'node:os'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const homeDirPath = os.homedir()
const mxfbConfigDirPath = path.join(homeDirPath, '.config/mxfb-cli')
const mxfbConfigFilePath = path.join(mxfbConfigDirPath, 'config.json')

export type Config = {
  mxfb_projects_sync?: {
    lm_path?: string
    mxfb_path?: string
  }
}

export const emptyConfigObj: Config = {}

export async function createConfigFile (force: boolean = false): Promise<true | Error> {
  await fs.mkdir(mxfbConfigDirPath, { recursive: true })
  try {
    await fs.stat(mxfbConfigFilePath)
    if (force === true) throw 'create anyway'
    return true
  } catch (err) {
    try {
      await fs.writeFile(
        mxfbConfigFilePath,
        `${JSON.stringify(emptyConfigObj, null, 2)}\n`,
        { encoding: 'utf-8' }
      )
      return true
    } catch (err) {
      if (err instanceof Error) return err
      if (typeof err === 'string') return new Error(err)
      return new Error(`${err}`)
    }
  }
}

const deletionSecurityPhrase = 'THIS IS A DESTRUCTIVE AND DEFINITIVE ACTION'

export async function deleteConfigDir (security: typeof deletionSecurityPhrase): Promise<true | Error> {
  if (security !== deletionSecurityPhrase) return new Error('You must provide the security phrase')
  await fs.rm(mxfbConfigDirPath, { recursive: true, force: true })
  return true
}

export async function deleteConfigFile (security: typeof deletionSecurityPhrase): Promise<true | Error> {
  if (security !== deletionSecurityPhrase) return new Error('You must provide the security phrase')
  await fs.rm(mxfbConfigDirPath)
  return true
}

export async function ensureConfigFile (): Promise<true | Error> {
  try {
    await fs.stat(mxfbConfigFilePath)
    return true
  } catch (err) {
    try {
      const created = await createConfigFile()
      if (created instanceof Error) throw created
      return true
    } catch (err) {
      if (err instanceof Error) return err
      if (typeof err === 'string') return new Error(err)
      return new Error(`${err}`)
    }
  }
}

export async function getConfigFile (): Promise<string | Error> {
  try {
    const fileContents = await fs.readFile(mxfbConfigFilePath, { encoding: 'utf-8' })
    return fileContents
  } catch (err) {
    if (err instanceof Error) return err
    if (typeof err === 'string') return new Error(err)
    return new Error(`${err}`)
  }
}

export function validateConfigObj (configObj: any): configObj is Config {
  // [WIP] implement this
  return true
}

export function parseConfigFile (fileContents: string): Config | Error {
  try {
    const parsed = JSON.parse(fileContents)
    const validated = validateConfigObj(parsed)
    if (!validated) throw new Error(`Invalid config file shape: ${fileContents}`)
    return parsed
  } catch (err) {
    if (err instanceof Error) return err
    if (typeof err === 'string') return new Error(err)
    return new Error(`${err}`)
  }
}

export async function getConfig (create: boolean = false): Promise<Config | Error> {
  if (create) {
    const created = await ensureConfigFile()
    if (created !== true) return created
  }
  const configStr = await getConfigFile()
  if (configStr instanceof Error) return configStr
  const parsed = parseConfigFile(configStr)
  if (parsed instanceof Error) return parsed
  return parsed
}

export type ConfigUpdater = Partial<Config> | ((curr: Config) => Config)

export async function updateConfig (updater: ConfigUpdater, create: boolean = false): Promise<true | Error> {
  const currentConfig = await getConfig(create)
  if (currentConfig instanceof Error) return currentConfig
  const updatedConfig: Config = typeof updater === 'function'
    ? updater(currentConfig)
    : { ...currentConfig, ...updater }
  const stringified = JSON.stringify(updatedConfig, null, 2)
  await fs.writeFile(mxfbConfigFilePath, stringified, { encoding: 'utf-8' })
  return true
}
