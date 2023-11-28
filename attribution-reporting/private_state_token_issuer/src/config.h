// Copyright 2023 Google LLC. SPDX-License-Identifier: Apache-2.0

// Protocol version to use. Available options are TrustTokenV3PMB and
// TrustTokenV3VOPRF. see:
// https://github.com/WICG/trust-token-api/blob/main/ISSUER_PROTOCOL.md#issuer-key-commitments
#define ISSUER_PROTOCOL_VERSION "TrustTokenV3VOPRF"

// In the context of attestation, the issuer always issue a single token as it
// is issued and redeemed for a specific use case. This is compared to private
// state tokens  which are issued in large quantity and redeemed individually at
// a different point in time for general use cases.
#define ISSUER_MAX_BATCHSIZE 1;
#define ISSUER_MAX_ISSUANCE 1;

// Today, this is mainly used to indicate which signing key is used to generated
// a blind token. see this section for details and extensions:
// https://github.com/WICG/attribution-reporting-api/blob/main/trigger_attestation.md#future-extension-scalable-public-metadata-for-destination-attestation
#define KEY_ID 0x0001;
#define ISSUER_PUBLIC_METADATA 0x0001;

// The PRIVATE_METADATA field can be used to record attestation decision.
// see:
// https://github.com/WICG/attribution-reporting-api/blob/main/trigger_attestation.md#privacy-of-the-ivt-detector
#define ISSUER_PRIVATE_METADATA 0;
