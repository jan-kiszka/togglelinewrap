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

function toggleLineWrap(windowId)
{
  let gMsgCompose = getMsgCompose(windowId);

  if (!gMsgCompose || gMsgCompose.composeHTML) {
    return;
  }

  try {
    if (gMsgCompose.editor.wrapWidth > 0) {
      gMsgCompose.editor.wrapWidth = 0;
    } else {
      gMsgCompose.editor.wrapWidth = gMsgCompose.wrapLength;
    }
  }
  catch (e) { }
}

function getLineWrap(windowId)
{
  let gMsgCompose = getMsgCompose(windowId);

  return gMsgCompose.editor.wrapWidth !== 0;
}

var composeLineWrap = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      composeLineWrap: {
        async toggle(windowId) {
          toggleLineWrap(windowId);
        },
        async isEnabled(windowId) {
          return getLineWrap(windowId);
        }
      }
    }
  }
};
