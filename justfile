_default:
    @just --list

run-nested-shell:
    MUTTER_DEBUG_DUMMY_MODE_SPECS=1024x768 dbus-run-session -- gnome-shell --devkit

compile-schemas:
    glib-compile-schemas ./schemas
