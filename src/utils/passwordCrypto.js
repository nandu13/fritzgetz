// NodeJS implementation of crypto, I'm sure google's 
// cryptoJS would work equally well.
var crypto = require('crypto');

var matchPassword = function (password, hashedPwd) {
// The value stored in [dbo].[AspNetUsers].[PasswordHash]
//var hashedPwd = "ANSwuaoV8O8Xxp7nJWAzi6zg1neqknzjC2M3Z8mTXSiN7k3NJtmE2DToM+bkf487hA==";
    var hashedPasswordBytes = new Buffer(hashedPwd, 'base64');
    var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var saltString = "";
    var storedSubKeyString = "";

// build strings of octets for the salt and the stored key
    for (var i = 1; i < hashedPasswordBytes.length; i++) {
        if (i > 0 && i <= 16) {
            saltString += hexChar[(hashedPasswordBytes[i] >> 4) & 0x0f] + hexChar[hashedPasswordBytes[i] & 0x0f]
        }
        if (i > 0 && i > 16) {
            storedSubKeyString += hexChar[(hashedPasswordBytes[i] >> 4) & 0x0f] + hexChar[hashedPasswordBytes[i] & 0x0f];
        }
    }

    if (storedSubKeyString === '') {
        return false
    }

// TODO remove debug - logging passwords in prod is considered 
// tasteless for some odd reason
   

    var nodeCrypto = crypto.pbkdf2Sync(new Buffer(password), new Buffer(saltString, 'hex'), 1000, 49, 'sha1');
    var derivedKeyOctets = nodeCrypto.toString('hex').toUpperCase();

   

// The first 64 bytes of the derived key should
// match the stored sub key
    if (derivedKeyOctets.indexOf(storedSubKeyString) === 0) {
        return true;
    } else {
        
        return false;
    }
}


var passwordHash = function (password, saltString) {
    var pass = crypto.pbkdf2Sync(new Buffer(password), new Buffer(saltString), 1000, 256, 'SHA1');
    var numArray = new Buffer(49);
    new Buffer(saltString).copy(numArray, 1, 0, 16);
    pass.copy(numArray, 17, 0, 32)
    return new Buffer(numArray).toString('base64')
}

var password = {
    passwordHash: passwordHash,
    matchPassword: matchPassword
};

module.exports = password;