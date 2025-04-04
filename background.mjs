/*
 * Toggle Line Wrap Thunderbird Add-On
 *
 * Copyright (c) Jan Kiszka, 2020-2023
 *
 * Authors:
 *  Jan Kiszka <jan.kiszka@web.de>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as utils from '/utils.mjs'

// Force Alt + W shortcut if explicitly requested in options.
let { use_alt_w } = await messenger.storage.local.get("use_alt_w");
if (use_alt_w) {
    messenger.commands.update({ name: "toggleLineWrap", shortcut: "Alt+W" });
}

// Prepare any newly opened compose tab.
messenger.tabs.onCreated.addListener(tab => {
    if (tab.type === "messageCompose") {
        utils.setupComposeTab(tab);
    }
});

// Toggle line wrap when command shortcut is used.
messenger.commands.onCommand.addListener((name, tab) => {
    if (name === "toggleLineWrap") {
        utils.toggleLineWrap(tab);
    }
});

// Toggle line wrap when compose action is clicked.
messenger.composeAction.onClicked.addListener(tab => {
    utils.toggleLineWrap(tab);
});

// Warn about patches before sending.
messenger.compose.onBeforeSend.addListener(async (tab, details) => {
    if (!details.isPlainText || !await utils.isPatch(details)) {
        return { cancel: false };
    }

    // If the flowed-format approach is used, we do not need to enforce wrapping
    // here, because this version of the add-on is only toggling the wrap in the
    // composer. The actual message is untouched.

    // To get around the GMX issue, which modifies the content-transfer-encoding
    // from 7bit to quoted-printable (breaking flowed format), we could try to
    // enforce a different encoding here. I currently do not see how this could
    // be done with an Experiment, but this does look like a good addition to the
    // compose API.
    
    // There is an alternative hack which would work now already. Enable the pref
    // mail.strictly_mime and make sure there is at least one non-ascii char in
    // the message, and the quoted-printable encoding or base64 encoding will be
    // used automatically. The check below could add a footer or header with the
    // missing non-ascii char.
    let confirmed = await messenger.tabs.executeScript(tab.id, {
        code: `
        (function beforeSend() {
            if (!document.body.style.width) {
                return true;
            }
            return window.confirm(
                "WARNING: Sending a patch without line wrapping disabled.\\n" +
                "Send anyway?"
            );
        })()
    `});
    return { cancel: !confirmed[0] };
});
