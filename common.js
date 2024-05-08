
const _StorageManager = {
    getLanguageWriteList: (callback) => {
        chrome.storage.sync.get('write_language_output_list').then(payload => {
            let config = payload.write_language_output_list;
            if (!config) config = [];

            callback(config);
        });
    },
    addLanguageWriteList: (value) => {
        chrome.storage.sync.get('write_language_output_list').then(payload => {
            let config = payload.write_language_output_list;
            if (!config) config = [];

            const record = LANGUAGE_SETTING_DATA.find(item => {
                return value == item.value
            });
            const record_in_config = config.find(item => {
                return value == item.value
            });

            if (record && !record_in_config) {
                config.push(record);
                chrome.storage.sync.set({ write_language_output_list: config });
            }
        });
    },
    removeLanguageWriteList: (value) => {
        chrome.storage.sync.get('write_language_output_list').then(payload => {
            let config = payload.write_language_output_list;
            if (!config) config = [];

            for (let i = 0; i < config.length; i++) {
                if (config[i].value == value) {
                    config.splice(i, 1);
                    chrome.storage.sync.set({ write_language_output_list: config });
                    console.log(config);
                    break;
                }
            }
        });
    },

    setLanguageWrite: (value) => {
        const record = LANGUAGE_SETTING_DATA.find(item => {
            return value == item.value
        });

        if (record) {
            USER_SETTING.language_write_active = record;
            chrome.storage.sync.set({ write_language_output_active: record });
        }
    },
    getLanguageWrite: (callback) => {
        chrome.storage.sync.get('write_language_output_active', payload => {
            callback(payload.write_language_output_active)
        });
    },
}