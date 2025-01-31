import React, { useState } from "react";
import FileInput from "./FileInput";
import { createSHA256 } from "hash-wasm";

// Exportable format size function
export const formatSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// Exportable hash calculation function
export const calculateFileHash = async (
  file: File,
  onProgress?: (processedBytes: number, totalBytes: number) => void
) => {
  const hasher = await createSHA256();
  const chunkSize = 256 * 1024;
  const fileSize = file.size;
  let processedSize = 0;

  const reader = new FileReader();

  const readChunk = async (start: number): Promise<void> => {
    const chunk = file.slice(start, Math.min(start + chunkSize, fileSize));
    reader.readAsArrayBuffer(chunk);

    return new Promise((resolve, reject) => {
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (!e.target?.result) {
          reject(new Error("Failed to read chunk"));
          return;
        }
        const chunkArray = new Uint8Array(e.target.result as ArrayBuffer);
        hasher.update(chunkArray);
        processedSize += chunk.size;
        onProgress?.(processedSize, fileSize);
        resolve();
      };
      reader.onerror = reject;
    });
  };

  for (let start = 0; start < fileSize; start += chunkSize) {
    await readChunk(start);
  }

  return hasher.digest("hex");
};

const HashCalculator = () => {
  const [selectedFileForHash, setSelectedFileForHash] = useState<File | null>(
    null
  );
  const [hashResult, setHashResult] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedBytes, setProcessedBytes] = useState<number>(0);

  const handleHashButtonClick = async () => {
    if (!selectedFileForHash) return;

    setIsCalculating(true);
    setProgress(0);
    setHashResult("");
    setProcessedBytes(0);

    try {
      const hashHex = await calculateFileHash(
        selectedFileForHash,
        (processed, total) => {
          setProcessedBytes(processed);
          setProgress(Number(((processed / total) * 100).toFixed(2)));
        }
      );
      setHashResult(hashHex);
    } catch (error) {
      console.error(error);
      setHashResult("Error calculating hash");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Hash Calculator</h2>
      <FileInput
        label="Select file to hash"
        file={selectedFileForHash}
        setFile={setSelectedFileForHash}
        id="hash-file-signature"
      />
      <button
        onClick={handleHashButtonClick}
        disabled={!selectedFileForHash || isCalculating}
        className={`
          mt-4 w-full py-3 px-4 rounded-md font-medium
          transition-colors focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-blue-500
          ${
            !selectedFileForHash || isCalculating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
        `}
      >
        {isCalculating ? "Calculating..." : "Calculate Hash"}
      </button>
      {isCalculating && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transform"
              style={{
                width: `${Math.max(0.1, progress)}%`,
                willChange: "width",
                transform: "translateZ(0)",
              }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1 text-center">
            {formatSize(processedBytes)} /{" "}
            {formatSize(selectedFileForHash?.size || 0)} ({progress}%)
          </div>
        </div>
      )}

      {hashResult && (
        <div className="mt-4 p-4 rounded-md bg-green-100 border border-green-400">
          <span className="font-mono text-sm break-all">
            SHA-256: {hashResult}
          </span>
        </div>
      )}
    </div>
  );
};

export default HashCalculator;
