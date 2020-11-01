#
# Toggle Line Wrap Thunderbird Add-On
#
# Copyright (c) Jan Kiszka, 2020
#
# Authors:
#  Jan Kiszka <jan.kiszka@web.de>
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#

ifeq ($(V),1)
	Q =
else
	Q = @
endif

PACKAGE_NAME=togglelinewrap

RELEASE_TAG=$(shell git describe --match "[0-9].[0-9]*" --dirty)
ARCHIVE_NAME=$(PACKAGE_NAME)-$(RELEASE_TAG).xpi

PACKAGE_FILES= \
	background-script.js \
	manifest.json \
	composeLineWrapAPI-schema.json \
	composeLineWrapAPI.js \
	icon.png \
	COPYING

UPDATE_VERSION='s|"version":.*|"version": "$(VERSION)",|'

all package: clean $(PACKAGE_FILES)
	zip -r $(ARCHIVE_NAME) $(PACKAGE_FILES)

clean:
	rm -f $(ARCHIVE_NAME)

release:
	${Q}if [ -z "$(VERSION)" ]; then		\
		echo "VERSION is not set";		\
		exit 1;					\
	fi
	${Q}if [ -n "`git status -s -uno`" ]; then	\
		echo "Working directory is dirty!";	\
		exit 1;					\
	fi
	${Q}sed -i $(UPDATE_VERSION) manifest.json
	git commit -s manifest.json -m "Bump version number"
	git tag -as $(VERSION) -m "Release $(VERSION)"

.PHONY: clean release
