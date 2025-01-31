import * as openpgp from "openpgp";

export async function verifyGpgSignature(
  publicKeyFile: File,
  hashFile: File,
  signatureFile: File
): Promise<{ verificationResult: string; error: string | null; verifiedData: string }> {
  let verificationResult = "";
  let error: string | null = null;
  let verifiedData = "";

  try {
    const publicKeyArmored = await publicKeyFile.text();
    const signatureArrayBuffer = await signatureFile.arrayBuffer();
    const signatureUint8 = new Uint8Array(signatureArrayBuffer);
    const dataArrayBuffer = await hashFile.arrayBuffer();
    const dataUint8 = new Uint8Array(dataArrayBuffer);

    // Convert hash file content to string
    verifiedData = new TextDecoder().decode(dataUint8);

    console.log("Public Key Armored:\n", publicKeyArmored);
    console.log("Signature Binary:\n", signatureUint8);
    console.log("Data Binary:\n", dataUint8);

    const normalizedPublicKey = publicKeyArmored.replace(/\r\n/g, "\n").trim();
    if (!normalizedPublicKey.includes("BEGIN PGP PUBLIC KEY BLOCK")) {
      throw new Error("Invalid key block");
    }

    const publicKey = await openpgp.readKey({ armoredKey: normalizedPublicKey });
    const signature = await openpgp.readSignature({ binarySignature: signatureUint8 });
    const message = await openpgp.createMessage({ binary: dataUint8 });

    const verification = await openpgp.verify({
      message,
      signature,
      verificationKeys: publicKey,
    });
    const { verified } = verification.signatures[0];
    await verified;

    const fingerprint = publicKey.getFingerprint?.() || publicKey.getFingerprint;
    verificationResult = `✅ Signature is valid. Fingerprint: ${fingerprint}`;
  } catch (err: any) {
    if (err.message.includes("Signed digest did not match")) {
      error = "❌ Signature is invalid.";
    } else {
      error = "❌ Verification failed. Please check your files and try again.";
    }
  }

  return { verificationResult, error, verifiedData };
}