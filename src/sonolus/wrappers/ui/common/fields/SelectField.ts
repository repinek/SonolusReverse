import { AssemblyHelper } from "../../../../../engine/AssemblyHelper";
import { System } from "../../../../../engine/System";
import { Dep } from "../../../reactivity/Dep";
import { Ref } from "../../../reactivity/Ref";
import { Field } from "./Field";

/**
 * `Sonolus.UI.Common.Fields.SelectField<T>`
 *
 * @requires Title, Value, Options
 */
export class SelectField<T extends Il2Cpp.Field.Type> extends Field {
    protected static override _class: Il2Cpp.Class | null = null;

    private genericClass!: Il2Cpp.Class;

    static override get class(): Il2Cpp.Class {
        return (this._class ??= AssemblyHelper.AssemblyCSharp.class("Sonolus.UI.Common.Fields.SelectField`1"));
    }

    static new<T extends Il2Cpp.Field.Type>(genericClass: Il2Cpp.Class): SelectField<T> {
        const obj = this._new<SelectField<T>>(this.class.inflate(genericClass));
        obj.genericClass = genericClass;
        obj.setRequired(["title", "value", "options"]);
        return obj;
    }

    value(value: Ref<T>): this {
        this.method<void>("SetValue", 1).invoke(value);
        this.setMark("value");
        return this;
    }

    defaultValue(value: T): this {
        this.method<void>("SetDefaultValue", 1).invoke(value);
        this.setMark("defaultValue");
        return this;
    }

    options(options: ReadonlyMap<T, Dep<Il2Cpp.String>>): this {
        const dictionaryClass = Il2Cpp.corlib.class("System.Collections.Generic.Dictionary`2").inflate(this.genericClass, Dep.class.inflate(System.String));
        const dictionary = dictionaryClass.new();

        for (const [value, title] of options) {
            dictionary.method<void>("Add", 2).invoke(value, title);
        }

        this.method<void>("SetOptions", 1).invoke(dictionary);
        this.setMark("options");
        return this;
    }

    enabled(enabled: Dep<boolean>): this {
        this.method<void>("SetEnabled", 1).invoke(enabled);
        return this;
    }
}
