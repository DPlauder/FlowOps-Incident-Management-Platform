const ALGORITHM = 'PBKDF2' as const;
const HASH = "SHA-256" as const;
const ITERATIONS = 600_000 as const;
const SALT_BYTES = 32;
const KEY_BITS = 256;

function toBase64Url(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function fromBase64Url(str: string): Uint8Array<ArrayBuffer> {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
        base64.length + (4 - (base64.length % 4)) % 4,
        "="
    );
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
} 

export function validatePassword(password: string): string{
    if(password.length < 12){
        return " Das Password muss mindestens 12 Zeichen lang sein";
    }
    return "";
}

async function deriveKey(
    password: string,
    salt: Uint8Array<ArrayBuffer>,
    iteration: number
): Promise<ArrayBuffer> {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        {name: ALGORITHM},
        false,
        ["deriveBits"]
    );
    return crypto.subtle.deriveBits(
        { name: ALGORITHM, salt, iterations: iteration, hash: HASH },
        baseKey,
        KEY_BITS
    );
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const hash = await deriveKey(password, salt, ITERATIONS);
    return `pbkdf2:sha256:${ITERATIONS}:${toBase64Url(salt.buffer)}:${toBase64Url(hash)}`;
}

export async function verifyPassword(
    password: string,
    stored: string
): Promise<boolean> {
    const parts = stored.split(':');
    if(parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256'){
        return false;
    }
    const iterations = parseInt(parts[2], 10);
    if(isNaN(iterations) || iterations < 1){
        return false;
    }
    const salt = fromBase64Url(parts[3]);
    const expectedHash = fromBase64Url(parts[4]);
    const actualHash = new Uint8Array(await deriveKey(password, salt, iterations));
    if(actualHash.length !== expectedHash.length){
        return false;
    }
    let diff = 0;
    for(let i = 0; i < actualHash.length; i++){
        diff |= actualHash[i] ^ expectedHash[i];
    }
    return diff === 0;
}
