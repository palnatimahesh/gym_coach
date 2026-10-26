package com.palnatimahesh.athleticcoach;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import androidx.activity.result.ActivityResult;
import androidx.documentfile.provider.DocumentFile;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * Copies backup files into a folder the user picks once (for example a Google Drive folder) using Android's
 * Storage Access Framework. No accounts, no API keys. Only files named backup-YYYY-MM-DD.json are touched.
 */
@CapacitorPlugin(name = "FolderBackup")
public class FolderBackupPlugin extends Plugin {

    private static final Pattern NAME = Pattern.compile("^backup-\\d{4}-\\d{2}-\\d{2}\\.json$");
    private static final int MAX_BYTES = 20 * 1024 * 1024;

    @PluginMethod
    public void pickFolder(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(call, intent, "folderPicked");
    }

    @ActivityCallback
    private void folderPicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Folder selection cancelled");
            return;
        }
        Uri uri = result.getData().getData();
        try {
            getContext().getContentResolver().takePersistableUriPermission(uri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        } catch (Exception e) {
            call.reject("Could not keep access to that folder: " + e.getMessage());
            return;
        }
        DocumentFile dir = DocumentFile.fromTreeUri(getContext(), uri);
        JSObject ret = new JSObject();
        ret.put("uri", uri.toString());
        ret.put("name", dir != null && dir.getName() != null ? dir.getName() : "Selected folder");
        call.resolve(ret);
    }

    private DocumentFile folder(PluginCall call) {
        String uri = call.getString("uri");
        if (uri == null) {
            call.reject("No folder chosen");
            return null;
        }
        DocumentFile dir = DocumentFile.fromTreeUri(getContext(), Uri.parse(uri));
        if (dir == null || !dir.exists() || !dir.canWrite()) {
            call.reject("Folder access was lost. Choose the folder again.");
            return null;
        }
        return dir;
    }

    private String fileName(PluginCall call) {
        String name = call.getString("name");
        if (name == null || !NAME.matcher(name).matches()) {
            call.reject("Invalid backup file name");
            return null;
        }
        return name;
    }

    @PluginMethod
    public void writeFile(PluginCall call) {
        DocumentFile dir = folder(call);
        String name = fileName(call);
        String data = call.getString("data");
        if (dir == null || name == null) return;
        if (data == null || data.length() > MAX_BYTES) {
            call.reject("Nothing to write");
            return;
        }
        try {
            DocumentFile file = dir.findFile(name);
            if (file == null) file = dir.createFile("application/json", name);
            if (file == null) {
                call.reject("Could not create the file in that folder");
                return;
            }
            Context ctx = getContext();
            try (OutputStream os = ctx.getContentResolver().openOutputStream(file.getUri(), "wt")) {
                if (os == null) {
                    call.reject("Could not open the file for writing");
                    return;
                }
                os.write(data.getBytes(StandardCharsets.UTF_8));
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Write failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void listFiles(PluginCall call) {
        DocumentFile dir = folder(call);
        if (dir == null) return;
        JSArray files = new JSArray();
        try {
            for (DocumentFile f : dir.listFiles()) {
                String n = f.getName();
                if (n != null && f.isFile() && NAME.matcher(n).matches()) {
                    JSObject o = new JSObject();
                    o.put("name", n);
                    o.put("modified", f.lastModified());
                    files.put(o);
                }
            }
        } catch (Exception e) {
            call.reject("Could not list the folder: " + e.getMessage());
            return;
        }
        JSObject ret = new JSObject();
        ret.put("files", files);
        call.resolve(ret);
    }

    @PluginMethod
    public void readFile(PluginCall call) {
        DocumentFile dir = folder(call);
        String name = fileName(call);
        if (dir == null || name == null) return;
        try {
            DocumentFile file = dir.findFile(name);
            if (file == null) {
                call.reject("File not found");
                return;
            }
            try (InputStream is = getContext().getContentResolver().openInputStream(file.getUri())) {
                if (is == null) {
                    call.reject("Could not open the file");
                    return;
                }
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                byte[] buf = new byte[8192];
                int n, total = 0;
                while ((n = is.read(buf)) > 0) {
                    total += n;
                    if (total > MAX_BYTES) {
                        call.reject("File too large");
                        return;
                    }
                    out.write(buf, 0, n);
                }
                JSObject ret = new JSObject();
                ret.put("data", out.toString("UTF-8"));
                call.resolve(ret);
            }
        } catch (Exception e) {
            call.reject("Read failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void deleteFile(PluginCall call) {
        DocumentFile dir = folder(call);
        String name = fileName(call);
        if (dir == null || name == null) return;
        try {
            DocumentFile file = dir.findFile(name);
            if (file != null) file.delete();
            call.resolve();
        } catch (Exception e) {
            call.reject("Delete failed: " + e.getMessage());
        }
    }
}
