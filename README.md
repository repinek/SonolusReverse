> [!WARNING]  
> This Project is for **educational and research purposes only**. **Not affiliated with Sonolus**; using this mod may violate Sonolus' [TOS](https://sonolus.com/tos) and [EULA](https://sonolus.com/eula).  
> **Use at your own risk.** I'm **NOT** responsible for bans or anything else that happens to you or your account.  
> If you enjoy Sonolus, please consider supporting Sonolus by purchasing VIP or gems in-game.  
> If you want to contact me: see [Contact Me](#contact-me)

# SonolusReverse

<a href="https://discord.gg/43FsKRzxnf">
  <img src="https://img.shields.io/badge/Join%20Us%20on-Discord-blue?style=flat&logo=discord" alt="Discord">
</a>
<a href="https://github.com/repinek/SonolusReverse/releases/latest">
    <img src="https://img.shields.io/badge/Download-latest-30c252?logo=github" alt="Download latest">
</a>  
<img src="https://github.com/repinek/SonolusReverse/actions/workflows/on-commit.yml/badge.svg" alt="Build Status">

A Mod for the [Sonolus](https://sonolus.com/) rhythm game with extra features, written using [Frida](https://frida.re/) and [frida-il2cpp-bridge](https://github.com/vfsfitvnm/frida-il2cpp-bridge)

The latest release **1.1.4** on **Android**: refer [Installation](#installation)  
For announcements and support join our community in Discord: [SonolusReverse Discord](https://discord.gg/43FsKRzxnf)

## Screenshots

<img src="assets/images/screenshot1.jpg" width="700" alt="SonolusReverse section in Settings">
<img src="assets/images/screenshot2.jpg" width="700" alt="Themes shortcut & Themes spoofing">

> `Rosé Pine 2`, `Everforest Dark` - Custom themes  
> `彗く星（しいたけ杯）` - An exclusive theme for tournament participants

## Features

- **Custom Settings Section**
- **VIP + Themes spoof**: Client-side unlock of VIP _(removes ads)_ and all themes _(including exclusives)_. **Requires logged-in account**
- **Version Spoof**: Override the version used by the client compatibility checks
- **Custom Themes**: Create your own themes in JSON format! See our [wiki](https://github.com/repinek/SonolusReverse/wiki)
- **Custom UI BGM**: Change UI Background Music to own!

##### Planned:

See our [TODO](TODO.md). If you wanna contribute: see [Contributing](#contributing)

## Installation

✅ **Android**: Install as a regular `.apk` file, downloadable from the [GitHub Releases Page](https://github.com/repinek/SonolusReverse/releases/latest)

⚠️ **iOS**: Currently in testing. The script is written for iOS, but there is **no release build**. You will need to build it from source.

**An iOS build guide by [JexOpy](https://github.com/JexOpy) is available [here](https://gist.github.com/JexOpy/3aed12c92824921449ba68cb5b041133).**  
**Note**: There may also be issues patching functions on recent iOS versions _(iOS 26+)_: see [Frida issue #3650](https://github.com/frida/frida/issues/3650). **It should work fine on older iOS versions.**

## Contributing

Got ideas? Want to add localization? Found a bug? Pull requests and issues are welcome!  
Please read our [Contributing Guide](CONTRIBUTING.md)

## Contact Me

My contacts are on my GitHub Profile - [@repinek](https://github.com/repinek/)

## License

This project is licensed under the **GNU General Public License v3.0**.
See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Frida Documentation](https://frida.re/docs/) - General Frida API reference.
- [frida-il2cpp-bridge Wiki](https://github.com/vfsfitvnm/frida-il2cpp-bridge/wiki) - Specific API for the IL2CPP used in this project.
- [fallguys-frida-modmenu](https://github.com/repinek/fallguys-frida-modmenu) - Some Code and architecture adapted from my earlier Frida project.
- [Gene Brawl](https://github.com/RomashkaTea/genebrawl-public) - Some code and architecture adapted from Gene Brawl.
