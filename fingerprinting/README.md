Minimal demo of [fingerprintjs2][fingerprintjs2-github].

Made with the [Parcel bundler][parcel] and [Glitch][glitch].

# Notes/Learnings

fingerprintjs2 uses [MurmurHash][murmurHash], a hash function that is fast and **non**-cryptographic i.e. **not** designed to be difficult to reverse.

# Plan

Todo:
* What sort of hash is it; is there a checksum?
* Display hash in the UI
* Display all fingerprinting surfaces used
* Better code org

Done:
* Log hash


[parcel]: https://parceljs.org
[glitch]: https://www.glitch.com
[fingerprintjs2-github]: https://github.com/Valve/fingerprintjs2
[murmurHash]: https://en.wikipedia.org/wiki/MurmurHash