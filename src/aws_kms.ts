import { KMSClient, SignCommand } from "@aws-sdk/client-kms";
import base64url from "base64url";
import {AssymetricJWTSigner, JWT, JWTSigningRequest} from "./index";

export class KMSJWTSigner implements AssymetricJWTSigner {
    encoder;
    decoder;
    client;
    kmsKeyId;
    kmsKeyAlg;
    expiry;
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
        // create KMS client
        this.client = new KMSClient({region: process.env.AWS_REGION!});

        // Get KMS Arn
        this.kmsKeyId = process.env.KMS_KEY_ID!;
        this.kmsKeyAlg = process.env.KMS_KEY_ALGO!;
        this.expiry = Number(process.env.JWT_TOKEN_TTL_MS!);
    }

    async sign(jwt: JWT): Promise<{token: string}> {
        
        const header = jwt.header("ES512");

        const payload = jwt.payload(`sdd:hub:iam:kms:${this.kmsKeyId}`, this.expiry)

        const signResponse = await this.client.send(new SignCommand({
            KeyId: this.kmsKeyId,
            Message: Buffer.from(`${header}.${payload}`),
            SigningAlgorithm: "ECDSA_SHA_512",
            MessageType: "RAW"

        }));

        return {
            token: `${header}.${payload}.${base64url(signResponse!.Signature!.toString())}`
        };
    }
}


// lambda handler
export const signer = new KMSJWTSigner()



export const handler = async (event: JWTSigningRequest, context: any) => {
    const jwt = new JWT(event.entity, event.claims);
    const signedJWT = await signer.sign(jwt);

    return signedJWT;
};
