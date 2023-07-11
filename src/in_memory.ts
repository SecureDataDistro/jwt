
import {JWT, AssymetricJWTSigner, AssymetricJWTVerifier, JWTSigningRequest} from "./index";
import { v4 as uuidv4 } from 'uuid';
import base64url from "base64url";
import {generateKeyPair, CompactSign, KeyLike, exportSPKI, SignJWT} from "jose";
import express from "express";
import exp = require("constants");

// ES384        | ECDSA using P-384 and SHA-384 | Optional 
export class InMemorySignerVerifier implements AssymetricJWTSigner {
    publicKey: KeyLike;
    privateKey: KeyLike;
    uuid;
    expiry;
    constructor() {
        this.uuid = uuidv4();
        this.expiry = 60 * 60; // 60s * 60m = 1hr
        this.publicKey = {} as KeyLike;
        this.privateKey = {} as KeyLike;
    }

    async init() {
        const { publicKey, privateKey } = await generateKeyPair('ES384');
        this.publicKey = publicKey;
        this.privateKey = privateKey;

        console.log(this.privateKey);
        console.log(this.publicKey);

        const spkiPem = await exportSPKI(publicKey)

        console.log(spkiPem)
    }

    async sign(jwt: JWT, expiresIn?: number): Promise<{ token: string; }> {
        
        let payload;
        if (jwt.sub.includes("sdd:hub:network:gateway")) {
            console.log('signing network token ', expiresIn)
            payload = jwt.payloadRaw(`sdd:hub:iam:local:${this.uuid}`, expiresIn?? this.expiry)
        } else {
            payload = jwt.payloadRaw(`sdd:hub:iam:local:${this.uuid}`, this.expiry)
        }

        console.log(payload);

        const jwtSigned = await new SignJWT(payload)
        .setProtectedHeader({alg: "ES384"})
        .sign(this.privateKey);
        

        return {
            token: jwtSigned
        };
    }

    async getPublicKey(): Promise<string> {
        const spkiPem = await exportSPKI(this.publicKey)
        return spkiPem;
    }
}

export const signer = new InMemorySignerVerifier();

export const localServer = async () => {
    const app = express()
    const port = 3000

    await signer.init() 

    app.use(express.json());
    app.put('/token',  async (req, res) => {
        const jwtReq =  req.body as JWTSigningRequest;
        console.log(jwtReq)
        const jwt = new JWT(jwtReq.entity, jwtReq.claims);
        console.log("signing token:" , jwt,jwtReq.expiresIn) 
        const token = await signer.sign(jwt,  jwtReq.expiresIn)
        res.send(token)
    })

    app.get('/pub', async (req, res) => {
        res.send(await signer.getPublicKey())
    })

    app.get('/health', async (req, res) => {
        res.status(200);
        res.send("ok");
    })

    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })
};
