import { Router } from 'express';
import { db } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserStoredFile } from '../../src/types/index';

const router = Router();

// GET /api/files - List files belonging to the authenticated user
router.get('/files', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const files = db.getUserFiles(req.user.id);
    return res.json(files);
  } catch (err: any) {
    console.error('Error fetching user files:', err);
    return res.status(500).json({ error: 'Failed to retrieve vault files' });
  }
});

// POST /api/files - Upload/save a new file to the vault
router.post('/files', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { name, size, size_bytes, type, category, data_url, notes, id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'File name is required' });
    }

    const savedFile = db.saveUserFile(req.user.id, {
      id,
      name,
      size: size || '0 KB',
      size_bytes: size_bytes || 0,
      type: type || 'application/octet-stream',
      category: category || 'document',
      data_url: data_url || '',
      notes: notes || '',
    });

    return res.status(201).json(savedFile);
  } catch (err: any) {
    console.error('Error saving file to vault:', err);
    return res.status(500).json({ error: 'Failed to save file to vault' });
  }
});

// PUT /api/files/:id - Update file metadata (name, category, notes)
router.put('/files/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { id } = req.params;
    const { name, category, notes, data_url } = req.body;

    const updated = db.updateUserFile(id, req.user.id, {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(notes !== undefined && { notes }),
      ...(data_url !== undefined && { data_url }),
    });

    if (!updated) {
      return res.status(404).json({ error: 'File not found or unauthorized' });
    }

    return res.json(updated);
  } catch (err: any) {
    console.error('Error updating vault file:', err);
    return res.status(500).json({ error: 'Failed to update file' });
  }
});

// DELETE /api/files/:id - Delete a file from the vault
router.delete('/files/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { id } = req.params;
    const deleted = db.deleteUserFile(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: 'File not found or unauthorized' });
    }

    return res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting file:', err);
    return res.status(500).json({ error: 'Failed to delete file from vault' });
  }
});

export default router;
