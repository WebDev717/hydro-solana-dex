.PHONY: list
SHELL := /bin/bash
_ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

list:
	@awk -F: '/^[A-z]/ {print $$1}' Makefile | sort

# COMMON
check:
	cargo check --workspace

clean:
	rm -rf scripts/tmp
	cargo clean

validator:
	@pgrep "solana-test-val" || solana-test-validator --quiet &

validator-reset:
	@pkill -9 "solana-test-validator" > /dev/null
	@sleep 1
	@solana-test-validator --quiet --reset

set-localnet:
	solana config set --url http://127.0.0.1:8899

validator-logs:
	solana logs

watch:
	cargo watch -c