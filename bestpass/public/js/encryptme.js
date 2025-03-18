// Browser version with debugging

// Check if libraries are loaded correctly
function checkLibraries() {
  if (typeof CryptoJS === "undefined") {
    console.error("CryptoJS library is not loaded!");
    return false;
  }

  console.log("Libraries loaded successfully!");
  return true;
}
document.addEventListener("DOMContentLoaded", async () => {
  checkLibraries();

  const encrypted = await CryptoJS.AES.encrypt("test", "secret-pass-phrase").toString();
  console.log("Encrypted", encrypted);

  const decrypted = await CryptoJS.AES.decrypt(encrypted, "secret-pass-phrase").toString(CryptoJS.enc.Utf8)
  console.log("Decrypted", decrypted)
})