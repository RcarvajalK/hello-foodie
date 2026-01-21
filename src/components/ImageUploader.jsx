import { useState, useRef } from 'react';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import { useStore } from '../lib/store';
import clsx from 'clsx';

export default function ImageUploader({
    currentImage,
    onUploadComplete,
    label = "Upload Image",
    className = "",
    aspectRatio = "aspect-video"
}) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const uploadImage = useStore(state => state.uploadImage);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setUploading(true);

        const result = await uploadImage(file);

        if (result.success) {
            onUploadComplete(result.url);
        } else {
            alert(`Upload failed: ${result.error}`);
            setPreview(null);
        }
        setUploading(false);
    };

    const triggerFilePicker = () => {
        fileInputRef.current?.click();
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        onUploadComplete('');
    };

    const displayImage = preview || currentImage;

    return (
        <div className={clsx("relative group", className)}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            <div
                onClick={triggerFilePicker}
                className={clsx(
                    "relative overflow-hidden cursor-pointer border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2",
                    aspectRatio,
                    displayImage ? "border-transparent" : "border-slate-100 bg-slate-50 hover:bg-slate-100 rounded-3xl",
                    displayImage && !uploading ? "" : "rounded-3xl"
                )}
            >
                {displayImage ? (
                    <>
                        <img
                            src={displayImage}
                            alt="Preview"
                            className={clsx(
                                "w-full h-full object-cover transition-all rounded-3xl",
                                uploading ? "opacity-30 blur-sm" : "group-hover:opacity-90"
                            )}
                        />
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={32} className="text-brand-orange animate-spin" />
                            </div>
                        )}
                        {!uploading && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 rounded-3xl">
                                <Upload size={24} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-orange">
                            <Camera size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
                    </>
                )}
            </div>

            {displayImage && !uploading && (
                <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white text-gray-400 rounded-full flex items-center justify-center shadow-lg hover:text-red-500 transition-colors z-20"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
