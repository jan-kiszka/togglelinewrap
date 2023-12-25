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

async function initBoolOption(key, defaultValue, selector)
{
    let valueObj = await messenger.storage.local.get(key);
    let value = valueObj[key];
    if (typeof value === "undefined") {
        value = defaultValue;
    }
    document.querySelector(selector).checked = value;
}

function initOptions()
{
    initBoolOption("line_wrap", true, "#line-wrap");
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
