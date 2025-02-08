"use client";
import { useState } from "react";
import * as openpgp from "openpgp";
import FileInput from "./FileInput";
import HashCalculator, { calculateFileHash, formatSize } from "./HashCalculator";
import { verifyGpgSignature as handleVerification } from "./utils/verifyGPGSignature";
import { compareHashes } from "./HashComparer";
import Image from 'next/image';

export default function Home() {
  const [publicKeyFile, setPublicKeyFile] = useState<File | null>(null);
  const [hashFile, setHashFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [fileToHash, setFileToHash] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [processedBytes, setProcessedBytes] = useState(0);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKeyFile || !hashFile || !signatureFile || !fileToHash) return;

    setIsLoading(true);
    setError(null);
    setVerificationResult("");
    setLogMessages([]);
    setProgress(0);
    setProcessedBytes(0);
    setIsVerificationComplete(false);

    try {
      // Signature Verification
      setLogMessages((prev) => [...prev, "🔍 Verifying signature..."]);
      const {
        verificationResult: vr,
        error: err,
        verifiedData,
      } = await handleVerification(publicKeyFile, hashFile, signatureFile);

      if (err) {
        setError(err);
        setLogMessages((prev) => [...prev, "❌ Signature verification failed"]);
        return;
      }

      setVerificationResult(vr);
      setLogMessages((prev) => [
        ...prev,
        "✅ Signature verified successfully",
        vr,
      ]);

      // Hash Extraction
      setLogMessages((prev) => [
        ...prev,
        `🔍 Extracting hash from verified file (${hashFile.name})...`,
      ]);
      const hashRegex = /[a-fA-F0-9]{64}/;
      const match = verifiedData?.match(hashRegex);

      if (!match) {
        setError("No valid SHA256 hash found in the verified file");
        setLogMessages((prev) => [...prev, "❌ No valid SHA256 hash found"]);
        return;
      }

      const extractedHash = match[0].toLowerCase();
      setLogMessages((prev) => [
        ...prev,
        `✅ Extracted hash: ${extractedHash}`,
      ]);

      // File Hashing
      setLogMessages((prev) => [
        ...prev,
        `🔨 Calculating file hash for  ${fileToHash.name} ...`,
      ]);
      const computedHash = await calculateFileHash(
        fileToHash,
        (processed, total) => {
          setProcessedBytes(processed);
          setProgress(Number(((processed / total) * 100).toFixed(2)));
        }
      );

      setLogMessages((prev) => [
        ...prev,
        `✅ Computed hash for ${fileToHash.name}: ${computedHash} `,
      ]);

      // Hash Comparison
      setLogMessages((prev) => [...prev, "🔍 Comparing hashes..."]);
      const hashesMatch = compareHashes(extractedHash, computedHash);

      if (hashesMatch) {
        setVerificationResult(
          (prev) => prev + " \n\n ✅ Hashes match - File is legitimate"
        );
        setLogMessages((prev) => [
          ...prev,
          "✅ Hashes match - File is legitimate",
        ]);
      } else {
        setError("❌ Hashes do not match - File may have been tampered with");
        setLogMessages((prev) => [...prev, "❌ Hashes do not match"]);
      }
    } catch (err) {
      setError(
        "❌ Verification failed. Please check your files and try again."
      );
      setLogMessages((prev) => [
        ...prev,
        "❌ Critical error during verification",
      ]);
    } finally {
      setIsLoading(false);
      setIsVerificationComplete(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <a
        href="https://github.com/ShashiSugrim/gpg-verifier"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4"
      >
        <Image
          src="/githubLogo.png"
          alt="GitHub"
          width={100}
          height={100}
          className="hover:opacity-80 transition-opacity"
        />
      </a>
      <main className="max-w-screen-xl mx-auto px-4">
        {/* Container for the two columns */}
        <div className="lg:flex lg:gap-8">
          {/* Left column - Signature verification */}
          <div className="lg:flex-1 max-w-md lg:max-w-none mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">
              Verify GPG Signature
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4" id="verify-form">
              <FileInput
                label="Upload Public Key"
                file={publicKeyFile}
                setFile={setPublicKeyFile}
                id="public-key"
                showContent={true}
              />
              <FileInput
                label="Upload Hash File"
                file={hashFile}
                setFile={setHashFile}
                id="hash-file"
                showContent={true}
              />
              <FileInput
                label="Upload Signature File"
                file={signatureFile}
                setFile={setSignatureFile}
                id="signature-file"
              />
              <FileInput
                label="Upload File to Verify"
                file={fileToHash}
                setFile={setFileToHash}
                id="file-to-hash"
              />
            </form>

            <button
              form="verify-form"
              type="submit"
              disabled={
                isLoading ||
                !publicKeyFile ||
                !hashFile ||
                !signatureFile ||
                !fileToHash
              }
              className={`mt-6
                w-full py-3 px-4 rounded-md font-medium
                transition-colors focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500
                ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              `}
            >
              {isLoading ? "Verifying..." : "Verify File"}
            </button>

            {/* Progress Bar */}
            {isLoading && (
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
                  {formatSize(processedBytes)} / {formatSize(fileToHash?.size || 0)}{" "}
                  ({progress}%)
                </div>
              </div>
            )}

            {/* Log Messages */}
            {logMessages.length > 0 && (
              <div className="mt-4 p-4 rounded-md bg-gray-100 border border-gray-300 space-y-2">
                {logMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md text-sm break-all whitespace-pre-wrap ${
                      message.startsWith("✅")
                        ? "bg-green-100 text-green-700"
                        : message.startsWith("❌")
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {message}
                  </div>
                ))}
              </div>
            )}

            {/* Final Results */}
            {isVerificationComplete && verificationResult && (
              <div className="mt-4 p-4 rounded-md bg-green-100 border border-green-400">
                <div className="whitespace-pre-line">{verificationResult}</div>
              </div>
            )}
            {isVerificationComplete && error && (
              <div className="mt-4 p-4 rounded-md bg-red-100 border border-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Right column - Hash calculator */}
          <div className="mt-8 lg:mt-0 lg:flex-1 max-w-md lg:max-w-none mx-auto">
            <HashCalculator />
          </div>
        </div>
      </main>
    </div>
  );
}
