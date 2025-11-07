_default:
    @just --list

run-nested-shell:
    dbus-run-session -- gnome-shell --devkit

compile-schemas:
    glib-compile-schemas ./schemas
