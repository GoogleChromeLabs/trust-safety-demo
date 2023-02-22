// Copyright 2023 Google LLC. SPDX-License-Identifier: Apache-2.0

#include "key_generator.h"

#include <openssl/curve25519.h>
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
int key_generate(base64_keys_t *keys) {
  // Trust Token method
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

  size_t priv_key_len, pub_key_len;

  uint8_t priv_key[TRUST_TOKEN_MAX_PRIVATE_KEY_SIZE],
      pub_key[TRUST_TOKEN_MAX_PUBLIC_KEY_SIZE];

  // KeyID of trust_token keys
  uint32_t key_id = KEY_ID;

  // generate Trust Token keypair
  // 1:success, 0:error
  if (!TRUST_TOKEN_generate_key(
          method, priv_key, &priv_key_len, TRUST_TOKEN_MAX_PRIVATE_KEY_SIZE,
          pub_key, &pub_key_len, TRUST_TOKEN_MAX_PUBLIC_KEY_SIZE, key_id)) {
    fprintf(stderr, "failed to generate TRUST_TOKEN key.\n");
    return 0;
  }

  // Base64 Public Key
  if (!base64_encode(pub_key, pub_key_len, &keys->pub_key_base64,
                     &keys->pub_key_base64_len)) {
    fprintf(stderr, "fail to encode base64\n");
    return 0;
  }

  // Base64 Private Key
  if (!base64_encode(priv_key, priv_key_len, &keys->priv_key_base64,
                     &keys->priv_key_base64_len)) {
    fprintf(stderr, "fail to encode base64\n");
    return 0;
  }

  return 1;
}
