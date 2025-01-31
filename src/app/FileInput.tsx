import { useState, useEffect, useRef } from "react";

interface FileInputProps {
    label: string;
    file: File | null;
    setFile: (file: File | null) => void;
    id: string;
    showContent?: boolean; // Add new optional prop
}

export default function FileInput({ 
    label, 
    file, 
    setFile, 
    id, 
    showContent = false // Default to false
}: FileInputProps) {
    const [dragActive, setDragActive] = useState(false);
    const [fileContent, setFileContent] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (file && showContent) {  // Only read content if showContent is true
            const reader = new FileReader();
            reader.onload = (e) => {
                setFileContent(e.target?.result as string);
            };
            reader.readAsText(file);
        } else {
            setFileContent("");
        }
    }, [file, showContent]);  // Add showContent to dependencies

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            setFile(droppedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const getBorderColor = () => {
        if (dragActive) return "border-blue-500";
        if (file) return "border-green-500";
        return "border-gray-300 hover:border-gray-400";
    };

    const getBackgroundColor = () => {
        if (dragActive) return "bg-blue-50";
        if (file) return "bg-green-50";
        return "bg-white";
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <label htmlFor={id} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
                {file && (
                    <span className="text-sm text-green-600">
                        File selected: {file.name}
                    </span>
                )}
            </div>
            <div className="relative">  {/* Add wrapper for positioning */}
                <div className={`relative border-2 border-dashed rounded-lg p-4 ${getBorderColor()} ${getBackgroundColor()}`}>
                    {file && (
                        <button
                            onClick={handleRemoveFile}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                            type="button"
                            aria-label="Remove file"
                        >
                            ×
                        </button>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        id={id}
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />

                    <label
                        htmlFor={id}
                        className={`flex flex-col items-center justify-center cursor-pointer`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <svg
                            className={`w-8 h-8 mb-2 ${file ? 'text-green-500' : 'text-gray-400'}`}
                            fill="none"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {file ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                />
                            )}
                        </svg>
                        <span className={`text-sm font-medium ${file ? 'text-green-600' : 'text-gray-600'}`}>
                            {file ? 'File uploaded successfully' : 'Drag & drop or click to upload'}
                        </span>
                    </label>
                </div>
            </div>
            {showContent && fileContent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                        {fileContent}
                    </pre>
                </div>
            )}
        </div>
    );
}