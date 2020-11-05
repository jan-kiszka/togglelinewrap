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

function initOptions()
{
    messenger.storage.local.get().then(localStorage => {
        let line_wrap = localStorage.line_wrap;
        if (typeof line_wrap === "undefined") {
            line_wrap = true;
        }
        document.querySelector("#line-wrap").checked = line_wrap;
    });
}

function storeOptions(event)
{
    event.preventDefault();

    messenger.storage.local.set({
        line_wrap: document.querySelector("#line-wrap").checked
    });
}

document.addEventListener("DOMContentLoaded", initOptions);
document.querySelector("#line-wrap").addEventListener("change", storeOptions);
