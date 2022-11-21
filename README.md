# Flux branch and version

Calculates version and branch information for building the Flux

## Usage

See [action.yml](action.yml)

```yaml
steps:
  - id: branch-and-version@v1
    uses: flirits/flux-branch-and-version
    with:
      version: 4.0.1
      default-ref: task/reporting/TMSNG-1234
      flux-server-ref: task/reporting/TMSNG-1235
      flux-hybrid-ref: task/reporting/TMSNG-1236
      flux-web-ref: task/reporting/FLUXWEBAPP-123
      flux-streaming-server-ref: task/reporting/TMSNG-1237
```

## Code

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```
