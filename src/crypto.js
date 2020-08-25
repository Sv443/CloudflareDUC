const crypto = require("crypto");
const scl = require("svcorelib");


/**
 * Encrypts a string with the key specified in `.env`
 * @param {String} text 
 * @returns {String}
 */
function encrypt(text)
{
    return new Promise((res, rej) => {
        try
        {
            let iv = crypto.randomBytes(16);
            let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from("7tedagb7enr4e79xdflsrywd4r2lc55y"), iv);
            let encrypted = cipher.update(text);

            encrypted = Buffer.concat([encrypted, cipher.final()]).toString("hex");

            return res(`${iv.toString("hex")}:${encrypted}`);
        }
        catch(err)
        {
            return rej(err);
        }
    });
}

/**
 * Decrypts a string with the key specified in `.env`
 * @param {String} text 
 * @returns {String|null}
 */
function decrypt(text)
{
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "binary");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from("7tedagb7enr4e79xdflsrywd4r2lc55y"), iv);
    let decrypted = decipher.update(encryptedText);

    let finalDecipher = null;
    try
    {
        finalDecipher = decipher.final();
    }
    catch(err)
    {
        scl.unused(err);
        return null;
    }

    if(finalDecipher == null)
        return null;

    decrypted = Buffer.concat([decrypted, finalDecipher]);

    return decrypted.toString();
}

module.exports = { encrypt, decrypt };
