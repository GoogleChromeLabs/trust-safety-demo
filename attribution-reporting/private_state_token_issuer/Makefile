CC := gcc
CFLAGS := -I./boringssl/include -L./boringssl/build/crypto -lcrypto -lpthread
OBJS = src/util.o src/issue.o src/redeem.o src/key_generator.o
MAIN = bin/main
.SUFFIXES: .c .o

.c.o:
	$(CC) $(CFLAGS) -c $< -o $@

all: main

main: $(OBJS) src/config.h
	$(CC) src/main.c -o $(MAIN) $(OBJS) $(CFLAGS)

.PHONY: generate_key, clean, test

generate_key:
	$(MAIN) --key-generate

clean:
	$(RM) $(OBJS) bin/*
