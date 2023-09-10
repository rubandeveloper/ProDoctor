import gdown
import zipfile
import os

def downloadModelFiles():

    file_id = "10WFsIovePVPkQrvnYS-gGTuvsfxzAX4j"
    destination_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "./"))

    # Create the destination directory if it doesn't exist
    os.makedirs(destination_dir, exist_ok=True)
    
    # Download the file from Google Drive
    gdown.download(f"https://drive.google.com/uc?id={file_id}", f"{destination_dir}/downloaded.zip", quiet=False)

    # Unzip the downloaded file
    zip_file_path = f"{destination_dir}/downloaded.zip"
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall(destination_dir)

    # Clean up: remove the downloaded zip file
    os.remove(zip_file_path)
