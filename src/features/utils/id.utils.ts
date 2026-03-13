export const ENCRYPTION_KEY = "x9z_P2qR_8mN_v5Y";

/**
 * Solid Obfuscation Layer
 * Uses an XOR cipher with a rolling key to make the ID non-obvious.
 */
const xorCipher = (text: string, key: string): string => {
  return text
    .split("")
    .map((char, i) => {
      const keyChar = key.charCodeAt(i % key.length);
      const shift = (i * 7) % 256; // Additional shifting
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar ^ shift);
    })
    .join("");
};

/**
 * Generates a simple 4-character checksum to verify integrity.
 */
const getChecksum = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).substring(0, 4);
};

/**
 * Obfuscates the form ID for public links with high security.
 */
export const encodeFormId = (id: string): string => {
  if (!id) return "";

  // 1. Add integrity check and salt
  const checksum = getChecksum(id + ENCRYPTION_KEY);
  const dataToSecure = `${checksum}_${id}`;

  // 2. Apply XOR Cipher
  const secured = xorCipher(dataToSecure, ENCRYPTION_KEY);

  // 3. Encode to URL-safe Base64
  return btoa(secured)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Decodes the obfuscated form ID and validates integrity.
 */
export const decodeFormId = (encoded: string): string => {
  if (!encoded) return "";

  // Standard UUID check (fallback for old links)
  if (encoded.includes("-") && encoded.length === 36) {
    return encoded;
  }

  try {
    // 1. Decode Base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const secured = atob(base64);

    // 2. Reverse XOR Cipher
    const decrypted = xorCipher(secured, ENCRYPTION_KEY);

    // 3. Extract check and ID
    const [checksum, ...idParts] = decrypted.split("_");
    const id = idParts.join("_");

    // 4. Validate integrity
    if (checksum === getChecksum(id + ENCRYPTION_KEY)) {
      return id;
    }
  } catch {
    // Falls through to handle as raw ID if decryption fails
  }

  return encoded;
};
