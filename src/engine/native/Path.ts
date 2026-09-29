import { Logger } from "../../utils/Logger";
import { AssemblyHelper } from "../AssemblyHelper";

export class Path {
    private static readonly tag = "Path";

    private static readonly CONFIG_FILE = "config.json";

    private static _dataPath: string | null = null;

    /** Wrapper over `UnityEngine.Application.get_persistentDataPath` */
    static get dataPath(): string {
        if (this._dataPath !== null) return this._dataPath;

        // Il2Cpp.application.identifier returns "app_process64" on android which is not true
        const raw = AssemblyHelper.CoreModule.class("UnityEngine.Application").method<Il2Cpp.String>("get_persistentDataPath").invoke();
        if (raw.isNull()) {
            Logger.error(`[${this.tag}::getDataPath] persistentDataPath returned null`);
            return "";
        }

        const rawString = raw.content;
        if (!rawString) {
            Logger.error(`[${this.tag}::getDataPath] persistentDataPath content is null`);
            return "";
        }

        this._dataPath = rawString.endsWith("/") ? rawString : rawString + "/";
        Logger.debug(`[${this.tag}::getDataPath] ${this._dataPath}`);
        return this._dataPath;
    }

    /**
     * Creates directories recursively
     *
     * Wrapper over `System.IO.Directory.CreateDirectory(path)`
     */
    static createDirectory(path: string): void {
        Logger.debug(`[${this.tag}::createDirectory] ${path}`);
        Il2Cpp.corlib.class("System.IO.Directory").method("CreateDirectory").invoke(Il2Cpp.string(path));
    }

    /**
     * Returns the names of files that meet specified criteria
     *
     * Wrapper over `System.IO.Directory.GetFiles(path, searchPattern)`
     */
    static getFiles(path: string, searchPattern: string): string[] {
        Logger.debug(`[${this.tag}::getFiles] ${path} pattern: ${searchPattern}`);
        const il2cppArray = Il2Cpp.corlib
            .class("System.IO.Directory")
            .method<Il2Cpp.Array<Il2Cpp.String>>("GetFiles", 2)
            .invoke(Il2Cpp.string(path), Il2Cpp.string(searchPattern));

        const result: string[] = [];

        for (let i = 0; i < il2cppArray.length; i++) {
            const filePath = il2cppArray.get(i).content;
            if (filePath) result.push(filePath);
        }

        return result;
    }

    static exists(path: string): boolean {
        Logger.debug(`[${this.tag}::exists] ${path}`);
        return Il2Cpp.corlib.class("System.IO.File").method<boolean>("Exists", 1).invoke(Il2Cpp.string(path));
    }

    static delete(path: string): void {
        Logger.debug(`[${this.tag}::delete] ${path}`);
        Il2Cpp.corlib.class("System.IO.File").method<void>("Delete", 1).invoke(Il2Cpp.string(path));
    }

    static move(sourcePath: string, distPath: string): void {
        Logger.debug(`[${this.tag}::move] sourcePath: ${sourcePath} distPath: ${distPath}`);

        if (!Path.exists(sourcePath)) throw new Error("sourcePath not found");
        if (Path.exists(distPath)) Path.delete(distPath); // overwrite

        Il2Cpp.corlib.class("System.IO.File").method("Move", 2).invoke(Il2Cpp.string(sourcePath), Il2Cpp.string(distPath));
    }

    static getFileNameFromPath(filePath: string): string {
        const fileName = filePath.split("/").at(-1);
        return fileName ? fileName : filePath;
    }

    static getFileNameWithoutExtension(filePath: string): string {
        const fileName = this.getFileNameFromPath(filePath);
        const dotIndex = fileName.lastIndexOf(".");
        return dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
    }

    static get configFilePath(): string {
        return this.dataPath + this.CONFIG_FILE;
    }

    static get customBgmPath(): string {
        return this.dataPath + "CustomBgm/";
    }
}
