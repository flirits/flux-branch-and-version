/**
 * Parses the override string
 * Example of an override string: flux=hashOrTask;hybrid=task/something/some;streaming=...
 * Available overrides are
 * - flux
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
 */
import * as core from '@actions/core'

const SKIP = 'SKIPPED'

type OverrideKeys =
  | 'flux'
  | 'hybrid'
  | 'web'
  | 'streaming'
  | 'documentation'
  | 'gateway'
  | 'maps'
  | 'broker'
  | 'est'
  | 'certificates'
  | 'data'
  | 'plugins'

function parseOverrides(overrides: string): Record<OverrideKeys, string> {
  const configObject: Record<OverrideKeys, string> = {
    flux: '',
    hybrid: '',
    web: '',
    streaming: '',
    documentation: '',
    gateway: '',
    maps: '',
    broker: '',
    est: '',
    certificates: '',
    data: '',
    plugins: ''
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
      'default-ref': defaultRef,
      'flux-server-ref': overrides.flux || defaultRef,
      'flux-hybrid-ref': overrides.hybrid || defaultRef,
      'flux-web-ref': overrides.web || defaultRef,
      'flux-streaming-server-ref': overrides.streaming || defaultRef,
      'flux-documentation-ref': overrides.documentation || defaultRef,
      'flux-gateway-ref': overrides.gateway || defaultRef,
      'flux-maps-ref': overrides.maps || defaultRef,
      'flux-broker-ref': overrides.broker || defaultRef,
      'flux-est-ref': overrides.est || defaultRef,
      'flux-certificates-ref': overrides.certificates || defaultRef,
      'flux-data-ref': overrides.certificates || defaultRef,
      'flux-plugins-ref': overrides.plugins || defaultRef
    }
    const flags: Record<string, boolean> = {
      'build-native': buildNativeRef,
      release: releaseRef,
      'flux-server-enabled': isEnabled(refs['flux-server-ref']),
      'flux-hybrid-enabled': isEnabled(refs['flux-hybrid-ref']),
      'flux-web-enabled': isEnabled(refs['flux-web-ref']),
      'flux-streaming-enabled': isEnabled(refs['flux-streaming-server-ref']),
      'flux-documentation-enabled': isEnabled(refs['flux-documentation-ref']),
      'flux-gateway-enabled': isEnabled(refs['flux-gateway-ref']),
      'flux-maps-enabled': isEnabled(refs['flux-maps-ref']),
      'flux-broker-enabled': isEnabled(refs['flux-broker-ref']),
      'flux-est-enabled': isEnabled(refs['flux-est-ref']),
      'flux-certificates-enabled': isEnabled(refs['flux-certificates-ref']),
      'flux-data-enabled': isEnabled(refs['flux-data-ref']),
      'flux-plugins-enabled': isEnabled(refs['flux-plugins-ref'])
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
