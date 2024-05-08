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
        "TXT_LANGUAGE": chrome.i18n.getMessage('txt_language'),
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

        "TXT_WRITE": chrome.i18n.getMessage('txt_write'),
        "TXT_OCR": chrome.i18n.getMessage('txt_ocr'),
        "TXT_TRANSLATE": chrome.i18n.getMessage('txt_translate'),
        "TXT_GRAMMAR": chrome.i18n.getMessage('txt_grammar'),
        "TXT_COMPOSE": chrome.i18n.getMessage('txt_compose'),
        "TXT_REPLY": chrome.i18n.getMessage('txt_reply'),
        "TXT_PLACEHOLDER_TOPIC_COMPOSE": chrome.i18n.getMessage('txt_placeholder_topic_compose'),
        "TXT_PLACEHOLDER_ORIGINAL_TEXT_REPLY": chrome.i18n.getMessage('txt_placeholder_original_text_reply'),
        "TXT_PLACEHOLDER_GENERAL_CONTENT_REPLY": chrome.i18n.getMessage('txt_placeholder_general_content_reply'),
        "TXT_FORMAT": chrome.i18n.getMessage('txt_format'),
        "TXT_ESSAY": chrome.i18n.getMessage('txt_essay'),
        "TXT_PARAGRAPH": chrome.i18n.getMessage('txt_paragraph'),
        "TXT_EMAIL": chrome.i18n.getMessage('txt_email'),
        "TXT_IDEA": chrome.i18n.getMessage('txt_idea'),
        "TXT_BLOG_POST": chrome.i18n.getMessage('txt_blog_post'),
        "TXT_OUTLINE": chrome.i18n.getMessage('txt_outline'),
        "TXT_MARKETING_ADS": chrome.i18n.getMessage('txt_marketing_ads'),
        "TXT_COMMENT": chrome.i18n.getMessage('txt_comment'),
        "TXT_MESSAGE": chrome.i18n.getMessage('txt_message'),
        "TXT_TWITTER": chrome.i18n.getMessage('txt_twitter'),
        "TXT_PROFESSIONAL": chrome.i18n.getMessage('txt_professional'),
        "TXT_FUNNY": chrome.i18n.getMessage('txt_funny'),
        "TXT_ENGLISH": chrome.i18n.getMessage('txt_english'),
        "TXT_VIETNAMESE": chrome.i18n.getMessage('txt_vietnamese'),
        "TXT_KOREAN": chrome.i18n.getMessage('txt_korean'),
        "TXT_JAPANESE": chrome.i18n.getMessage('txt_japanese'),
        "TXT_GENERATE_DRAFT": chrome.i18n.getMessage('txt_generate_draft'),
        "TXT_ADD_TO_SITE": chrome.i18n.getMessage('txt_add_to_site'),
        "DES_ERROR_TOPIC_COMPOSE": chrome.i18n.getMessage('des_error_empty_topic_compose'),
        "DES_ERROR_ORIGINAL_TEXT_REPLY": chrome.i18n.getMessage('des_error_empty_original_text_reply'),
        "DES_ERROR_GENERAL_CONTENT_REPLY": chrome.i18n.getMessage('des_error_empty_general_content_reply'),
        "DES_ERROR_GEMINI_NOT_RELEASED": chrome.i18n.getMessage('des_error_gemini_not_released'),
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