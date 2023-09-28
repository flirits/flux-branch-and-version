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
 */
import * as core from '@actions/core'

type OverrideKeys = "flux" | "hybrid" | "web" | "streaming" | "documentation" | "gateway" | "maps"
function parseOverrides(overrides: string): Record<OverrideKeys, string> {
  const configObject: Record<OverrideKeys, string> = {
    flux: "",
    hybrid: "",
    web: "",
    streaming: "",
    documentation: "",
    gateway: "",
    maps: ""
  };

  const keyValuePairs = overrides.split(';');

  for (const pair of keyValuePairs) {
    const [key, value] = pair.split('=');
    if (key && value && configObject.hasOwnProperty(key.trim())) {
      configObject[key.trim() as OverrideKeys] = value.trim();
    }
  }
  return configObject;
}

function run(): void {
  try {
    const version = core.getInput('version')
    const defaultRef = core.getInput('default-ref') || process.env.GITHUB_REF_NAME
    if (!defaultRef) {
      core.setFailed('Unable to retrieve the branch name')
      return
    }
    const overrides = parseOverrides(core.getInput('overrides'));

    const fluxServerRef = overrides.flux || defaultRef
    const fluxHybridRef = overrides.hybrid || defaultRef
    const fluxWebRef = overrides.web || defaultRef
    const fluxStreamingServerRef = overrides.streaming || defaultRef
    const fluxDocumentationRef = overrides.documentation || defaultRef
    const fluxGatewayRef = overrides.gateway || defaultRef
    const fluxMapsRef = overrides.maps || defaultRef
    const buildNativeRef = core.getInput('build-native') || false
    const releaseRef = core.getInput('release') || false

    core.info(`${typeof releaseRef}`)
    core.info(`${releaseRef}`)
    if (true) {
      core.setFailed('Stop for debugging output')
      return
    }

    let versionString
    if (defaultRef === 'master') {
      versionString = `${version}-b${process.env.GITHUB_RUN_NUMBER}`
    } else {
      const branchStringInLowerCase = defaultRef.toLowerCase()
      let branchString = branchStringInLowerCase
      if (branchStringInLowerCase.includes('/')) {
        branchString = branchStringInLowerCase.substring(branchStringInLowerCase.indexOf('/') + 1).replace('/', '-')
      }
      versionString = `${version}-${branchString}-b${process.env.GITHUB_RUN_NUMBER}`
    }

    core.info(`version-string: ${versionString}`)
    core.info(`default-ref: ${defaultRef}`)
    core.info(`flux-server-ref: ${fluxServerRef}`)
    core.info(`flux-hybrid-ref: ${fluxHybridRef}`)
    core.info(`flux-web-ref: ${fluxWebRef}`)
    core.info(`flux-streaming-server-ref: ${fluxStreamingServerRef}`)
    core.info(`flux-documentation-ref: ${fluxDocumentationRef}`)
    core.info(`flux-gateway-ref: ${fluxGatewayRef}`)
    core.info(`flux-maps-ref: ${fluxMapsRef}`)
    core.info(`build-native: ${buildNativeRef}`)
    core.info(`release: ${releaseRef}`)

    core.setOutput('version-string', versionString)
    core.setOutput('default-ref', defaultRef)
    core.setOutput('flux-server-ref', fluxServerRef)
    core.setOutput('flux-hybrid-ref', fluxHybridRef)
    core.setOutput('flux-web-ref', fluxWebRef)
    core.setOutput('flux-streaming-server-ref', fluxStreamingServerRef)
    core.setOutput('flux-documentation-ref', fluxDocumentationRef)
    core.setOutput('flux-gateway-ref', fluxGatewayRef)
    core.setOutput('flux-maps-ref', fluxMapsRef)
    core.setOutput('build-native', buildNativeRef)
    core.setOutput('release', releaseRef)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
