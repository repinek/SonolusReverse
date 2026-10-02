import { System } from "../../../engine/System";
import { SelectField } from "../../../sonolus/wrappers/ui/common/fields/SelectField";
import { Config } from "../../data/Config";
import { Uwuify } from "../../features/Uwuify";
import { I18n } from "../../i18n/I18n";

export function UwuifyField(): SelectField<Il2Cpp.String> {
    const valueRef = Config.getRef("uwuifyLevel");

    valueRef.hook(() => {
        Uwuify.toggleUwuifyMode();
    });

    return SelectField.new<Il2Cpp.String>(System.String)
        .title(I18n.tRef("ui.uwuify.title"))
        .description(I18n.tRef("ui.uwuify.description"))
        .value(valueRef)
        .defaultValue(Il2Cpp.string("off"))
        .options(
            new Map([
                [Il2Cpp.string("off"), I18n.tRef("ui.uwuify.options.off")],
                [Il2Cpp.string("owo"), I18n.tRef("ui.uwuify.options.owo")],
                [Il2Cpp.string("uwu"), I18n.tRef("ui.uwuify.options.uwu")],
                [Il2Cpp.string("uvu"), I18n.tRef("ui.uwuify.options.uvu")],
                [Il2Cpp.string("max"), I18n.tRef("ui.uwuify.options.max")]
            ])
        )
        .validate();
}
