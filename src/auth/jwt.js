import jwt from 'jsonwebtoken'

export const createToken = (user) => {
    const payload = {
        id: user[0].id,
        username: user[0].username
    };
     
    const secretKey = "ClaveSecreta2024UwU";

    const options = {
        expiresIn : '1h',
        issuer : 'localhost'
    };

    return jwt.sign(payload,secretKey,options);
}

export const desencryptToken = (encryptedToken) => {
    const secretKey = "ClaveSecreta2024UwU";
    let token = encryptedToken;
    let payloadOriginal = null;
    try {
        payloadOriginal = jwt.verify(token, secretKey);
    } catch(e) {
        console.error(e);
    }
    return payloadOriginal;
};