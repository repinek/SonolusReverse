import { AssemblyHelper } from "../../engine/AssemblyHelper";
import { UEObject } from "../../engine/wrappers/Object";
import { Logger } from "../../utils/Logger";
import { Config } from "../data/Config";

/*
 * Ported from https://github.com/UntitledCharts/uc-sonoserver/blob/734097db2111ddfb2a5c1b3985d6ce7b3e637251/helpers/owoify.py
 * Original implementation and this project are licensed under GPL-3.0
 *
 * Some code taken from https://github.com/repinek/fallguys-frida-modmenu/blob/803ef281be402cfe6c04f53723b5f3a7faf98c50/src/modules/game/UwUify.ts
 */

// TODO: add mode with less uwuify - hook sonolus i18n keys only, not ALL text
// TODO: fix mess (relies on config)
export const UWUIFY_LEVELS = ["off", "owo", "uwu", "uvu", "max"] as const;
export type UwuLevel = (typeof UWUIFY_LEVELS)[number];

interface CachedText {
    original: string;
    transformed: string;
}

export class Uwuify {
    private static _UIText: Il2Cpp.Class | null = null;
    private static cachedTexts = new Map<number, CachedText>();

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
            // if (content && content.length > 0) value = Il2Cpp.string(Uwuify.owoify(content, Config.uwuifyLevel, true));
            if (content && content.length > 0) value = Il2Cpp.string(Uwuify.createOwoifiedString(this, content));
        }

        this.method<void>("set_text", 1).invoke(value);
    }

    static toggleUwuifyMode(level: UwuLevel): void {
        if (level !== "off") {
            const objects = UEObject.findObjectsOfType(this._UIText!.type.object, false);

            for (const object of objects) {
                const objectID = UEObject.getInstanceID(object);
                const current = object.method<Il2Cpp.String>("get_text", 0).invoke().content;
                const original = this.cachedTexts.get(objectID)?.original ?? current;

                if (original !== null) object.method<void>("set_text", 1).invoke(Il2Cpp.string(original));
            }
        } else {
            for (const [objectID, { original }] of this.cachedTexts) {
                const textObject = UEObject.findObjectFromInstanceID(objectID);

                if (textObject) {
                    textObject.method<void>("set_text", 1).invoke(Il2Cpp.string(original));
                }
            }
            this.cachedTexts.clear();
        }
    }

    private static createOwoifiedString(object: Il2Cpp.Object, value: string): string {
        const objectID = UEObject.getInstanceID(object);
        const cached = this.cachedTexts.get(objectID);
        const original = cached?.transformed === value ? cached.original : value;
        const transformed = this.owoify(original, Config.uwuifyLevel, true);

        this.cachedTexts.set(objectID, { original, transformed });
        return transformed;
    }

    /* Owoifies string, keeping Unity tags and URLs untouched */
    private static owoify(source: string, level: UwuLevel, symbols: boolean): string {
        const uwuified = source
            // Keep Unity tags and URLs untouched
            .split(/(<[^>]*>|https?:\/\/\S+|www\.\S+|\s+)/g)
            .map(part => {
                if (!part || /^\s+$/.test(part) || /^<[^>]*>$/.test(part) || /^(?:https?:\/\/|www\.)/.test(part)) return part;

                return this.owoifyWord(part, level, symbols);
            })
            .join("");
        Logger.debug(uwuified);
        return uwuified;
    }

    /* Owoifies word */
    private static owoifyWord(source: string, level: UwuLevel, symbols: boolean): string {
        let text = source;

        // (...args: string[] => string) is used for `match => ...`
        const replace = (pattern: RegExp, value: string | ((...args: string[]) => string)): void => {
            text = text.replace(pattern, value as string);
        };

        const replaceWithFace = (pattern: RegExp): void => {
            const match = text.match(pattern);
            if (match) text = text.replaceAll(match[0], ` ${this.randomFace()}`);
        };

        // All levels
        replace(/([Ff])uc/g, "$1wuc");
        replace(/([Mm])om/g, "$1wom");
        replace(/\b([Tt])ime\b/g, "$1im");
        replace(/^Me$/, "Mwe");
        replace(/^me$/, "mwe");
        replace(/([Oo])ver/g, "$1wor");
        replace(/ove/g, "uv");
        replace(/OVE/g, "UV");
        replace(/\b(ha|hah|heh|hehe)+\b/gi, "hehe xD");
        replace(/\b([Tt])he\b/g, "$1eh");
        replace(/\bYou\b/g, "U");
        replace(/\byou\b/g, "u");
        replace(/Read/g, "Wead");
        replace(/read/g, "wead");
        replace(/([Ww])orse/g, "$1ose");
        replace(/([Gg])reat/g, "$1wate");
        replace(/([Aa])viat/g, "$1wiat");
        replace(/([Dd])edicat/g, "$1editat");
        replace(/([Rr])emember/g, "$1ember");
        replace(/([Ww])hen/g, "$1en");
        replace(/([Ff])righten(ed)*/g, "$1rigten");
        replace(/Meme/g, "mem");
        replace(/Mem/g, "Mem");
        replace(/^([Ff])eel$/, "$1ell");

        // Max
        if (level === "max") {
            // More than 2 symbols, 1/3 chance and if A-Za-z -> double first letter
            // Hello -> H-Hello
            if (text.length >= 2 && Math.floor(Math.random() * 3) === 0 && /^[A-Za-z]/.test(text)) text = `${text[0]}-${text}`;

            replace(/([Ss])(?=[aeiou])/g, "$1h");
            replace(/y$/g, "yw");
            replace(/([^w])e$/g, "$1ew");
            replace(/([A-Za-z])ing\b/g, "$1in");
            replace(/\b([Aa])nd\b/g, "$1n");
            replace(/\b([Ff])or\b/g, "$1wo");
            replace(/\b([Ww])ith\b/g, "$1if");
            replace(/\b([Jj])ust\b/g, "$1uwst");
            replace(/\b([Hh])ave\b/g, "$1ab");

            // 1/4 for adding ~
            if (Math.floor(Math.random() * 4) === 0) text += "~";
        }

        // Max and uvu
        if (level === "max" || level === "uvu") {
            // 1/3 for replace `o` to `owo`
            if (Math.floor(Math.random() * 3) > 0) replace(/o/g, "owo");

            replace(/ew/g, "uwu");
            replace(/([Hh])ey/g, "$1ay");
            replace(/Dead/g, "Ded");
            replace(/dead/g, "ded");
            replace(/n[aeiou]*t/g, "nd");
        }

        // max, uvu and uwu
        if (level === "max" || level === "uvu" || level === "uwu") {
            if (symbols) {
                // Replace ({<>}) with stars
                replace(/[({<]/g, "｡･:*:･ﾟ★,｡･:*:･ﾟ☆");
                replace(/[)}>]/g, "☆ﾟ･:*:･｡,★ﾟ･:*:･｡");
                // Replace . , ! ; with faces (excluding float numbers)
                replaceWithFace(/[.,](?![0-9])/);
                replaceWithFace(/[!;]+/);
            }

            replace(/That/g, "Dat");
            replace(/that/g, "dat");
            replace(/[Tt]h(?![Ee])/g, match => (match[0] === "T" ? "F" : "f"));
            replace(/TH(?!E)/g, "F");
            replace(/le$/g, "wal");
            replace(/Ve/g, "We");
            replace(/ve/g, "we");
            replace(/ry/g, "wwy");
            replace(/(?:R|L)/g, "W");
            replace(/(?:r|l)/g, "w");
        }

        // All levels
        replace(/n([aeiou])/g, "ny$1");
        replace(/N([aeiou])/g, "Ny$1");
        replace(/N([AEIOU])/g, "NY$1");
        replace(/ll/g, "ww");
        replace(/([aeiur])l$/g, "$1wl");
        replace(/[AEIUR]([lL])$/g, "W$1");
        replace(/OLD/g, "OWLD");
        replace(/([Oo])ld/g, "$1wld");
        replace(/OL/g, "OWL");
        replace(/([Oo])l/g, "$1wl");
        replace(/[LR]([oO])/g, "W$1");
        replace(/[lr]o/g, "wo");
        replace(/([BCDFGHJKMNPQSTXYZ])([oO])/g, (_match, first, second) => `${first}${second === second.toUpperCase() ? "W" : "w"}${second}`);
        replace(/([bcdfghjkmnpqstxyz])o/g, "$1wo");
        replace(/[vw]le/g, "wal");
        replace(/FI/g, "FWI");
        replace(/([Ff])i/g, "$1wi");
        replace(/([Vv])er/g, "$1wer");
        replace(/([Pp])oi/g, "$1woi");
        replace(/([DdFfGgHhJjPpQqRrSsTtXxYyZz])le$/g, "$1wal");
        replace(/([BbCcDdFfGgKkPpQqSsTtWwXxZz])r/g, "$1w");
        replace(/Ly/g, "Wy");
        replace(/ly/g, "wy");
        replace(/([Pp])le/g, "$1we");
        replace(/NR/g, "NW");
        replace(/([Nn])r/g, "$1w");
        replace(/Mem/g, "mwem");
        replace(/mem/g, "Mwem");
        replace(/([Nn])ywo/g, "$1yo");

        return text;
    }

    /** @returns random uwufied face */
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
