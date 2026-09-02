import { AssemblyHelper } from "../../engine/AssemblyHelper";
import { Path } from "../../engine/native/Path";
import { Logger } from "../../utils/Logger";
import { Platform } from "../../utils/Platform";
import { Config } from "../data/Config";

export class CustomBgm {
    private static PreviewSystem: Il2Cpp.Class | null;

    private static pendingPath: string | null = null;

    static init(): void {
        this.PreviewSystem = AssemblyHelper.AssemblyCSharp.class("Sonolus.Preview.PreviewSystem");

        const BgmPlayer = AssemblyHelper.AssemblyCSharp.class("Sonolus.Audio.BgmPlayer");

        // Android: Sonolus.Audio.BgmPlayer Create(string path, long startTime, float bgmTime, float speed, float volume, bool loop, float loopTime, bool isPrecise);
        // iOS: Sonolus.Audio.BgmPlayer Create(string path, double startTime, float bgmTime, float speed, float volume, bool loop, float loopTime, bool isPrecise);
        // I have no idea why startTime is double in iOS
        const Create = BgmPlayer.method<Il2Cpp.Object>("Create", 8);

        // Why `Interceptor.attach` over `Create.implementation`?
        //
        // Implementation FULLY replaces method, so it required to re-invoke
        // original method using `method.invoke` which calls internal `invokeRaw`
        //
        // For some reason when we call it so many times something breaks
        // and we got `access violation accessing` 0x0 on `invokeRaw`
        //
        // In `args` argument we have General Purpose registers (GP)
        // Floating points arguments are passed in SIMD/Floating-point registers (FP)
        //
        // Look at the arguments:
        // Android:
        // str, long, float, float, float, bool, float, bool
        // x0 , x1  , s0   , s1   , s2   , x2  , s3   , x3
        //
        // iOS:
        // str, double, float, float, float, bool, float, bool
        // x0 , d0    , s1   , s2   , s3   , x1  , s4   , x2
        //
        // From: https://github.com/ARM-software/abi-aa/blob/main/aapcs64/aapcs64.rst#68parameter-passing
        // Floating-point and short vector types are passed in SIMD and Floating-point registers or on the stack; never in general-purpose registers (except when they form part of a small structure that is neither an HFA nor an HVA).
        //
        // This is hack, but at least it's works
        // Sonolus compiled only for `arm64` and `arm`
        // so we are safe with that move
        //
        // Written by hand, not AI comment
        // Thanks TSoding code sessions, at least I know about FP registers
        Interceptor.attach(Create.virtualAddress, {
            onEnter(this: InvocationContext, args: InvocationArguments) {
                Logger.debug("BgmPlayer::Create called");

                const path = new Il2Cpp.String(args[0]);

                if (path.isNull() || !CustomBgm.shouldOverride(path.content)) {
                    return;
                }

                CustomBgm.pendingPath = Config.customBgmPath;
                args[0] = Il2Cpp.string(CustomBgm.pendingPath).handle;

                // loopTime
                switch (Process.arch) {
                    case "arm64":
                    case "arm":
                        // Or Arm64CpuContext
                        if (Platform.isPlatformAndroid()) {
                            (this.context as ArmCpuContext).s3 = 0;
                        } else if (Platform.isPlatformIOS()) {
                            (this.context as ArmCpuContext).s4 = 0;
                        }
                        break;
                    default:
                        Logger.error("[CustomBgm::CreateHook] Unsupported architecture. How you actually run Sonolus?");
                }
            }
        });

        Logger.info("[CustomBgm::init] Initialized");
    }

    private static shouldOverride(originalPath: string | null): boolean {
        return !!Config.customBgmPath && !!originalPath && originalPath.includes("BgmMain") && Path.exists(Config.customBgmPath);
    }

    static restartBgm(): void {
        Logger.info("[CustomBgm::restartBgm] Restarting UI BGM");
        this.PreviewSystem!.method<void>("Disable", 0).invoke();
        this.PreviewSystem!.method<boolean>("Start", 1).invoke(0);
    }
}
