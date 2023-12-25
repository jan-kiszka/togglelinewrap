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

async function updateComposeAction(tab, defaultWidth)
{
    if (defaultWidth === 0) {
        messenger.composeAction.disable(tab.id);
        return;
    }

    let width = await messenger.ComposeLineWrap.getEditorWrapWidth(tab.windowId);
    messenger.composeAction.setBadgeText({
        tabId: tab.id,
        text: (width === 0) ? "off" : ""
    });
    messenger.composeAction.enable(tab.id);
}

async function toggleLineWrap(tab)
{
    let defaultWidth = await messenger.ComposeLineWrap.getDefaultWrapWidth(tab.windowId);
    if (defaultWidth === 0) {
        return;
    }

    let width = await messenger.ComposeLineWrap.getEditorWrapWidth(tab.windowId);
    if (width > 0) {
        width = 0;
    } else {
        width = defaultWidth;
    }
    messenger.ComposeLineWrap.setEditorWrapWidth(tab.windowId, width);

    updateComposeAction(tab, defaultWidth);
}

async function isPatch(details)
{
    let { patch_detect } = await messenger.storage.local.get("patch_detect");
    return (typeof patch_detect === "undefined" || patch_detect) &&
        details.subject.search(/\[PATCH[ \]]/) >= 0;
}

async function handleBeforeSend(tab, details)
{
    if (!await isPatch(details)) {
        return {cancel: false};
    }

    let width = await messenger.ComposeLineWrap.getEditorWrapWidth(tab.windowId);
    if (width === 0) {
        return {cancel: false};
    }

    let confirmed = await messenger.tabs.executeScript(tab.id, {code: `
        window.confirm(
            "WARNING: Sending a patch without line wrapping disabled.\\n" +
            "Send anyway?");
    `});
    return {cancel: !confirmed[0]};
}

async function setupComposeWindows(window)
{
    messenger.compose.onBeforeSend.addListener(handleBeforeSend);

    let { line_wrap } = await messenger.storage.local.get("line_wrap");
    if (typeof line_wrap !== "undefined" && !line_wrap) {
        messenger.ComposeLineWrap.setEditorWrapWidth(window.id, 0);
    }

    let defaultWidth = await messenger.ComposeLineWrap.getDefaultWrapWidth(window.id);
    messenger.tabs.query({windowId: window.id}).then(async tabs => {
        let tab = tabs[0];
        let details = await messenger.compose.getComposeDetails(tab.id);
        if (await isPatch(details)) {
            messenger.ComposeLineWrap.setEditorWrapWidth(tab.windowId, 0);
        }
        updateComposeAction(tab, defaultWidth);
    });
}

async function main()
{
    messenger.composeAction.disable();

    messenger.windows.onCreated.addListener(window => {
        if (window.type === "messageCompose") {
            setupComposeWindows(window);
        }
    });

    let { use_alt_w } = await messenger.storage.local.get("use_alt_w");
    if (use_alt_w) {
        messenger.commands.update({name: "toggleLineWrap", shortcut: "Alt+W"});
    }

    messenger.commands.onCommand.addListener(name => {
        if (name === "toggleLineWrap") {
            messenger.windows.getAll().then(windows => {
                for (let window of windows) {
                    if (window.type === "messageCompose" && window.focused === true) {
                        messenger.tabs.query({windowId: window.id}).then(tabs => {
                            toggleLineWrap(tabs[0]);
                        });
                        break;
                    }
                }
            });
        }
    });

    messenger.composeAction.onClicked.addListener(tab => {
        toggleLineWrap(tab);
    });
}

main();
