{
  description = "SonolusReverse development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = {
    nixpkgs,
    ...
  }:
  let
    supportedSystems = [
      "x86_64-linux"
      # x86_64-windows
    ];

    forEachSupportedSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
      pkgs = import nixpkgs {
        inherit system;
        config = {
          allowUnfree = true; # !!!
          android_sdk.accept_license = true;
        };
      };
    });
  in {
    devShells = forEachSupportedSystem ({ pkgs }:
    let
      buildToolsVersion = "34.0.0";
      androidComposition = pkgs.androidenv.composeAndroidPackages {
        buildToolsVersions = [ buildToolsVersion ];
      };
    in {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs
          python314
          jre
          apksigner
          androidenv.androidPkgs.platform-tools
          apkeditor
        ];

        # Create python venv and install python requirements and requirements_build
        shellHook = ''
          VENV_DIR=".venv"
          SAVED_HASH_FILE="$VENV_DIR/.requirements.hash"
          SAVED_HASH_BUILD_FILE="$VENV_DIR/.requirements_build.hash"

          export PATH="${androidComposition.androidsdk}/libexec/android-sdk/build-tools/${buildToolsVersion}:$PATH"

          # Init venv if we don't have one
          if [ ! -d "$VENV_DIR" ]; then
            echo "Creating python virtual environment at $VENV_DIR"
            ${pkgs.python314}/bin/python -m venv .venv
          fi

          source $VENV_DIR/bin/activate

          CURRENT_HASH=$(md5sum requirements.txt | cut -d' ' -f1)
          CURRENT_HASH_BUILD=$(md5sum requirements_build.txt | cut -d' ' -f1)

          # If current_hash != hash
          if [ ! -f "$SAVED_HASH_FILE" ] || [ "$CURRENT_HASH" != "$(cat "$SAVED_HASH_FILE")" ]; then
            echo "Found changes in requirements.txt, Installing/updating python packages"

            pip install --upgrade pip
            pip install -r requirements.txt

            # If exit status == 0
            if [ $? -eq 0 ]; then
                echo "$CURRENT_HASH" > "$SAVED_HASH_FILE"
            fi
          fi

          if [ ! -f "$SAVED_HASH_BUILD_FILE" ] || [ "$CURRENT_HASH_BUILD" != "$(cat "$SAVED_HASH_BUILD_FILE")" ]; then
            echo "Found changes in requirements_build.txt, Installing/updating python packages"

            pip install --upgrade pip
            pip install -r requirements_build.txt

            # If exit status == 0
            if [ $? -eq 0 ]; then
                echo "$CURRENT_HASH_BUILD" > "$SAVED_HASH_BUILD_FILE"
            fi
          fi

          echo "SonolusReverse development environment is ready!"
        '';
      };
    });
  };
}
