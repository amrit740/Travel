import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { apiFiles } from '../services/api';
import type { UserStoredFile, DocumentCategory } from '../types';

export type { UserStoredFile, DocumentCategory };

// IndexedDB Helper for safe local persistence of large files & attachments
const DB_NAME = 'TravelWiseVaultDB';
const STORE_NAME = 'vault_files';
const DB_VERSION = 1;

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const dbInstance = request.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(file: UserStoredFile): Promise<void> {
  try {
    const idb = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write warning:', err);
  }
}

async function getFromIndexedDB(userId: string): Promise<UserStoredFile[]> {
  try {
    const idb = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const all: UserStoredFile[] = req.result || [];
        const userFiles = all.filter((f) => f.user_id === userId);
        resolve(userFiles);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read warning:', err);
    return [];
  }
}

async function deleteFromIndexedDB(fileId: string): Promise<void> {
  try {
    const idb = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(fileId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete warning:', err);
  }
}

/**
 * Fetch all documents belonging strictly to the specified user from Firestore & Backend
 */
export async function getUserFilesFromFirestore(userId: string): Promise<UserStoredFile[]> {
  if (!userId) return [];

  const filesMap = new Map<string, UserStoredFile>();

  // 1. Try Firestore First
  try {
    const filesCol = collection(db, 'files');
    const q = query(filesCol, where('user_id', '==', userId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const data = d.data() as UserStoredFile;
      if (data && data.id) {
        filesMap.set(data.id, data);
        saveToIndexedDB(data).catch(() => {});
      }
    });
  } catch (firestoreErr) {
    console.warn('Firestore query warning for user files:', firestoreErr);
  }

  // 2. Try Backend API for consistency
  try {
    const apiRecords = await apiFiles.getAll();
    if (Array.isArray(apiRecords)) {
      apiRecords.forEach((f) => {
        if (f && f.id && f.user_id === userId) {
          if (!filesMap.has(f.id)) {
            filesMap.set(f.id, f);
            saveToIndexedDB(f).catch(() => {});
          }
        }
      });
    }
  } catch (apiErr) {
    console.warn('API query warning for user files:', apiErr);
  }

  // 3. If offline or both queries returned 0, check IndexedDB cache
  if (filesMap.size === 0) {
    try {
      const idbRecords = await getFromIndexedDB(userId);
      idbRecords.forEach((f) => {
        filesMap.set(f.id, f);
      });
    } catch {
      // ignore
    }
  }

  const results = Array.from(filesMap.values());
  // Sort descending by created_at (newest first)
  results.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  return results;
}

/**
 * Save / Upload a new document record in Firestore, Backend & Local Storage
 */
export async function saveUserFileToFirestore(
  userId: string,
  file: {
    name: string;
    size: string;
    size_bytes: number;
    type: string;
    category: DocumentCategory;
    data_url: string;
    notes?: string;
  }
): Promise<UserStoredFile> {
  if (!userId) {
    throw new Error('Authentication required to upload documents.');
  }

  const fileId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  const newFileRecord: UserStoredFile = {
    id: fileId,
    user_id: userId,
    name: file.name,
    size: file.size,
    size_bytes: file.size_bytes,
    type: file.type || 'application/octet-stream',
    category: file.category || 'document',
    data_url: file.data_url,
    storage_path: `users/${userId}/vault/${fileId}`,
    notes: file.notes || '',
    created_at: now,
    updated_at: now,
  };

  let savedSuccessfully = false;
  let lastError: any = null;

  // 1. Save to Firestore
  try {
    const fileRef = doc(db, 'files', fileId);
    await setDoc(fileRef, newFileRecord);
    savedSuccessfully = true;
  } catch (err: any) {
    console.warn('Firestore setDoc error:', err);
    lastError = err;
  }

  // 2. Save to Backend Database
  try {
    await apiFiles.create(newFileRecord);
    savedSuccessfully = true;
  } catch (err: any) {
    console.warn('Backend API save file error:', err);
    if (!lastError) lastError = err;
  }

  // 3. Save to IndexedDB
  await saveToIndexedDB(newFileRecord);

  if (!savedSuccessfully && lastError) {
    throw new Error(lastError.message || 'Failed to save document. Please check your network and try again.');
  }

  return newFileRecord;
}

/**
 * Update document metadata (name, category, notes, data_url)
 */
export async function updateUserFileInFirestore(
  fileId: string,
  userId: string,
  updates: {
    name?: string;
    category?: DocumentCategory;
    notes?: string;
    data_url?: string;
  }
): Promise<UserStoredFile> {
  if (!fileId || !userId) {
    throw new Error('Invalid file ID or user session');
  }

  const now = new Date().toISOString();
  const updatePayload = {
    ...updates,
    updated_at: now,
  };

  let updatedRecord: UserStoredFile | null = null;

  // 1. Update Firestore
  try {
    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, updatePayload);
    const snap = await getDoc(fileRef);
    if (snap.exists()) {
      updatedRecord = snap.data() as UserStoredFile;
    }
  } catch (err) {
    console.warn('Firestore updateDoc warning:', err);
  }

  // 2. Update Backend API
  try {
    const apiResult = await apiFiles.update(fileId, updatePayload);
    if (apiResult && !updatedRecord) {
      updatedRecord = apiResult as UserStoredFile;
    }
  } catch (err) {
    console.warn('Backend API update warning:', err);
  }

  if (!updatedRecord) {
    // Construct updated object
    const existing = (await getFromIndexedDB(userId)).find((f) => f.id === fileId);
    updatedRecord = {
      ...(existing || {
        id: fileId,
        user_id: userId,
        name: updates.name || 'Document',
        size: '0 KB',
        size_bytes: 0,
        type: 'application/octet-stream',
        category: updates.category || 'document',
        data_url: updates.data_url || '',
        created_at: now,
        updated_at: now,
      }),
      ...updates,
      updated_at: now,
    };
  }

  // 3. Update IndexedDB
  await saveToIndexedDB(updatedRecord);

  return updatedRecord;
}

/**
 * Delete a document permanently from Firestore, Backend & Storage caches
 */
export async function deleteUserFileFromFirestore(fileId: string, userId: string): Promise<void> {
  if (!fileId) {
    throw new Error('Invalid document identifier.');
  }
  if (!userId) {
    throw new Error('Authentication required to delete documents.');
  }

  let firestoreDeleted = false;
  let backendDeleted = false;
  let lastError: any = null;

  // 1. Delete from Firestore
  try {
    const fileRef = doc(db, 'files', fileId);
    await deleteDoc(fileRef);
    firestoreDeleted = true;
  } catch (err: any) {
    console.error('Firestore deleteDoc failed:', err);
    lastError = err;
  }

  // 2. Delete from Backend Database
  try {
    const result = await apiFiles.delete(fileId);
    if (result && result.success) {
      backendDeleted = true;
    }
  } catch (err: any) {
    console.error('Backend API delete failed:', err);
    if (!lastError) lastError = err;
  }

  // 3. Delete from IndexedDB and Local Storage
  await deleteFromIndexedDB(fileId);
  try {
    const localKey = `travel_wise_user_files_${userId}`;
    const local = localStorage.getItem(localKey);
    if (local) {
      const parsed: UserStoredFile[] = JSON.parse(local);
      const filtered = parsed.filter((f) => f.id !== fileId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }

  // If both storage layers failed, throw error so UI remains consistent and notifies user
  if (!firestoreDeleted && !backendDeleted && lastError) {
    throw new Error(
      lastError.message || 'Unable to delete this document. Please check your connection and try again.'
    );
  }
}
