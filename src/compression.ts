import { gzipSync, strToU8 } from 'fflate'
import { _base64Encode } from './utils'
import { Compression, CompressionData, XHROptions } from './types'

export function decideCompression(): Compression {
    // compressionSupport: Partial<Record<Compression, boolean>>
    // if (compressionSupport[Compression.Base64]) {
    //     return Compression.Base64
    // } else {
    return Compression.Base64
    // }
}

export function compressData(
    compression: Compression,
    jsonData: string,
    options: XHROptions
): [CompressionData | Uint8Array, XHROptions] {
    if (compression === Compression.GZipJS) {
        // :TRICKY: This returns an UInt8Array. We don't encode this to a string - returning a blob will do this for us.
        return [
            gzipSync(strToU8(jsonData), { mtime: 0 }),
            { ...options, blob: true, urlQueryArgs: { compression: Compression.GZipJS } },
        ]
    } else {
        return [{ data: _base64Encode(jsonData) }, options]
    }
}
