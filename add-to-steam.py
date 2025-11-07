import subprocess
from os import path, popen, access, X_OK

from gi.repository import GObject, Nautilus
from urllib.parse import urlparse, unquote, quote


SUPPORTED_MIMES = (
    "application/x-desktop",
    "application/x-executable",
    "application/vnd.appimage",
    "application/x-shellscript",
    "application/x-ms-dos-executable",
    "application/x-msdownload",
    "application/vnd.microsoft.portable-executable"
)

SUPPORTED_NON_EXEC = (
    SUPPORTED_MIMES[0],
    SUPPORTED_MIMES[4],
    SUPPORTED_MIMES[5],
    SUPPORTED_MIMES[6]
)

class AddToSteam(GObject.GObject, Nautilus.MenuProvider):     
    def get_file_items(self, *args):
        files = args[-1]
        
        if len(files) != 1:
            return []

        mime = files[0].get_mime_type()

        if not mime in SUPPORTED_MIMES:
            return []
        elif not mime in SUPPORTED_NON_EXEC and not access(unquote(files[0].get_uri()).replace("file://", ""), X_OK):
            return []

        item = Nautilus.MenuItem(
            name="AddToSteam::Add",
            label="Add to Steam",
        )
        
        item.connect("activate", self.run_add_to_steam, files)
        return [item]
        
    def run_add_to_steam(self, menus, files):
        popen(f"touch /tmp/addnonsteamgamefile && steam \"steam://addnonsteamgame/{quote(files[0].get_uri().replace("file://", ""), safe='')}\"")
