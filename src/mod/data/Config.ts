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

export class Config {
    private static readonly tag = "Config";

    private static _refs = new Map<string, Ref<unknown>>();

    static versionCheck: boolean = false;
    static customBgmPath: string = "";
    static uwuifyLevel: UwuLevel = "off";

    static load(): void {
        const path = Path.configFilePath;
        try {
            // Looks messy tbh
            // Maybe use `Object.assign(Config, data) instead this
            // But not typed then
            // TODO FIXME
            const data = JSON.parse(File.readAllText(path)) as ConfigData;
            const state = Config as unknown as Record<keyof ConfigData, unknown>;
            for (const key of Object.keys(data) as (keyof ConfigData)[]) {
                state[key] = data[key];
            }
        } catch {
            Logger.warn(`[${this.tag}::load] No config file found, using defaults`);
        }
        Logger.info(`[${this.tag}::load] Config loaded with ${Object.keys(this.fields).length} values`);
    }

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

    // Maybe we don't need here il2cpp logic (?)
    // very very complicated
    // very messy
    // TODO: rewrite
    static registerOrGet<K extends keyof ConfigData>(key: K, initialValue: ConfigData[K]): Ref<ConfigRefValue<ConfigData[K]>> {
        let ref = this._refs.get(key) as Ref<ConfigRefValue<ConfigData[K]>> | undefined;
        if (!ref) {
            const r = Ref.create(initialValue) as Ref<ConfigRefValue<ConfigData[K]>>; // r is temp ref var. TS moment???
            r.hook(() => {
                const value = typeof initialValue === "string" ? ((r.value as Il2Cpp.String).content ?? "") : r.value;
                (Config as unknown as Record<string, unknown>)[key] = value;
                Config.save();
            });
            this._refs.set(key, r);
            ref = r;
        }
        return ref;
    }

    private static toJSON(): string {
        const data = this.fields;
        return JSON.stringify(data, null, 4);
    }

    private static get fields(): Record<string, unknown> {
        return {
            versionCheck: this.versionCheck,
            customBgmPath: this.customBgmPath,
            uwuifyLevel: this.uwuifyLevel
        };
    }
}
