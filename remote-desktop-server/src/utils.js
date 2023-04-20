// @ts-check
'use strict';

/**
 * Генерация случайно строки
 * @param {number} symbolsCount число символов в случайно строке
 * @returns {string} случайная строка указанной длины
 */
export function GenerateRandomString(symbolsCount) {
  const alph = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890".split("");
  const length = symbolsCount || 40;
  let randomString = "";
  for (let i = 0; i < length; i += 1) {
    const randomCharIndex = Math.round(Math.random() * 10000000 % alph.length);
    if (alph[randomCharIndex - 1] !== undefined) {
      randomString += alph[randomCharIndex];
    } else {
      i -= 1;
    }
  }
  return randomString;
}

/**
 * Хэшировать текст
 * @param {string} text строка для хэширования
 * @param {'sha512'|'sha256'|'md5'|'sha1'} algorithm алгоритм хэширования (sha512, sha256, md5...) crypto.getHashes()
 * @returns {string} Хэш-строку
 * ```js
 * console.log(crypto.getHashes());

 * // Prints:
 * //  [
 * //   'RSA-MD4',
 * //   'RSA-MD5',
 * //   'RSA-MDC2',
 * //   'RSA-RIPEMD160',
 * //   'RSA-SHA1',
 * //   'RSA-SHA1-2',
 * //   'RSA-SHA224',
 * //   'RSA-SHA256',
 * //   'RSA-SHA3-224',
 * //   'RSA-SHA3-256',
 * //   'RSA-SHA3-384',
 * //   'RSA-SHA3-512',
 * //   'RSA-SHA384',
 * //   'RSA-SHA512',
 * //   'RSA-SHA512/224',
 * //   'RSA-SHA512/256',
 * //   'RSA-SM3',
 * //   'blake2b512',
 * //   'blake2s256',
 * //   'id-rsassa-pkcs1-v1_5-with-sha3-224',
 * //   'id-rsassa-pkcs1-v1_5-with-sha3-256',
 * //   'id-rsassa-pkcs1-v1_5-with-sha3-384',
 * //   'id-rsassa-pkcs1-v1_5-with-sha3-512',
 * //   'md4',
 * //   'md4WithRSAEncryption',
 * //   'md5',
 * //   'md5-sha1',
 * //   'md5WithRSAEncryption',
 * //   'mdc2',
 * //   'mdc2WithRSA',
 * //   'ripemd',
 * //   'ripemd160',
 * //   'ripemd160WithRSA',
 * //   'rmd160',
 * //   'sha1',
 * //   'sha1WithRSAEncryption',
 * //   'sha224',
 * //   'sha224WithRSAEncryption',
 * //   'sha256',
 * //   'sha256WithRSAEncryption',
 * //   'sha3-224',
 * //   'sha3-256',
 * //   'sha3-384',
 * //   'sha3-512',
 * //   'sha384',
 * //   'sha384WithRSAEncryption',
 * //   'sha512',
 * //   'sha512-224',
 * //   'sha512-224WithRSAEncryption',
 * //   'sha512-256',
 * //   'sha512-256WithRSAEncryption',
 * //   'sha512WithRSAEncryption',
 * //   'shake128',
 * //   'shake256',
 * //   'sm3',
 * //   'sm3WithRSAEncryption',
 * //   'ssl3-md5',
 * //   'ssl3-sha1',
 * //   'whirlpool'
 * // ]
 * ```
 */
export function GetHashString(text, algorithm = 'sha512') {
  const crypto = require('crypto');
  const hashText = crypto.createHash(algorithm).update(text).digest('hex');
  return hashText;
}

/**
 * @param {{path: string, algorithm: ('sha512'|'sha256'|'md5'|'sha1')}} obj 
 * @returns {Promise<string>}
 */
export function CheckSumFile(obj) {
  if(obj.hasOwnProperty('path') && obj.hasOwnProperty('algorithm')) {
    const path = obj.path;
    const algorithm = obj.algorithm;
    return new Promise(function (resolve, reject) {
      const fs = require('fs');
      const crypto = require('crypto');
  
      let hash = crypto.createHash(algorithm).setEncoding('hex');
      fs.createReadStream(path)
        .once('error', reject)
        .pipe(hash)
        .once('finish', function () {
          resolve(hash.read());
        });
    });
  } else {
    throw new Error('Wrong argument Object. Object should have property "path" and "algorithm"');
  }
}

/**
 * 
 * @param {string} path 
 * @returns {Number}
 */
function FolderSize(path) {
  const FS = require('fs');
  const PATH = require('path');
  if(FS.existsSync(path)) {
    const files = FS.readdirSync(path);
    let totalSize = 0;
    files.forEach(it => {
      totalSize += FS.statSync(PATH.join(path, it)).size;
    });
    return totalSize;
  } else {
    return 0;
  }
}