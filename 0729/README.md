## About this project

BUSAN GUIDE is a non-commercial, educational portfolio project (student/team assignment) and is not affiliated with Busan Transportation Corporation or any official tourism body.

- **Photos**: most photography on this site comes from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license), which permits commercial and non-commercial use without attribution. The one exception is the Oncheonjang station photo (`public/pages/oncheonjang.jpg`), which is [Hurshimchung 01.JPG](https://commons.wikimedia.org/wiki/File:Hurshimchung_01.JPG) by Abasaa via Wikimedia Commons, released into the public domain (PD-self) — resized for the web.
- **Fonts**: Instrument Serif, Shippori Mincho, and M PLUS Rounded 1c, served via Google Fonts, all licensed under the [SIL Open Font License](https://scripts.sil.org/OFL).
- **Code**: built with React, Vite, TypeScript, Tailwind CSS, motion/react, and GSAP.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
