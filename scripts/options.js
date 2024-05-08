(() => {
    $('#lang').on('change', (event) => {
        chrome.storage.sync.get('user_setting').then(value => {
            let user_setting_old = value.user_setting;

            chrome.storage.sync.set({ user_setting: { ...user_setting_old, language: event.target.value } });
        })
    })

    chrome.storage.sync.get('user_setting').then(value => {
        const { user_setting } = value;

        if (user_setting) {
            $('#lang').val(user_setting.language)
        }
    })
})();