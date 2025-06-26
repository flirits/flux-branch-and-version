/**
 * Parses the override string
 * Example of an override string: server=hashOrTask;hybrid=task/something/some;streaming=...
 * Available overrides are
 * - server
 * - hybrid
 * - web
 * - streaming
 * - documentation
 * - gateway
 * - maps
 * - broker
 * - est
 * - certificates
 * - data
 * - plugins
 * - c2c
 */
import * as core from '@actions/core'

const SKIP = 'SKIPPED'

type OverrideKeys =
  | 'server'
  | 'hybrid'
  | 'web'
  | 'streaming-server'
  | 'documentation'
  | 'gateway'
  | 'maps'
  | 'broker'
  | 'est'
  | 'certificates'
  | 'data'
  | 'plugins'
  | 'c2c'

function parseOverrides(overrides: string): Record<OverrideKeys, string> {
  const configObject: Record<OverrideKeys, string> = {
    server: '',
    hybrid: '',
    web: '',
    'streaming-server': '',
    documentation: '',
    gateway: '',
    maps: '',
    broker: '',
    est: '',
    certificates: '',
    data: '',
    plugins: '',
    c2c: ''
  }

  const keyValuePairs = overrides.split(';')

  for (const pair of keyValuePairs) {
    const [key, value] = pair.split('=')
    if (key && value && configObject.hasOwnProperty(key.trim())) {
      configObject[key.trim() as OverrideKeys] = value.trim()
    }
  }
  return configObject
}

function toBoolean(input: string | boolean | undefined): boolean {
  if (typeof input === 'string') {
    if (input === 'true' || input === '1') {
      return true
    }
    return false
  }
  return !!input
}

function isEnabled(ref: string): boolean {
  return ref !== SKIP
}

function run(): void {
  try {
    const version = core.getInput('version')
    const defaultRef = core.getInput('default-ref') || (process.env.GITHUB_REF_NAME as string)
    if (!defaultRef) {
      core.setFailed('Unable to retrieve the branch name')
      return
    }
    const overrides = parseOverrides(core.getInput('overrides'))

    const buildNativeRef = toBoolean(core.getInput('build-native'))
    const releaseRef = toBoolean(core.getInput('release'))

    let versionString
    if (defaultRef === 'master' || releaseRef) {
      versionString = `${version}-b${process.env.GITHUB_RUN_NUMBER}`
    } else {
      const branchStringInLowerCase = defaultRef.toLowerCase()
      let branchString = branchStringInLowerCase
      if (branchStringInLowerCase.includes('/')) {
        branchString = branchStringInLowerCase.substring(branchStringInLowerCase.indexOf('/') + 1).replace('/', '-')
      }
      versionString = `${version}-${branchString}-b${process.env.GITHUB_RUN_NUMBER}`
    }

    const refs: Record<string, string> = {
      'version-string': versionString,
      'default-ref': defaultRef
    }
    for (const [key, value] of Object.entries(overrides)) {
      refs[`flux-${key}-ref`] = value || defaultRef
    }

    const flags: Record<string, boolean> = {
      'build-native': buildNativeRef,
      release: releaseRef
    }
    for (const [key, value] of Object.entries(overrides)) {
      flags[`flux-${key}-enabled`] = isEnabled(value)
    }

    // Logging
    for (const key in refs) {
      const value = refs[key]
      core.info(`${key}:${value}`)
    }
    for (const key in flags) {
      const value = flags[key]
      core.info(`${key}:${value}`)
    }

    // Output
    for (const key in refs) {
      const value = refs[key]
      core.setOutput(key, value)
    }
    for (const key in flags) {
      const value = flags[key]
      core.setOutput(key, value)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
