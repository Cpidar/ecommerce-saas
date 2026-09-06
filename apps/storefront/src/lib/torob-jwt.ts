// // lib/torob-jwt.ts

// import { jwtVerify, importSPKI, errors } from "jose"

// // Torob's official Public Key (Ed25519)
// const TOROB_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
// MCowBQYDK2VwAyEAt6Mu4T0pBORY11W+QeM35UsmLO3vsf+6yKpFDEImFk0=
// -----END PUBLIC KEY-----`

// /**
//  * Verifies the JWT token sent by Torob
//  * @param token - The value of X-Torob-Token header
//  * @param expectedAudience - Your API hostname (e.g. "yourdomain.com" or "api.yourdomain.com")
//  */
// export async function verifyTorobToken(
//     token: string,
//     expectedAudience: string
// ): Promise<boolean> {
//     try {
//         // Import the public key
//         const publicKey = await importSPKI(TOROB_PUBLIC_KEY, "EdDSA")

//         // Verify the token
//         const { payload } = await jwtVerify(token, publicKey, {
//             algorithms: ["EdDSA"],
//             audience: expectedAudience, // Critical security check
//         })

//         // Optional: You can also check payload.exp and payload.nbf manually if needed
//         // (jose already checks them by default)

//         return true
//     } catch (err) {
//         if (err instanceof errors.JWTExpired) {
//             console.error("[Torob JWT] Token has expired")
//         } else if (err instanceof errors.JWTClaimValidationFailed) {
//             console.error("[Torob JWT] Claim validation failed:", err.message)
//         } else if (err instanceof errors.JWSSignatureVerificationFailed) {
//             console.error("[Torob JWT] Invalid signature")
//         } else {
//             console.error("[Torob JWT] Verification failed:", err)
//         }
//         return false
//     }
// }
