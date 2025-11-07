_default:
    @just --list

run-nested-shell:
    dbus-run-session -- gnome-shell --devkit

compile-schemas:
    glib-compile-schemas ./schemas

zip-extension:
    zip -r gnome-add-to-steam@pupper.space.zip \
    schemas/org.gnome.shell.extensions.add-to-steam.gschema.xml \
    add-to-steam.py \
    *.js \
    metadata.json

    zip -sf gnome-add-to-steam@pupper.space.zip