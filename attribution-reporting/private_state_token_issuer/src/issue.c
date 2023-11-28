// Copyright 2023 Google LLC. SPDX-License-Identifier: Apache-2.0

#include "issue.h"

#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/trust_token.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "config.h"
#include "util.h"

/**
 * success: 1
 * error: 0
 */
int issue(uint8_t *request_base64, size_t request_base64_len,
          uint8_t **response_base64, size_t *response_base64_len) {
  // 1. Base64 decode
  size_t request_len;
  uint8_t *request;
  fprintf(stderr, "\e[0;31mISSUE REQUEST(%lu)\e[0m: %s\n\n", request_base64_len,
          request_base64);

  if (!base64_decode(request_base64, request_base64_len, &request,
                     &request_len)) {
    fprintf(stderr, "failed to decode base64\n");
    return 0;
  }

  // 2. Trust Token method
  const TRUST_TOKEN_METHOD *method;
  if (strcmp(ISSUER_PROTOCOL_VERSION, "TrustTokenV3PMB") == 0) {
    method = TRUST_TOKEN_experiment_v2_pmb();
  } else if (strcmp(ISSUER_PROTOCOL_VERSION, "TrustTokenV3VOPRF") == 0) {
    method = TRUST_TOKEN_experiment_v2_voprf();
  } else {
    fprintf(stderr,
            "invalid issuer protocol version(%s), valid options are "
            "TrustTokenV3PMB & TrustTokenV3VOPRF\n",
            ISSUER_PROTOCOL_VERSION);
    return 0;
  }

  // 3. Trust Token Issuer
  uint16_t issuer_max_batchsize = ISSUER_MAX_BATCHSIZE;
  TRUST_TOKEN_ISSUER *issuer =
      TRUST_TOKEN_ISSUER_new(method, issuer_max_batchsize);
  if (!issuer) {
    fprintf(stderr,
            "failed to create TRUST_TOKEN Issuer. maybe max_batchsize(%i) is "
            "too large\n",
            issuer_max_batchsize);
    return 0;
  }

  // 4. Private Key
  size_t priv_key_base64_size;
  uint8_t *priv_key_base64;
  if (!read_file(PRIV_KEY_PATH, &priv_key_base64, &priv_key_base64_size)) {
    fprintf(stderr, "failed to read file\n");
    return 0;
  };

  size_t priv_key_base64_len = priv_key_base64_size - 1;

  size_t priv_key_len;
  uint8_t *priv_key;
  if (!base64_decode(priv_key_base64, priv_key_base64_len, &priv_key,
                     &priv_key_len)) {
    fprintf(stderr, "failed to decode base64\n");
    return 0;
  }

  // 5. Add Private Key to Issuer
  if (!TRUST_TOKEN_ISSUER_add_key(issuer, priv_key, priv_key_len)) {
    fprintf(stderr, "failed to add key in TRUST_TOKEN Issuer.\n");
    return 0;
  }

  /// issue

  // 6. Generate 32byte random bytes for key to encrypt Private Metadata
  //    1:success, 0:error
  uint8_t metadata_key[32];
  RAND_bytes(metadata_key, sizeof(metadata_key));
  if (!TRUST_TOKEN_ISSUER_set_metadata_key(issuer, metadata_key,
                                           sizeof(metadata_key))) {
    fprintf(stderr, "failed to generate trust token metadata key.\n");
    return 0;
  }

  // 7. ISSUER token based on request 1:success, 0:error
  uint8_t *response = NULL;
  size_t response_len, tokens_issued;
  size_t max_issuance = ISSUER_MAX_ISSUANCE;
  uint8_t public_metadata = ISSUER_PUBLIC_METADATA;
  uint8_t private_metadata = ISSUER_PRIVATE_METADATA;
  if (!TRUST_TOKEN_ISSUER_issue(
          issuer, &response, &response_len, &tokens_issued, request,
          request_len, public_metadata, private_metadata, max_issuance)) {
    fprintf(stderr, "failed to issue in TRUST_TOKEN Issuer.\n");
    return 0;
  }

  // 8. encode response into Base64
  if (!base64_encode(response, response_len, response_base64,
                     response_base64_len)) {
    fprintf(stderr, "fail to encode base64\n");
    return 0;
  }

  fprintf(stderr, "\e[0;31mISSUE RESPONSE(%ld)\e[0m: %s\n\n",
          *response_base64_len, *response_base64);

  return 1;
}
