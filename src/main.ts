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

interface Parameters {
  version: string
  defaultRef: string
  overrides: Record<OverrideKeys, string>
  isBuildNative: boolean
  isRelease: boolean
}

function parseParameters(): Parameters {
  const defaultRef = core.getInput('default-ref') || (process.env.GITHUB_REF_NAME as string)
  if (!defaultRef) {
    throw new Error('Unable to retrieve the branch name')
  }
  return {
    version: core.getInput('version'),
    defaultRef,
    overrides: parseOverrides(core.getInput('overrides')),
    isBuildNative: toBoolean(core.getInput('build-native')),
    isRelease: toBoolean(core.getInput('release'))
  }
}

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
    const parameters = parseParameters()
    const versionString = determineVersion(parameters)
    const {defaultRef, overrides, isBuildNative, isRelease} = parameters

    const refs: Record<string, string> = {
      'version-string': versionString,
      'default-ref': defaultRef
    }
    for (const [key, value] of Object.entries(overrides)) {
      refs[`flux-${key}-ref`] = value || defaultRef
    }

    const flags: Record<string, boolean> = {
      'build-native': isBuildNative,
      release: isRelease
    }
    for (const [key, value] of Object.entries(overrides)) {
      flags[`flux-${key}-enabled`] = isEnabled(value)
    }

    setOutputs(refs)
    setOutputs(flags)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function determineVersion({defaultRef, isRelease, version}: Parameters): string {
  return defaultRef === 'master' || isRelease
    ? `${version}-b${process.env.GITHUB_RUN_NUMBER}`
    : `${version}-${branchId(defaultRef)}-b${process.env.GITHUB_RUN_NUMBER}`
}

function branchId(defaultRef: string): string {
  const ref = defaultRef.toLowerCase()
  return ref.includes('/')
    ? ref.substring(ref.indexOf('/') + 1).replace('/', '-')
    : ref
}

function setOutputs(values: Record<string, unknown>): void {
  for (const key in values) {
    const value = values[key]
    core.info(`${key}:${value}`)
    core.setOutput(key, value)
  }
}

run()
