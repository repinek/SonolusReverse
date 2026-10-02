import { ToggleField } from "../../../sonolus/wrappers/ui/common/fields/ToggleField";
import { Config } from "../../data/Config";
import { I18n } from "../../i18n/I18n";

export function versionField(): ToggleField {
    const valueRef = Config.getRef("versionCheck");

    // prettier-ignore
    return ToggleField.new()
        .title(I18n.tRef("ui.version_check.title"))
        .description(I18n.tRef("ui.version_check.description"))
        .value(valueRef)
        .validate();
}
