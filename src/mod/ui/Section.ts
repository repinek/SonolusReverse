import { SectionsHook } from "../../sonolus/routes/SectionsHook";
import { Assets } from "../../sonolus/wrappers/Assets";
import { Dep } from "../../sonolus/wrappers/reactivity/Dep";
import { RouteSection } from "../../sonolus/wrappers/routing/RouteSection";
import { Rows } from "../../sonolus/wrappers/ui/common/Rows";
import { CustomSection } from "../../sonolus/wrappers/ui/common/sections/CustomSection";
import { SectionBase } from "../../sonolus/wrappers/ui/common/sections/SectionBase";
import { PopupExtensions } from "../../sonolus/wrappers/ui/popup/PopupExtensions";
import { Widget } from "../../sonolus/wrappers/ui/Widget";
import { ModPreferences } from "../data/ModPreferences";
import { UpdateChecker } from "../features/UpdateChecker";
import { I18n } from "../i18n/I18n";
import { Version } from "../utils/version";
import { aboutField } from "./fields/AboutField";
import { bgmField } from "./fields/BgmField";
import { versionField } from "./fields/VersionField";

export class CustomSectionMod {
    private static readonly SECTION_ICON_NAME: string = "IconStar";
    private static _versionPopupShown: boolean = false;

    static buildCustomSection(): RouteSection {
        // Show popup if outdated version
        const latest = UpdateChecker.latestVersion;
        if (!this._versionPopupShown && latest && Version.isNewerThan(latest, ModPreferences.VERSION)) {
            PopupExtensions.showHelp(SectionsHook.router, I18n.t("ui.about.popup.update_available"));
            this._versionPopupShown = true;
        }

        const title = this.title();
        const rows = Rows.new().gap(20).children([title, versionField(), bgmField(), aboutField()]);

        const section = CustomSection.new().content(rows).validate();

        const icon = Dep.opImplicit(Assets.getAsset(this.SECTION_ICON_NAME));
        const route = RouteSection.new(icon, section);
        return route;
    }

    private static title(): Widget {
        // later this information will be in About Tab
        return SectionBase.createTitle(
            /// #if DEV
            I18n.tRef("ui.title_dev", ModPreferences.VERSION, ModPreferences.BUILD, ModPreferences.HASH, ModPreferences.ENV),
            /// #else
            // @ts-ignore
            I18n.tRef("ui.title", ModPreferences.VERSION)
            /// #endif
        );
    }
}
