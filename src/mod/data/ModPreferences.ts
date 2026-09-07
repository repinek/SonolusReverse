declare const process: {
    env: {
        BUILD_ENV: Env;
        BUILD_HASH: string;
        BUILD_VERSION: string;
        BUILD_COUNTER: number;
        BUILD_BRANCH: string;
    };
};

export type Env = "release" | "dev";

export class ModPreferences {
    static readonly ENV = process.env.BUILD_ENV;
    static readonly HASH = process.env.BUILD_HASH;
    static readonly VERSION = process.env.BUILD_VERSION;
    static readonly BUILD = process.env.BUILD_COUNTER;
    static readonly GIT_BRANCH = process.env.BUILD_BRANCH;
    static readonly FOR_GAME_VERSION = "1.1.4"; // should be hardcoded, script was written only for THIS version
}
