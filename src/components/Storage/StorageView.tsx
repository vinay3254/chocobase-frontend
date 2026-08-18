import React, { useState, useRef } from 'react';
import { 
  FolderArchive, 
  FolderPlus, 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  Key, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  Eye, 
  FileText, 
  Image, 
  Plus, 
  X,
  File,
  ShieldCheck
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { StorageBucket, StorageObject } from '../../types';

export const StorageView: React.FC = () => {
  const { 
    storageBuckets, 
    storageObjects, 
    selectedBucketId, 
    setSelectedBucketId, 
    createStorageBucket, 
    deleteStorageBucket, 
    uploadStorageObject, 
    deleteStorageObject,
    projectSettings,
    showNotification 
  } = useSupabase();

  const [isNewBucketModalOpen, setIsNewBucketModalOpen] = useState(false);
  const [signedUrlModalObj, setSignedUrlModalObj] = useState<StorageObject | null>(null);
  const [signedUrlDuration, setSignedUrlDuration] = useState('3600');
  const [copiedSignedUrl, setCopiedSignedUrl] = useState(false);
  const [fileSearch, setFileSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeBucket = storageBuckets.find(b => b.id === selectedBucketId) || storageBuckets[0];
  const bucketObjects = storageObjects.filter(o => o.bucketId === activeBucket?.id);

  const filteredObjects = bucketObjects.filter(o => 
    o.name.toLowerCase().includes(fileSearch.toLowerCase()) || 
    o.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeBucket) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      uploadStorageObject(activeBucket.id, file.name, file.size, file.type, previewUrl);
    }
  };

  const generateSignedUrl = (obj: StorageObject) => {
    return `${projectSettings.apiUrl}/storage/v1/object/sign/${obj.bucketId}/${obj.path}?token=sig_9381029_${Date.now()}&expires_in=${signedUrlDuration}`;
  };

  return (
    <div id="storage-view" className="flex h-[calc(100vh-4rem)] bg-[#fcfcfc] overflow-hidden">
      {/* Left Buckets Sidebar */}
      <div className="w-64 border-r border-[#ececec] bg-white flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#ececec] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#333]">
            <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>Buckets ({storageBuckets.length})</span>
          </div>
          <button
            onClick={() => setIsNewBucketModalOpen(true)}
            className="p-1 rounded border border-[#ececec] hover:bg-[#f9f9f9] text-[#666] hover:text-[#1a1a1a] transition-colors"
            title="Create new bucket"
          >
            <Plus className="w-3.5 h-3.5 text-[#3ecf8e]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {storageBuckets.map((bucket) => {
            const isSelected = bucket.id === activeBucket?.id;
            return (
              <button
                key={bucket.id}
                onClick={() => setSelectedBucketId(bucket.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors ${
                  isSelected 
                    ? 'bg-[#f9f9f9] text-[#1a1a1a] font-semibold border border-[#ececec] shadow-2xs' 
                    : 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#f9f9f9]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {bucket.isPublic ? (
                    <Unlock className="w-3.5 h-3.5 text-[#3ecf8e] flex-shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#999] flex-shrink-0" />
                  )}
                  <span className="truncate">{bucket.name}</span>
                </div>
                <span className="font-mono text-[10px] text-[#999]">{bucket.objectsCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Files Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fcfcfc]">
        {/* Top Header */}
        {activeBucket && (
          <div className="p-4 border-b border-[#ececec] bg-white flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#1a1a1a]">{activeBucket.name}</h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  activeBucket.isPublic 
                    ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' 
                    : 'bg-[#f4f4f5] text-[#666] border-[#ececec]'
                }`}>
                  {activeBucket.isPublic ? 'Public Bucket' : 'Private (RLS Enforced)'}
                </span>
                <span className="text-[11px] text-[#999] font-mono">
                  Max: {activeBucket.fileSizeLimitMb} MB/file
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#3ecf8e] hover:bg-[#34b27b] text-xs font-semibold text-white transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-3 border-b border-[#ececec] bg-[#fafafa] flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#999]" />
            <input
              type="text"
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              placeholder="Search files in bucket..."
              className="w-full pl-8 pr-2.5 py-1 rounded-md bg-white border border-[#ececec] text-xs text-[#1a1a1a] placeholder-[#999] focus:outline-hidden focus:border-[#3ecf8e] font-mono shadow-2xs"
            />
          </div>

          <div className="text-[11px] font-mono text-[#999]">
            {filteredObjects.length} files in bucket
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredObjects.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#999] text-xs border border-dashed border-[#ececec] bg-white rounded-xl">
              <FolderArchive className="w-8 h-8 text-[#ccc] mb-2" />
              <p>No files in bucket. Click <strong className="text-[#3ecf8e]">Upload Files</strong> to add assets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredObjects.map((obj) => {
                const isImage = obj.mimeType.startsWith('image/');
                const sizeKb = (obj.sizeBytes / 1024).toFixed(1);

                return (
                  <div 
                    key={obj.id} 
                    className="group p-3 rounded-xl bg-white border border-[#ececec] hover:border-[#d0d0d0] shadow-xs transition-all flex flex-col justify-between"
                  >
                    {/* Preview box */}
                    <div className="h-32 rounded-lg bg-[#f9f9f9] border border-[#ececec] flex items-center justify-center overflow-hidden mb-2 relative">
                      {isImage && obj.previewUrl ? (
                        <img 
                          src={obj.previewUrl} 
                          alt={obj.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-[#999]" />
                      )}
                      
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSignedUrlModalObj(obj)}
                          className="p-1 rounded bg-white/90 hover:bg-white text-[#333] border border-[#ececec] shadow-xs"
                          title="Create Signed URL"
                        >
                          <Key className="w-3 h-3 text-amber-500" />
                        </button>
                        <button
                          onClick={() => deleteStorageObject(obj.id)}
                          className="p-1 rounded bg-white/90 hover:bg-white text-red-500 border border-[#ececec] shadow-xs"
                          title="Delete File"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <div className="font-mono text-xs font-semibold text-[#1a1a1a] truncate" title={obj.name}>
                        {obj.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#999] font-mono mt-1">
                        <span>{sizeKb} KB</span>
                        <span>{new Date(obj.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Bucket Modal */}
      {isNewBucketModalOpen && (
        <CreateBucketModal
          onClose={() => setIsNewBucketModalOpen(false)}
          onCreate={(name, isPub, sizeMb) => {
            createStorageBucket(name, isPub, sizeMb);
            setIsNewBucketModalOpen(false);
          }}
        />
      )}

      {/* Signed URL Modal */}
      {signedUrlModalObj && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#ececec] rounded-xl shadow-2xl overflow-hidden text-[#1a1a1a]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ececec] bg-[#fafafa]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-[#1a1a1a]">Signed URL Generator</h3>
              </div>
              <button onClick={() => setSignedUrlModalObj(null)} className="text-[#999] hover:text-[#333]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-[#666]">
                Generate a time-limited authenticated URL for private object <code className="font-mono text-[#1a1a1a]">{signedUrlModalObj.name}</code>.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#333] mb-1">Expiry Duration</label>
                <select
                  value={signedUrlDuration}
                  onChange={(e) => setSignedUrlDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#ececec] text-xs text-[#333] focus:outline-hidden focus:border-[#3ecf8e]"
                >
                  <option value="60">1 Minute (60s)</option>
                  <option value="3600">1 Hour (3600s)</option>
                  <option value="86400">24 Hours (1 Day)</option>
                  <option value="604800">7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#333] mb-1">Generated Signed URL</label>
                <div className="p-2.5 rounded bg-[#fafafa] border border-[#ececec] text-xs font-mono text-amber-600 break-all select-all">
                  {generateSignedUrl(signedUrlModalObj)}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#ececec]">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSignedUrl(signedUrlModalObj));
                    setCopiedSignedUrl(true);
                    showNotification('Signed URL copied to clipboard');
                    setTimeout(() => setCopiedSignedUrl(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition-colors shadow-xs"
                >
                  {copiedSignedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSignedUrl ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Create Bucket Modal
const CreateBucketModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string, isPublic: boolean, sizeMb: number) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [sizeMb, setSizeMb] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-'), isPublic, sizeMb);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#ececec] rounded-xl shadow-2xl overflow-hidden text-[#1a1a1a]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ececec] bg-[#fafafa]">
          <h3 className="text-sm font-semibold text-[#1a1a1a]">Create Storage Bucket</h3>
          <button onClick={onClose} className="text-[#999] hover:text-[#333]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#333] mb-1">Bucket Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. project-assets, customer-invoices"
              className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#ececec] text-xs text-[#1a1a1a] font-mono focus:outline-hidden focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#333] mb-1">Max Upload File Size (MB)</label>
            <input
              type="number"
              min={1}
              max={500}
              value={sizeMb}
              onChange={(e) => setSizeMb(parseInt(e.target.value, 10) || 50)}
              className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#ececec] text-xs text-[#1a1a1a] font-mono focus:outline-hidden focus:border-[#3ecf8e]"
            />
          </div>

          <div className="p-3 rounded-md bg-[#fafafa] border border-[#ececec] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#1a1a1a]">Public Bucket</div>
              <p className="text-[11px] text-[#666]">Allows anyone to read media without signed tokens</p>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded bg-white border-[#ccc] text-[#3ecf8e] focus:ring-0 w-4 h-4"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#ececec]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs text-[#666] hover:bg-[#f9f9f9] border border-[#ececec]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#3ecf8e] hover:bg-[#34b27b] text-xs font-medium text-white shadow-xs"
            >
              Create Bucket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
