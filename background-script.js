/*
 * Toggle Line Wrap Thunderbird Add-On
 *
 * Copyright (c) Jan Kiszka, 2020
 *
 * Authors:
 *  Jan Kiszka <jan.kiszka@web.de>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

async function toggleLineWrap(windowId)
{
  messenger.composeLineWrap.toggle(windowId);

  let details = { text: null };
  if (!await messenger.composeLineWrap.isEnabled(windowId)) {
    details.text = "off";
  }
  messenger.composeAction.setBadgeText(details);
}

async function main() {
  messenger.commands.onCommand.addListener(name => {
    if (name === "toggleLineWrap") {
      messenger.windows.getAll().then(windows => {
        for (let window of windows) {
          if (window.type === "messageCompose" && window.focused === true) {
            toggleLineWrap(window.id);
          }
        }
      });
    }
  });

  messenger.composeAction.onClicked.addListener(tab => {
    toggleLineWrap(tab.windowId);
  });
}

main();
