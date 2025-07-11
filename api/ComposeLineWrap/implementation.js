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

async function getMsgCompose(windowId)
{
    let window = Services.wm.getOuterWindowWithId(windowId);
    let gMsgCompose = window.document.defaultView.gMsgCompose;

    while (gMsgCompose.editor === null) {
        await new Promise((resolve, reject) => {
            window.setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    return gMsgCompose;
}

async function getDefaultWidth(windowId)
{
    let gMsgCompose = await getMsgCompose(windowId);

    return gMsgCompose.composeHTML ? 0 : gMsgCompose.wrapLength;
}

async function setWrapWidth(windowId, value)
{
    let gMsgCompose = await getMsgCompose(windowId);

    gMsgCompose.editor.wrapWidth = value;
}

async function getWrapWidth(windowId)
{
    let gMsgCompose = await getMsgCompose(windowId);

    return gMsgCompose.editor.wrapWidth;
}

var ComposeLineWrap = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
        return {
            ComposeLineWrap: {
                async setEditorWrapWidth(windowId, value) {
                    setWrapWidth(windowId, value);
                },
                async getEditorWrapWidth(windowId) {
                    return getWrapWidth(windowId);
                },
                async getDefaultWrapWidth(windowId) {
                    return getDefaultWidth(windowId);
                }
            }
        }
    }
};
