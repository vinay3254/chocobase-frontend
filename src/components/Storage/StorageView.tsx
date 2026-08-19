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
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080';
    return `${origin}/v1/storage/v1/object/sign/${obj.bucketId}/${obj.path}?token=sig_${Date.now()}&expires_in=${signedUrlDuration}`;
  };

  return (
    <div id="storage-view" className="flex h-[calc(100vh-3.5rem)] bg-[#FAF7F2] overflow-hidden text-[#2B1D20]">
      {/* Left Buckets Sidebar */}
      <div className="w-64 border-r border-[#E8DDD2] bg-[#FFFDF9] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#E8DDD2] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B1D20]">
            <FolderArchive className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>Buckets ({storageBuckets.length})</span>
          </div>
          <button
            onClick={() => setIsNewBucketModalOpen(true)}
            className="p-1 rounded-lg border border-[#E8DDD2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] transition-colors shadow-2xs"
            title="Create new bucket"
          >
            <Plus className="w-3.5 h-3.5 text-[#8B1E3F]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {storageBuckets.map((bucket) => {
            const isSelected = bucket.id === activeBucket?.id;
            return (
              <button
                key={bucket.id}
                onClick={() => setSelectedBucketId(bucket.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  isSelected 
                    ? 'bg-[#FAF7F2] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs' 
                    : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#F4EFEA]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {bucket.isPublic ? (
                    <Unlock className="w-3.5 h-3.5 text-[#286E4F] flex-shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#9B888C] flex-shrink-0" />
                  )}
                  <span className="truncate">{bucket.name}</span>
                </div>
                <span className="font-mono text-[10px] text-[#9B888C]">{bucket.objectsCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Files Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F2]">
        {/* Top Header */}
        {activeBucket && (
          <div className="p-4 border-b border-[#E8DDD2] bg-[#FFFDF9] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#2B1D20]">{activeBucket.name}</h2>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                  activeBucket.isPublic 
                    ? 'bg-[#286E4F]/10 text-[#286E4F] border-[#286E4F]/20 font-semibold' 
                    : 'bg-[#FAF7F2] text-[#685559] border-[#E8DDD2]'
                }`}>
                  {activeBucket.isPublic ? 'Public Bucket' : 'Private (RLS Enforced)'}
                </span>
                <span className="text-[11px] text-[#9B888C] font-mono">
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-all shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-3 border-b border-[#E8DDD2] bg-[#FAF7F2]/80 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9B888C]" />
            <input
              type="text"
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              placeholder="Search files in bucket..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#2B1D20] placeholder-[#9B888C] focus:outline-hidden focus:border-[#8B1E3F] font-mono shadow-2xs"
            />
          </div>

          <div className="text-[11px] font-mono text-[#685559]">
            {filteredObjects.length} files in bucket
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredObjects.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#9B888C] text-xs border border-dashed border-[#E8DDD2] bg-[#FFFDF9] rounded-2xl">
              <FolderArchive className="w-8 h-8 text-[#9B888C]/60 mb-2" />
              <p>No files in bucket. Click <strong className="text-[#8B1E3F]">Upload Files</strong> to add assets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredObjects.map((obj) => {
                const isImage = obj.mimeType.startsWith('image/');
                const sizeKb = (obj.sizeBytes / 1024).toFixed(1);

                return (
                  <div 
                    key={obj.id} 
                    className="group p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] hover:border-[#8B1E3F]/40 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    {/* Preview box */}
                    <div className="h-32 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center overflow-hidden mb-2 relative">
                      {isImage && obj.previewUrl ? (
                        <img 
                          src={obj.previewUrl} 
                          alt={obj.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-[#9B888C]" />
                      )}
                      
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSignedUrlModalObj(obj)}
                          className="p-1 rounded-lg bg-[#FFFDF9]/90 hover:bg-[#FFFDF9] text-[#2B1D20] border border-[#E8DDD2] shadow-2xs"
                          title="Create Signed URL"
                        >
                          <Key className="w-3 h-3 text-[#8B1E3F]" />
                        </button>
                        <button
                          onClick={() => deleteStorageObject(obj.id)}
                          className="p-1 rounded-lg bg-[#FFFDF9]/90 hover:bg-[#FFFDF9] text-red-600 border border-[#E8DDD2] shadow-2xs"
                          title="Delete File"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <div className="font-mono text-xs font-semibold text-[#2B1D20] truncate" title={obj.name}>
                        {obj.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#685559] font-mono mt-1">
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
          <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl shadow-2xl overflow-hidden text-[#2B1D20]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD2] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#8B1E3F]" />
                <h3 className="text-sm font-semibold text-[#2B1D20]">Signed URL Generator</h3>
              </div>
              <button onClick={() => setSignedUrlModalObj(null)} className="text-[#9B888C] hover:text-[#2B1D20]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-[#685559]">
                Generate a time-limited authenticated URL for private object <code className="font-mono text-[#8B1E3F] font-semibold">{signedUrlModalObj.name}</code>.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#2B1D20] mb-1">Expiry Duration</label>
                <select
                  value={signedUrlDuration}
                  onChange={(e) => setSignedUrlDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
                >
                  <option value="60">1 Minute (60s)</option>
                  <option value="3600">1 Hour (3600s)</option>
                  <option value="86400">24 Hours (1 Day)</option>
                  <option value="604800">7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B1D20] mb-1">Generated Signed URL</label>
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#8B1E3F] break-all select-all">
                  {generateSignedUrl(signedUrlModalObj)}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DDD2]">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSignedUrl(signedUrlModalObj));
                    setCopiedSignedUrl(true);
                    showNotification('Signed URL copied to clipboard');
                    setTimeout(() => setCopiedSignedUrl(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-all shadow-xs"
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
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl shadow-2xl overflow-hidden text-[#2B1D20]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD2] bg-[#FAF7F2]">
          <h3 className="text-sm font-semibold text-[#2B1D20]">Create Storage Bucket</h3>
          <button onClick={onClose} className="text-[#9B888C] hover:text-[#2B1D20]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Bucket Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. project-assets, customer-invoices"
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] font-mono focus:outline-hidden focus:border-[#8B1E3F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Max Upload File Size (MB)</label>
            <input
              type="number"
              min={1}
              max={500}
              value={sizeMb}
              onChange={(e) => setSizeMb(parseInt(e.target.value, 10) || 50)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] font-mono focus:outline-hidden focus:border-[#8B1E3F]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#2B1D20]">Public Bucket</div>
              <p className="text-[11px] text-[#685559]">Allows anyone to read media without signed tokens</p>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded bg-white border-[#E8DDD2] text-[#8B1E3F] focus:ring-0 w-4 h-4 accent-[#8B1E3F]"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E8DDD2]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs text-[#685559] hover:bg-[#F4EFEA] border border-[#E8DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white shadow-xs"
            >
              Create Bucket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
