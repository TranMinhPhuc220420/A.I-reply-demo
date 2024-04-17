let TAB_ID, WINDOW_ID = '';

const sateraito = {
    UI: {
        update_text_selected: (text) => {
            document.getElementById('original_text').value = text;
        },
        show_text_selected: async () => {
            let payload = await chrome.storage.sync.get('text_selected');
            document.getElementById('original_text').value = payload.text_selected;
        },
    }
}

const getTabId = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab.id;
}
const getWindowId = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab.windowId;
}
const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

const handlerTextSelectedChange = async (payload) => {
    let text = payload.text_selected.newValue;
    sateraito.UI.update_text_selected(text);
}

const initialize_side = async () => {
    TAB_ID = await getTabId();
    WINDOW_ID = await getWindowId();

    sateraito.UI.show_text_selected();

    chrome.storage.onChanged.addListener((payload) => {
        if ('text_selected' in payload) {
            handlerTextSelectedChange(payload);
        }
    });
}

initialize_side();