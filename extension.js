import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as AppDisplay from 'resource:///org/gnome/shell/ui/appDisplay.js';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export default class AddToSteam extends Extension {
    constructor(metadata) {
        super(metadata);
        this._originalPopupMenu = null;
        this._addToSteamButton = null;
        this._customMenuItemFile = null;
        this.settings = this.getSettings();
    }

    enable() {
        // Save the original popupMenu function to the prototype
        if (!this._originalPopupMenu) {
            this._originalPopupMenu = AppDisplay.AppIcon.prototype.popupMenu;
        }
        const originalPopupMenu = this._originalPopupMenu;

        const fn = Gio.File.new_for_uri(import.meta.url);
        const ws = fn.get_parent().get_path();
        const home = GLib.get_home_dir();

        Gio.Subprocess.new([
            "mkdir",
            "-p",
            home + "/.local/share/nautilus-python/extensions"
        ], Gio.SubprocessFlags.NONE);

        Gio.Subprocess.new([
            "ln",
            "-s",
            ws + "/add-to-steam.py",
            home + "/.local/share/nautilus-python/extensions/add-to-steam.py"
        ], Gio.SubprocessFlags.NONE);


        // Since there is not proper API to add context menu functions to the AppIcons, we'll have to patch the popupMenu function instead
        AppDisplay.AppIcon.prototype.popupMenu = function (side = imports.gi.St.Side.LEFT) {
            originalPopupMenu.call(this, side);

            if (!this._menu) {
                console.log('No context menu found for the app icon.');
                return false;
            }

            const desktopInfo = this.app.get_app_info();
            const desktopFilePath = desktopInfo?.get_filename();
            if (!desktopFilePath) {
                console.log('No .desktop file found for the selected app.');
                return;
            }
            

            // Open folder action
            if (!this._addToSteamButton) {
                this._addToSteamButton = new PopupMenu.PopupMenuItem(_('Add To Steam'));
                this._addToSteamButton.connect('activate', async () => {
                    try {
                        Gio.Subprocess.new([this.settings.get_string("target-binary"), desktopFilePath], Gio.SubprocessFlags.NONE);

                    } catch (e) { 
                        console.log("Failed to call 'add-to-steam' binary.", e);
                    }
                    
                });

                this._menu.addMenuItem(this._addToSteamButton);
            }

        };
    }

    disable() {
        const home = GLib.get_home_dir();
        Gio.Subprocess.new([
            "rm",
            home + "/.local/share/nautilus-python/extensions/add-to-steam.py"
        ], Gio.SubprocessFlags.NONE);
        
        // Restore the original popupMenu method
        if (this._originalPopupMenu) {
            AppDisplay.AppIcon.prototype.popupMenu = this._originalPopupMenu;
            this._originalPopupMenu = null;
        }

        this.settings = null;
    }
}
