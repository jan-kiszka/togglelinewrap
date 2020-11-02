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

var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

function getMsgCompose(windowId)
{
    let window = Services.wm.getOuterWindowWithId(windowId);
    return window.document.defaultView.gMsgCompose;
}

function getDefaultWidth(windowId)
{
    let gMsgCompose = getMsgCompose(windowId);

    return gMsgCompose.composeHTML ? 0 : gMsgCompose.wrapLength;
}

function setWrapWidth(windowId, value)
{
    let gMsgCompose = getMsgCompose(windowId);

    gMsgCompose.editor.wrapWidth = value;
}

function getWrapWidth(windowId)
{
    let gMsgCompose = getMsgCompose(windowId);

    return gMsgCompose.editor ? gMsgCompose.editor.wrapWidth : getDefaultWidth(windowId);
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
