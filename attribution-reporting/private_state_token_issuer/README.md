# Private State Token Issuer (for Trigger Attestation)

Example Private State Token Issuer implentation. It make available executables
that are used by the attribution's demo adtech. It allows testing the [trigger
attestation](https://github.com/WICG/attribution-reporting-api/blob/main/trigger_attestation.md)
feature. The source was adapted from the [Trust Token
demo](https://github.com/JackJey/trust-token-demo).

## Re-build executables

The following instructions are oriented to a Linux environment.

### If necessary, install cmake

To build this demo you will need the [cmake build
tool](https://cmake.org/download/).

### Install BoringSSL

Run the [install-boringssl.sh](install-boringssl.sh) script to download and
build BoringSSL:

```sh
./install-boringssl.sh
```

### Build executables

Build the executable files required for the demo, using the BoringSSL library
and the C files in the [src](src) directory as defined in the
[Makefile](Makefile):

```sh
make
```

## Commands and flags

[bin/main](./bin/main) is the build result of [src/main.c](src/main.c).

There is a flag for each Private State Token operation:

```sh
$ main --issue $REQUEST
$ main --redeem $REQUEST $MESSAGE
$ main --key-generate
```

### --issue

Take an issuance request (`Sec-Attribution-Reporting-Private-State-Token HTTP
Header`) and return an issuance response.

### --redeem

Take a redemption request (`Sec-Attribution-Reporting-Private-State-Token HTTP
Header`) and a message and return a redemption response.

### --key-generate

Generate private/public keys for a Trust Token and
[ED25519](https://ed25519.cr.yp.to/) key pair and save them in the
[./keys](./keys) directory.
