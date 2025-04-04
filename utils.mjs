export async function isPatch(details) {
    let { patch_detect } = await messenger.storage.local.get("patch_detect");
    return (typeof patch_detect === "undefined" || patch_detect) &&
        details.subject.search(/\[(P|.*\[P)ATCH[ \]]/) === 0;
}

export async function setComposeAction(tab, options) {
    let off = options?.off ?? false;
    let enabled = options?.enabled ?? false;

    if (enabled) {
        await messenger.composeAction.setBadgeText({
            tabId: tab.id,
            text: off ? "off" : "",
        });
        await messenger.composeAction.enable(tab.id);
    } else {
        await messenger.composeAction.setBadgeText({
            tabId: tab.id,
            text: "",
        });
        await messenger.composeAction.disable(tab.id);
    }
}

export async function toggleLineWrap(tab) {
    let defaultWrap = await getDefaultWrap(tab);

    let [toggledWrap] = await messenger.tabs.executeScript(tab.id, {
        code: `
        (function toggleWrap() {
            if (!document.body.style.width) {
             document.body.style.width = "${defaultWrap}";
            } else {
             document.body.style.width = "";
            };
            return document.body.style.width;
        })()
    `});

    return setComposeAction(tab, { enabled: true, off: toggledWrap == "" });
}


export async function setupComposeTab(tab) {
    // Getting the ComposeDetails ensures the tab is fully loaded.
    let details = await messenger.compose.getComposeDetails(tab.id);
    if (!details.isPlainText) {
        return setComposeAction(tab, { enabled: false });
    }

    let [defaultWrap] = await messenger.tabs.executeScript(tab.id, {
        code: `
        (function getDefaultWrap() {
            return document.body.style.width;
        })()
    `});

    // Store the default wrap width for this tab.
    await setDefaultWrap(tab, defaultWrap);

    let { line_wrap } = await messenger.storage.local.get("line_wrap");
    if ((typeof line_wrap !== "undefined" && !line_wrap) || await isPatch(details)) {
        // Remove wrapping, if not already done.
        if (defaultWrap != "") {
            await messenger.tabs.executeScript(tab.id, {
                code: `
                (function clearWarp() {
                    document.body.style.width = "";
                })()
            `});
        }
        return setComposeAction(tab, { enabled: true, off: true });
    }

    return setComposeAction(tab, { enabled: true, off: defaultWrap == "" });
}

async function setDefaultWrap(tab, defaultWrap) {
    let { defaultWraps } = await browser.storage.session.get({ defaultWraps: new Map() });
    defaultWraps.set(tab.id, defaultWrap);
    await browser.storage.session.set({ defaultWraps });
}

async function getDefaultWrap(tab) {
    let { defaultWraps } = await browser.storage.session.get({ defaultWraps: new Map() });
    return defaultWraps.get(tab.id);
}
