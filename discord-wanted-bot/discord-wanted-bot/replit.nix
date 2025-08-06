{ pkgs }: {
  deps = [
    pkgs.nodejs
    pkgs.cairo
    pkgs.pango
    pkgs.glib
    pkgs.glibc
    pkgs.gcc
    pkgs.libjpeg
    pkgs.libuuid
  ];
}
