import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class AddToSteamPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            description: _('If there is no \'add-to-steam\' binary on your system, one can be created from https://github.com/vicrodh/steamos-add-to-steam/blob/main/bin/add-to-steam'),
        });
        page.add(group);

        // Create a new preferences row
        const row = new Adw.EntryRow({
            title: _("'add-to-steam' binary location")
        });
        group.add(row);

        window._settings = this.getSettings();
        window._settings.bind('target-binary', row, 'text',
            Gio.SettingsBindFlags.DEFAULT);
    }
}