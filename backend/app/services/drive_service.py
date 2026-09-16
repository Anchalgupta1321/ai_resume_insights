import os
import logging
from typing import List, Dict, Any, Optional
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from googleapiclient.http import MediaIoBaseDownload

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class GoogleDriveService:
    def __init__(self, credentials_dict: Optional[Dict[str, Any]] = None, credentials_file: Optional[str] = None):
        self.creds = None
        self.drive_service = None
        
        if credentials_dict:
            self._setup_from_dict(credentials_dict)
        elif credentials_file and os.path.exists(credentials_file):
            self._setup_from_file(credentials_file)
        else:
            # Check default workspace location
            default_cred_paths = ["Credentails_file.json", "credentials.json", "credentials_file.json"]
            for path in default_cred_paths:
                if os.path.exists(path):
                    self._setup_from_file(path)
                    break

    def _setup_from_dict(self, creds_dict: Dict[str, Any]):
        try:
            self.creds = Credentials.from_service_account_info(
                creds_dict,
                scopes=['https://www.googleapis.com/auth/drive']
            )
            self.drive_service = build('drive', 'v3', credentials=self.creds)
            logging.info("Google Drive API initialized successfully from credentials dict.")
        except Exception as e:
            logging.error(f"Failed to initialize Drive API from dict: {str(e)}")
            raise

    def _setup_from_file(self, creds_file: str):
        try:
            self.creds = Credentials.from_service_account_file(
                creds_file,
                scopes=['https://www.googleapis.com/auth/drive']
            )
            self.drive_service = build('drive', 'v3', credentials=self.creds)
            logging.info("Google Drive API initialized successfully from credentials file.")
        except Exception as e:
            logging.error(f"Failed to initialize Drive API from file: {str(e)}")
            raise

    def list_pdf_files(self, folder_id: str) -> List[Dict[str, str]]:
        if not self.drive_service:
            raise RuntimeError("Google Drive service is not authenticated. Please provide valid service account credentials.")
        
        query = f"'{folder_id}' in parents and mimeType='application/pdf' and trashed = false"
        results = self.drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])
        logging.info(f"Found {len(files)} PDF files in Google Drive folder {folder_id}.")
        return files

    def download_file(self, file_id: str, output_path: str) -> str:
        if not self.drive_service:
            raise RuntimeError("Google Drive service is not authenticated.")
        
        request = self.drive_service.files().get_media(fileId=file_id)
        with open(output_path, 'wb') as f:
            downloader = MediaIoBaseDownload(f, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
        return output_path

    def download_folder_resumes(self, folder_id: str, output_dir: str) -> List[str]:
        os.makedirs(output_dir, exist_ok=True)
        files = self.list_pdf_files(folder_id)
        downloaded_paths = []
        for file in files:
            file_id = file['id']
            file_name = file['name']
            output_path = os.path.join(output_dir, file_name)
            self.download_file(file_id, output_path)
            downloaded_paths.append(output_path)
        return downloaded_paths
