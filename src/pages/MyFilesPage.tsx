import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  Search,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Image as ImageIcon,
  Ticket,
  Shield,
  CreditCard,
  Plus,
  X,
  RefreshCw,
  HardDrive,
  Edit2,
  ArrowUpDown,
  Filter,
  FileUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  type UserStoredFile,
  type DocumentCategory,
  getUserFilesFromFirestore,
  saveUserFileToFirestore,
  updateUserFileInFirestore,
  deleteUserFileFromFirestore,
} from '../lib/userFilesService';
import { formatDate } from '../lib/utils';

export const MyFilesPage: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UserStoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<UserStoredFile | null>(null);
  const [editingFile, setEditingFile] = useState<UserStoredFile | null>(null);
  const [deletingFile, setDeletingFile] = useState<UserStoredFile | null>(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('document');
  const [uploadNotes, setUploadNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<DocumentCategory>('document');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Action State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadFiles = async () => {
    if (!user?.id) {
      setFiles([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getUserFilesFromFirestore(user.id);
      setFiles(data);
    } catch (err: any) {
      console.warn('Error fetching files:', err);
      showToast('Could not sync vault with server. Loaded offline cache.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [user?.id]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectFile(e.target.files[0]);
    }
  };

  const handleSelectFile = (file: File) => {
    // 15MB limit
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File exceeds 15MB maximum size. Please choose a smaller document or photo.');
      return;
    }
    setUploadFile(file);
    setUploadName(file.name);
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !user?.id) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onerror = () => {
        setIsUploading(false);
        setUploadError('Failed to read file from disk.');
      };

      reader.onload = async (event) => {
        try {
          const dataUrl = event.target?.result as string;
          const sizeFormatted =
            uploadFile.size > 1024 * 1024
              ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
              : `${(uploadFile.size / 1024).toFixed(0)} KB`;

          const newRecord = await saveUserFileToFirestore(user.id, {
            name: uploadName.trim() || uploadFile.name,
            size: sizeFormatted,
            size_bytes: uploadFile.size,
            type: uploadFile.type || 'application/octet-stream',
            category: uploadCategory,
            data_url: dataUrl,
            notes: uploadNotes.trim(),
          });

          setFiles((prev) => [newRecord, ...prev.filter((f) => f.id !== newRecord.id)]);
          setIsUploading(false);
          setIsUploadModalOpen(false);
          setUploadFile(null);
          setUploadName('');
          setUploadNotes('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          showToast(`"${newRecord.name}" securely saved to your Travel Vault.`);
        } catch (err: any) {
          setIsUploading(false);
          setUploadError(err.message || 'Failed to save document. Please try again.');
        }
      };

      reader.readAsDataURL(uploadFile);
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'Upload processing error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (file: UserStoredFile) => {
    setEditingFile(file);
    setEditName(file.name);
    setEditCategory(file.category);
    setEditNotes(file.notes || '');
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile || !user?.id) return;

    setIsUpdating(true);
    try {
      const updated = await updateUserFileInFirestore(editingFile.id, user.id, {
        name: editName.trim() || editingFile.name,
        category: editCategory,
        notes: editNotes.trim(),
      });

      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      if (previewFile?.id === updated.id) setPreviewFile(updated);
      setEditingFile(null);
      showToast('Document details updated successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update document.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Perform Secure Delete
  const handleConfirmDelete = async () => {
    if (!deletingFile || !user?.id) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteUserFileFromFirestore(deletingFile.id, user.id);

      // Remove from UI
      setFiles((prev) => prev.filter((f) => f.id !== deletingFile.id));
      if (previewFile?.id === deletingFile.id) setPreviewFile(null);

      const deletedName = deletingFile.name;
      setDeletingFile(null);
      showToast(`"${deletedName}" removed permanently from your vault.`);
    } catch (err: any) {
      console.error('Delete error:', err);
      setDeleteError(err.message || 'Unable to delete this document. Please check connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Trigger Download
  const handleDownloadFile = (file: UserStoredFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.data_url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloading "${file.name}"...`);
    } catch (err) {
      showToast('Failed to download document.', 'error');
    }
  };

  // Category Configuration
  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'All Documents', icon: FolderOpen },
    { id: 'ticket', label: 'Tickets & Passes', icon: Ticket },
    { id: 'voucher', label: 'Hotel & Vouchers', icon: CreditCard },
    { id: 'passport', label: 'Passports & Visas', icon: Shield },
    { id: 'photo', label: 'Travel Photos', icon: ImageIcon },
    { id: 'document', label: 'Other Docs', icon: FileText },
  ];

  // Calculate live counts per category
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat.id === 'all') {
      acc[cat.id] = files.length;
    } else {
      acc[cat.id] = files.filter((f) => f.category === cat.id).length;
    }
    return acc;
  }, {} as Record<string, number>);

  // Filter and Sort
  const filteredAndSortedFiles = files
    .filter((f) => {
      const matchesQuery =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesQuery) return false;
      if (selectedCategory === 'all') return true;
      return f.category === selectedCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'size') {
        return (b.size_bytes || 0) - (a.size_bytes || 0);
      }
      return 0;
    });

  const totalBytes = files.reduce((acc, f) => acc + (f.size_bytes || 0), 0);
  const formattedTotalStorage =
    totalBytes > 1024 * 1024
      ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(totalBytes / 1024).toFixed(1)} KB`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950 border border-rose-800 text-rose-100'
              : 'bg-[#0f172a] border border-slate-700 text-white'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C59B27] font-semibold block mb-1">
            Encrypted Travel Storage
          </span>
          <h1 className="font-serif-title text-3xl sm:text-4xl text-[#0f172a] font-medium tracking-tight">
            My Documents & Travel Vault
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] font-light mt-1">
            Your private database-backed vault for flight passes, hotel vouchers, visa papers, and trip receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={loadFiles}
            disabled={isLoading}
            className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
            title="Refresh vault"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C59B27]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] font-medium text-xs tracking-wider uppercase shadow-md active:scale-98 transition-all border border-[#C59B27]/40 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#C59B27]" />
            <span>Upload Document</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
          />
        </div>
      </div>

      {/* Storage Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAFAF8] p-5 rounded-3xl border border-[#e2e8f0] flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#0f172a]/10 text-[#0f172a] flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#64748b] font-medium">Stored Documents</p>
            <p className="text-2xl font-bold text-[#0f172a]">{files.length} Files</p>
          </div>
        </div>

        <div className="bg-[#FAFAF8] p-5 rounded-3xl border border-[#e2e8f0] flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#C59B27]/15 text-[#0f172a] flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-[#C59B27]" />
          </div>
          <div>
            <p className="text-xs text-[#64748b] font-medium">Vault Storage Used</p>
            <p className="text-2xl font-bold text-[#0f172a]">{formattedTotalStorage}</p>
          </div>
        </div>

        <div className="bg-[#FAFAF8] p-5 rounded-3xl border border-[#e2e8f0] flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-[#64748b] font-medium">Security & Privacy</p>
            <p className="text-sm font-bold text-emerald-900 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Isolated User Vault
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Quick Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-[#C59B27] bg-[#C59B27]/10 scale-[1.01]'
            : 'border-slate-300 hover:border-slate-400 bg-[#FAFAF8]'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
          <FileUp className="w-5 h-5 text-[#0f172a]" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            Drag & drop files here, or <span className="text-[#C59B27] underline">browse your device</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Supports PDF, JPG, PNG, WEBP, DOC, DOCX up to 15MB
          </p>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#FAFAF8] rounded-2xl border border-[#e2e8f0]">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            const count = categoryCounts[c.id] || 0;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0f172a] text-[#f8fafc] font-semibold shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a] hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Sort Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by file name or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20 text-[#0f172a]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">File Name (A-Z)</option>
              <option value="size">File Size (Largest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* File List Grid / Loading / Empty States */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C59B27]" />
          <span className="font-medium text-slate-600">Synchronizing your Travel Vault...</span>
        </div>
      ) : filteredAndSortedFiles.length === 0 ? (
        <div className="p-16 text-center bg-[#FAFAF8] rounded-3xl border border-dashed border-[#e2e8f0] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#0f172a]/10 text-[#0f172a] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8 text-[#C59B27]" />
          </div>
          <div className="max-w-md mx-auto">
            {files.length === 0 ? (
              <>
                <h3 className="text-base font-bold text-[#0f172a]">Your Travel Vault is empty</h3>
                <p className="text-xs text-[#64748b] mt-1">
                  Upload your tickets, hotel vouchers, passport copies, and receipts so you can easily access them anywhere on your travels.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-[#0f172a]">No documents found</h3>
                <p className="text-xs text-[#64748b] mt-1">
                  No files match your current category filter or search query "{searchQuery}".
                </p>
              </>
            )}
          </div>
          {files.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#C59B27]" />
              <span>Select File to Upload</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedFiles.map((file) => {
            const isImage = file.type.startsWith('image/') || file.data_url.startsWith('data:image');
            const isPdf = file.type === 'application/pdf' || file.data_url.startsWith('data:application/pdf');

            return (
              <div
                key={file.id}
                className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => setPreviewFile(file)}
                      className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#e2e8f0] flex items-center justify-center text-[#0f172a] overflow-hidden shrink-0 cursor-pointer hover:border-slate-400 transition-colors"
                    >
                      {isImage ? (
                        <img
                          src={file.data_url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : isPdf ? (
                        <FileText className="w-6 h-6 text-amber-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-[#C59B27]" />
                      )}
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAFAF8] border border-[#e2e8f0] text-[10px] font-bold uppercase tracking-wider text-[#0f172a]">
                      {file.category}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => setPreviewFile(file)}
                      className="font-bold text-sm text-[#0f172a] truncate hover:text-[#C59B27] transition-colors cursor-pointer"
                      title={file.name}
                    >
                      {file.name}
                    </h3>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      {file.size} • Added {formatDate(file.created_at)}
                    </p>
                    {file.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        "{file.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewFile(file)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFAF8] hover:bg-[#0f172a] text-[#0f172a] hover:text-white text-xs font-semibold transition-all border border-[#e2e8f0] cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(file)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Document Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(file)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingFile(file);
                        setDeleteError(null);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C59B27]/15 flex items-center justify-center text-[#0f172a]">
                  <Upload className="w-4 h-4 text-[#C59B27]" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Save Document to Vault</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadFile(null);
                  setUploadError(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g., Goa Flight Boarding Pass"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ticket', 'voucher', 'passport', 'photo', 'document'] as DocumentCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setUploadCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all text-center ${
                        uploadCategory === cat
                          ? 'bg-[#0f172a] text-white border-[#0f172a]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Trip Reference (Optional)
                </label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g., Indigo Flight 6E-204, Seat 12A, PNR: X78YQ"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20 text-slate-900 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="truncate max-w-[220px] font-medium">{uploadFile?.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {uploadFile ? `${(uploadFile.size / 1024).toFixed(0)} KB` : ''}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
                      <span>Saving to Vault...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>Save Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                  <Edit2 className="w-4 h-4 text-[#0f172a]" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Edit Document Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFile(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ticket', 'voucher', 'passport', 'photo', 'document'] as DocumentCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all text-center ${
                        editCategory === cat
                          ? 'bg-[#0f172a] text-white border-[#0f172a]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20 text-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setEditingFile(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete this document?</h3>
                <p className="text-xs text-slate-500">Permanent removal confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 font-semibold">"{deletingFile.name}"</strong>? This document will be permanently removed from your Travel Vault across all devices.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeletingFile(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview / View Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm truncate max-w-[400px]">{previewFile.name}</h3>
                <p className="text-xs text-slate-500">
                  {previewFile.category.toUpperCase()} • {previewFile.size} • Added {formatDate(previewFile.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl bg-slate-100 flex items-center justify-center p-2">
              {previewFile.data_url.startsWith('data:image') || previewFile.type.startsWith('image/') ? (
                <img
                  src={previewFile.data_url}
                  alt={previewFile.name}
                  className="max-h-[55vh] w-auto object-contain rounded-xl shadow-sm"
                />
              ) : previewFile.type === 'application/pdf' || previewFile.data_url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewFile.data_url}
                  title={previewFile.name}
                  className="w-full h-[55vh] rounded-xl border border-slate-200"
                />
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 mx-auto text-[#C59B27] mb-2" />
                  <p className="text-sm font-semibold">{previewFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">Binary Document File</p>
                </div>
              )}
            </div>

            {previewFile.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Notes:</span>
                <p>{previewFile.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const toDelete = previewFile;
                  setPreviewFile(null);
                  setDeletingFile(toDelete);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewFile)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
