import "frida-il2cpp-bridge";

import { AssemblyHelper } from "./engine/AssemblyHelper";
import { Config } from "./mod/data/Config";
import { ModPreferences } from "./mod/data/ModPreferences";
import { CustomBgm } from "./mod/features/CustomBgm";
import { TitleLabel } from "./mod/features/TitleLabel";
import { UpdateChecker } from "./mod/features/UpdateChecker";
import { Uwuify } from "./mod/features/Uwuify";
import { VersionCheck } from "./mod/features/VersionCheck";
import { I18n } from "./mod/i18n/I18n";
import { I18nHook } from "./sonolus/I18nHook";
import { SectionsHook } from "./sonolus/routes/SectionsHook";
import { TitleHook } from "./sonolus/ui/TitleHook";
import { App } from "./sonolus/wrappers/App";
import { Logger } from "./utils/Logger";

function logBanner(): void {
    const { VERSION, BUILD, ENV, HASH, FOR_GAME_VERSION } = ModPreferences;
    const semVer = App.semVer;
    const unityVersion = Il2Cpp.unityVersion;

    Logger.infoGreen(`SonolusReverse v${VERSION} (build ${BUILD}) - ${HASH} (${ENV}). Game Version: ${semVer} | Unity Version: ${unityVersion}`);

    if (FOR_GAME_VERSION !== semVer) {
        Logger.warn(`Sonolus version ${semVer} isn't supported by SonolusReverse. Script will still load, but things may break`);
    }
}

function ifDev(): void {
    /// #if DEV
    // Il2Cpp.installExceptionListener("all");
    /// #endif
}

function initEngine(): void {
    AssemblyHelper.init();
}

function initGame(): void {
    TitleHook.init();
    SectionsHook.init();
    I18nHook.init();
}

function initMod(): void {
    Config.load();
    TitleLabel.init();
    VersionCheck.init();
    I18n.init();
    CustomBgm.init();
    Uwuify.init();
    UpdateChecker.checkVersion();
}

function init(): void {
    Logger.info("Script loaded!");

    Il2Cpp.perform(() => {
        ifDev();

        Logger.info("Il2Cpp loaded!");

        initEngine();

        logBanner();

        initGame();

        initMod();
    }).catch(error => Logger.error(`Failed to initialize script: ${error}`));
}

init();
