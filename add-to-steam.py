import subprocess
from os import system, path, popen

from gi.repository import GObject, Nautilus
from urllib.parse import urlparse

SUPPORTED_MIMES = (
    "application/x-executable",
    "application/vnd.appimage",
    "application/x-shellscript",
    "application/x-ms-dos-executable"
)

class AddToSteam(Nautilus.MenuProvider, GObject.GObject):
    gsettings_call = [
        "gsettings",
        "get",
        "org.gnome.shell.extensions.add-to-steam",
        "target-binary"
    ]
    def __init__(self):
        #if path.exists("/usr/share/gnome-shell/extensions/add-to-steam@pupper.space"):
        #    print("installed at system level")
        if path.exists(path.expanduser("~/.local/share/gnome-shell/extensions/add-to-steam@pupper.space")):
            self.gsettings_call.insert(1, "--schemadir")
            self.gsettings_call.insert(2, path.expanduser("~/.local/share/gnome-shell/extensions/add-to-steam@pupper.space/schemas"))
            
    def get_file_items(self, *args):
        files = args[-1]
        item = Nautilus.MenuItem(
            name="AddToSteam::Add",
            label="Add to Steam",
        )

        if len(files) != 1:
            return []
        elif not files[0].get_mime_type() in SUPPORTED_MIMES:
            return []
        
       
        item.connect("activate", self.run_add_to_steam, files)
        return [item]
        
    def run_add_to_steam(self, menus, files):
        add_to_steam_path = subprocess.check_output(self.gsettings_call).decode("utf-8").replace("\n", "")
        # if not path.exists(add_to_steam_path):
        #    system()
        system(f"{add_to_steam_path} \"{files[0].get_uri().replace("file://", " ")}\"")
        