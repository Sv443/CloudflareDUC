const crypto = require("crypto");


/**
 * Encrypts a string
 * @param {String} text 
 * @returns {String}
 */
function encrypt(text)
{
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(Buffer.from("7tedagb7enr4e79xdflsrywd4r2lc55y")), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a string
 * @param {String} text 
 * @returns {String|null}
 */
function decrypt(text)
{
    let textParts = text.split(":");

    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(Buffer.from("7tedagb7enr4e79xdflsrywd4r2lc55y")), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

module.exports = { encrypt, decrypt };
