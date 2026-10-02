import { AssemblyHelper } from "../../engine/AssemblyHelper";
import { UEObject } from "../../engine/wrappers/Object";
import { Config } from "../data/Config";

/*
 * Ported from https://github.com/UntitledCharts/uc-sonoserver/blob/734097db2111ddfb2a5c1b3985d6ce7b3e637251/helpers/owoify.py
 * Original implementation and this project are licensed under GPL-3.0
 *
 * Some code is taken from https://github.com/repinek/fallguys-frida-modmenu/blob/803ef281be402cfe6c04f53723b5f3a7faf98c50/src/modules/game/UwUify.ts
 */

// TODO: add a less UwUified mode - hook Sonolus i18n keys only, not ALL text
export const UWUIFY_LEVELS = ["off", "owo", "uwu", "uvu", "max"] as const;
export type UwuLevel = (typeof UWUIFY_LEVELS)[number];

interface TextCacheEntry {
    originalText: string;
    uwuifiedText: string;
}

export class Uwuify {
    private static _UIText: Il2Cpp.Class | null = null;
    private static textCacheByInstanceId = new Map<number, TextCacheEntry>();

    static init(): void {
        this._UIText = AssemblyHelper.UI.class("UnityEngine.UI.Text");

        // @ts-ignore
        this._UIText.method<void>("set_text", 1).implementation = this.setTextHook;
    }

    private static setTextHook(this: Il2Cpp.Object, value: Il2Cpp.String): void {
        if (value.isNull()) {
            this.method<void>("set_text", 1).invoke(value);
            return;
        }

        if (Config.uwuifyLevel != "off") {
            const content = value.content;
            if (content && content.length > 0) value = Il2Cpp.string(Uwuify.createUwuifiedString(this, content));
        }

        this.method<void>("set_text", 1).invoke(value);
    }

    static toggleUwuifyMode(): void {
        if (Config.uwuifyLevel !== "off") {
            // Maybe we do not need true here, but then the main menu does not update
            const uiTextObjects = UEObject.findObjectsOfType(this._UIText!.type.object, true);

            for (const uiTextObject of uiTextObjects) {
                const instanceId = UEObject.getInstanceID(uiTextObject);
                const currentText = uiTextObject.method<Il2Cpp.String>("get_text", 0).invoke().content;
                const originalText = this.textCacheByInstanceId.get(instanceId)?.originalText ?? currentText;

                if (originalText !== null) uiTextObject.method<void>("set_text", 1).invoke(Il2Cpp.string(originalText));
            }
        } else {
            for (const [instanceId, { originalText }] of this.textCacheByInstanceId) {
                const uiTextObject = UEObject.findObjectFromInstanceID(instanceId);

                if (uiTextObject) {
                    uiTextObject.method<void>("set_text", 1).invoke(Il2Cpp.string(originalText));
                }
            }
            this.textCacheByInstanceId.clear();
        }
    }

    private static createUwuifiedString(uiTextObject: Il2Cpp.Object, value: string): string {
        const instanceId = UEObject.getInstanceID(uiTextObject);
        const cachedText = this.textCacheByInstanceId.get(instanceId);
        const originalText = cachedText?.uwuifiedText === value ? cachedText.originalText : value;
        const uwuifiedText = this.uwuify(originalText, Config.uwuifyLevel, true);

        this.textCacheByInstanceId.set(instanceId, { originalText, uwuifiedText });
        return uwuifiedText;
    }

    /** UwUifies a string, keeping Unity tags and URLs untouched */
    private static uwuify(sourceText: string, level: UwuLevel, includeSymbols: boolean): string {
        const uwuifiedText = sourceText
            // Keep empty strings, Unity tags and URLs untouched
            .split(/(<[^>]*>|https?:\/\/\S+|www\.\S+|\s+)/g)
            .map(segment => {
                if (!segment || /^\s+$/.test(segment) || /^<[^>]*>$/.test(segment) || /^(?:https?:\/\/|www\.)/.test(segment)) return segment;

                return this.uwuifyWord(segment, level, includeSymbols);
            })
            .join("");

        // Logger.debug(uwuifiedText);
        return uwuifiedText;
    }

    /* UwUifies a word */
    private static uwuifyWord(sourceWord: string, level: UwuLevel, includeSymbols: boolean): string {
        let transformedWord = sourceWord;

        // The (...args: string[]) => string callback is used for `match => ...`
        const replaceText = (pattern: RegExp, replacement: string | ((...args: string[]) => string)): void => {
            transformedWord = transformedWord.replace(pattern, replacement as string);
        };

        const replaceWithFace = (pattern: RegExp): void => {
            const match = transformedWord.match(pattern);
            if (match) transformedWord = transformedWord.replaceAll(match[0], ` ${this.randomFace()}`);
        };

        // All levels
        replaceText(/([Ff])uc/g, "$1wuc");
        replaceText(/([Mm])om/g, "$1wom");
        replaceText(/\b([Tt])ime\b/g, "$1im");
        replaceText(/^Me$/, "Mwe");
        replaceText(/^me$/, "mwe");
        replaceText(/([Oo])ver/g, "$1wor");
        replaceText(/ove/g, "uv");
        replaceText(/OVE/g, "UV");
        replaceText(/\b(ha|hah|heh|hehe)+\b/gi, "hehe xD");
        replaceText(/\b([Tt])he\b/g, "$1eh");
        replaceText(/\bYou\b/g, "U");
        replaceText(/\byou\b/g, "u");
        replaceText(/Read/g, "Wead");
        replaceText(/read/g, "wead");
        replaceText(/([Ww])orse/g, "$1ose");
        replaceText(/([Gg])reat/g, "$1wate");
        replaceText(/([Aa])viat/g, "$1wiat");
        replaceText(/([Dd])edicat/g, "$1editat");
        replaceText(/([Rr])emember/g, "$1ember");
        replaceText(/([Ww])hen/g, "$1en");
        replaceText(/([Ff])righten(ed)*/g, "$1rigten");
        replaceText(/Meme/g, "mem");
        replaceText(/Mem/g, "Mem");
        replaceText(/^([Ff])eel$/, "$1ell");

        // Max
        if (level === "max") {
            // At least 2 characters, a 1/3 chance, and starts with A-Za-z -> double the first letter
            // Hello -> H-Hello
            if (transformedWord.length >= 2 && Math.floor(Math.random() * 3) === 0 && /^[A-Za-z]/.test(transformedWord)) {
                transformedWord = `${transformedWord[0]}-${transformedWord}`;
            }

            replaceText(/([Ss])(?=[aeiou])/g, "$1h");
            replaceText(/y$/g, "yw");
            replaceText(/([^w])e$/g, "$1ew");
            replaceText(/([A-Za-z])ing\b/g, "$1in");
            replaceText(/\b([Aa])nd\b/g, "$1n");
            replaceText(/\b([Ff])or\b/g, "$1wo");
            replaceText(/\b([Ww])ith\b/g, "$1if");
            replaceText(/\b([Jj])ust\b/g, "$1uwst");
            replaceText(/\b([Hh])ave\b/g, "$1ab");

            // 1/4 chance to add ~
            if (Math.floor(Math.random() * 4) === 0) transformedWord += "~";
        }

        // Max and uvu
        if (level === "max" || level === "uvu") {
            // 1/3 chance to replace `o` with `owo`
            if (Math.floor(Math.random() * 3) > 0) replaceText(/o/g, "owo");

            replaceText(/ew/g, "uwu");
            replaceText(/([Hh])ey/g, "$1ay");
            replaceText(/Dead/g, "Ded");
            replaceText(/dead/g, "ded");
            replaceText(/n[aeiou]*t/g, "nd");
        }

        // Max, uvu, and uwu
        if (level === "max" || level === "uvu" || level === "uwu") {
            if (includeSymbols) {
                // Replace brackets with stars
                replaceText(/[({<]/g, "｡･:*:･ﾟ★,｡･:*:･ﾟ☆");
                replaceText(/[)}>]/g, "☆ﾟ･:*:･｡,★ﾟ･:*:･｡");
                // Replace ., !, and ; with faces, excluding decimal separators
                replaceWithFace(/[.,](?![0-9])/);
                replaceWithFace(/[!;]+/);
            }

            replaceText(/That/g, "Dat");
            replaceText(/that/g, "dat");
            replaceText(/[Tt]h(?![Ee])/g, match => (match[0] === "T" ? "F" : "f"));
            replaceText(/TH(?!E)/g, "F");
            replaceText(/le$/g, "wal");
            replaceText(/Ve/g, "We");
            replaceText(/ve/g, "we");
            replaceText(/ry/g, "wwy");
            replaceText(/(?:R|L)/g, "W");
            replaceText(/(?:r|l)/g, "w");
        }

        // All levels
        replaceText(/n([aeiou])/g, "ny$1");
        replaceText(/N([aeiou])/g, "Ny$1");
        replaceText(/N([AEIOU])/g, "NY$1");
        replaceText(/ll/g, "ww");
        replaceText(/([aeiur])l$/g, "$1wl");
        replaceText(/[AEIUR]([lL])$/g, "W$1");
        replaceText(/OLD/g, "OWLD");
        replaceText(/([Oo])ld/g, "$1wld");
        replaceText(/OL/g, "OWL");
        replaceText(/([Oo])l/g, "$1wl");
        replaceText(/[LR]([oO])/g, "W$1");
        replaceText(/[lr]o/g, "wo");
        replaceText(/([BCDFGHJKMNPQSTXYZ])([oO])/g, (_match, first, second) => `${first}${second === second.toUpperCase() ? "W" : "w"}${second}`);
        replaceText(/([bcdfghjkmnpqstxyz])o/g, "$1wo");
        replaceText(/[vw]le/g, "wal");
        replaceText(/FI/g, "FWI");
        replaceText(/([Ff])i/g, "$1wi");
        replaceText(/([Vv])er/g, "$1wer");
        replaceText(/([Pp])oi/g, "$1woi");
        replaceText(/([DdFfGgHhJjPpQqRrSsTtXxYyZz])le$/g, "$1wal");
        replaceText(/([BbCcDdFfGgKkPpQqSsTtWwXxZz])r/g, "$1w");
        replaceText(/Ly/g, "Wy");
        replaceText(/ly/g, "wy");
        replaceText(/([Pp])le/g, "$1we");
        replaceText(/NR/g, "NW");
        replaceText(/([Nn])r/g, "$1w");
        replaceText(/Mem/g, "mwem");
        replaceText(/mem/g, "Mwem");
        replaceText(/([Nn])ywo/g, "$1yo");

        return transformedWord;
    }

    /** @returns A random UwUified face */
    private static randomFace(): string {
        const faces = [
            "(・`ω´・)",
            ";;w;;",
            "owo",
            "UwU",
            ">w<",
            "^w^",
            "(* ^ ω ^)",
            "(⌒ω⌒)",
            "ヽ(*・ω・)ﾉ",
            "(o´∀`o)",
            "(o･ω･o)",
            "＼(＾▽＾)／",
            "(*^ω^)",
            "(◕‿◕✿)",
            "(◕ᴥ◕)",
            "ʕ•ᴥ•ʔ",
            "ʕ￫ᴥ￩ʔ",
            "(*^.^*)",
            "(｡♥‿♥｡)",
            "OwO",
            "uwu",
            "uvu",
            "UvU",
            "(*￣з￣)",
            "(つ✧ω✧)つ",
            "(/ =ω=)/",
            "(╯°□°）╯︵ ┻━┻",
            "┬─┬ ノ( ゜-゜ノ)",
            "¯\\_(ツ)_/¯"
        ];

        return faces[Math.floor(Math.random() * faces.length)];
    }
}
