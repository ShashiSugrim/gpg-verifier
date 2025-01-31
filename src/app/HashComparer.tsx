import { useState } from "react";

export const compareHashes = (hash1: string, hash2: string): boolean => {
  return hash1.trim() === hash2.trim();
};

const HashComparer = () => {
  const [hash1, setHash1] = useState("");
  const [hash2, setHash2] = useState("");
  const [result, setResult] = useState<boolean | null>(null);

  const compareFN = () => {
    setResult(compareHashes(hash1, hash2));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Hash
        </label>
        <input
          type="text"
          value={hash1}
          onChange={(e) => setHash1(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter first hash..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Second Hash
        </label>
        <input
          type="text"
          value={hash2}
          onChange={(e) => setHash2(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter second hash..."
        />
      </div>

      <button
        onClick={compareFN}
        disabled={!hash1 || !hash2}
        className={`
          w-full py-3 px-4 rounded-md font-medium
          transition-colors focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-blue-500
          ${
            !hash1 || !hash2
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
        `}
      >
        Compare Hashes
      </button>

      {result !== null && (
        <div
          className={`mt-4 p-4 rounded-md ${
            result
              ? "bg-green-100 border border-green-400"
              : "bg-red-100 border border-red-400"
          }`}
        >
          {result ? "Hashes match" : "Hashes don't match"}
        </div>
      )}
    </div>
  );
};

export default HashComparer;
