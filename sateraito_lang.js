const MyLang = {
    msgData: {
        "TXT_EXTENSION_NAME": chrome.i18n.getMessage('extension_name'),
        "TXT_EXTENSION_DESCRIPTION": chrome.i18n.getMessage('extension_description'),

        "TXT_AI_REPLY": chrome.i18n.getMessage('txt_ai_reply'),
        "TXT_RESULT": chrome.i18n.getMessage('txt_result'),
        "TXT_INSERT": chrome.i18n.getMessage('txt_insert'),
        "TXT_CONTINUE_IMPROVING": chrome.i18n.getMessage('txt_continue_improving'),
        "DES_TELL_SIDER_TO_REPLY": chrome.i18n.getMessage('des_tell_sider_to_reply'),

        "TXT_SUMMARY": chrome.i18n.getMessage('txt_summary'),
        "TXT_KEY_POINTS": chrome.i18n.getMessage('txt_key_points'),
        "TXT_ORIGINAL_LANGUAGE": chrome.i18n.getMessage('txt_original_language'),
        "TXT_REPLY_SUGGESTIONS": chrome.i18n.getMessage('txt_reply_suggestions'),
        "DES_CLICK_TO_CONFIG_VOICE": chrome.i18n.getMessage('des_click_to_config_voice'),

        "TXT_VOICE_SETTING": chrome.i18n.getMessage('txt_voice_setting'),
        "TXT_FORMALITY": chrome.i18n.getMessage('txt_formality'),
        "TXT_CASUAL": chrome.i18n.getMessage('txt_casual'),
        "TXT_NEUTRAL": chrome.i18n.getMessage('txt_neutral'),
        "TXT_FORMAL": chrome.i18n.getMessage('txt_formal'),

        "TXT_TONE": chrome.i18n.getMessage('txt_tone'),
        "TXT_FRIENDLY": chrome.i18n.getMessage('txt_friendly'),
        "TXT_PERSONABLE": chrome.i18n.getMessage('txt_personable'),
        "TXT_INFORMATIONAL": chrome.i18n.getMessage('txt_informational'),
        "TXT_WITTY": chrome.i18n.getMessage('txt_witty'),
        "TXT_CONFIDENT": chrome.i18n.getMessage('txt_confident'),
        "TXT_DIRECT": chrome.i18n.getMessage('txt_direct'),
        "TXT_ENTHUSIASTIC": chrome.i18n.getMessage('txt_enthusiastic'),
        "TXT_EMPATHETIC": chrome.i18n.getMessage('txt_empathetic'),
        "TXT_FUNNY": chrome.i18n.getMessage('txt_funny'),

        "TXT_EMAIL_LENGTH": chrome.i18n.getMessage('txt_email_length'),
        "TXT_MEDIUM": chrome.i18n.getMessage('txt_medium'),
        "TXT_SHORT": chrome.i18n.getMessage('txt_short'),
        "TXT_LONG": chrome.i18n.getMessage('txt_long'),

        "TXT_YOUR_ROLE": chrome.i18n.getMessage('txt_your_role'),
        "TXT_LEADER": chrome.i18n.getMessage('txt_leader'),
        "TXT_SUBORDINATE": chrome.i18n.getMessage('txt_subordinate'),
        "TXT_COLLEAGUE": chrome.i18n.getMessage('txt_colleague'),
        "TXT_SALES_REPRESENTATIVE": chrome.i18n.getMessage('txt_sales_representative'),
        "TXT_APPLICANT": chrome.i18n.getMessage('txt_applicant'),
        "TXT_CUSTOMER_SERVICE_STAFF": chrome.i18n.getMessage('txt_customer_service_staff'),
        "TXT_PROJECT_MANAGER": chrome.i18n.getMessage('txt_project_manager'),
        "TXT_HUMAN_RESOURCES": chrome.i18n.getMessage('txt_human_resources'),
    },

    /**
     * getMsg
     *
     * メッセージ取得
     *
     * @param {String} aMsgCd メッセージコード
     * @return {String} 国際化メッセージ
     */
    getMsg: function (aMsgCd) {
        let text = MyLang.msgData[aMsgCd];

        if (typeof (text) == 'undefined') {
            text = aMsgCd;
        }

        return text
    },
}