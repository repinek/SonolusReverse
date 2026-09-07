import { AssemblyHelper } from "../../../engine/AssemblyHelper";

/** `Sonolus.UI.Widget` - base class for all UI components */
export class Widget extends Il2Cpp.Object {
    protected static _class: Il2Cpp.Class | null = null;

    private _setFields = new Set<string>();
    private _requiredFields: string[] = [];

    static get class(): Il2Cpp.Class {
        return (this._class ??= AssemblyHelper.AssemblyCSharp.class("Sonolus.UI.Widget"));
    }

    protected setMark(field: string): void {
        this._setFields.add(field);
    }

    protected setRequired(fields: string[]): void {
        this._requiredFields = fields;
    }

    validate(): this {
        const missing = this._requiredFields.filter(field => !this._setFields.has(field));
        if (missing.length > 0) {
            throw new Error(`${this.constructor.name} missing required: ${missing.join(", ")}`);
        }
        return this;
    }

    /** `class.new()` + setPrototypeOf */
    protected static _new<T extends Widget>(klass: Il2Cpp.Class = this.class): T {
        const obj = klass.new(); // call alloc + il2cpp_object_initialize export
        Object.setPrototypeOf(obj, this.prototype);
        (obj as unknown as Record<string, unknown>)._setFields = new Set<string>();
        (obj as unknown as Record<string, unknown>)._requiredFields = [];
        return obj as T;
    }
}
