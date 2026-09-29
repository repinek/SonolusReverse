import { ModPreferences } from "./ModPreferences";

export class Constants {
    static readonly GITHUB_URL = "https://github.com/repinek/SonolusReverse";
    // static readonly WIKI_URL = `${this.GITHUB_URL}/wiki`;

    static readonly RAW_URL = this.GITHUB_URL.replace("github.com", "raw.githubusercontent.com");
    // May not work since GITHUB_URL is wrong (fork) or branch is not pushed to remote yet
    static readonly VERSION_URL = `${this.RAW_URL}/${ModPreferences.GIT_BRANCH}/version.json`;

    static readonly DISCORD_URL = "https://discord.gg/43FsKRzxnf";
}
