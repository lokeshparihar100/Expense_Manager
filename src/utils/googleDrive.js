// Google Drive integration for backup uploads
// Uses Google Identity Services (GIS) and Drive API

const GOOGLE_DRIVE_SETTINGS_KEY = 'expense_manager_google_drive_settings';
const GOOGLE_TOKEN_KEY = 'expense_manager_google_token';

// Scopes needed for Drive file upload
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Default settings
const DEFAULT_DRIVE_SETTINGS = {
  enabled: false,
  folderId: null,
  folderName: null,
  autoUpload: true, // Auto upload on scheduled backup
  clientId: '' // User must provide their own client ID
};

/**
 * Get Google Drive settings
 */
export const getDriveSettings = () => {
  try {
    const saved = localStorage.getItem(GOOGLE_DRIVE_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_DRIVE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load Drive settings:', e);
  }
  return { ...DEFAULT_DRIVE_SETTINGS };
};

/**
 * Save Google Drive settings
 */
export const saveDriveSettings = (settings) => {
  try {
    localStorage.setItem(GOOGLE_DRIVE_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save Drive settings:', e);
    return false;
  }
};

/**
 * Get stored Google token
 */
export const getStoredToken = () => {
  try {
    const saved = localStorage.getItem(GOOGLE_TOKEN_KEY);
    if (saved) {
      const token = JSON.parse(saved);
      // Check if token is expired
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }
    }
  } catch (e) {
    console.error('Failed to get stored token:', e);
  }
  return null;
};

/**
 * Store Google token
 */
const storeToken = (accessToken, expiresIn) => {
  try {
    const token = {
      accessToken,
      expiresAt: Date.now() + (expiresIn * 1000) - 60000 // Subtract 1 minute for safety
    };
    localStorage.setItem(GOOGLE_TOKEN_KEY, JSON.stringify(token));
    return true;
  } catch (e) {
    console.error('Failed to store token:', e);
    return false;
  }
};

/**
 * Clear stored token (sign out)
 */
export const clearToken = () => {
  try {
    localStorage.removeItem(GOOGLE_TOKEN_KEY);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Check if Google API scripts are loaded
 */
export const isGoogleApiLoaded = () => {
  return typeof google !== 'undefined' && google.accounts;
};

/**
 * Load Google API scripts dynamically
 */
export const loadGoogleApi = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (isGoogleApiLoaded()) {
      resolve();
      return;
    }

    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Give it a moment to initialize
      setTimeout(resolve, 100);
    };
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.head.appendChild(script);
  });
};

/**
 * Initialize Google Sign-In and get access token
 */
export const signInWithGoogle = (clientId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await loadGoogleApi();
      
      if (!google || !google.accounts) {
        reject(new Error('Google API not loaded'));
        return;
      }

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          
          // Store the token
          storeToken(response.access_token, response.expires_in);
          
          resolve({
            accessToken: response.access_token,
            expiresIn: response.expires_in
          });
        },
        error_callback: (error) => {
          reject(new Error(error.message || 'Sign-in failed'));
        }
      });

      // Request the token
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get or create the backup folder in Google Drive
 */
export const getOrCreateBackupFolder = async (accessToken, folderName = 'Expense_Manager_Backups') => {
  try {
    // First, search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      throw new Error(error.error?.message || 'Failed to search for folder');
    }

    const searchResult = await searchResponse.json();
    
    if (searchResult.files && searchResult.files.length > 0) {
      // Folder exists
      return {
        id: searchResult.files[0].id,
        name: searchResult.files[0].name,
        isNew: false
      };
    }

    // Create new folder
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        })
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.error?.message || 'Failed to create folder');
    }

    const folder = await createResponse.json();
    return {
      id: folder.id,
      name: folder.name,
      isNew: true
    };
  } catch (error) {
    console.error('Error getting/creating folder:', error);
    throw error;
  }
};

/**
 * Upload a backup file to Google Drive
 */
export const uploadBackupToDrive = async (backupData, accessToken, folderId) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `expense_backup_${date}_${time}.json`;
    
    const metadata = {
      name: filename,
      mimeType: 'application/json',
      parents: [folderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' }));

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,createdTime',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload file');
    }

    const file = await response.json();
    return {
      success: true,
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink,
      createdTime: file.createdTime
    };
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload any file to Google Drive (for reports, etc.)
 * @param {string} filename - Name of the file
 * @param {string} content - File content
 * @param {string} mimeType - MIME type of the file
 * @param {string} folderName - Optional folder name (defaults to Reports folder)
 */
export const uploadFileToDrive = async (filename, content, mimeType = 'text/csv') => {
  const settings = getDriveSettings();
  
  if (!settings.enabled || !settings.clientId) {
    return { success: false, error: 'Google Drive not configured' };
  }

  let token = getStoredToken();
  
  if (!token) {
    return { success: false, error: 'Not signed in to Google Drive' };
  }

  try {
    // Get or create a Reports folder
    const reportsFolder = await getOrCreateFolder(token.accessToken, 'Expense_Manager_Reports');
    
    const metadata = {
      name: filename,
      mimeType: mimeType,
      parents: [reportsFolder.id]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: mimeType }));

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,createdTime',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.accessToken}`
        },
        body: form
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload file');
    }

    const file = await response.json();
    console.log('[Drive] Report uploaded:', file.name);
    return {
      success: true,
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink,
      folderName: reportsFolder.name
    };
  } catch (error) {
    console.error('[Drive] Report upload failed:', error);
    if (error.message?.includes('401') || error.message?.includes('invalid')) {
      clearToken();
    }
    return { success: false, error: error.message };
  }
};

/**
 * Get or create a folder by name
 */
const getOrCreateFolder = async (accessToken, folderName) => {
  try {
    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    if (searchResponse.ok) {
      const result = await searchResponse.json();
      if (result.files && result.files.length > 0) {
        return { id: result.files[0].id, name: result.files[0].name };
      }
    }

    // Create folder
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        })
      }
    );

    if (!createResponse.ok) {
      throw new Error('Failed to create folder');
    }

    const folder = await createResponse.json();
    return { id: folder.id, name: folder.name };
  } catch (error) {
    console.error('Error with folder:', error);
    throw error;
  }
};

/**
 * List backup files in the Drive folder
 */
export const listDriveBackups = async (accessToken, folderId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&orderBy=createdTime desc&fields=files(id,name,createdTime,size,webViewLink)&pageSize=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to list files');
    }

    const result = await response.json();
    return {
      success: true,
      files: result.files || []
    };
  } catch (error) {
    console.error('Error listing Drive backups:', error);
    return {
      success: false,
      error: error.message,
      files: []
    };
  }
};

/**
 * Delete old backups keeping only the most recent ones
 */
export const cleanupOldDriveBackups = async (accessToken, folderId, keepCount = 7) => {
  try {
    const listResult = await listDriveBackups(accessToken, folderId);
    if (!listResult.success || listResult.files.length <= keepCount) {
      return { success: true, deleted: 0 };
    }

    const filesToDelete = listResult.files.slice(keepCount);
    let deleted = 0;

    for (const file of filesToDelete) {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        deleted++;
      }
    }

    return { success: true, deleted };
  } catch (error) {
    console.error('Error cleaning up Drive backups:', error);
    return { success: false, error: error.message, deleted: 0 };
  }
};

/**
 * Verify folder exists and is accessible, recreate if needed
 */
export const verifyOrCreateFolder = async (accessToken, existingFolderId = null) => {
  // If we have an existing folder ID, verify it still exists
  if (existingFolderId) {
    try {
      const verifyResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${existingFolderId}?fields=id,name,trashed`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (verifyResponse.ok) {
        const folder = await verifyResponse.json();
        if (!folder.trashed) {
          console.log('[Drive] Folder verified:', folder.name);
          return { id: folder.id, name: folder.name, isNew: false };
        }
      }
    } catch (e) {
      console.log('[Drive] Folder verification failed, will recreate:', e.message);
    }
  }
  
  // Folder doesn't exist or was deleted, create new one
  console.log('[Drive] Creating backup folder...');
  return await getOrCreateBackupFolder(accessToken);
};

/**
 * Full backup to Drive workflow
 */
export const backupToDrive = async (backupData) => {
  const settings = getDriveSettings();
  
  if (!settings.enabled || !settings.clientId) {
    return { success: false, error: 'Google Drive not configured' };
  }

  let token = getStoredToken();
  
  if (!token) {
    // Need to sign in first
    try {
      const signInResult = await signInWithGoogle(settings.clientId);
      token = { accessToken: signInResult.accessToken };
    } catch (error) {
      return { success: false, error: `Sign-in required: ${error.message}` };
    }
  }

  try {
    // Always verify folder exists (in case it was deleted or this is first upload)
    console.log('[Drive] Verifying backup folder...');
    const folder = await verifyOrCreateFolder(token.accessToken, settings.folderId);
    
    // Update settings if folder changed
    if (folder.id !== settings.folderId) {
      console.log('[Drive] Updating folder settings:', folder.name);
      saveDriveSettings({ ...settings, folderId: folder.id, folderName: folder.name });
    }

    // Upload backup to the folder
    console.log('[Drive] Uploading backup to folder:', folder.name);
    const uploadResult = await uploadBackupToDrive(backupData, token.accessToken, folder.id);
    
    if (uploadResult.success) {
      console.log('[Drive] Backup uploaded successfully:', uploadResult.fileName);
      // Cleanup old backups
      await cleanupOldDriveBackups(token.accessToken, folder.id, 7);
    }

    return uploadResult;
  } catch (error) {
    console.error('[Drive] Backup failed:', error);
    // Token might be expired, clear it
    if (error.message?.includes('401') || error.message?.includes('invalid')) {
      clearToken();
    }
    return { success: false, error: error.message };
  }
};

/**
 * Check if Drive is properly configured and connected
 */
export const isDriveConnected = () => {
  const settings = getDriveSettings();
  const token = getStoredToken();
  return settings.enabled && settings.clientId && token !== null;
};

export default {
  getDriveSettings,
  saveDriveSettings,
  getStoredToken,
  clearToken,
  loadGoogleApi,
  isGoogleApiLoaded,
  signInWithGoogle,
  getOrCreateBackupFolder,
  verifyOrCreateFolder,
  uploadBackupToDrive,
  uploadFileToDrive,
  listDriveBackups,
  cleanupOldDriveBackups,
  backupToDrive,
  isDriveConnected
};
