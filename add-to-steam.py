import subprocess
from os import system, path, popen, access, X_OK

from gi.repository import GObject, Nautilus
from urllib.parse import urlparse, unquote


SUPPORTED_MIMES = (
    "application/x-desktop",
    "application/x-executable",
    "application/vnd.appimage",
    "application/x-shellscript",
    "application/x-ms-dos-executable"
)

ATS_PATH = "/usr/bin/steamos-add-to-steam"
LOCAL_ATS_PATH = path.expanduser("~/.local/bin/steamos-add-to-steam")

class AddToSteam(Nautilus.MenuProvider, GObject.GObject):     
    def get_file_items(self, *args):
        if path.exists(ATS_PATH):
            self.target_path = ATS_PATH
        elif path.exists(LOCAL_ATS_PATH):
            self.target_path = LOCAL_ATS_PATH
        else:
            self.target_path = ""
        files = args[-1]
        mime = files[0].get_mime_type()
        
        if len(files) != 1:
            return []
        elif not files[0].get_mime_type() in SUPPORTED_MIMES:
            return []
        elif not access(unquote(files[0].get_uri()).replace("file://", ""), X_OK) and not mime == "application/x-ms-dos-executable":
            pass
        elif self.target_path == "":
            return []

        item = Nautilus.MenuItem(
            name="AddToSteam::Add",
            label="Add to Steam",
        )
        
        item.connect("activate", self.run_add_to_steam, files)
        return [item]
        
    def run_add_to_steam(self, menus, files):
        popen(f"{self.target_path} \"{unquote(files[0].get_uri()).replace("file://", "")}\"")
