import { AssemblyHelper } from "../../engine/AssemblyHelper";

/** `Sonolus.App` - static class for version */
export class App {
    private static _class: Il2Cpp.Class | null = null;

    private static _version: string | undefined;
    private static _semVer: string | undefined;

    static get class(): Il2Cpp.Class {
        return (this._class ??= AssemblyHelper.AssemblyCSharp.class("Sonolus.App"));
    }

    /**
     * Gets Sonolus Version
     *
     * You can also use `Il2Cpp.application.version` for getting version
     */
    static get semVer(): string {
        // get_SemVer is `Sonolus.SemVer`
        return (this._semVer ??= this.class.method<Il2Cpp.Object>("get_SemVer").invoke().method<Il2Cpp.String>("ToString").invoke().content ?? "unknown");
    }

    /** @deprecated not working properly, use `semVer` instead */
    static get version(): string {
        return (this._version ??= this.class.field<Il2Cpp.String>("Version").value.content ?? "unknown");
    }
}
