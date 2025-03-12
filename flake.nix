{
  description = "Password manager for Security course at AAU";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            deno
            sqlite
          ];

          shellHook = ''
          run() {
            deno run --allow-read --allow-write ./bestpass/dummy_data.ts
            deno run --allow-all --watch ./bestpass/main.ts
          }
          run
          '';
        };
      });
}