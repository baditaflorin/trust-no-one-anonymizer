# Trust No One Anonymizer

![Version](https://img.shields.io/badge/version-0.1.0-95d8c2)
![Deployment](https://img.shields.io/badge/deploy-GitHub%20Pages-d6a73a)
![License](https://img.shields.io/badge/license-MIT-f4f0e8)

Live site: https://baditaflorin.github.io/trust-no-one-anonymizer/

Repository: https://github.com/baditaflorin/trust-no-one-anonymizer

Support: https://www.paypal.com/paypalme/florinbadita

Trust No One Anonymizer is a static browser app that turns local camera and microphone input into a processed avatar video feed plus modulated voice audio before those tracks can be exported through WebRTC.

![Trust No One Anonymizer screenshot](https://raw.githubusercontent.com/baditaflorin/trust-no-one-anonymizer/main/docs/screenshot.png)

## Quickstart

```sh
npm install
make install-hooks
make build
make pages-preview
```

Local preview URL: http://127.0.0.1:4287/trust-no-one-anonymizer/

## What Ships In V1

- MediaPipe Face Landmarker drives a deterministic avatar renderer from local expression blendshapes.
- Web Audio modulates voice timbre while preserving prosody; RNNoise WASM initializes lazily when enabled.
- Manual WebRTC copy/paste signaling exports only processed canvas and audio destination tracks.
- ESRGAN snapshot enhancement is lazy-loaded for avatar keyframes.
- Version and latest published commit are visible on the GitHub Pages UI.

## Project Docs

Architecture: https://github.com/baditaflorin/trust-no-one-anonymizer/blob/main/docs/architecture.md

ADRs: https://github.com/baditaflorin/trust-no-one-anonymizer/tree/main/docs/adr

Deploy guide: https://github.com/baditaflorin/trust-no-one-anonymizer/blob/main/docs/deploy.md

Privacy: https://github.com/baditaflorin/trust-no-one-anonymizer/blob/main/docs/privacy.md

Postmortem: https://github.com/baditaflorin/trust-no-one-anonymizer/blob/main/docs/postmortem.md

## Checks

```sh
make lint
make test
make build
make smoke
```

No GitHub Actions are configured. Local hooks run the checks before commit and push.
