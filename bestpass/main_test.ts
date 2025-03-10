import { assertEquals } from "@std/assert";
import { add } from "./main.ts";

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});
import { assertEquals, assertThrows } from "@std/assert";

Deno.test(async function encrypt() {
  let testText = "hello from encrypted deno"
  let secretKey = await importSecretKey("asdfghjklpoiuytrewqzxcvbnm123456");
  let iv = crypto.getRandomValues(new Uint8Array(12));
  let encryptedText = await crypto.subtle.encrypt({
    name: "AES-GCM",
    iv: iv, // Initialization vector must be unique for each encryption
  }, secretKey, str2ab(testText));
  secretKey = await importSecretKey("asdfghjklpoiuytrewqzxcvbnm123456");
  let decryptedText = await crypto.subtle.decrypt({
    name: "AES-GCM",
    iv: iv, // Initialization vector must be unique for each encryption
  }, secretKey, encryptedText);
  assertEquals(String.fromCharCode.apply(null, new Uint16Array(decryptedText)), testText);
  
  // secretKey = await importSecretKey("falsekeyfalsekeyfalsekeyfalsekey");
  // await assertThrows(
  //   async () => {
  //     await crypto.subtle.decrypt({
  //       name: "AES-GCM",
  //       iv: iv, // Initialization vector must be unique for each encryption
  //     }, secretKey, encryptedText);
  //   },
  //   Error,
  //   "OperationError"
  // );
  
})

function importSecretKey(key) {
  let jwkEcKey = {
    crv: "P-384",
    ext: true,
    key_ops: ["encrypt", "decrypt",],
    kty: "oct",
    k: key,
  };
  return crypto.subtle.importKey("jwk", jwkEcKey, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}