import { AssemblyHelper } from "../AssemblyHelper";

/**
 * `UnityEngine.Object` - base class for all objects Unity can reference
 *
 * Only static methods are wrapped here
 */
// ts(2725): Class name cannot be `Object` when targeting ES5 and above with module NodeNext.
// That's why it is named UEObject - Unity Engine Object
// Not Il2Cpp.Object - this wraps the managed C# type
export class UEObject {
    protected static _class: Il2Cpp.Class | null = null;

    /** `UnityEngine.Object` */
    static get class(): Il2Cpp.Class {
        return (this._class ??= AssemblyHelper.CoreModule.class("UnityEngine.Object"));
    }

    // Obsolete in Unity 6.0 LTS
    // https://docs.unity3d.com/Manual/UpgradeGuideUnity6.html
    // Use FindObjectsByType instead, but this is fine for now
    /**
     * Gets a list of all loaded objects of type `type`
     *
     * @param type A `System.Type`, accessible through `.type.object`
     */
    static findObjectsOfType(type: Il2Cpp.Object, includeInactive: boolean): Il2Cpp.Array<Il2Cpp.Object> {
        return this.class.method<Il2Cpp.Array<Il2Cpp.Object>>("FindObjectsOfType", 2).invoke(type, includeInactive);
    }

    // Wtf, I can't find any documentation for this one, so no JSDoc
    static findObjectFromInstanceID(id: number): Il2Cpp.Object | undefined {
        const object = this.class.method<Il2Cpp.Object>("FindObjectFromInstanceID", 1).invoke(id);
        if (object.isNull()) return undefined;
        return object;
    }

    // Obsolete in Unity 6.5
    // https://docs.unity3d.com/Manual/instanceid-to-entityid-migration.html
    // Use EntityId instead, but this is fine for now
    /** Gets the instance ID of the object */
    static getInstanceID(object: Il2Cpp.Object): number {
        return object.method<number>("GetInstanceID").invoke();
    }
}
