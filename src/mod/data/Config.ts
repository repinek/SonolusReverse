import { Path } from "../../engine/native/Path";
import { Ref } from "../../sonolus/wrappers/reactivity/Ref";
import { Logger } from "../../utils/Logger";
import type { UwuLevel } from "../features/Uwuify";

type ConfigRefValue<T> = T extends string ? Il2Cpp.String : T;

interface ConfigData {
    versionCheck: boolean;
    customBgmPath: string;
    uwuifyLevel: UwuLevel;
}

const DEFAULT_CONFIG: ConfigData = {
    versionCheck: false,
    customBgmPath: "",
    uwuifyLevel: "off"
};

export class Config {
    private static readonly tag = "Config";

    private static _refs = new Map<string, Ref<unknown>>();

    static versionCheck: boolean = DEFAULT_CONFIG.versionCheck;
    static customBgmPath: string = DEFAULT_CONFIG.customBgmPath;
    static uwuifyLevel: UwuLevel = DEFAULT_CONFIG.uwuifyLevel;

    /** Loads config state from the file */
    static load(): void {
        const path = Path.configFilePath;
        this.apply(DEFAULT_CONFIG);

        if (!Path.exists(path)) {
            Logger.warn(`[${this.tag}::load] No config file found, using defaults`);
        } else {
            try {
                const data = JSON.parse(File.readAllText(path));
                this.apply(this.parse(data));
            } catch (error) {
                Logger.warn(`[${this.tag}::load] Invalid config, using valid values or defaults: ${error}`);
            }
        }

        Logger.info(`[${this.tag}::load] Config loaded with ${Object.keys(this.fields).length} values`);
    }

    /** Saves current config state to the file */
    static save(): void {
        const path = Path.configFilePath;
        try {
            const file = new File(path, "w");
            file.write(this.toJSON());
            file.close();
            Logger.debug(`[${this.tag}::save] Config saved`);
        } catch (error) {
            Logger.error(`[${this.tag}::save] Failed to save config: ${error}`);
        }
    }

    /** Current config state to JSON */
    private static toJSON(): string {
        const data = this.fields;
        return JSON.stringify(data, null, 4);
    }

    /** Applies config values to the current config state */
    private static apply(data: ConfigData): void {
        this.versionCheck = data.versionCheck;
        this.customBgmPath = data.customBgmPath;
        this.uwuifyLevel = data.uwuifyLevel;
    }

    /** Parse JSON data into a valid config object, using default for missing or invalid values */
    private static parse(data: unknown): ConfigData {
        // Check if data even valid object
        if (!data || typeof data !== "object" || Array.isArray(data)) return DEFAULT_CONFIG;

        const rawData = data as Record<string, unknown>;
        return {
            versionCheck: typeof rawData.versionCheck === "boolean" ? rawData.versionCheck : DEFAULT_CONFIG.versionCheck,
            customBgmPath: typeof rawData.customBgmPath === "string" ? rawData.customBgmPath : DEFAULT_CONFIG.customBgmPath,
            uwuifyLevel: this.isUwuLevel(rawData.uwuifyLevel) ? rawData.uwuifyLevel : DEFAULT_CONFIG.uwuifyLevel
        };
    }

    /** Returns a cached reactive ref for a config value */
    static getRef<K extends keyof ConfigData>(key: K): Ref<ConfigRefValue<ConfigData[K]>> {
        let ref = this._refs.get(key) as Ref<ConfigRefValue<ConfigData[K]>> | undefined;
        if (!ref) {
            const initialValue = this.fields[key];
            const r = Ref.create(initialValue) as Ref<ConfigRefValue<ConfigData[K]>>;
            r.hook(() => {
                const value = typeof initialValue === "string" ? ((r.value as Il2Cpp.String).content ?? "") : r.value;
                (Config as unknown as ConfigData)[key] = value as ConfigData[K];
                Config.save();
            });
            this._refs.set(key, r);
            ref = r;
        }
        return ref;
    }

    /** Checks if value is valid uwuLevel string */
    private static isUwuLevel(value: unknown): value is UwuLevel {
        return value === "off" || value === "owo" || value === "uwu" || value === "uvu" || value === "max";
    }

    private static get fields(): ConfigData {
        return {
            versionCheck: this.versionCheck,
            customBgmPath: this.customBgmPath,
            uwuifyLevel: this.uwuifyLevel
        };
    }
}
