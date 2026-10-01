import { AssemblyHelper } from "../AssemblyHelper";

/**
 * `UnityEngine.Object ` - base class for all objects Unity can reference
 *
 * Only static methods are wrapped here
 */
// ts(2725): Class name cannot be `Object` when targeting ES5 and above with module NodeNext.
// That's why UEObject - Unity Engine Object
// Not Il2Cpp.Object, it's different!
// This wraps managed C# type
export class UEObject {
    protected static _class: Il2Cpp.Class | null = null;

    /** `UnityEngine.Object` */
    static get class(): Il2Cpp.Class {
        return (this._class ??= AssemblyHelper.CoreModule.class("UnityEngine.Object"));
    }

    // static UnityEngine.Object[] FindObjectsOfType(System.Type type, bool includeInactive);
    static findObjectsOfType(type: Il2Cpp.Object, includeInactive: boolean): Il2Cpp.Array<Il2Cpp.Object> {
        return this.class.method<Il2Cpp.Array<Il2Cpp.Object>>("FindObjectsOfType", 2).invoke(type, includeInactive);
    }

    static findObjectFromInstanceID(id: number): Il2Cpp.Object | undefined {
        const object = this.class.method<Il2Cpp.Object>("FindObjectFromInstanceID", 1).invoke(id);
        if (object.isNull()) return undefined;
        return object;
    }

    static getInstanceID(object: Il2Cpp.Object): number {
        return object.method<number>("GetInstanceID").invoke();
    }
}
