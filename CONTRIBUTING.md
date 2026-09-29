# Contributing to SonolusReverse

Thank you for your interest in this project! We welcome any contributions, such as bug fixes, new features or localization improvements.

#### Contents

- [Prerequisites](#prerequisites)
- [Adding new localization](#adding-new-localization)
- [Building](#building)
- [Developing](#developing)
- [Scripts](#available-npm-scripts)
- [Project Structure](#project-structure)
- [Pull Request Process](#pull-request-process)

## Prerequisites

#### For adding new localizations:

- [GitHub](https://github.com/) account
- Knowledge of the language

#### For Building and Development:

If you are using [Nix](https://nixos.org/), you can use the provided [flake.nix](flake.nix) to automatically set up the development shell. Otherwise, ensure you have the following installed:

- git
- wget _(For downloading Sonolus APK using CLI)_
- [Python 3.10+](https://www.python.org/) _(**3.14** is recommended)_
- [Node.js 24+](https://nodejs.org/) _(or latest)_
- [JDK](https://www.oracle.com/java/technologies/downloads/) _(JRE)_
- `zipalign` and `apksigner` _(or the [Android SDK](https://developer.android.com/studio))_
- Android device
- [Android Debug Bridge (ADB)](https://developer.android.com/tools/adb)

## Adding new localization

> **NOTE:** The language should be supported by Sonolus

Please follow these steps to submit a translation for a new language:

0. Preparation  
   Read the [Pull Request Process](#pull-request-process) to learn how to properly submit your changes.

1. Create localization file
   Navigate to `src/mod/i18n/localization/` and create a new `<lang>.json` file, where `<lang>` is your [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)  
   Use existing language files in this directory as a template.

2. Add your language to the code  
   Open `src/mod/i18n/I18n.ts` to import your translation file and add it to the `TRANSLATIONS` record:

    ```ts
    import lang from "./localization/lang.json";

    // Register your language in the TRANSLATIONS record
    const TRANSLATIONS: Record<string, unknown> = {
        en: en,
        lang: lang
    };
    ```

## Building

0.  Environment Setup and dependencies
    - Download Sonolus APK (or you can download it from Sonolus website)

        ```bash
        # Download sonolus APK, change <VERSION> to actual game version: e.g. 1.1.2
        wget https://download.sonolus.com/Sonolus_<VERSION>.apk
        ```

    - If you are using **[Nix](https://nixos.org)**, simply run:

        ```bash
        nix develop

        # Install script dependencies for node.js
        npm install
        ```

        It will automatically install Node.js, Python 3.14, JDK, Android Build Tools, set up the python virtual environment and install all python dependencies

    - If you are not using **Nix**

        ```bash
        # Creating a virtual environment for Python
        python -m venv .venv

        # Activate Python venv, it's depending on what OS you are. For example Linux with fish:
        . .venv/bin/activate.fish

        # Install build dependencies for python
        pip install -r requirements_build.txt

        # Install script dependencies for node.js
        npm install
        ```

1.  Build a script  
    Build the script into `dist/agent.js`:

    ```bash
    npm run build
    ```

2.  patch Sonolus APK using frida gadget in **script** mode.  
    I'm using [fgi](https://github.com/commonuserlol/fgi), but you can use [frida-gadget script](https://github.com/ksg97031/frida-gadget), [objection](https://github.com/sensepost/objection) or any other method

    ```bash
    fgi -i <path-to-sonolus-apk> -t script -l dist/agent.js
    ```

    Patched APK will be saved with `.patched` suffix

## Developing

These instructions are for developers who want to modify the script and test changes dynamically without rebuilding and reinstalling the APK every time.

0.  Environment Setup and dependencies  
    Follow Step 0 from [Building](#building), but also install frida CLI

    ```bash
    pip install -r requirements.txt
    ```

1.  Patch Sonolus APK using Frida Gadget in **listen** mode _(or use frida-server)_.  
    I'm using [fgi](https://github.com/commonuserlol/fgi), but you can use [frida-gadget script](https://github.com/ksg97031/frida-gadget), [objection](https://github.com/sensepost/objection) or any other method

    ```bash
    fgi -i <path-to-sonolus-apk>
    ```

    Patched APK will be saved with `.patched` suffix

2.  Install APK on your android device

    ```bash
    adb install <path-to-sonolus-patched-apk>
    ```

3.  Spawn script  
    Open patched apk on your device and run
    ```
    # Compiles a dev version script and spawns it
    npm run spawn:dev
    ```

## Available NPM Scripts

### Build

These scripts build the agent into `./dist/agent.js` using Webpack:

- `npm run build` – Builds a **RELEASE** version (minified, optimized, increments `.build-counter`).
- `npm run build:nobump` – Builds a **RELEASE** version _without_ incrementing `.build-counter`.
- `npm run build:dev` – Builds a **DEVELOPMENT** version.

### Spawn

> **Prerequisites:** Requires a patched APK with Frida Gadget configured in **listen** mode, and Frida CLI tools installed via Python (`requirements.txt`).  
> Your device should be connected via ADB

- `npm run spawn` – Injects the compiled `dist/agent.js` into the connected device.
- `npm run spawn:dev` – Runs `build:dev` and `spawn`.
- `npm run spawn:release` – Runs `build:release` and `spawn`.

### Code Quality & Formatting

- `npm run prettier` – Formats the codebase using [Prettier](https://prettier.io/).
- `npm run lint` – Runs [ESLint](https://eslint.org/) to perform static code analysis and fix issues via the `--fix` flag.

## Project Structure

```
SonolusReverse/
├── .github                             # Github CI/CD workflows
│   └── workflows
│       └── on-commit.yml               # Triggered on push/PR: Builds script
│
├── assets                              # Images for README.md
│
├── src
│   ├── index.ts                        # Entry Point
│   │
│   ├── engine                          # Everything related to UnityEngine
│   │   ├── native                      # Our classes
│   │   ├── wrappers                    # Wrappers for UnityEngine.* Classes
│   │   ├── AssemblyHelper.ts           # Manages IL2CPP assemblies
│   │   └── System.ts                   # short-hand to System.* Types
│   │
│   ├── mod                             # Everything related to Mod
│   │   ├── data                        # Mod Config, constants, etc.
│   │   │   ├── Config.ts
│   │   │   ├── Constants.ts
│   │   │   └── ModPreferences.ts
│   │   ├── features                    # Features logic
│   │   ├── i18n                        # Internationalization system
│   │   │   ├── localization            # JSON Translations Files
│   │   │   │   ├── en.json
│   │   │   │   ├── ru.json
│   │   │   │   └── vi.json
│   │   │   └── I18n.ts
│   │   ├── ui                          # Mod UI
│   │   │   ├── Fields
│   │   │   └── Section.ts              # Custom Sections in Settings
│   │   └── utils                       # Helper functions for mod
│   │
│   ├── sonolus                         # Sonolus logic
│   │   ├── routes                      # Hook for routes
│   │   ├── ui                          # Hook for integration custom UI
│   │   ├── wrappers                    # Wrappers for Sonolus.* Classes
│   │   │   ├── content
│   │   │   ├── core
│   │   │   ├── reactivity
│   │   │   ├── routing
│   │   │   ├── theme
│   │   │   ├── ui
│   │   │   ├── App.ts                  # Sonolus.App
│   │   │   └── Assets.ts               # Sonolus.Assets
│   │   └── I18nHook.ts                 # Hook for I18n
│   └── utils                           # Global helpers functions
│
├── eslint.config.mts                   # ESLint Configuration
├── flake.nix                           # Nix development shell
├── package.json                        # Node.js dependencies & Scripts
├── requirements.txt                    # Python dependencies (Frida CLI)
├── requirements_build.txt              # Python dependencies for building (fgi)
├── TODO.md
├── tsconfig.json                       # TypeScript Configuration
├── version.json                        # Script parses this file
└── webpack.config.mts                  # Webpack Configuration
```

## Pull Request Process

You can contribute using either the GitHub web interface or the `git` CLI.  
Follow these steps to submit a pull request:

1. **Fork** the repository
2. **Create** a feature branch (e.g. `<your_nickname>/add-ru-localization`)
3. **Make** your changes
4. **Commit** your changes
5. **Push** changes to your branch
6. **Open** a pull request

You can read more information here: [GitHub "Pull request" documentation](https://docs.github.com/en/pull-requests/reference/pull-requests) and [GitHub "Creating a pull request" documentation](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request)
