import { Application } from "../../../engine/wrappers/Application";
import { SectionsHook } from "../../../sonolus/routes/SectionsHook";
import { App } from "../../../sonolus/wrappers/App";
import { Assets } from "../../../sonolus/wrappers/Assets";
import { Dep } from "../../../sonolus/wrappers/reactivity/Dep";
import { BtnField } from "../../../sonolus/wrappers/ui/common/fields/BtnField";
import { ImgLblBtn } from "../../../sonolus/wrappers/ui/common/ImgLblBtn";
import { PopupExtensions } from "../../../sonolus/wrappers/ui/popup/PopupExtensions";
import { WidgetUtils } from "../../../sonolus/wrappers/ui/WidgetUtils";
import { Constants } from "../../data/Constants";
import { ModPreferences } from "../../data/ModPreferences";
import { UpdateChecker } from "../../features/UpdateChecker";
import { I18n } from "../../i18n/I18n";
import { createOkBtn } from "../../utils/BtnHelpers";
import { Version } from "../../utils/version";

function updateBtnOnClick(): () => void {
    return () => {
        UpdateChecker.checkVersion();
        const latest = UpdateChecker.latestVersion;
        if (!latest) {
            PopupExtensions.showError(SectionsHook.router, I18n.t("ui.about.popup.checking"), [createOkBtn()]);
            return;
        }

        if (Version.isNewerThan(latest, ModPreferences.VERSION)) {
            PopupExtensions.showHelp(SectionsHook.router, I18n.t("ui.about.popup.update_available"));
        } else {
            PopupExtensions.showHelp(SectionsHook.router, I18n.t("ui.about.popup.up_to_date"));
        }
    };
}

function updateBtn(): ImgLblBtn {
    return ImgLblBtn.new()
        .title(I18n.tRef("ui.about.update_button"))
        .icon(Dep.opImplicit(Assets.getAsset("Refresh")))
        .onClick(updateBtnOnClick())
        .validate();
}

function discordBtn(): ImgLblBtn {
    const btn = ImgLblBtn.new()
        .title(I18n.tRef("ui.about.discord_button"))
        .icon(Dep.opImplicit(Assets.getAsset("Link")))
        .onClick(() => {
            Application.openURL(Constants.DISCORD_URL);
        })
        .validate();

    return WidgetUtils.margin(btn, 20, 0, 0, 0) as ImgLblBtn;
}

function githubBtn(): ImgLblBtn {
    const btn = ImgLblBtn.new()
        .title(I18n.tRef("ui.about.github_button"))
        .icon(Dep.opImplicit(Assets.getAsset("Link")))
        .onClick(() => {
            Application.openURL(Constants.GITHUB_URL);
        })
        .validate();

    return WidgetUtils.margin(btn, 20, 0, 0, 0) as ImgLblBtn;
}

export function aboutField(): BtnField {
    return BtnField.new()
        .title(I18n.tRef("ui.about.title"))
        .description(I18n.tRef("ui.about.description", ModPreferences.VERSION, ModPreferences.HASH, ModPreferences.ENV, App.semVer))
        .value(Dep.opImplicit(""))
        .btns([updateBtn(), discordBtn(), githubBtn()])
        .validate();
}
