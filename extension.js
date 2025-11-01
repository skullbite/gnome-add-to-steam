import { Extension, InjectionManager, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import { AppMenu } from 'resource:///org/gnome/shell/ui/appMenu.js'
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export default class AddToSteam extends Extension {
    async enable() {
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
            const binaryCheck = Gio.Subprocess.new(["test", "-f", i], Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE);
            
            const success = await binaryCheck.wait_check_async(null);
            if (success) {
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


    linkNautliusExtension(unlink = false) {
        const fn = Gio.File.new_for_uri(import.meta.url);
        const ws = fn.get_parent().get_path();
        const home = GLib.get_home_dir();

        Gio.Subprocess.new([
            "mkdir",
            "-p",
            home + "/.local/share/nautilus-python/extensions"
        ], Gio.SubprocessFlags.NONE);

        Gio.Subprocess.new([
            ...(unlink ? ["rm", "-f"] : [
                "ln",
                "-sf",
                ws + "/add-to-steam.py"
            ]),
            home + "/.local/share/nautilus-python/extensions/add-to-steam.py"
        ], Gio.SubprocessFlags.NONE);
    }
}
