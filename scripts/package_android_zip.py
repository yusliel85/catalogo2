import os
import zipfile
import sys

def zip_directory(folder_path, output_path):
    print(f"[Packaging] Compressing {folder_path} into {output_path} ...")
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            # Exclude build output or git
            dirs[:] = [d for d in dirs if d not in ['.gradle', 'build', '.git']]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, os.path.dirname(folder_path))
                zipf.write(full_path, rel_path)
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"[Packaging] ✅ Complete! Package size: {size_mb:.2f} MB")

if __name__ == "__main__":
    src_folder = os.path.abspath("android")
    # Output to public folder so it can be served and downloaded directly
    out_zip = os.path.abspath("public/CatalogExporter-Android-Project.zip")
    os.makedirs(os.path.dirname(out_zip), exist_ok=True)
    zip_directory(src_folder, out_zip)
