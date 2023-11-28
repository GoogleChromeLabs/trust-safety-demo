// Copyright 2023 Google LLC. SPDX-License-Identifier: Apache-2.0

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "issue.h"
#include "key_generator.h"
#include "redeem.h"
#include "util.h"

#define FLAG_ISSUE "--issue"
#define FLAG_REDEEM "--redeem"
#define FLAG_KEY_GENERATE "--key-generate"

int main(int argc, char* argv[]) {
  char* flag = argv[1];

  if (strcmp(flag, FLAG_ISSUE) == 0 && argc == 3) {
    char* request_base64 = argv[2];
    size_t request_base64_len = strlen(request_base64);
    uint8_t* response_base64;
    size_t response_base64_len;
    if (!issue(request_base64, request_base64_len, &response_base64,
               &response_base64_len)) {
      fprintf(stderr, "failed to issue\n");
      return EXIT_FAILURE;
    }

    // output for stdout
    printf("%s", response_base64);

    return EXIT_SUCCESS;
  }

  if (strcmp(flag, FLAG_REDEEM) == 0 && argc == 4) {
    char* request_base64 = argv[2];
    size_t request_base64_len = strlen(request_base64);

    char* message = argv[3];
    size_t message_len = strlen(message);

    uint8_t* response_base64;
    size_t response_base64_len;

    if (!redeem(request_base64, request_base64_len, message, message_len,
                &response_base64, &response_base64_len)) {
      fprintf(stderr, "failed to redeem\n");
      return EXIT_FAILURE;
    }

    // output for stdout
    printf("%s", response_base64);

    return EXIT_SUCCESS;
  }

  if (strcmp(flag, FLAG_KEY_GENERATE) == 0 && argc == 2) {
    base64_keys_t keys;
    if (!key_generate(&keys)) {
      fprintf(stderr, "failed to generate keys\n");
      return EXIT_FAILURE;
    };

    fprintf(stdout,
            "{\n"
            "  \"priv_key_base64\": \"%s\",\n"
            "  \"pub_key_base64\": \"%s\"\n"
            "}\n",
            keys.priv_key_base64, keys.pub_key_base64);

    // save to file
    if (!write_file("./keys/priv_key.txt", keys.priv_key_base64,
                    keys.priv_key_base64_len)) {
      fprintf(stderr, "failed to write key\n");
      return EXIT_FAILURE;
    }
    if (!write_file("./keys/pub_key.txt", keys.pub_key_base64,
                    keys.pub_key_base64_len)) {
      fprintf(stderr, "failed to write key\n");
      return EXIT_FAILURE;
    }

    free(keys.pub_key_base64);
    free(keys.priv_key_base64);
    return EXIT_SUCCESS;
  }

  fprintf(stderr, "argument error\n");
  return EXIT_FAILURE;
}
