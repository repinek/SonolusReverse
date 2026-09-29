import { Assets } from "../../sonolus/wrappers/Assets";
import { Dep } from "../../sonolus/wrappers/reactivity/Dep";
import { BtnType } from "../../sonolus/wrappers/ui/common/BtnType";
import { ImgBtn } from "../../sonolus/wrappers/ui/common/ImgBtn";
import { ImgLblBtn } from "../../sonolus/wrappers/ui/common/ImgLblBtn";
import { I18n } from "../i18n/I18n";

export function createOkBtn(): ImgLblBtn {
    return ImgLblBtn.new()
        .title(I18n.tRef("ui.popup.ok"))
        .icon(Dep.opImplicit(Assets.getAsset("Check")))
        .validate();
}

export function createUndoBtn(): ImgBtn {
    return ImgBtn.new()
        .icon(Dep.opImplicit(Assets.getAsset("Undo")))
        .type(BtnType.Warning);
}
