import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class AddToSteamPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: _('Add To Steam'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({});
        page.add(group);

        // Create a new preferences row
        const row = new Adw.SwitchRow({
            title: _("Use Nautilus Extension")
        });
        group.add(row);

        window._settings = this.getSettings();
        window._settings.bind('use-nautilus', row, 'active',
            Gio.SettingsBindFlags.DEFAULT);
    }
}