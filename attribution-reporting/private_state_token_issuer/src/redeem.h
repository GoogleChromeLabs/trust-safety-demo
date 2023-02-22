// Copyright 2023 Google LLC. SPDX-License-Identifier: Apache-2.0

#include <stdint.h>
#include <stdio.h>

int redeem(uint8_t *request_base64, size_t request_base64_len, char *message,
           size_t message_len, uint8_t **response_base64,
           size_t *response_base64_len);
