import { Extension, InjectionManager, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import { AppMenu } from 'resource:///org/gnome/shell/ui/appMenu.js'
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export default class AddToSteam extends Extension {
    async enable() {
        for (const i of ["make_directory_async", "delete_async", "make_symbolic_link_async"])
            Gio._promisify(Gio.File.prototype, i);

        this.settings = this.getSettings();
        this.injector = new InjectionManager();
        this.menus = [];

        this.settings.connectObject(
            "changed::use-nautilus", 
            () => this.linkNautliusExtension(!this.settings.get_boolean("use-nautilus")), 
            this
        );

        this.linkNautliusExtension(!this.settings.get_boolean("use-nautilus"))

        let atsPath = "";
        for (const i of ["/usr/bin/steamos-add-to-steam", "~/.local/bin/steamos-add-to-steam"]) {
            const file = Gio.File.new_for_path(i);

            if (file.query_exists(null)) {
                atsPath = i;
                break;
            }
        }

        this.injector.overrideMethod(AppMenu.prototype, "open", og => {
            const menus = this.menus;

            return function (...args) {
                const appInfo = this._app?.app_info;
                if (!appInfo || atsPath === "" || menus.includes(this)) 
                    return og.call(this, ...args);

                this.steamButton = this.addAction("Add To Steam", () => {
                    try {
                        Gio.Subprocess.new([atsPath, `${appInfo.filename.replace("file://", "")}`], Gio.SubprocessFlags.NONE);
                    } catch (e) { 
                        console.log("Failed to call 'steamos-add-to-steam' binary.", e);
                    }
                });

                menus.push(this);

                return og.call(this, ...args);
            }
        });
        
    }

    disable() {
        this.linkNautliusExtension(true);

        for (const i of this.menus) {
            i.steamButton.destroy();
            delete i.steamButton;
        }
        
        this.menus = null;
        this.settings = null;
        this.injector.clear();
        this.injector = null;
    }


    async linkNautliusExtension(unlink = false) {
        const fn = Gio.File.new_for_uri(import.meta.url);
        const ws = fn.get_parent().get_path();
        const home = GLib.get_home_dir();
        const extensionFinal = `${home}/.local/share/nautilus-python/extensions`;
        const extension = `${ws}/add-to-steam.py`;

        const nautilusExtensionPath = Gio.File.new_for_path(extensionFinal);
        const extensionPath = Gio.File.new_for_path(extensionFinal + "/add-to-steam.py");

        if (!nautilusExtensionPath.query_exists(null))
            await nautilusExtensionPath.make_directory_async(GLib.PRIORITY_DEFAULT, null);
        
        try {
            if (unlink)
                await extensionPath.delete_async(GLib.PRIORITY_DEFAULT, null);
            else 
                await extensionPath.make_symbolic_link_async(extension, GLib.PRIORITY_DEFAULT, null);
        } catch (e) { /* only happened during debug but just to be sure */}

        
    }
}
