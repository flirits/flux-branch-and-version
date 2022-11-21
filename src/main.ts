import * as core from '@actions/core'

function run(): void {
  try {
    const version = core.getInput('version')
    const defaultRef = core.getInput('default-ref') || process.env.GITHUB_REF_NAME
    if (!defaultRef) {
      core.setFailed('Unable to get retrieve the branch name')
      return
    }
    const fluxServerRef = core.getInput('flux-server-ref') || defaultRef
    const fluxHybridRef = core.getInput('flux-hybrid-ref') || defaultRef
    const fluxWebRef = core.getInput('flux-web-ref') || defaultRef
    const fluxStreamingServerRef = core.getInput('flux-streaming-server-ref') || defaultRef
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

    core.setOutput('version-string', versionString)
    core.setOutput('default-ref', defaultRef)
    core.setOutput('flux-server-ref', fluxServerRef)
    core.setOutput('flux-hybrid-ref', fluxHybridRef)
    core.setOutput('flux-web-ref', fluxWebRef)
    core.setOutput('flux-streaming-server-ref', fluxStreamingServerRef)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
