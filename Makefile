NPM ?= npm
VSCE ?= npx vsce
DIST_DIR ?= dist
EXT_NAME ?= comodoro
VERSION := $(shell node -p "require('./package.json').version")
VSIX := $(DIST_DIR)/$(EXT_NAME)-$(VERSION).vsix

.PHONY: install clean build package publish

install:
	$(NPM) install

clean:
	rm -rf out $(DIST_DIR)

build: install
	$(NPM) run vscode:prepublish

package: build
	mkdir -p $(DIST_DIR)
	$(VSCE) package --out $(VSIX)
	@echo "VSIX saved to $(VSIX)"

publish: build
	$(VSCE) publish
