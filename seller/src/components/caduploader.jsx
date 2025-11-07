import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, X, UploadCloud } from 'lucide-react';

/**
 * CadUploader
 * Props:
 * - onModelChange(url, fileName) : called when a GLB is accepted (url is an object URL)
 * - currentFileName : optional string to show current file
 * - onRemove : optional callback when removed
 */
const CadUploader = ({ onModelChange, currentFileName, onRemove }) => {
    // Accept only GLB files and forward an object URL to parent
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const url = URL.createObjectURL(file);
            // Provide object URL and file name to parent
            if (onModelChange) onModelChange(url, file.name, file);
        }
    }, [onModelChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'model/gltf-binary': ['.glb'] },
        maxFiles: 1,
    });

    const handleRemove = (e) => {
        e.stopPropagation();
        if (onRemove) onRemove();
        // parent is expected to revoke the object URL
        if (onModelChange) onModelChange('', null);
    };

    return (
        <div className="mt-4">
            {currentFileName ? (
                <div className="flex items-center justify-between p-3 bg-white border border-[#FFE5D9] rounded-lg shadow-inner">
                    <div className="flex items-center text-sm font-medium text-[#943410]">
                        <FileText className="w-4 h-4 mr-2 text-[#B7410E]" />
                        <span className="truncate max-w-[220px]">{currentFileName}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="p-1 rounded-full text-[#B7410E] hover:bg-[#FFF3EE] transition-colors"
                        aria-label="Remove uploaded file"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={
                        `p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200
                        ${isDragActive ? 'border-[#B7410E] bg-[#FFF3EE]' : 'border-gray-300 hover:border-[#B7410E] hover:bg-white'}
                        flex flex-col items-center justify-center text-center`
                    }
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-10 h-10 text-[#B7410E] mb-2" />
                    {isDragActive ? (
                        <p className="font-semibold text-[#B7410E]">Drop the GLB file here...</p>
                    ) : (
                        <p className="text-sm text-[#943410]">
                            Drag and drop your GLB file here, or click to select.
                        </p>
                    )}
                    <p className="text-xs text-[#943410] mt-1">Only .glb files are accepted for real-time preview.</p>
                </div>
            )}
        </div>
    );
};

export default CadUploader;