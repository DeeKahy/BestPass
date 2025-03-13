// Browser version with debugging

// Check if libraries are loaded correctly
function checkLibraries() {
  console.log("Checking libraries...");
  if (typeof bcrypt === "undefined") {
    console.error("bcrypt library is not loaded!");
    return false;
  }

  if (typeof CryptoJS === "undefined") {
    console.error("CryptoJS library is not loaded!");
    return false;
  }

  console.log("Libraries loaded successfully!");
  return true;
}

/**
 * Hash an email using bcrypt
 * @param {string} email - The email to hash
 * @returns {Promise<string>} - The hashed email
 */
async function hashEmail(email) {
  console.log("Attempting to hash email:", email);

  // Salt rounds (higher is more secure but slower)
  const saltRounds = 10;

  try {
    // Generate salt and hash the email
    const salt = await bcrypt.genSalt(saltRounds);
    console.log("Generated salt:", salt);

    const hashedEmail = await bcrypt.hash(email, salt);
    console.log("Successfully hashed email");
    return hashedEmail;
  } catch (error) {
    console.error("Error hashing email:", error);
    throw error;
  }
}

/**
 * Encrypt a password using AES with the password itself as the key
 * @param {string} password - The password to encrypt (also used as the key)
 * @returns {string} - The encrypted password
 */
function encryptPassword(password) {
  console.log("Attempting to encrypt password (length):", password.length);

  try {
    // Using the password itself as the key
    const encrypted = CryptoJS.AES.encrypt(password, password).toString();
    console.log("Encryption successful, result length:", encrypted.length);
    return encrypted;
  } catch (error) {
    console.error("Error encrypting password:", error);
    throw error;
  }
}

/**
 * Decrypt a password that was encrypted with AES
 * @param {string} encryptedPassword - The encrypted password
 * @param {string} originalPassword - The original password used as the key
 * @returns {string} - The decrypted password
 */
function decryptPassword(encryptedPassword, originalPassword) {
  console.log("Attempting to decrypt password");

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, originalPassword);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log("Decryption successful, result:", decrypted);
    return decrypted;
  } catch (error) {
    console.error("Error decrypting password:", error);
    throw error;
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, setting up form handler");

  // Check if libraries are loaded
  if (!checkLibraries()) {
    console.error("Cannot proceed due to missing libraries");
    return;
  }

  const loginForm = document.querySelector("form");

  if (!loginForm) {
    console.error("Login form not found!");
    return;
  }

  console.log("Form found, adding submit event listener");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!emailInput || !passwordInput) {
      console.error("Email or password input not found!");
      return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    console.log("Email input:", email ? "provided" : "empty");
    console.log("Password input:", password ? "provided" : "empty");

    if (!email || !password) {
      console.error("Email or password is empty");
      return;
    }

    try {
      // Test direct encryption to verify CryptoJS is working
      console.log("Testing direct encryption...");
      const testEncrypt = CryptoJS.AES.encrypt("test", "key").toString();
      console.log("Test encryption result:", testEncrypt);

      // Hash the email
      const hashedEmail = await hashEmail(email);
      console.log("Hashed Email:", hashedEmail);

      // Encrypt the password
      const encryptedPassword = encryptPassword(password);
      console.log("Encrypted Password:", encryptedPassword);

      // Verify decryption works
      const decrypted = decryptPassword(encryptedPassword, password);
      console.log(
        "Decrypted Password matches original:",
        decrypted === password,
      );

      // Display results on page for verification
      const resultDiv = document.createElement("div");
      resultDiv.innerHTML = `
        <h3>Results:</h3>
        <p><strong>Original Email:</strong> ${email}</p>
        <p><strong>Hashed Email:</strong> ${hashedEmail}</p>
        <p><strong>Original Password:</strong> ${password}</p>
        <p><strong>Encrypted Password:</strong> ${encryptedPassword}</p>
        <p><strong>Decrypted Password:</strong> ${decrypted}</p>
      `;
      document.body.appendChild(resultDiv);

      // Continue with form submission if needed
      // loginForm.submit();
    } catch (error) {
      console.error("Error processing form:", error);
      alert("Error processing form: " + error.message);
    }
  });

  // Add a test button for direct verification
  const testButton = document.createElement("button");
  testButton.textContent = "Test Encryption";
  testButton.style.marginTop = "10px";
  testButton.onclick = function (e) {
    e.preventDefault();

    try {
      const testResult = CryptoJS.AES.encrypt(
        "test message",
        "test key",
      ).toString();
      alert("Encryption test result: " + testResult);
    } catch (error) {
      alert("Encryption test failed: " + error.message);
    }
  };

  loginForm.appendChild(testButton);
});
