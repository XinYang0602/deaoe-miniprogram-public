# DEAOE Customer Service Mini Program

A native WeChat mini program for appliance after-sales service, built with JavaScript, WXML and WXSS. This public edition shares the client implementation with example configuration and a fresh Git history. The interface is in Simplified Chinese; this documentation is in English.

## Features

- WeChat sign-in and optional native phone-number authorization.
- Member profiles, custom avatars and copyable membership numbers.
- Welcome dialogs for new and returning members.
- Bound-device and electronic warranty-card views.
- Installation and repair requests, with service progress tracking.
- Native camera QR scanning with cancellation, permission and error handling.
- Consistent four-tab navigation and a light champagne membership card.

## Getting started

1. Install WeChat DevTools and import this repository.
2. Replace `touristappid` in `project.config.json` with your own mini program AppID. Guest mode does not support the complete authentication flow.
3. Configure your HTTPS backend in `miniprogram/config.js` and the matching allowed domains in the WeChat console. Update the website web-view URL and domain-related help text for your deployment.
4. Implement the API contract consumed by `miniprogram/services/api.js`. The private backend is not included.
5. Compile and preview on a physical phone to verify native authorization and camera behavior.

The example endpoint is deliberately nonfunctional. This is not an offline demo: login, profiles, devices, warranties and requests require a compatible backend. Keep AppSecret and session exchange logic on the server, never in client code. Keep HTTPS/domain validation enabled.

## Project structure

```text
miniprogram/
  assets/       Brand graphics and interface icons
  pages/        Service, device, member and request screens
  services/     API client and camera scanning helpers
  app.*         App registration and shared styles
  config.js     Example API configuration
tests/          Node.js tests using mocked WeChat APIs
project.config.json
```

## Validation

No npm dependencies are required. With Node.js installed:

```sh
node tests/basic.cjs
node tests/camera-scan.cjs
node tests/welcome.cjs
node tests/profile-preload.cjs
```

Tests use mocked APIs and synthetic data; they do not prove live backend integration or WeChat review approval. If you change example configuration, adjust the corresponding fixture assertions.

## Scope and limitations

QR scanning displays the recognized content without uploading it or automatically opening links. It does not automatically bind devices or activate warranty coverage. Device ownership must be verified through the service workflow. Manufacturer-code verification is not included.

This repository contains no backend, production configuration, customer database, uploaded customer images or private development history. Before a real deployment, configure your own privacy notice, contact details, data retention practices and platform permissions to match actual processing. The included Chinese privacy copy is application content, not a compliance template.

## Brand assets

DEAOE logos and mascot assets are included to document the original interface. No trademark license or permission to reuse the brand is granted. No open-source license is granted by this publication.

## Change history

### 2026-11-10

- Published the initial sanitized client source edition with English documentation.

### 2026-11-11

- Preloaded member profiles before tab navigation and improved welcome-particle rendering.
- The brief welcome sparkles play once in both system motion modes; card entry animation is disabled with reduced motion.
