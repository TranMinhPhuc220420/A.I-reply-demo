/**
 * author by: THANG NGUYEN <tan@vnd.sateraito.co.jp>
 * created by: 2024-01-27 
 */

sateraitoAI = {
	debug_mode: false,
};

sateraitoAI.Utils = {
	copyTextToClipboard: async (text) => {
		if ("clipboard" in navigator) {
			return await navigator.clipboard.writeText(text);
		} else {
			return document.execCommand("copy", true, text);
		}
	},

	/*
	* InitTranslateLangInHTML
	* <h2 data-trans="FORM_MAIL_LOGIN_HEADER_TITLE"></h2>
	* */
	InitTranslateLangInHTML: function (parentNode) {
		if (typeof parentNode == "undefined") {
			parentNode = document;
		}
		let MyLang = sateraitoAI.MyLang;
		$(parentNode).find('[data-trans]').each(function () {
			if ($(this).data('trans')) {
				$(this).text(MyLang.getMsg($(this).data('trans')));
				$(this).removeAttr('data-trans');
			}
		});
		$(parentNode).find('[data-trans-placeholder]').each(function () {
			if ($(this).data('trans-placeholder')) {
				$(this).attr('aria-placeholder', MyLang.getMsg($(this).data('trans-placeholder')));
				$(this).attr('placeholder', MyLang.getMsg($(this).data('trans-placeholder')));
				$(this).removeAttr('data-trans-placeholder');
			}
		});
		$(parentNode).find('[data-trans-title]').each(function () {
			if ($(this).data('trans-title')) {
				$(this).attr('aria-label', MyLang.getMsg($(this).data('trans-title')));
				$(this).attr('title', MyLang.getMsg($(this).data('trans-title')));
				$(this).removeAttr('data-trans-title');
			}
		});
	},

	cloneDeep: function (obj) {
		return JSON.parse(JSON.stringify(obj));
	},

	randomString: function (string_length) {
		if (typeof string_length == 'undefined') {
			string_length = 16;
		}
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var randomstring = '';
		for (var i = 0; i < string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum, rnum + 1);
		}
		return randomstring;
	},

	createNewId: function () {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 8;
		var randomstring = '';
		for (var i = 0; i < string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum, rnum + 1);
		}
		var d = new Date();
		var n = d.getTime();
		return (n + '_' + randomstring)
	},

	// Function to download data to a file
	download: function (data, filename, type) {
		var file = new Blob([data], { type: type });
		if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(file, filename);
		else { // Others
			var a = document.createElement("a"),
				url = URL.createObjectURL(file);
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function () {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 0);
		}
	}
}

sateraitoAI.Request = {
	get: function (aUrl, callback) {
		$.ajax({
			type: "GET",
			url: aUrl,
			contentType: "application/json",
			headers: {
				"Authorization": "Bearer " + sateraitoAI.options.apiKey
			},
			dataType: "json",
			success: function (jsondata, textStatus, jqXHR) {
				sateraitoAI.console.log("success", data, textStatus, jqXHR);
				if (typeof (callback) == 'function') {
					callback(jsondata);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				sateraitoAI.console.log("error", jqXHR, textStatus, errorThrown);
				if (typeof (callback) == 'function') {
					// コールバックをキック
					callback({
						status: 'ng',
						error_code: 'unknown_error'
					});
				}
			}
		});
	},
	post: function (aUrl, aPostData, callback) {
		$.ajax({
			type: "POST",
			url: aUrl,
			data: JSON.stringify(aPostData),
			contentType: "application/json",
			headers: {
				"Authorization": "Bearer " + sateraitoAI.options.apiKey
			},
			dataType: "json",
			success: function (jsondata, textStatus, jqXHR) {
				sateraitoAI.console.log("success", data, textStatus, jqXHR);
				if (typeof (callback) == 'function') {
					callback(jsondata);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				sateraitoAI.console.log("error", jqXHR, textStatus, errorThrown);
				if (typeof (callback) == 'function') {
					// コールバックをキック
					callback({
						status: 'ng',
						error_code: 'unknown_error'
					});
				}
			}
		});
	}
}

sateraitoAI.console = {
	log: function () {
		if (sateraitoAI.debug_mode) {
			var args = Array.prototype.slice.call(arguments);
			console.log.apply(console, args);
		}
	},
	warn: function () {
		if (sateraitoAI.debug_mode) {
			var args = Array.prototype.slice.call(arguments);
			console.warn.apply(console, args);
		}
	},
	error: function () {
		if (sateraitoAI.debug_mode) {
			var args = Array.prototype.slice.call(arguments);
			console.error.apply(console, args);
		}
	}
}

sateraitoAI.MyLang = {

	msgData_ALL_ALL: {
		"AI_BUILDER_PROMPT_DIRECT_SEND_ON": "Automatically execute inquiries to ChatGPT",
		"AI_BUILDER_PROMPT_DIRECT_SEND_OFF": "Set in question box (question execution is manual)",
		"AI_EMAIL_CREATION": "AIメール作成",
		"CONTENTS_OF_EMAIL_CREATION": "AIメール作成",
		"EMAIL_BODY_CREATED_BY_AI": "AIメール作成",
		"AI_MAIL_CREATE": "AIメール作成",
		"AI_MAIL_SEND": "AIメール作成",
		"AI_MAIL_CANCEL": "AIメール作成",
		"AI_MAIL_ACTION": "アクション",
		"AI_MAIL_CREATE_NEW": "新規を作成",
		"AI_MAIL_CREATE_REPLY": "返信を作成",
		"COUNTRIES": "言語",
		"VOICETONES": "声の張り",
		"WRITINGSTYLES": "文章のスタイル",

		// countries
		"JAPANESE": "日本語",
		"ENGLISH": "英語",
		"GERMAN": "ドイツ語",
		"FRANCE": "フランス語",
		"CHINESE": "中国語",
		"KOREAN": "韓国語",
		"VIETNAMESE": "ベトナム語",
		"THAI": "タイ語",

		// voice tones
		"VOICETONES_CALM": "穏やか",
		"VOICETONES_CHEERFUL": "陽気",
		"VOICETONES_FORMAL": "丁寧",
		"VOICETONES_EXCITED": "興奮した",
		"VOICETONES_SERIOUS": "真剣",
		"VOICETONES_FRIENDLY": "友好的",
		"VOICETONES_CONFIDENT": "自信あり",
		"VOICETONES_HUMOROUS": "ユーモアがある",
		"VOICETONES_SYMPATHETIC": "共感的",
		"VOICETONES_AUTHORITATIVE": "権威ある",

		// writing styles
		"WRITINGSTYLES_FORMAL": "丁寧な表現",
		"WRITINGSTYLES_INFORMAL": "カジュアルな表現",
		"WRITINGSTYLES_ACADEMIC": "学術的な表現",
		"WRITINGSTYLES_TECHNICAL": "テクニカルな表現",
		"WRITINGSTYLES_CREATIVE": "クリエイティブな表現",
		"WRITINGSTYLES_JOURNALISTIC": "ジャーナリスティックな表現",
		"WRITINGSTYLES_BUSINESS": "ビジネスな表現",
		"WRITINGSTYLES_POETIC": "詩的な表現",
		"WRITINGSTYLES_PERSUASIVE": "説得力のある表現",
		"WRITINGSTYLES_CASUAL": "カジュアルな表現",

		"REQUIRE_SELECT_FILE": "ファイルを選択してください",

		"DOC_FILE_UPLOAD_DROP1": "ここでクリックしてファイルを選択する、または、ファイルをドラッグ＆ドロップしてください",
		"DOC_FILE_UPLOAD_DROP2": "ファイルを選択",
		"DOC_FILE_UPLOAD_DROP3": "：アップロード　",
		"DOC_FILE_UPLOAD_DROP4": "％",
		"FILE_UPLOADING": "アップロード中・・・",
		"FILE_UPLOAD_DONE": "アップロードが完了しました！",
		"FILE_UPLOAD_ERROR": "アップロードが失敗しました!",
		"FILE_UPLOAD_MORE": "追加でアップロードしますか？",
		"FILE_UPLOAD_TRY_AGAIN": "再度アップロードしますか？",
		"FILE_UPLOAD_SELECTED": "ファイルを{count}件選択しました。",
		"FILE_UPLOAD_OR": "または",
		"AI_BUILDER_PROMPT": "プロンプトビルダー",
		"AI_BUILDER_IMPORT_TEMPLAT_FILE": "テキストファイルよりインポート",
		"AI_BUILDER_INPUT_TEMPLATE": "プロンプトビルダーで直接に作成",
		"AI_BUILDER_NEXT_STEP": "次にテンプレートを編集する",
		"AI_BUILDER_BUILD_PROMPT": "プロンプトテンプレートの編集・作成",
		"AI_BUILDER_SELECT_LABEL": "ラベルを指定する",
		"AI_BUILDER_CLEAR_LABEL": "ラベルを外す",
		"AI_BUILDER_CREATE_LABEL": "新しいラベルを作成",
		"AI_BUILDER_CREATE_TEMPLATE": "プロンプトテンプレートを登録する",
		"AI_BUILDER_TEXT": "テキスト",
		"AI_BUILDER_TEXTAREA": "テキストエリア",
		"AI_BUILDER_SELECT": "ドロップダウン",
		"AI_BUILDER_RADIO": "ラジオボタン",
		"AI_BUILDER_CHECK": "チェックボックス",
		"AI_BUILDER_OPTION_REMOVE": "削除",
		"AI_BUILDER_OPTION_ADD": "追加",
		"AI_BUILDER_COMPONENT_LABEL": "指示項目",
		"AI_BUILDER_COMPONENT_VALUE": "指示内容",
		"AI_BUILDER_COMPONENT_NAME": "項目名",
		"AI_BUILDER_COMPONENT_OPTION_VALUE": "選択可能な値",
		"AI_BUILDER_COMPONENT_CANCEL": "キャンセル",
		"AI_BUILDER_COMPONENT_SUBMIT": "送信",
		"AI_BUILDER_CREATE_TEXT": "テキスト",
		"AI_BUILDER_CREATE_TEXTAREA": "テキストエリア",
		"AI_BUILDER_CREATE_SELECT": "ドロップダウン",
		"AI_BUILDER_CREATE_RADIO": "ラジオボタン",
		"AI_BUILDER_CREATE_CHECKBOX": "チェックボックス",
		"AI_BUILDER_SHOW_CODE": "テキストモードで操作",
		"AI_BUILDER_SHOW_UI": "ビルダーモードで操作",
		"AI_BUILDER_DOWNLOAD": "テキストファイルをダウンロード",
		"AI_BUILDER_CLONE_TEMPLATE": "コピー新規",
		"AI_BUILDER_UPDATE_TEMPLATE": "保存する",
		"AI_BUILDER_TEMPLATE_NAME": "プロンプトのテンプレートの名前を入力ください",
		"AI_BUILDER_TEMPLATE_CONTENT": "プロンプトテンプレートのテキスト内容があれば、ここでテキスト形式で初期として入力できます。",
		"AI_BUILDER_PROMPT_LABEL_NAME": "ラベル名",
		"AI_BUILDER_BACKGROUND_COLOR": "ラベルの背景色",
		"AI_BUILDER_TEXT_COLOR": "ラベルの文字色",
		"AI_BUILDER_PROMPT_LABEL_SAVE": "新規作成",
    "AI_BUILDER_COMPONENT_PROPERTIES": "項目属性(文字数など)",
    "AI_BUILDER_COMPONENT_PLACEHOLDER_LABEL": "",
    "AI_BUILDER_COMPONENT_PLACEHOLDER_INPUT": "",
    "AI_BUILDER_COMPONENT_PLACEHOLDER_TEXTAREA": "",
		"CLOSE": "閉じる",
		"DEFAULT": "自動作成",
		"CUSTOM": "手動作成",
		"CLONE": "ラベル複製",
		"DELETE": "ラベル削除",
		"AI_BUILDER_PROMPT_LABEL_DESCRIPTION_HELP": "※新しいラベルを作成したい場合に「ラベル複製」ボタンをクリックしてください",
		"BUTTON_BACK": "戻る",
	},

	msgData_ja_ALL: {
		"AI_BUILDER_PROMPT_DIRECT_SEND_ON": "ChatGPTへの問い合わせまで自動実行する",
		"AI_BUILDER_PROMPT_DIRECT_SEND_OFF": "質問ボックスにセット（質問実行は手動）",
		"AI_EMAIL_CREATION": "AIメール作成",
		"CONTENTS_OF_EMAIL_CREATION": "AIメール作成",
		"EMAIL_BODY_CREATED_BY_AI": "AIメール作成",
		"AI_MAIL_CREATE": "AIメール作成",
		"AI_MAIL_SEND": "AIメール作成",
		"AI_MAIL_CANCEL": "AIメール作成",
		"AI_MAIL_ACTION": "アクション",
		"AI_MAIL_CREATE_NEW": "新規を作成",
		"AI_MAIL_CREATE_REPLY": "返信を作成",
		"COUNTRIES": "言語",
		"VOICETONES": "声の張り",
		"WRITINGSTYLES": "文章のスタイル",

		// countries
		"JAPANESE": "日本語",
		"ENGLISH": "英語",
		"GERMAN": "ドイツ語",
		"FRANCE": "フランス語",
		"CHINESE": "中国語",
		"KOREAN": "韓国語",
		"VIETNAMESE": "ベトナム語",
		"THAI": "タイ語",

		// voice tones
		"VOICETONES_CALM": "穏やか",
		"VOICETONES_CHEERFUL": "陽気",
		"VOICETONES_FORMAL": "丁寧",
		"VOICETONES_EXCITED": "興奮した",
		"VOICETONES_SERIOUS": "真剣",
		"VOICETONES_FRIENDLY": "友好的",
		"VOICETONES_CONFIDENT": "自信あり",
		"VOICETONES_HUMOROUS": "ユーモアがある",
		"VOICETONES_SYMPATHETIC": "共感的",
		"VOICETONES_AUTHORITATIVE": "権威ある",

		// writing styles
		"WRITINGSTYLES_FORMAL": "丁寧な表現",
		"WRITINGSTYLES_INFORMAL": "カジュアルな表現",
		"WRITINGSTYLES_ACADEMIC": "学術的な表現",
		"WRITINGSTYLES_TECHNICAL": "テクニカルな表現",
		"WRITINGSTYLES_CREATIVE": "クリエイティブな表現",
		"WRITINGSTYLES_JOURNALISTIC": "ジャーナリスティックな表現",
		"WRITINGSTYLES_BUSINESS": "ビジネスな表現",
		"WRITINGSTYLES_POETIC": "詩的な表現",
		"WRITINGSTYLES_PERSUASIVE": "説得力のある表現",
		"WRITINGSTYLES_CASUAL": "カジュアルな表現",

		"REQUIRE_SELECT_FILE": "ファイルを選択してください",

		"DOC_FILE_UPLOAD_DROP1": "ここでクリックしてファイルを選択する、または、ファイルをドラッグ＆ドロップしてください",
		"DOC_FILE_UPLOAD_DROP2": "ファイルを選択",
		"DOC_FILE_UPLOAD_DROP3": "：アップロード　",
		"DOC_FILE_UPLOAD_DROP4": "％",
		"FILE_UPLOADING": "アップロード中・・・",
		"FILE_UPLOAD_DONE": "アップロードが完了しました！",
		"FILE_UPLOAD_ERROR": "アップロードが失敗しました!",
		"FILE_UPLOAD_MORE": "追加でアップロードしますか？",
		"FILE_UPLOAD_TRY_AGAIN": "再度アップロードしますか？",
		"FILE_UPLOAD_SELECTED": "ファイルを{count}件選択しました。",
		"FILE_UPLOAD_OR": "または",
		"AI_BUILDER_PROMPT": "プロンプトビルダー",
		"AI_BUILDER_IMPORT_TEMPLAT_FILE": "テキストファイルよりインポート",
		"AI_BUILDER_INPUT_TEMPLATE": "プロンプトビルダーで直接に作成",
		"AI_BUILDER_NEXT_STEP": "次にテンプレートを編集する",
		"AI_BUILDER_BUILD_PROMPT": "プロンプトウィザードの編集・作成",
		"AI_BUILDER_SELECT_LABEL": "ラベルを指定",
		"AI_BUILDER_CLEAR_LABEL": "ラベルを外す",
		"AI_BUILDER_CREATE_LABEL": "ラベルを管理",
		"AI_BUILDER_CREATE_TEMPLATE": "プロンプトウィザードを登録する",
		"AI_BUILDER_TEXT": "テキスト",
		"AI_BUILDER_TEXTAREA": "テキストエリア",
		"AI_BUILDER_SELECT": "ドロップダウン",
		"AI_BUILDER_RADIO": "ラジオボタン",
		"AI_BUILDER_CHECK": "チェックボックス",
		"AI_BUILDER_OPTION_REMOVE": "削除",
		"AI_BUILDER_OPTION_ADD": "追加",
		"AI_BUILDER_COMPONENT_LABEL": "指示項目",
		"AI_BUILDER_COMPONENT_VALUE": "指示内容",
		"AI_BUILDER_COMPONENT_NAME": "項目名",
		"AI_BUILDER_COMPONENT_OPTION_VALUE": "選択可能な値",
		"AI_BUILDER_COMPONENT_CANCEL": "キャンセル",
		"AI_BUILDER_COMPONENT_SUBMIT": "送信",
		"AI_BUILDER_CREATE_TEXT": "テキスト",
		"AI_BUILDER_CREATE_TEXTAREA": "テキストエリア",
		"AI_BUILDER_CREATE_SELECT": "ドロップダウン",
		"AI_BUILDER_CREATE_RADIO": "ラジオボタン",
		"AI_BUILDER_CREATE_CHECKBOX": "チェックボックス",
		"AI_BUILDER_SHOW_CODE": "テキストモードで操作",
		"AI_BUILDER_SHOW_UI": "ビルダーモードで操作",
		"AI_BUILDER_DOWNLOAD": "テキストファイルをダウンロード",
		"AI_BUILDER_CLONE_TEMPLATE": "コピー新規",
		"AI_BUILDER_UPDATE_TEMPLATE": "保存する",
		"AI_BUILDER_TEMPLATE_NAME": "プロンプトウィザードの名前を入力ください",
		"AI_BUILDER_TEMPLATE_CONTENT": "プロンプトウィザードのテキスト内容があれば、ここでテキスト形式で初期的に入力できます。",
		"AI_BUILDER_PROMPT_LABEL_NAME": "ラベル名",
		"AI_BUILDER_BACKGROUND_COLOR": "ラベルの背景色",
		"AI_BUILDER_TEXT_COLOR": "ラベルの文字色",
		"AI_BUILDER_PROMPT_LABEL_SAVE": "新規作成",
    "AI_BUILDER_COMPONENT_PROPERTIES": "項目属性(文字数など)",
    "AI_BUILDER_COMPONENT_PLACEHOLDER_LABEL": "",
    "AI_BUILDER_COMPONENT_PLACEHOLDER_INPUT": "",
    "AI_BUILDER_COMPONENT_PLACEHOLDER_TEXTAREA": "",
		"CLOSE": "閉じる",
		"DEFAULT": "自動作成",
		"CUSTOM": "手動作成",
		"CLONE": "ラベル複製",
		"DELETE": "ラベル削除",
		"AI_BUILDER_PROMPT_LABEL_DESCRIPTION_HELP": "※新しいラベルを作成したい場合に「ラベル複製」ボタンをクリックしてください",
		"BUTTON_BACK": "戻る",
	},

	/**
	 * getLocale
	 *
	 * @return {string} ロケール（'ja', 'en'等）
	 */
	getLocale: function () {
		return this.locale;
	},

	/**
	 * setLocale
	 *
	 * @param {string} ロケール
	 */
	setLocale: function (aLocale) {
		this.locale = aLocale;
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
		// if(typeof _msg[aMsgCd] != 'undefined') {
		//   return _msg[aMsgCd];
		// }
		// return aMsgCd;
		sateraitoAI.MyLang.setLocale(MyLang.getLocale())

		// let MyLang = this;
		var message = '';
		var locale = sateraitoAI.MyLang.getLocale();
		switch (locale) {
			case 'ja':
				message = sateraitoAI.MyLang.msgData_ja_ALL[aMsgCd];
				break;
			default:
				message = sateraitoAI.MyLang.msgData_ALL_ALL[aMsgCd];
		}
		if (typeof message === 'undefined') {
			message = aMsgCd;
		}
		return message;
	},
};

sateraitoAI.ObjectsTemporary = function () {
	this.items = [];
	this.active = -1;
};
sateraitoAI.ObjectsTemporary.prototype.get = function (index) {
	if (typeof index == 'undefined') {
		index = this.active;
	}
	if (this.items.length > 0) {
		return this.items[index];
	} else {
		return null;
	}
};
sateraitoAI.ObjectsTemporary.prototype.set = function (aObj) {
	if (typeof aObj == 'undefined') {
		return false;
	}
	if (typeof aObj != 'object') {
		return false;
	}
	this.active += 1;
	this.items.push(aObj);
	return true;
};

sateraitoAI.ObjectsTemporary.prototype.destroy = function () {
	this.items = new Array();
	this.active = -1;
};

sateraitoAI.BuilderTemplate = {
	HEADER_SYNTAX: "##",
	CHAR_SPLIT_SYNTAX: "|",

	cache_key: "SATE_AI_BUILDER_POPUP",
	saveTemplateList: function (data) {
		localStorage.setItem(this.cache_key, JSON.stringify(data));
	},
	getTemplateList: function () {
		var data = localStorage.getItem(this.cache_key);
		if (!data) {
			// data = [];
			data = [];
		} else {
			sateraitoAI.console.log(localStorage.getItem(this.cache_key));
			data = JSON.parse(data);
		}
		return data;
	},

	parseProperties: function (properties, key, defaultValue) {
		if (typeof defaultValue === 'undefined') {
			defaultValue = "";
		}
		if (!properties) {
			return defaultValue;
		}
		let properties_split = properties.split(",");
		let result = {
			maxlength: properties_split.length > 0 ? parseInt(properties_split[0]) : defaultValue
		};
		if (key) {
			return result[key];
		} else {
			return result;
		}
	},

	parseTemplateContent: function (content) {
		var self = this;
		var components = [];
		var temp_cmp = {};
		var temp_value = "";
		var count_block = 0;

		var parseValueForControl = function (control) {
			var items = [];
			control.value.split("\n").forEach(function (item) {
				var text = item.toString().trim();
				if (text) {
					// sateraitoAI.console.log(text);
					// if (text.search("-") == 0) {
					// 	text = text.replace("-", "").trim();
					// }
					items.push(text);
				}
			});
			switch (control.type) {
				case "SELECT":
					control.items = sateraitoAI.Utils.cloneDeep(items);
					control.value = control.default_value;
					break;
				case "CHECK":
					control.items = sateraitoAI.Utils.cloneDeep(items);
					// control.value = control.default_value;
					var default_value = control.default_value;
					if (default_value) {
						control.value = default_value.split(",");
					} else {
						control.value = [default_value];
					}
					break;
				case "RADIO":
					control.items = sateraitoAI.Utils.cloneDeep(items);
					control.value = control.default_value;
					break;
				default:
					break;
			}
		};

		var parseConfigForControl = function (control) {
			var match = control.label.match(/([0-9]+)/g);
			if (match && match[0]) {
				var properties = match[0];
				control.label = control.label.replace(`(${properties})`);
				control.properties = properties;
			} else {
				control.properties = "";
			}
		};

		content.split("\n").forEach(function (item, index) {
			var text = item.toString().trim();
			if (text) {
				sateraitoAI.console.log(text);
				if (text.search(self.HEADER_SYNTAX) == 0) {
					if (!$.isEmptyObject(temp_cmp)) {
						// remove last character from string
						temp_value = temp_value.slice(0, -1);
						temp_cmp.value = temp_value;
						parseValueForControl(temp_cmp);
						parseConfigForControl(temp_cmp);
						components.push(sateraitoAI.Utils.cloneDeep(temp_cmp));
					}
					// clear HEADER_SYNTAX in text
					text = text.replace(self.HEADER_SYNTAX, "");

					var text_split = text.split(self.CHAR_SPLIT_SYNTAX);
					// start_control = true;
					temp_cmp = {};
					// temp_cmp.type = text_split[0];
					// temp_cmp.name = text_split[1];
					// temp_cmp.label = text_split[2];
					temp_cmp.label = text_split[0];
					temp_cmp.type = text_split[1];
					temp_cmp.name = text_split[2];
					temp_cmp.default_value = "";
					if (text_split.length > 3) {
						temp_cmp.default_value = text_split[3];
					}
					// reset temp_value
					temp_value = "";
					count_block += 1;
					return true; // break
				} else {
					temp_value += text + "\n";
				}
			}
		});
		if (count_block != components.length) {
			if (!$.isEmptyObject(temp_cmp)) {
				// remove last character from string
				temp_value = temp_value.slice(0, -1);
				temp_cmp.value = temp_value;
				parseValueForControl(temp_cmp);
				components.push(sateraitoAI.Utils.cloneDeep(temp_cmp));
			}
		}
		sateraitoAI.console.log(components);
		return components;
	},

	componentsToText: function (components) {
		var self = this;
		var text = "";
		$.each(components, function (index, component) {
			var label = component.label;
			if (component.properties) {
				label = `${component.label}(${component.properties})`;
			}
			text += `${self.HEADER_SYNTAX}${label}${self.CHAR_SPLIT_SYNTAX}${component.type}${self.CHAR_SPLIT_SYNTAX}${component.name}`;
			if (
				component.type == "SELECT" ||
				component.type == "CHECK" ||
				component.type == "RADIO"
			) {
				text += `${self.CHAR_SPLIT_SYNTAX}${component.value}`;
			}
			if (
				component.type == "SELECT" ||
				component.type == "CHECK" ||
				component.type == "RADIO"
			) {
				$.each(component.items, function (index, item) {
					// text += `\n- ${item}`;
					text += `\n${item}`;
				});
			} else {
				text += `\n${component.value}`;
			}

			// self.HEADER_SYNTAX + component.type + self.CHAR_SPLIT_SYNTAX + component.name + self.CHAR_SPLIT_SYNTAX + component.name + self.CHAR_SPLIT_SYNTAX

			text += "\n\n";
		});
		sateraitoAI.console.log(text);
		return text;
	},

	getIconClassByComponentType: function (componentType) {
		sateraitoAI.console.log(componentType);
		var cls;
		switch (componentType) {
			case "TEXT":
				cls = "mdi-form-textbox";
				break;
			case "TEXTAREA":
				cls = "mdi-form-textarea";
				break;
			case "SELECT":
				cls = "mdi-form-dropdown";
				break;
			case "CHECK":
        cls = "mdi-order-bool-descending-variant";
				break;
			case "RADIO":
        cls = "mdi-order-bool-descending";
				break;
			default:
				break;
		}
		return cls;
	},

	createHTMLComponent: function (component) {
		var self = this;
		var vHtml = "";
		vHtml +=
			'<div class="builder-lbl"><i class="mdi ' +
			this.getIconClassByComponentType(component.type) +
			'"></i>' +
			component.label +
			"</div>";
		switch (component.type) {
			case "TEXT":
				vHtml +=
					'<input type="text" name="' +
					component.name +
					'" value="' +
					component.value +
					'" maxlength="' +
					self.parseProperties(component.properties, 'maxlength', 200) +
					'"/>';
				break;
			case "TEXTAREA":
				vHtml +=
					'<textarea name="' +
					component.name +
					'" cols="1" rows="' +
					self.parseProperties(component.properties, 'maxlength', 3) +
					'">' +
					component.value +
					"</textarea>";
				break;
			case "SELECT":
				vHtml +=
					'<select name="' +
					component.name +
					'" value="' +
					component.value +
					'">';
				$.each(component.items, function () {
					if (component.value == this.toString()) {
						vHtml +=
							'<option value="' +
							this.toString() +
							'" selected>' +
							this.toString() +
							"</option>";
					} else {
						vHtml +=
							'<option value="' +
							this.toString() +
							'">' +
							this.toString() +
							"</option>";
					}
				});
				vHtml += "</select>";
				break;
			case "CHECK":
				$.each(component.items, function () {
					// if (component.value == this.toString()) {
					if (component.value.indexOf(this.toString()) > -1) {
						vHtml +=
							'<div class="check-gr"><input type="checkbox" name="' +
							component.name +
							'" value="' +
							this.toString() +
							'" checked><label>' +
							this.toString() +
							"</label></div>";
					} else {
						vHtml +=
							'<div class="check-gr"><input type="checkbox" name="' +
							component.name +
							'" value="' +
							this.toString() +
							'"><label>' +
							this.toString() +
							"</label></div>";
					}
				});
				break;
			case "RADIO":
				$.each(component.items, function () {
					if (component.value == this.toString()) {
						vHtml +=
							'<div class="check-gr"><input type="radio" name="' +
							component.name +
							'" value="' +
							this.toString() +
							'" checked><label>' +
							this.toString() +
							"</label></div>";
					} else {
						vHtml +=
							'<div class="check-gr"><input type="radio" name="' +
							component.name +
							'" value="' +
							this.toString() +
							'"><label>' +
							this.toString() +
							"</label></div>";
					}
				});
				break;
			default:
				break;
		}
		return vHtml;
	},

	FormComponentArea: function (parentNode, props) {
		var self = this;
		self.parentNode = parentNode;
		self.type = "TEXT";
		self.name = "";
		self.label = "";
		self.value = "";
		self.items = [];
		self.properties = "";
		self.onSubmit = function () { };
		self.onCancel = function () { };
		for (var key in props) {
			this[key] = props[key];
		}

		self.destroy = function () {
			$(parentNode).html("");
		};

		self.createHTMLComponentOptionItem = function (value) {
			if (typeof value == "undefined") {
				value = "";
			}
			var vHtml = "";
			vHtml += '<div class="component-option-item">';
			vHtml += '	<input placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_PLACEHOLDER_OPTION") + '" name="component_option" value="' + value + '"/>';
			vHtml += '	<button type="button" class="btn btn_remove_component_option mdi mdi-close" title="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_OPTION_REMOVE") + '"></button>';
			vHtml += '</div>';
			return vHtml;
		};
		sateraitoAI.console.log(self);
		var vHtml = "";
		vHtml +=
			'<div class="form-component-type"><span>' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_" + self.type) +
			"</span></div>";
		vHtml += "<form>";
		vHtml += '<div class="form-component-item">';
		// vHtml += '  <span class="mdi mdi-tag ico"></span>';
		vHtml += '	<label>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_LABEL") + '</label>';
		vHtml += '	<input placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_PLACEHOLDER_LABEL") + '" name="component_label" value="' + self.label + '" />';
		vHtml += '</div>';
		vHtml += '<div class="form-component-item">';
		// vHtml += '  <span class="mdi mdi-text-short ico"></span>';
		vHtml += '	<label>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_NAME") + '</label>';
		vHtml += '	<input placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_PLACEHOLDER_INPUT") + '" name="component_name" value="' + self.name + '" />';
		vHtml += '</div>';
		if (self.type != 'TEXTAREA') {
			vHtml += '<div class="form-component-item">';
			// vHtml += '  <span class="mdi mdi-form-textbox ico"></span>';
			vHtml += '	<label>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_VALUE") + '</label>';
			vHtml += '	<input placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_PLACEHOLDER_INPUT") + '" name="component_value" value="' + self.value + '" />';
			vHtml += '</div>';
		} else {
			vHtml += '<div class="form-component-item">';
			// vHtml += '  <span class="mdi mdi-form-textbox ico"></span>';
			vHtml += '	<label>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_VALUE") + '</label>';
			vHtml += '	<textarea placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_PLACEHOLDER_TEXTAREA") + '" name="component_value" rows="5" cols="1">' + self.value + '</textarea>';
			vHtml += '</div>';
		}
		if (self.type == "TEXT" || self.type == "TEXTAREA") {
			vHtml += '<div class="form-component-item">';
			// vHtml += '  <span class="mdi mdi-form-textbox ico"></span>';
			vHtml +=
				"	<label>" + sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_PROPERTIES") + "</label>";
			vHtml +=
				'	<input name="component_properties" type="number" min="0" value="' +
				self.properties +
				'"/>';
			vHtml += "</div>";
		}
		if (self.type == "SELECT" || self.type == "CHECK" || self.type == "RADIO") {
			vHtml += '<div class="form-component-item">';
			// vHtml += ' <span class="mdi mdi-list-box-outline ico"></span>';
			vHtml +=
				"	<label>" +
				sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_OPTION_VALUE") +
				"</label>";
			vHtml += '	<div class="component-option-repeater">';
			vHtml += '		<div class="component-option-list">';
			if (self.items.length) {
				$.each(self.items, function () {
					vHtml += self.createHTMLComponentOptionItem(this.toString());
				});
			} else {
				vHtml += self.createHTMLComponentOptionItem();
			}
			vHtml += "		</div>";
			vHtml +=
				'		<button type="button" class="btn btn_add_component_option mdi mdi-plus" title="' +
				sateraitoAI.MyLang.getMsg("AI_BUILDER_OPTION_ADD") +
				'"></button>';
			vHtml += "	</div>";
			vHtml += "</div>";
		}
		vHtml += "</form>";
		vHtml += '<div class="act-component">';
		vHtml +=
			'<button type="button" class="btn btn_cancel_form_component_area st-btn-material-outline" data-kind="TEXTAREA">' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_CANCEL") +
			"</button>";
		vHtml +=
			'<button type="button" class="btn btn_submit_form_component_area st-btn-material" data-kind="TEXT"><span class="mdi mdi-check"></span>' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_COMPONENT_SUBMIT") +
			"</button>";
		vHtml += "</div>";

		$(parentNode).html(vHtml);

		// fire events
		$(parentNode).off("click");
		$(parentNode).on(
			"click",
			".component-option-repeater .btn_add_component_option",
			function (e) {
				e.preventDefault();
				var vHtml = self.createHTMLComponentOptionItem();
				$(this)
					.closest(".component-option-repeater")
					.find(".component-option-list")
					.append(vHtml);
			}
		);
		$(parentNode).on(
			"click",
			".component-option-repeater .btn_remove_component_option",
			function (e) {
				e.preventDefault();
				$(this).closest(".component-option-item").remove();
			}
		);

		var $btnSubmit = $(parentNode).find(".btn_submit_form_component_area");
		var $btnCancel = $(parentNode).find(".btn_cancel_form_component_area");
		$btnSubmit.click(function (e) {
			e.preventDefault();
			var component = {
				type: self.type,
			};
			var formSerializeArray = $(parentNode).find("form").serializeArray();
			sateraitoAI.console.log(formSerializeArray);
			var items = [];
			$(parentNode)
				.find(".form-component-item :input")
				.each(function () {
					var name = $(this).attr("name");
					var value = $(this).val().trim();
					if (name == "component_properties") {
						component.properties = value;
					}
					if (name == "component_name") {
						component.name = value;
					}
					if (name == "component_label") {
						component.label = value;
					}
					if (name == "component_value") {
						component.value = value;
					}
					if (name == "component_option") {
						if (value) {
							items.push(value);
						}
					}
				});
			component.items = sateraitoAI.Utils.cloneDeep(items);

			// check valid component
			if (!component.label) {
				$(parentNode)
					.find(".form-component-item :input[name=component_label]")
					.focus();
				return false;
			}
			if (!component.name) {
				$(parentNode)
					.find(".form-component-item :input[name=component_name]")
					.focus();
				return false;
			}

			self.destroy();

			if (typeof self.onSubmit == "function") {
				self.onSubmit(component);
			}
		});

		$btnCancel.click(function (e) {
			e.preventDefault();

			self.destroy();

			if (typeof self.onCancel == "function") {
				self.onCancel();
			}
		});
	},

	init: function (parentNode, options) {
		var self = this;
		self.parentNode = parentNode;
		self.template_name = "";
		self.template_body = "";
		self.direct_send = false;
		self.label_id = "";
		self.buttonSaveMessage = "Submit";
		self.onComplete = function () { };

		// override props to this
		for (var key in options) {
			this[key] = options[key];
		}

		self.components = sateraitoAI.BuilderTemplate.parseTemplateContent(
			self.template_body
		);
		sateraitoAI.console.log(options);
		sateraitoAI.console.log(self.components);

		$(parentNode).html("");
		var vHtml = "";

		vHtml += '<div class="sateraito_ai_builder_header">';
		// vHtml += '	<h3 class="template_name">' + self.template_name + '</h3>';
		vHtml +=
			'	<input type="text" name="template_name" value="' +
			self.template_name +
			'">';

		vHtml += '<div id="label_id"></div>';
		// vHtml += '<div class="dropdown_select_label form-group-label">';
		// vHtml += '	<div class="custom-dropdown">';
		// vHtml += '		<div class="dropdown">';
		// vHtml += '			<button class="btn st-btn-material-outline dropdown-toggle" type="button" id="button_dropdown_select_label" data-bs-toggle="dropdown" aria-expanded="false">';
		// vHtml += '				<span class="mdi mdi-tag"></span>	' + sateraitoAI.MyLang.getMsg('AI_BUILDER_SELECT_LABEL');
		// vHtml += '			</button>';
		// vHtml += '			<ul class="dropdown-menu" aria-labelledby="button_dropdown_select_label">';
		//
		// let createNewRecordLabelHtml = function(label){
		// 	if(typeof label === 'undefined'){
		// 		label = {};
		// 	}
		// 	let label_name = label.label_name ? label.label_name : '';
		// 	let bg_color = label.bg_color ? label.bg_color : '#2196F3';
		// 	let text_color = label.text_color ? label.text_color : '#ffffff';
		// 	let vHtml = '';
		// 	vHtml += '<li>';
		// 	vHtml += '  <a class="dropdown-item checked" href="#" style="background-color: '+bg_color+';color: '+text_color+';">';
		// 	vHtml += '    <span class="mdi mdi-tag"></span>';
		// 	vHtml += '    <span class="drop-item-lbl">' + label_name + '</span>';
		// 	vHtml += '  </a>';
		// 	vHtml += '</li>';
		// 	return vHtml;
		// };
		//
		// let labels = sateraitoAI.PromptLabel.getValue();
		// labels.map(function(label){
		// 	vHtml += createNewRecordLabelHtml(label);
		// });
		// vHtml += '				<div class="break-option"></div>';
		// vHtml += '				<li class="skip-attach-event button_create_new_label"><a class="dropdown-item custom-lbl" href="#">';
		// vHtml += '				  <span class="mdi mdi-tag-plus"></span>';
		// vHtml += '					<span class="drop-item-lbl">' + sateraitoAI.MyLang.getMsg('AI_BUILDER_CREATE_LABEL') + '</span>';
		// vHtml += '				  </a></li>';
		// vHtml += '			</ul>';
		// vHtml += '		</div>';
		// vHtml += '	</div>';
		// vHtml += '</div>';

		// vHtml += '	<span class="btn_edit_template_name mdi mdi-pencil"></span>';
		// vHtml += '	<span class="btn_save_template_name mdi mdi-content-save"></span>';
		vHtml += "</div>";

		vHtml += '<div class="sateraito_ai_builder_form">';
		vHtml += '<div class="toolbar-title">';
		vHtml +=
			"<span>" +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_BUILD_PROMPT") +
			"</span>";
		vHtml += "</div>";
		vHtml += '<div class="toolbar">';
		vHtml += "</div>";
		vHtml += '<div class="block-builder">';
		vHtml += '	<ul class="sortable"></ul>';
		vHtml += "</div>";
		vHtml += '<div class="block-preview-code">';
		vHtml += '	<textarea name="preview_code" cols="1" rows="20"></textarea>';
		vHtml += "</div>";
		vHtml += '<div class="block-action-btn">';
		// if(self.edit_type && self.edit_type == 'renew') {
		// 	vHtml += '<button type="button" class="btn btn_clone_template btn-filled st-btn-material">';
		// 	vHtml += '	<span>' + sateraitoAI.MyLang.getMsg('AI_BUILDER_CLONE_TEMPLATE') + '</span>';
		// 	vHtml += '</button>';
		// }
		vHtml +=
			'<button type="button" class="btn btn_save_template btn-filled st-btn-material">';
		vHtml += "	<span>" + self.buttonSaveMessage + "</span>";
		vHtml += "</button>";
		vHtml += "</div>";
		vHtml += "</div>";
		$(parentNode).html(vHtml);

		// create toolbar
		self.$toolbar = $(parentNode).find(".toolbar");
		var vHtml = "";
		vHtml += '<div class="toolbar-left">';
		vHtml +=
			'	<button type="button" class="btn btn_create st-btn-material-outline" data-type="TEXT" title="' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_TEXT") +
			'"><span class="mdi mdi-form-textbox"></span></button>';
		vHtml +=
			'	<button type="button" class="btn btn_create st-btn-material-outline" data-type="TEXTAREA" title="' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_TEXTAREA") +
			'"><span class="mdi mdi-form-textarea"></span></button>';
		vHtml +=
			'	<button type="button" class="btn btn_create st-btn-material-outline" data-type="SELECT" title="' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_SELECT") +
			'"><span class="mdi mdi-form-dropdown"></span></button>';
		vHtml +=
			'	<button type="button" class="btn btn_create st-btn-material-outline" data-type="RADIO" title="' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_RADIO") +
			'"><span class="mdi mdi-radiobox-marked"></span></button>';
		vHtml +=
			'	<button type="button" class="btn btn_create st-btn-material-outline" data-type="CHECK" title="' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_CHECKBOX") +
			'"><span class="mdi mdi-checkbox-marked"></span></button>';
		vHtml += "</div>";
		vHtml += '<div class="toolbar-right">';
		vHtml +=
			'	<button type="button" class=" btn  st-btn-material-outline btn_show_code"><span title="' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_SHOW_CODE") +
			'"  class="mdi mdi-code-tags"></span></button>';
		vHtml +=
			'	<button type="button" class="btn  st-btn-material-outline btn_show_builder"><span title="' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_SHOW_UI") +
			'" class="mdi mdi-code-block-tags"></span></button>';
		vHtml +=
			'	<button type="button" class="btn  st-btn-material-outline btn_export_template"><span title="' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_DOWNLOAD") +
			'" class="mdi mdi-download-outline"></span></button>';

		// switch auto send
		vHtml += '<div class="custom-switch auto-summary form-check">';
		if (self.direct_send) {
			vHtml +=
				'  <input type="checkbox" class="form-check-input" checked="checked" name="direct_send">';
		} else {
			vHtml +=
				'  <input type="checkbox" class="form-check-input" name="direct_send">';
		}
		vHtml +=
			'  <label title="" class="form-check-label">' +
			sateraitoAI.MyLang.getMsg("AI_BUILDER_PROMPT_DIRECT_SEND_ON") +
			"</label>";
		vHtml += "</div>";
		// end switch auto send

		vHtml += "</div>";
		vHtml += '<div class="form_component_area">';
		vHtml += "</div>";
		self.$toolbar.html(vHtml);
		self.$formComponentArea = self.$toolbar.find(".form_component_area");

		self.$btnShowCode = self.$toolbar.find(".btn_show_code");
		self.$btnBuilder = self.$toolbar.find(".btn_show_builder");

		self.$blockBuilder = $(parentNode).find(".block-builder");
		self.$btnPreviewCode = $(parentNode).find(".block-preview-code");

		self.dropdownPromptLabels = $(parentNode)
			.find("#label_id")
			.DropdownPromptLabels({
				value: self.label_id,
			});
		sateraitoAI.console.log(self.dropdownPromptLabels.getValue());
		// self.$dropdownSelectLabel = $(parentNode).find('.dropdown_select_label');
		// // self.$btnDropdownSelectLabel = self.$dropdownSelectLabel.find('.button_dropdown_select_label');
		// self.$dropdownSelectLabel.on('click', 'ul.dropdown-menu li a', function(){
		// 	sateraitoAI.console.log(this);
		// 	sateraitoAI.showLabelManagePopup({
		// 		onSubmit: function(){
		//
		// 		}
		// 	});
		// });

		// self.$dropdownSelectLabel.on('click', 'ul.dropdown-menu li a.button_create_new_label', function(){
		// 	sateraitoAI.showLabelManagePopup({
		// 		onSubmit: function(){
		//
		// 		}
		// 	});
		// });

		self.$btnShowCode.show();
		self.$btnBuilder.hide();
		self.$blockBuilder.show();
		self.$btnPreviewCode.hide();
		self.$btnShowCode.click(function (e) {
			e.preventDefault();
			self.$blockBuilder.hide();
			self.$btnPreviewCode.show();
			self.$btnBuilder.show();
			self.$btnShowCode.hide();
			var templateBody = sateraitoAI.BuilderTemplate.componentsToText(
				self.components
			);
			self.$btnPreviewCode.find("textarea").val(templateBody);
		});
		self.$btnBuilder.click(function (e) {
			e.preventDefault();
			self.$blockBuilder.show();
			self.$btnPreviewCode.hide();
			self.$btnBuilder.hide();
			self.$btnShowCode.show();
		});

		self.$sateraitoAiBuilderHeader = $(parentNode).find(
			".sateraito_ai_builder_header"
		);
		self.$sateraitoAiBuilderForm = $(parentNode).find(
			".sateraito_ai_builder_form"
		);
		// self.$btnEditTemplateName = self.$sateraitoAiBuilderHeader.find('.btn_edit_template_name');
		// self.$btnSaveTemplateName = self.$sateraitoAiBuilderHeader.find('.btn_save_template_name');
		// // self.$btnEditTemplateName.show();
		// // self.$btnSaveTemplateName.hide();
		// // self.$sateraitoAiBuilderHeader.find(".template_name").show();
		// // self.$sateraitoAiBuilderHeader.find("input").hide();
		// self.$btnEditTemplateName.click(function (e) {
		// 	self.$btnEditTemplateName.hide();
		// 	self.$btnSaveTemplateName.show();
		// 	self.$sateraitoAiBuilderHeader.find(".template_name").hide();
		// 	self.$sateraitoAiBuilderHeader.find("input").show();
		// });
		// self.$btnSaveTemplateName.click(function (e) {

		// 	self.template_name = self.$sateraitoAiBuilderHeader.find("input").val().trim();
		// 	if (!self.template_name) {
		// 		self.$sateraitoAiBuilderHeader.find("input").focus();
		// 		return false;
		// 	}
		// 	self.$btnEditTemplateName.show();
		// 	self.$btnSaveTemplateName.hide();
		// 	self.$sateraitoAiBuilderHeader.find(".template_name").show();
		// 	self.$sateraitoAiBuilderHeader.find("input").hide();

		// 	if (typeof self.onComplete == 'function') {
		// 		var templateBody = sateraitoAI.BuilderTemplate.componentsToText(self.components);
		// 		self.template_body = templateBody;
		// 		self.onComplete({
		// 			template_name: self.template_name,
		// 			template_body: self.template_body,
		// 		});
		// 	}
		// });

		self.$btnExportTemplate = self.$toolbar.find(".btn_export_template");
		self.$btnExportTemplate.click(function (e) {
			e.preventDefault();

			var templateBody = sateraitoAI.BuilderTemplate.componentsToText(
				self.components
			);
			sateraitoAI.Utils.download(
				templateBody,
				`${self.template_name}.txt`,
				"text/plain"
			);
		});
		// add event to btn_create
		self.$toolbar.find(".btn_create").click(function (e) {
			e.preventDefault();
			var data = $(this).data();

			new sateraitoAI.BuilderTemplate.FormComponentArea(
				self.$formComponentArea[0],
				{
					type: data.type,
					onSubmit: function (component) {
						self.components.push(component);
						self.renderAll();
					},
					onCancel: function () { },
				}
			);
		});

		// clone template
		$(parentNode)
			.find(".btn_clone_template")
			.click(function (e) {
				e.preventDefault();

				self.template_name = self.$sateraitoAiBuilderHeader
					.find('input[name="template_name"]')
					.val()
					.trim();
				self.direct_send = self.$sateraitoAiBuilderForm
					.find(':input[name="direct_send"]')
					.is(":checked");
				// self.label_id = self.$sateraitoAiBuilderHeader.find('input[name="label_id"]').val().trim();
				self.label_id = self.dropdownPromptLabels.getValue();
				if (!self.template_name) {
					self.$sateraitoAiBuilderHeader.find("input").focus();
					return false;
				}
				// check duplicate template name

				if (typeof self.onComplete == "function") {
					var templateBody = sateraitoAI.BuilderTemplate.componentsToText(
						self.components
					);
					self.template_body = templateBody;
					self.onComplete(
						{
							template_name: self.template_name,
							template_body: self.template_body,
							direct_send: self.direct_send,
							label_id: self.label_id,
						},
						"clone"
					);
				}
			});

		// save template
		$(parentNode)
			.find(".btn_save_template")
			.click(function (e) {
				e.preventDefault();

				self.template_name = self.$sateraitoAiBuilderHeader
					.find('input[name="template_name"]')
					.val()
					.trim();
				self.direct_send = self.$sateraitoAiBuilderForm
					.find(':input[name="direct_send"]')
					.is(":checked");
				// self.label_id = self.$sateraitoAiBuilderHeader.find('input[name="label_id"]').val().trim();
				self.label_id = self.dropdownPromptLabels.getValue();
				if (!self.template_name) {
					self.$sateraitoAiBuilderHeader.find("input").focus();
					return false;
				}
				// check duplicate template name

				if (typeof self.onComplete == "function") {
					var templateBody = sateraitoAI.BuilderTemplate.componentsToText(
						self.components
					);
					self.template_body = templateBody;
					self.onComplete(
						{
							template_name: self.template_name,
							template_body: self.template_body,
							direct_send: self.direct_send,
							label_id: self.label_id,
						},
						"submit"
					);
				}
			});

		self.$ulSortable = $(parentNode).find("ul.sortable");
		self.renderAll = function () {
			var vHtml = "";
			for (var i = 0; i < self.components.length; i++) {
				vHtml += '<li class="item_jig"> ';
				vHtml += '	<span class="mdi mdi-drag"></span>';
				vHtml += sateraitoAI.BuilderTemplate.createHTMLComponent(
					self.components[i]
				);
				vHtml += '	<span class="edit_ctr mdi mdi-pencil"></span>';
				vHtml += '	<span class="delete_ctr mdi mdi-delete"></span>';
				vHtml += "</li>";
			}
			self.$ulSortable.html(vHtml);

			// fire events

			self.$ulSortable.find(".edit_ctr").click(function (e) {
				e.preventDefault();
				var $componentUI = $(this).closest(".item_jig");
				var index = $componentUI.index();
				var component = self.components[index];
				new sateraitoAI.BuilderTemplate.FormComponentArea(
					self.$formComponentArea[0],
					{
						type: component.type,
						label: component.label,
						name: component.name,
						value: component.value,
						items: component.items,
						properties: component.properties,
						onSubmit: function (component) {
							self.components[index] = sateraitoAI.Utils.cloneDeep(component);
							sateraitoAI.console.log(
								"edit callback onSubmit",
								component,
								self.components
							);
							self.renderAll();
						},
						onCancel: function () { },
					}
				);
			});

			self.$ulSortable.find(".delete_ctr").click(function (e) {
				e.preventDefault();
				var $componentUI = $(this).closest(".item_jig");
				var index = $componentUI.index();
				var resultConfirm = window.confirm("Are you sure you want to delete");
				if (resultConfirm) {
					self.components.splice(index, 1);
					self.renderAll();
				}
			});
		};

		self.renderAll();

		self.objectTmp = null;

		self.$ulSortable
			.sortable({
				// connectWith: ".droptrue",
				placeholder: "dragging_highlight",
				scroll: true,
				revert: false,
				forcePlaceholderSize: true,
				cancel: ".edit_ctr",
				tolerance: "pointer",
				items: "> .item_jig",
				cursorAt: { top: 15, left: 10 },
				start: function (event, ui) {
					sateraitoAI.console.log("start", event, ui);

					var parent = ui.item[0].parentNode;
					ui.placeholder.height(ui.item.height());
					ui.placeholder.css("visibility", "visible");
					// ui.placeholder.css('opacity', 0.7);
					// ui.placeholder.html(ui.item[0].innerHTML);
					self.objectTmp = new sateraitoAI.ObjectsTemporary();
					self.objectTmp.set({
						parent: parent,
						index: $(ui.item[0]).index(),
					});
					self.$ulSortable.addClass("dragarea-highlight");
				},
				over: function (event, ui) {
					sateraitoAI.console.log("over", event, ui);
					// var cl = ui.item.attr('class');
					// $('.ui-state-highlight').addClass(cl);
					self.$ulSortable.addClass("dragarea-highlight");
				},

				stop: function (event, ui) {
					sateraitoAI.console.log("stop", event, ui);

					var objectTmpValue = self.objectTmp.get();
					var index_old = objectTmpValue.index;
					var index_new = $(ui.item[0]).index();
					var removes = self.components.splice(index_old, 1);
					self.components.splice(index_new, 0, removes[0]);
					// re render components
					self.renderAll();
					self.$ulSortable.removeClass("dragarea-highlight");
				},
			})
			.disableSelection();

		return this;
	},

	initFormBuilder: function (parentNode, options) {
		var self = this;
		self.parentNode = parentNode;
		self.template_name = "";
		self.template_body = "";
		self.direct_send = false;
		self.label_id = "";
		self.buttonSaveMessage = "Submit";
		self.onComplete = function () { };

		// override props to this
		for (var key in options) {
			this[key] = options[key];
		}

		self.components = sateraitoAI.BuilderTemplate.parseTemplateContent(
			self.template_body
		);
		sateraitoAI.console.log(options);
		sateraitoAI.console.log(self.components);

		$(parentNode).html("");
		var vHtml = "";

		vHtml +=
			'<div class="sateraito_ai_builder_header"><h3>' +
			self.template_name +
			"</h3></div>";
		vHtml += '<div class="sateraito_ai_builder_form">';
		vHtml += '	<form class="block-form-builder">';
		vHtml += "	</form>";
		vHtml += "</div>";
		$(parentNode).html(vHtml);

		self.$blockFormBuilder = $(parentNode).find(".block-form-builder");

		self.getPrompt = function () {
			var prompt = "";
			self.$blockFormBuilder.find(".block-component-item").each(function () {
				var inputElement = $(this).find(":input");
				var tagName = inputElement[0].tagName;
				var type = $(inputElement).attr("type");
				var name = $(inputElement).attr("name");
				var value = $(inputElement).val().trim();
				var label = $(this).find("div.builder-lbl").text();
				if (tagName == "INPUT" && type == "radio") {
					value = $(this)
						.find(':input[name="' + name + '"]:checked')
						.val();
					prompt += `##${label}\n`;
					prompt += `${value}\n\n`;
					return true;
				}
				if (tagName == "INPUT" && type == "checkbox") {
					value = "";
					$(this)
						.find(':input[name="' + name + '"]:checked')
						.each(function () {
							value += `${$(this).val()}\n`;
						});
					prompt += `##${label}\n`;
					prompt += `${value}\n`;
					return true;
				}
				if (tagName == "SELECT") {
					prompt += `##${label}\n`;
					prompt += `${value}\n\n`;
					return true;
				}
				prompt += `##${label}\n`;
				prompt += `${value}\n\n`;
			});

			// remove last character from string
			prompt = prompt.slice(0, -1);

			return prompt;
		};

		self.renderAll = function () {
			var vHtml = "";
			for (var i = 0; i < self.components.length; i++) {
				vHtml += '<div class="block-component-item m-2">';
				vHtml += sateraitoAI.BuilderTemplate.createHTMLComponent(
					self.components[i]
				);
				vHtml += "</div>";
			}
			self.$blockFormBuilder.html(vHtml);
		};

		self.renderAll();

		return this;
	},
};

sateraitoAI.PromptLabel = {
	_labels: [],
	_default_labels: [
		{
			'label_name': '一般/一般＠その他系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '一般/一般＠要約系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '人事/人事＠その他系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '人事/人事＠採用系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '分析/分析＠まとめ',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '営業/営業＠その他系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '営業/営業＠メール系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '営業/営業＠文章作成系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '広報/広報＠SNS系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '広報/広報＠セミナー系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '広報/広報＠展示会系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '広報/広報＠文章作成系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '法務/法務＠契約書系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '法務/法務＠守秘義務契約系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '経営戦略/経営戦略＠その他系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '経営戦略/経営戦略＠事業計画系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '経営戦略/経営戦略＠戦略系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '経理/経理＠申請・計算系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '経理/経理＠管理系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '総務/総務＠イベント系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		},
		{
			'label_name': '総務/総務＠文書作成系',
			'bg_color': '#2196F3',
			'text_color': '#ffffff',
			'is_default': true
		}
	],
	setValue: function (labels) {
		let newLabels = sateraitoAI.Utils.cloneDeep(labels);
		// let hasDefault = false;
		// $.each(labels, function (){
		// 	if(this.is_default){
		// 		hasDefault = true;
		// 		return false;
		// 	}
		// });
		// if(!hasDefault){
		// 	newLabels = sateraitoAI.Utils.cloneDeep(labels).concat(this._default_labels)
		// }
		this._labels = newLabels;
	},
	getValue: function (labels) {
		return this._labels;
	},
	getById: function (label_name) {
		var self = this;
		var results = self._labels.filter(function (item) {
			return item.label_name === label_name;
		});
		if (results.length) {
			return results[0];
		}
		return null;
	}
};

sateraitoAI.showLabelManagePopup = function (props) {

	var self = this;

	self.onSubmit = function () { };
	for (var key in props) {
		self[key] = props[key];
	}

	var modal_id = "ai_label_manage_popup_modal";

	var createModalHtml = function () {
		if ($(document).find('#' + modal_id).length) {
			return;
		}

		var vHtml = '';
		// <!-- The Modal -->
		vHtml += '<div id="' + modal_id + '" class="sateraito_ai_modal st-ui modal-large sateraito_ai_builder modal-label-manage">';

		// <!-- Modal content -->
		vHtml += '  <div class="modal-content">';
		vHtml += '		<div class="modal-header">';
		vHtml += '  	  <h2><i class="mdi mdi-tag"></i>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_PROMPT") + '</h2>';
		vHtml += '  	  <span class="close mdi mdi-close"></span>';
		vHtml += '  	</div>';

		// START modal-body
		vHtml += '  	<div class="modal-body">';
		vHtml += '    	<div class="tbl-body">';
		vHtml += '      	<div class="tbl-header">';
		vHtml += '        	<div class="th-drag"><span class="mdi mdi-drag"></span></div>';
		vHtml += '        	<div class="th-name">' + sateraitoAI.MyLang.getMsg("AI_BUILDER_PROMPT_LABEL_NAME") + '</div>';
		vHtml += '        	<div class="th-bg-color">' + sateraitoAI.MyLang.getMsg("AI_BUILDER_BACKGROUND_COLOR") + '</div>';
		vHtml += '        	<div class="th-text-color">' + sateraitoAI.MyLang.getMsg("AI_BUILDER_TEXT_COLOR") + '</div>';
		vHtml += '        	<div class="th-type"></div>';
		vHtml += '        	<div class="th-action"></div>';
		vHtml += "      	</div>";
		vHtml += '        <div class="repeater">';
		vHtml += '          <div data-repeater-list="category-group" class="category-group">';
		vHtml += "          </div>"; // end data-repeater-list
		vHtml += '        </div>';// end repeater
		vHtml += "      </div>";
		vHtml += "    </div>";

		// END modal-body

		vHtml += '  	<div class="modal-footer">';
		vHtml += '  	  <span class="text-description">' + sateraitoAI.MyLang.getMsg("AI_BUILDER_PROMPT_LABEL_DESCRIPTION_HELP") + '</span>';
		vHtml += '  	  <button type="button" class="btn btn-submit st-btn-material" disabled><i class=" mdi mdi-content-save"></i>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_PROMPT_LABEL_SAVE") + '</button>';
		vHtml += '  	  <button type="button" class="btn btn-cancel st-btn-material-outline">' + sateraitoAI.MyLang.getMsg("CLOSE") + '</button>';
		vHtml += '  	</div>';
		vHtml += '  </div>';

		// END modal-content

		vHtml += '</div>';
		$(document.body).append(vHtml);
	}
	createModalHtml();

	var modal = document.getElementById(modal_id);
	this._modal = modal;

	// When the user clicks on the button, open the modal
	modal.style.display = "block";

	// Get the <span> element that closes the modal
	let span = modal.getElementsByClassName("close")[0];
	// When the user clicks on <span> (x), close the modal
	span.onclick = function () {
		self.hide();
	};

	self.show = function () {
		modal.style.display = "block";
	}

	self.hide = function () {
		// hide modal
		modal.style.display = "none";
	}

	let $btnSubmit = $(modal).find('.btn-submit');
	let $btnCancel = $(modal).find('.btn-cancel');

	$btnCancel.click(function () {
		self.hide();
	});

	$btnSubmit.click(function () {
		let label_names = [];
		let labels = [];
		let invalid = false;
		$parentRepeaterList.find('[data-repeater-item]').removeClass('invalid');
		$parentRepeaterList.find('[data-repeater-item]').each(function () {
			let $label_name = $(this).find(':input[name="label_name"]');
			let $bg_color = $(this).find(':input[name="bg_color"]');
			let $text_color = $(this).find(':input[name="text_color"]');
			let $is_default = $(this).find(':input[name="is_default"]');
			if (!$label_name.val().trim()) {
				$label_name.focus();
				$label_name.closest('[data-repeater-item]').addClass('invalid');
				invalid = true;
				return false;
			}
			let label_name = $label_name.val().trim();
			if (label_names.indexOf(label_name) > -1) {
				return true;
			}
			labels.push({
				label_name: label_name,
				bg_color: $bg_color.val().trim(),
				text_color: $text_color.val().trim(),
				is_default: $is_default.val().trim() == 'true' ? true : false
			});
			label_names.push(label_name);
		});

		// // check label name duplicate
		// let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index);
		// if (!invalid) {
		// 	let allDuplicates = findDuplicates(label_names); // All duplicates
		// 	console.log()
		// 	if (allDuplicates.length) {
		// 	}
		// }
		// label_names = [...new Set(findDuplicates(label_names))]  // Unique duplicates

		if (!invalid) {
			console.log('submit', labels);
			Ext.Ajax.request({
				url: _vurl + 'prompt_label/xtregist',
				method: 'POST',
				params: {
					'prompt_labels': JSON.stringify(labels)
				},
				success: function (response) {
					if (response.responseText != undefined && response.responseText != '') {
						var jsondata = jQuery.parseJSON(response.responseText);
						var code = jsondata.code;

						if (code == 0) {
							console.log(jsondata);
							sateraitoAI.PromptLabel.setValue(labels);
						} else if (code == 100) {
							var message = '';
							for (data in jsondata.vcmsg) {
								message += '<br/>※' + jsondata.vcmsg[data];
								var ele = Ext.getCmp(data);
								if (typeof (ele) != 'undefined') {
									ele.preVCMessage = jsondata.vcmsg[data];
									ele.markInvalid(jsondata.vcmsg[data]);
								}
								$('#VC_' + data).html(message);
							}
							Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, message);
							//mask.hide();
						} else {
							if (jsondata.msg != '') {
								Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, jsondata.msg);
							} else {
								Ext.ucf.dispSysErrMsg(code);
							}
						}
					}

					if (typeof callback === 'function') {
						callback();
					}
				},
				error: function (response) {
				}
			});
			self.hide();
		}
	});

	let $parentRepeaterList = $(modal).find('.repeater > div');
	$parentRepeaterList.html('');

	let addNewRecordLabel = function (label) {
		if (typeof label === 'undefined') {
			label = {};
		}

		let label_name = label.label_name ? label.label_name : ''
		let bg_color = label.bg_color ? label.bg_color : '#2196F3';
		let text_color = label.text_color ? label.text_color : '#ffffff';
		let is_default = label.is_default ? label.is_default : false;
		let vHtml = '';
		if (is_default) {
			vHtml += '<div data-repeater-item class="repeater-item is_default">';
		} else {
			vHtml += '<div data-repeater-item class="repeater-item">';
		}
		vHtml += ' <div class="item-row drag-row">';
		vHtml += '		<span class="mdi mdi-drag handle_dragging"></span>';
		vHtml += '</div>';
		vHtml += '  <div class="item-row label-row">';

		if (is_default) {
			vHtml += '    <input type="text" name="label_name" value="' + label_name + '" placeholder="" disabled="disabled" />';
		} else {
			vHtml += '    <input type="text" name="label_name" value="' + label_name + '" placeholder="" />';
		}
		vHtml += '    <input type="hidden" name="is_default" value="' + is_default + '" placeholder="" />';
		vHtml += '  </div>';
		vHtml += '  <div class="item-row">';
		vHtml += '    <input type="color" name="bg_color" value="' + bg_color + '" placeholder="" />';
		vHtml += '  </div>';
		vHtml += '  <div class="item-row">';
		vHtml += '    <input type="color" name="text_color" value="' + text_color + '" placeholder="" />';
		vHtml += '  </div>';
		vHtml += '  <div class="item-row label-type-row">';
		vHtml += '    <label>' + (is_default ? sateraitoAI.MyLang.getMsg("DEFAULT") : sateraitoAI.MyLang.getMsg("CUSTOM")) + '</label>';
		vHtml += '  </div>';
		vHtml += '  <div class="item-row action-row">';
		vHtml += '    <button data-repeater-clone class="st-btn-material-outline" title="' + sateraitoAI.MyLang.getMsg("CLONE") + '">';
		vHtml += '      <span class="mdi mdi-content-copy"></span>';
		vHtml += '    </button>';
		vHtml += '    <button data-repeater-delete class="st-btn-material-outline" value="delete" title="' + sateraitoAI.MyLang.getMsg("DELETE") + '">';
		vHtml += '      <span class="mdi mdi-delete"></span>';
		vHtml += '    </button>';
		vHtml += '  </div>';
		vHtml += '</div>'; // end data-repeater-item
		$parentRepeaterList.append(vHtml);
	};

	let labels = sateraitoAI.PromptLabel.getValue();
	labels.map(function (label) {
		addNewRecordLabel(label);
	});
	if (labels.length == 0) {
		addNewRecordLabel();
	}

	$parentRepeaterList.off('click');
	$parentRepeaterList.on('click', 'button[data-repeater-clone]', function () {
		console.log(this);
		let $repeaterItem = $(this).closest('[data-repeater-item]');
		let $el = $repeaterItem.clone();
		$el.hide();
		$el.removeClass('is_default');
		$el.find(':input[type="text"]').prop('disabled', false);
		$el.find(':input[type="text"]').val($el.find(':input[type="text"]').val() + ' ' + sateraitoAI.MyLang.getMsg("CLONE"));
		$el.find('.item-row.label-type-row label').text(sateraitoAI.MyLang.getMsg("CUSTOM"));

		$repeaterItem.after($el);
		// if($repeaterItem.hasClass('is_default')){
		// 	$parentRepeaterList.prepend($el);
		// 	$parentRepeaterList.animate({
		// 		scrollTop: $el.offset().top
		// 	},500);
		// }else {
		// 	$repeaterItem.after($el);
		// }
		$el.slideDown();
		$btnSubmit.prop('disabled', false);
	});
	$parentRepeaterList.on('click', 'button[data-repeater-delete]', function () {
		console.log(this);
		if ($parentRepeaterList.find('[data-repeater-item]').length > 1) {
			$(this).closest('[data-repeater-item]').remove();
			$btnSubmit.prop('disabled', false);
		}
	});

	let initSorable = function () {
		self.objectTmp = null;
		self.$ulSortable = $(modal).find('[data-repeater-list="category-group"]');
		self.$ulSortable.sortable({
			// connectWith: ".droptrue",
			placeholder: "dragging_highlight",
			scroll: true,
			revert: false,
			forcePlaceholderSize: true,
			handle: ".handle_dragging",
			// cancel: '.edit_ctr',
			tolerance: "pointer",
			items: "> .repeater-item",
			cursorAt: { top: 15, left: 10 },
			start: function (event, ui) {
				console.log('start', event, ui);

				ui.placeholder.height(ui.item.height());
				ui.placeholder.css('visibility', 'visible');
				// ui.placeholder.css('opacity', 0.7);
				// ui.placeholder.html(ui.item[0].innerHTML);
				self.objectTmp = new sateraitoAI.ObjectsTemporary();
				self.objectTmp.set({
					parent: parent,
					index: $(ui.item[0]).index()
				});
				self.$ulSortable.addClass("dragarea-highlight");
			},
			over: function (event, ui) {
				console.log('over', event, ui);
				// var cl = ui.item.attr('class');
				// $('.ui-state-highlight').addClass(cl);
				self.$ulSortable.addClass("dragarea-highlight");
			},

			stop: function (event, ui) {
				console.log('stop', event, ui);

				var objectTmpValue = self.objectTmp.get();
				var index_old = objectTmpValue.index;
				var index_new = $(ui.item[0]).index();
				// var removes = self.components.splice(index_old, 1);
				// self.components.splice(index_new, 0, removes[0]);
				// re render components
				// self.renderAll();
				self.$ulSortable.removeClass("dragarea-highlight");
			}
		}).disableSelection();
	}

	initSorable();

	return this;
}

sateraitoAI.showBuilderPopup = function (props) {

	var self = this;

	self.onSubmit = function () { };
	for (var key in props) {
		self[key] = props[key];
	}

	const { edit_type, unique_id, edit_data } = props;
	console.log("showBuilderPopup", edit_type, unique_id);

	var modal_id = "ai_builder_popup_modal";

	var createModalHtml = function () {
		if ($(document).find('#' + modal_id).length) {
			return;
		}

		var vHtml = '';
		// <!-- The Modal -->
		vHtml += '<div id="' + modal_id + '" class="sateraito_ai_modal st-ui modal-large sateraito_ai_builder">';

		// <!-- Modal content -->
		vHtml += '  <div class="modal-content">';
		vHtml += '		<div class="modal-header">';
		vHtml += '  	  <h2><i class="mdi mdi-code-block-tags"></i>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_PROMPT") + '</h2>';
		vHtml += '  	  <span class="close mdi mdi-close"></span>';
		vHtml += '  	</div>';

		// START modal-body
		vHtml += '  	<div class="modal-body">';
		vHtml += '    <div class="block-wrap">'

		// START menu left
		vHtml += '    <div class="menu-left">'

		vHtml += '  	<div class="menu-header">';
		vHtml += '  		<button type="button" class="btn btn_create_template st-btn-material"><i class="mdi mdi-file-document-plus"></i>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_TEMPLATE") + '</button>';
		vHtml += '  	</div>';
		vHtml += '  	<ul class="menu_template_list">';
		vHtml += '  	</ul>';

		vHtml += '  	</div>';
		// END menu left

		// START menu right
		vHtml += '    <div class="menu-right">'

		// START template_detail
		vHtml += '    <div class="content-item" data-content_type="template_detail">'
		vHtml += '    </div>'
		// END template_detail

		// START template_upload
		vHtml += '    <div class="content-item" data-content_type="template_upload">'
		vHtml += '    </div>'
		// END template_upload

		// START template_start_create
		vHtml += '    <div class="content-item" data-content_type="template_start_create">'
		vHtml += '			<div class="d-flex wrap-create">'
		vHtml += '  		<button type="button" class="btn btn_input_template st-btn-material-outline"><i class="mdi mdi-code-block-tags"></i>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_INPUT_TEMPLATE") + '</button>';
		vHtml += '  		<button type="button" class="btn btn_import_template_file st-btn-material-outline"><i class="mdi mdi-upload"></i>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_IMPORT_TEMPLAT_FILE") + '</button>';
		vHtml += '    </div>'
		vHtml += '    </div>'
		// END template_start_create

		// START template_import_file
		vHtml += '    <div class="content-item" data-content_type="template_import_file">'
		// START upload area
		vHtml += '    <div class="upload-field"></div>'
		// END upload area
		vHtml += '    </div>'
		// END template_import_file


		// START template_input_content
		vHtml += '    <div class="content-item template_input_content" data-content_type="template_input_content">';
		vHtml += '    </div>'
		// END template_input_content


		// START template_builder
		vHtml += '    <div class="content-item template_builder" data-content_type="template_builder">';
		vHtml += '    </div>'
		// END template_builder


		vHtml += '  	</div>';
		// END menu right

		vHtml += '  	</div>';
		vHtml += '  	</div>';
		// END modal-body

		// vHtml += '  	<div class="modal-footer">';
		// vHtml += '  	  <button type="button" class="btn btn-preview st-btn-material"><i class=" mdi mdi-email"></i>' + sateraitoAI.MyLang.getMsg("AI_MAIL_CREATE") + '</button>';
		// vHtml += '  	  <button type="button" class="btn btn-submit st-btn-material" disabled><i class=" mdi mdi-send"></i>' + sateraitoAI.MyLang.getMsg("AI_MAIL_SEND") + '</button>';
		// vHtml += '  	  <button type="button" class="btn btn-cancel st-btn-material-outline">' + sateraitoAI.MyLang.getMsg("CLOSE") + '</button>';
		// vHtml += '  	  <h3>Modal Footer</h3>';
		// vHtml += '  	</div>';
		vHtml += '  </div>';

		// END modal-content

		vHtml += '</div>';
		$(document.body).append(vHtml);
	};

	createModalHtml();

	var self = this;

	// Get the modal
	var modal = document.getElementById(modal_id);
	self._modal = modal;

	// When the user clicks on the button, open the modal
	modal.style.display = "block";

	// Get the <span> element that closes the modal
	var span = modal.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function () {
		modal.style.display = "none";
	};

	// When the user clicks anywhere outside of the modal, close it
	// window.onclick = function (event) {
	// 	if (event.target == modal) {
	// 		modal.style.display = "none";
	// 	}
	// };
	$(modal).click(function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	});

	self.show = function () {
		modal.style.display = "block";
	}

	self.hide = function () {
		// hide modal
		modal.style.display = "none";
	}

	let $btnPreview = $(modal).find('.btn-preview');
	let $btnSubmit = $(modal).find('.btn-submit');
	let $btnCopy = $(modal).find('.btn-copy');
	let $btnCancel = $(modal).find('.btn-cancel');
	let $btnCreateTemplate = $(modal).find('.btn_create_template');
	let $btnImportTemplateFile = $(modal).find('.btn_import_template_file');
	let $btnInputTemplate = $(modal).find('.btn_input_template');
	let $menuRight = $(modal).find('.menu-right');
	let $menuTemplateList = $(modal).find('.menu_template_list');

	var on_submit_callback = function (template) {
		self.onSubmit(self, template, 'submit');
	}

	// self.addNewTemplate = function (template) {
	// 	// self.templateList.push(template);
	// 	// sateraitoAI.BuilderTemplate.saveTemplateList(self.templateList);
	// 	on_submit_callback(template);
	// 	// save_btn_process('ai_builder_popup_modal', template);
	// }
	self.templateList = sateraitoAI.BuilderTemplate.getTemplateList();

	// var renderMenuTemplateList = function () {
	//
	// 	// destroy template_builder
	// 	$(modal).find('.content-item[data-content_type="template_builder"]').html('');
	//
	// 	var vHtml = '';
	// 	$.each(self.templateList, function () {
	// 		vHtml += '<li class="menu-template-item"><span class="mdi mdi-file-document"></span><span class="template-name">' + this.template_name + '</span><span class="btn_delete_template mdi mdi-delete-circle"></span></li>';
	// 	});
	// 	$menuTemplateList.html(vHtml);
	//
	//
	// 	// fire event edit template
	// 	$menuTemplateList.find('li').off('click');
	// 	$menuTemplateList.find('li').on('click', function (e) {
	// 		e.preventDefault();
	// 		if ($(e.target).hasClass('btn_delete_template')) {
	// 			console.log("delete template");
	//
	// 			var index = $(this).closest('li.menu-template-item').index();
	// 			var resultConfirm = window.confirm('Are you sure you want to delete');
	// 			if (resultConfirm) {
	// 				self.templateList.splice(index, 1);
	// 				sateraitoAI.BuilderTemplate.saveTemplateList(self.templateList);
	// 				renderMenuTemplateList();
	// 			}
	// 			return;
	// 		}
	//
	// 		var index = $(this).index();
	// 		if (!$(this).hasClass('.menu-template-item')) {
	// 			var index = $(this).closest('li.menu-template-item').index();
	// 		}
	// 		var currentTemplate = self.templateList[index];
	// 		console.log("edit template ", index, currentTemplate)
	//
	// 		changeSectionInMenuRight("template_builder");
	// 		new sateraitoAI.BuilderTemplate.init($(modal).find('.content-item[data-content_type="template_builder"]')[0], {
	// 			template_name: currentTemplate.template_name,
	// 			template_body: currentTemplate.template_body,
	// 			buttonSaveMessage: sateraitoAI.MyLang.getMsg("AI_BUILDER_UPDATE_TEMPLATE"),
	// 			onComplete: function (template) {
	//
	// 				// do action update template
	// 				for (var key in template) {
	// 					self.templateList[index][key] = template[key];
	// 				}
	// 				sateraitoAI.BuilderTemplate.saveTemplateList(self.templateList);
	// 				renderMenuTemplateList();
	// 			}
	// 		});
	// 	});
	// }

	var hideAllSectionInMenuRight = function (content_type) {
		$menuRight.find("> .content-item").hide();
	}
	hideAllSectionInMenuRight();

	var changeSectionInMenuRight = function (content_type) {
		hideAllSectionInMenuRight();
		$menuRight.find('> .content-item[data-content_type="' + content_type + '"]').show();
	}

	// $btnCreateTemplate.click(function () {
	// 	changeSectionInMenuRight("template_start_create");
	// })

	if (edit_type == 'renew') {
		changeSectionInMenuRight("template_builder");
		var currentTemplate = { ...edit_data };
		new sateraitoAI.BuilderTemplate.init($(modal).find('.content-item[data-content_type="template_builder"]')[0], {
			template_name: currentTemplate.template_name,
			template_body: currentTemplate.template_body,
			direct_send: currentTemplate.direct_send,
			label_id: currentTemplate.label_id,
			edit_type: edit_type,
			buttonSaveMessage: sateraitoAI.MyLang.getMsg("AI_BUILDER_UPDATE_TEMPLATE"),
			onComplete: function (template) {

				on_submit_callback(template);
				// do action update template
				// for (var key in template) {
				// 	self.templateList[index][key] = template[key];
				// }
				// sateraitoAI.BuilderTemplate.saveTemplateList(self.templateList);
				// renderMenuTemplateList();
			}
		});
	} else {

		changeSectionInMenuRight("template_start_create");
	}

	$btnImportTemplateFile.click(function () {
		changeSectionInMenuRight("template_import_file");
	})

	$btnInputTemplate.click(function () {
		changeSectionInMenuRight("template_input_content");
		TemplateInputContent.init();
	})

	$btnCancel.click(function () {
		self.hide();
	});

	$btnCopy.click(function () {
		var mail_preview_value = $(modal).find('textarea[name="mail_preview"]').val();
		sateraitoAI.Utils.copyTextToClipboard(mail_preview_value);
	})

	$btnSubmit.click(function () {

		var mail_preview_value = $(modal).find('textarea[name="mail_preview"]').val();
		callback(mail_preview_value);
		// hide modal
		modal.style.display = "none";
	})

	$btnPreview.click(function () {
		$btnPreview.addClass('loading');
		$btnSubmit.prop('disabled', true);
	});


	/**
	 * UploadField
	 */
	var UploadField = {
		/**
		 * renderAll
		 */
		renderAll: function (parentNode, options) {
			var self = this;
			$(parentNode).find('div.upload-field').each(function () {
				var element = this;
				// init new scope
				new self.init(element, options);
			});
		},

		/**
		 * init
		 *
		 * @param {dom} aElementToConvert
		 */
		init: function (aElementToConvert, options) {

			var self = this;
			self.element = aElementToConvert;

			var vHtml = '';
			vHtml += '<div class="wrap-upload">';
			vHtml += '	<div class="d-flex-col">';
			vHtml += '		<div class="section-upload trigger_file">';
			vHtml += '			<div class="section-drop ">';
			vHtml += '				<div class="center-upload-icon">';
			vHtml += '					<div class="mdi mdi mdi-upload"></div>';
			vHtml += '				</div>';
			vHtml += '				<div class="upload-des">';
			vHtml += '					<strong>' + sateraitoAI.MyLang.getMsg("DOC_FILE_UPLOAD_DROP1") + '</strong>';
			vHtml += '				</div>';
			vHtml += '			</div>';
			// vHtml += '			<input type="file" multiple="" style="display: none" />';
			vHtml += '			<input type="file" style="display: none" />';
			vHtml += '		</div>';
			vHtml += '		<div class="list-uploading">';
			vHtml += '		</div>';
			vHtml += '	</div>';
			vHtml += '		<div class="block-action-btn flex-between ">';
			vHtml += '			<button type="button" class="btn btn-text-back st-btn-material-outline">';
			vHtml += '				<span class="mdi mdi-arrow-left"></span>';
			vHtml += '				<span>' + sateraitoAI.MyLang.getMsg("BUTTON_BACK") + '</span>';
			vHtml += '			</button>';
			vHtml += '			<button type="button" class="btn btn-next btn-filled st-btn-material" disabled="disabled">';
			vHtml += '				<span>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_NEXT_STEP") + '</span>';
			vHtml += '			</button>';
			vHtml += '		</div>';

			vHtml += '</div>';
			$(self.element).html(vHtml);

			this.enableAllowFile = false;
			this.AllowFileUpload = [
				"application/txt",
			];
			this.MAX_ROW_NUM_ATTACHED_FILE = 10;
			this.MapIconFileTypes = {
				"application/pdf": 'mdi-file-pdf-box',
				"application/msword": 'mdi-file-word-box',
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document": 'mdi-file-word-box',
				"application/vnd.ms-excel": 'mdi-file-excel-box',
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 'mdi-file-excel-box',
				"application/vnd.ms-powerpoint": 'mdi-file-powerpoint-box',
				"application/vnd.openxmlformats-officedocument.presentationml.presentation": 'mdi-file-powerpoint-box',
				"image/jpg": 'mdi-file-jpg-box',
				"image/bmp": 'mdi-file-image',
				"image/gif": 'mdi-file-gif-box',
				"image/png": 'mdi-file-png-box',
				'text/plain': 'mdi-text-box',
			};
			this.onComplete = function () { }

			// override props to this
			for (var key in options) {
				this[key] = options[key];
			}

			// var dropEl = $(self.element).find('.section-upload')[0];
			var dropEl = self.element;
			var $listUploading = $(self.element).find('.list-uploading');


			this.getIconCls = function (file_type) {
				var iconCls = this.MapIconFileTypes[file_type];
				if (!iconCls) {
					iconCls = 'mdi-file';
				}
				return iconCls;
			}

			this.isAllowFileUpload = function (file_type) {
				if (!this.enableAllowFile) {
					return true;
				}
				if (this.AllowFileUpload.indexOf(file_type) > -1) {
					return true;
				}
				return false;
			}

			this.renderFileLoaders = function (files) {
				var vHtml = '';

				for (var i = 0; i < files.length; i++) {
					var file = files[i];
					vHtml += '<div class="row-file" id="' + file.id + '">';
					vHtml += '	<div class="ico mdi ' + this.getIconCls(file.type) + '"></div>';
					vHtml += '	<div class="name">' + file.name + '</div>';
					// vHtml += '	<div class="name"><input type="text" class="" name="template_name" value="' + file.name.split(".")[0] + '"></div>';
					vHtml += '	<div class="process-bar uploading">';
					vHtml += '		<div class="progress">';
					vHtml += '			<div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>';
					vHtml += '		</div>';
					vHtml += '	</div>';
					vHtml += '	<div class="process">0%</div>';

					vHtml += '	<div class="stt mdi mdi-loading mdi-spin"></div>';
					vHtml += '</div>';
				}

				$listUploading.append(vHtml);
			};

			// feature detection for drag&drop upload
			var isAdvancedUpload = function () {
				var div = document.createElement('div');
				return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
			}();

			var input = dropEl.querySelector('input[type="file"]');
			var $btnNext = $(self.element).find('.btn-next');
			var $btnBack = $(self.element).find('.btn-text-back');
			$btnBack.click(function () {
				changeSectionInMenuRight("template_start_create");
			});

			this.handler = function (sender, files, callback) {
				self.LIST_FILE_UPLOADED = [];
				// sateraitoAI.console.log('handler', sender, files, callback)
				if (files.length) {
					var num_finished = 0;
					var list_file_uploaded = [];
					$btnNext.prop('disabled', true).show();
					var checkFinishInSequence = function () {
						if (num_finished == files.length) {

							self.LIST_FILE_UPLOADED = self.LIST_FILE_UPLOADED.concat(list_file_uploaded);
							sateraitoAI.console.log(list_file_uploaded)
							$btnNext.prop('disabled', false);

							if (typeof callback == 'function') {
								callback();
							}
						}
					}
					var nextSequence = function (file) {

						if (!self.isAllowFileUpload(file.type)) {
							// skip upload file
							sateraitoAI.console.log('Skip upload file ', file);
							num_finished += 1;

							var $elmentParent = $(self.element).find('#' + file.id);
							var $process = $elmentParent.find('.process');
							var $icon = $elmentParent.find('.stt.mdi');
							var $processBar = $elmentParent.find('.process-bar');
							var $progressbar = $elmentParent.find('.progress-bar');
							var $progress = $elmentParent.find('.progress');
							$processBar.hide();
							$process.show().text(sateraitoAI.MyLang.getMsg('FILE_CANT_NOT_CONVERT_TO_PDF'));
							$icon.removeClass('mdi-loading').removeClass('mdi-spin').addClass('mdi-alert-circle');

							checkFinishInSequence();
						} else {

							const encoding = "utf-8";
							const reader = new FileReader();
							reader.addEventListener(
								"load",
								function () {
									var $elmentParent = $(self.element).find('#' + file.id);
									var $process = $elmentParent.find('.process');
									var $icon = $elmentParent.find('.stt.mdi');
									var $processBar = $elmentParent.find('.process-bar');
									var $progressbar = $elmentParent.find('.progress-bar');
									var $progress = $elmentParent.find('.progress');
									$process.show();
									$progressbar.show();
									var complete = 100;
									$progressbar.css('width', complete + '%');
									// $icon.removeClass('mdi-loading').removeClass('mdi-spin').addClass('mdi-alert-circle');
									setTimeout(function () {
										$processBar.hide();
										$process.hide();
										$progressbar.hide();
										$icon.removeClass('mdi-loading').removeClass('mdi-spin').addClass('mdi-check-circle');
									}, 1000)


									num_finished += 1;
									list_file_uploaded.push({
										file: file,
										file_id: file.id,
										file_name: file.name,
										file_content: reader.result,
									});
									checkFinishInSequence();
								},
								false,
							);
							reader.readAsText(file, encoding)
						}
					}
					for (var i = 0; i < files.length; i++) {
						nextSequence(files[i]);
					}
				}
			}

			$btnNext.click(function () {
				// trigger event uploaded
				if (typeof self.onComplete == 'function') {
					self.onComplete(self, self.LIST_FILE_UPLOADED);
				}
			});

			this.triggerFormSubmit = function (e, files) {
				e.preventDefault();

				if (files.length == 0) return;

				// upload only file
				files = [files[0]];

				if (files.length > self.MAX_ROW_NUM_ATTACHED_FILE) {
					window.alert(sateraitoAI.MyLang.getMsg('NUMBER_OF_FILES_UPLOADED_IS_OVER_THE_ALLOWED_LIMIT'))
					// Swal.fire({
					//   title: sateraitoAI.MyLang.getMsg('NUMBER_OF_FILES_UPLOADED_IS_OVER_THE_ALLOWED_LIMIT'),
					//   text: "",
					//   icon: "error",
					//   showCancelButton: false,
					//   confirmButtonText: sateraitoAI.MyLang.getMsg('OK'),
					//   cancelButtonText: sateraitoAI.MyLang.getMsg('CANCEL')
					// }).then(function (result) {
					// })
					return false;
				}

				// generate id to files
				for (var i = 0; i < files.length; i++) {
					files[i].id = 'file_' + sateraitoAI.Utils.createNewId();
				}

				sateraitoAI.console.log('triggerFormSubmit', files);

				self.renderFileLoaders(files);

				self.stateLoading(true)
				self.stateError(false)

				if (isAdvancedUpload) // ajax file upload for modern browsers
				{
					if (typeof self.handler == 'function') {
						self.handler(self, files, function () {
							self.resetState()
						})
					} else {
						self.resetState()
					}
				}
			};

			this.stateLoading = function (flag) {
				if (flag) {
					dropEl.classList.add('is-uploading')
				} else {
					dropEl.classList.remove('is-uploading')
				}
			}

			this.stateError = function (flag) {
				if (flag) {
					dropEl.classList.add('is-error')
				} else {
					dropEl.classList.remove('is-error')
				}
			}

			this.stateSuccess = function (flag) {
				if (flag) {
					dropEl.classList.add('is-success')
				} else {
					dropEl.classList.remove('is-success')
				}
			}

			this.resetState = function () {
				dropEl.classList.remove('is-error', 'is-success', 'is-uploading');
			}

			this.resetGUI = function () {
				self.resetState();
				$listUploading.html("");
				$btnNext.prop('disabled', true);
				$(input).val(null);
			}

			// // automatically submit the dropEl on file select
			// input.addEventListener('change', function (e) {
			// 	self.triggerFormSubmit(e, e.target.files);
			// });
			$(input).change(function (e) {
				self.triggerFormSubmit(e, e.target.files);
			})

			$(dropEl).find('.trigger_file').click(function (e) {
				// preventing the duplicate submissions if the current one is in progress
				if ($(dropEl).hasClass('is-uploading')) return false;

				input.click();
			});

			// drag&drop files if the feature is available
			if (isAdvancedUpload) {
				dropEl.classList.add('has-advanced-upload'); // letting the CSS part to know drag&drop is supported by the browser

				['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (event) {
					dropEl.addEventListener(event, function (e) {
						// preventing the unwanted behaviours
						e.preventDefault();
						e.stopPropagation();
					});
				});
				['dragover', 'dragenter'].forEach(function (event) {

					// preventing the duplicate submissions if the current one is in progress
					if ($(dropEl).hasClass('is-uploading')) return false;

					dropEl.addEventListener(event, function () {
						dropEl.classList.add('is-dragover');
					});
				});
				['dragleave', 'dragend', 'drop'].forEach(function (event) {

					// preventing the duplicate submissions if the current one is in progress
					if ($(dropEl).hasClass('is-uploading')) return false;

					dropEl.addEventListener(event, function () {
						dropEl.classList.remove('is-dragover');
					});
				});
				dropEl.addEventListener('drop', function (e) {

					// preventing the duplicate submissions if the current one is in progress
					if ($(dropEl).hasClass('is-uploading')) return false;

					self.triggerFormSubmit(e, e.dataTransfer.files); // the files that were dropped
				});
			}

			this.resetState();
		}
	};

	/**
	 * TemplateInputContent
	 */
	var TemplateInputContent = {
		init: function (template_values) {
			var parentNode = $(modal).find('.content-item[data-content_type="template_input_content"]');
			var vHtml = '';
			vHtml += '    	<div class="template_input_list"></div>';
			vHtml += '			<div class="block-action-btn">';
			vHtml += '			<button type="button" class="btn btn-text-back st-btn-material-outline">';
			vHtml += '				<span class="mdi mdi-arrow-left"></span>';
			vHtml += '				<span>' + sateraitoAI.MyLang.getMsg("BUTTON_BACK") + '</span>';
			vHtml += '			</button>';
			vHtml += '			<button type="button" class="btn btn_save_template btn-filled st-btn-material">';
			vHtml += '				<span>' + sateraitoAI.MyLang.getMsg("AI_BUILDER_NEXT_STEP") + '</span>';
			vHtml += '			</button>';
			vHtml += '			</div>'

			$(parentNode).html(vHtml);

			var $templateList = $(parentNode).find('.template_input_list');
			var $btnSave = $(parentNode).find('.btn_save_template');
			var $btnBack = $(parentNode).find('.btn-text-back');
			$btnBack.click(function () {
				changeSectionInMenuRight("template_start_create");
			});
			$templateList.html("");

			var vHtml = '';
			if (typeof template_values != 'undefined') {
				for (var i = 0; i < template_values.length; i++) {
					vHtml += '<div class="template-item">'
					vHtml += '<div class="d-flex"><div class="mdi mdi-form-textbox"></div><input name="template_name" placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_TEMPLATE_NAME") + '" tabindex="-1" type="text" class="" value="' + template_values[i].template_name + '"></div>'
					vHtml += '<div class="d-flex"><div class="mdi mdi-code-block-tags"></div><textarea name="template_body" placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_TEMPLATE_CONTENT") + '" class="" cols="1" rows="15">' + template_values[i].template_body + '</textarea></div>'
					vHtml += '</div>'
				}
			} else {
				vHtml += '<div class="template-item">'
				vHtml += '<div class="d-flex"><div class="mdi mdi-form-textbox"></div><input type="text" name="template_name" placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_TEMPLATE_NAME") + '" tabindex="-1" class=""></div>'
				vHtml += '<div class="d-flex"><div class="mdi mdi-code-block-tags"></div><textarea placeholder="' + sateraitoAI.MyLang.getMsg("AI_BUILDER_TEMPLATE_CONTENT") + '" name="template_body" class="" cols="1" rows="15"></textarea></div>'
				vHtml += '</div>'
			}
			$templateList.html(vHtml);
			$btnSave.click(function () {
				var values = [];
				// validate template name
				var is_error = false;
				$templateList.find(".template-item").each(function () {
					var $template_name = $(this).find('input[name="template_name"]');
					var $template_body = $(this).find('textarea[name="template_body"]');
					if (!$template_name.val().trim()) {
						is_error = true;
						$template_name.focus().addClass("invalid");
						return false;
					}
					// if (!$template_body.val().trim()) {
					// 	is_error = true;
					// 	$template_body.focus().addClass("invalid");
					// 	return false;
					// }
					$template_name.removeClass("invalid");
					$template_body.removeClass("invalid");
					values.push({
						template_name: $template_name.val().trim(),
						template_body: $template_body.val().trim(),
					});
				})
				if (!is_error) {
					console.log("save templates", values)
					changeSectionInMenuRight("template_builder");
					new sateraitoAI.BuilderTemplate.init($(modal).find('.content-item[data-content_type="template_builder"]')[0], {
						template_name: values[0].template_name,
						template_body: values[0].template_body,
						buttonSaveMessage: sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_TEMPLATE"),
						onComplete: function (template) {

							on_submit_callback(template);
							// save_btn_process('ai_builder_popup_modal', template);
							// do action create template
							// self.addNewTemplate(template);
							// renderMenuTemplateList();

						}
					});
				}
			});
		}
	}

	var renderUI = function () {

		// renderMenuTemplateList();

		UploadField.renderAll($(modal).find('.content-item[data-content_type="template_import_file"]')[0], {
			onComplete: function (sender, list_files) {

				sateraitoAI.console.log("onComplete", sender, list_files);

				sender.resetGUI();

				changeSectionInMenuRight("template_input_content");
				var template_values = [];
				for (var i = 0; i < list_files.length; i++) {
					template_values.push({
						template_name: list_files[i].file_name.split('.')[0],
						template_body: list_files[i].file_content
					});
				}
				TemplateInputContent.init(template_values);

			}
		});

	}

	renderUI();

	// var content = $('#text_demo').val();
	// changeSectionInMenuRight("template_builder");
	// new sateraitoAI.BuilderTemplate.init($(modal).find('.content-item[data-content_type="template_builder"]')[0], {
	// 	template_name: "template name " + Math.random().toString(),
	// 	template_body: content,
	// 	buttonSaveMessage: sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_TEMPLATE"),
	// 	onComplete: function (template) {

	// 		// do action create template
	// 		self.addNewTemplate(template);
	// 		renderMenuTemplateList();
	// 	}
	// });

	return this;
};

sateraitoAI.showUserBuilderPopup = function (props, callback) {

	var self = this;

	this.props = {};
	for (var key in props) {
		this.props[key] = props[key];
	}

	var modal_id = "ai_user_builder_popup_modal";
	var createModalHtml = function () {
		if ($(document).find('#' + modal_id).length) {
			return;
		}

		var vHtml = '';
		// <!-- The Modal -->
		vHtml += '<div id="' + modal_id + '" class="sateraito_ai_modal st-ui modal-large sateraito_ai_builder">';

		// <!-- Modal content -->
		vHtml += '  <div class="modal-content">';
		vHtml += '		<div class="modal-header">';
		vHtml += '  	  <h2><i class="mdi mdi-code-block-tags"></i>' + sateraitoAI.MyLang.getMsg("AI_USER_BUILDER_PROMPT") + '</h2>';
		vHtml += '  	  <span class="close mdi mdi-close"></span>';
		vHtml += '  	</div>';

		// START modal-body
		vHtml += '  	<div class="modal-body">';
		vHtml += '    <div class="block-wrap">'

		// START menu left
		vHtml += '    <div class="menu-left">'

		// vHtml += '  	<div class="menu-header">';
		// vHtml += '  		<button type="button" class="btn btn_create_template st-btn-material">' + sateraitoAI.MyLang.getMsg("AI_BUILDER_CREATE_TEMPLATE") + '</button>';
		// vHtml += '  	</div>';
		vHtml += '  	<ul class="menu_template_list">';
		vHtml += '  	</ul>';

		vHtml += '  	</div>';
		// END menu left

		// START menu right
		vHtml += '    <div class="menu-right">'

		// START template_builder
		vHtml += '    <div class="content-item template_builder" data-content_type="template_builder">';
		vHtml += '    </div>'
		// END template_builder


		vHtml += '  	</div>';
		// END menu right

		vHtml += '    <textarea name="template_prompt" cols="1" rows="20" style="display:none !important;"></textarea>'

		vHtml += '  	</div>';
		vHtml += '  	</div>';
		// END modal-body

		vHtml += '  	<div class="modal-footer">';
		vHtml += '  	  <button type="button" class="btn btn-cancel st-btn-material-outline">' + sateraitoAI.MyLang.getMsg("CLOSE") + '</button>';
		vHtml += '  	  <button type="button" class="btn btn-submit st-btn-material" disabled="disabled">' + sateraitoAI.MyLang.getMsg("AI_USER_BUILDER_SUBMIT") + '</button>';
		vHtml += '  	</div>';
		vHtml += '  </div>';
		vHtml += '</div>';
		$(document.body).append(vHtml);
	};

	createModalHtml();

	// Get the modal
	var modal = document.getElementById(modal_id);

	sateraitoAI.console.log(modal)

	// Get the <span> element that closes the modal
	var span = modal.getElementsByClassName("close")[0];

	// When the user clicks on the button, open the modal
	modal.style.display = "block";

	// When the user clicks on <span> (x), close the modal
	span.onclick = function () {
		modal.style.display = "none";
	};

	// When the user clicks anywhere outside of the modal, close it
	// window.onclick = function (event) {
	// 	if (event.target == modal) {
	// 		modal.style.display = "none";
	// 	}
	// };
	$(modal).click(function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	});

	let $btnSubmit = $(modal).find('.btn-submit');
	let $btnCancel = $(modal).find('.btn-cancel');
	let $menuRight = $(modal).find('.menu-right');
	let $menuTemplateList = $(modal).find('.menu_template_list');

	self.templateList = sateraitoAI.BuilderTemplate.getTemplateList();

	self.formBuilder = null;
	var renderMenuTemplateList = function () {
		var vHtml = '';
		$.each(self.templateList, function () {
			vHtml += '<li class="menu-template-item"><span class="mdi mdi-file-document"></span><span class="template-name">' + this.template_name + '</span></li>';
		});
		$menuTemplateList.html(vHtml);


		// fire event edit template
		$menuTemplateList.find('li').off('click');
		$menuTemplateList.find('li').on('click', function (e) {
			e.preventDefault();

			$btnSubmit.prop('disabled', false);

			var index = $(this).index();
			if (!$(this).hasClass('.menu-template-item')) {
				var index = $(this).closest('li.menu-template-item').index();
			}
			var currentTemplate = self.templateList[index];
			console.log("edit template ", index, currentTemplate)

			changeSectionInMenuRight("template_builder");
			self.formBuilder = new sateraitoAI.BuilderTemplate.initFormBuilder($(modal).find('.content-item[data-content_type="template_builder"]')[0], {
				template_name: currentTemplate.template_name,
				template_body: currentTemplate.template_body
			});
		});
	}

	var hideAllSectionInMenuRight = function (content_type) {
		$menuRight.find("> .content-item").hide();
	}
	hideAllSectionInMenuRight();

	var changeSectionInMenuRight = function (content_type) {
		hideAllSectionInMenuRight();
		$menuRight.find('> .content-item[data-content_type="' + content_type + '"]').show();
	}

	$btnCancel.click(function () {
		// hide modal
		modal.style.display = "none";
	})

	$btnSubmit.click(function () {
		var templateBody = self.formBuilder.getPrompt();
		callback(templateBody);
		// hide modal
		modal.style.display = "none";
	})

	var renderUI = function () {

		renderMenuTemplateList();
	}

	renderUI();

};

(function ($) {
	$.fn.DropdownPromptLabels = function (options) {

		// This is the easiest way to have default options.
		var settings = $.extend({
			value: ''
		}, options);

		let element = $(this);
		let self = this;
		console.log(element);

		let createNewRecordLabelHtml = function (label) {
			if (typeof label === 'undefined') {
				label = {};
			}
			let label_name = label.label_name ? label.label_name : '';
			let bg_color = label.bg_color ? label.bg_color : '#2196F3';
			let text_color = label.text_color ? label.text_color : '#ffffff';
			let vHtml = '';
			vHtml += '<li>';
			if (self.value == label.value) {
				vHtml += '  <a class="dropdown-item checked" href="#" style="background-color: ' + bg_color + ';color: ' + text_color + ';" data-value="' + label.value + '">';
			} else {
				vHtml += '  <a class="dropdown-item" href="#" style="background-color: ' + bg_color + ';color: ' + text_color + ';" data-value="' + label.value + '">';
			}
			vHtml += '    <span class="drop-item-lbl">' + label_name + '</span>';
			vHtml += '  </a>';
			vHtml += '</li>';
			return vHtml;
		};
		let createDefaultRecordHtml = function () {
			let vHtml = '';
			vHtml += '				<div class="break-option" style="margin-bottom:5px;"></div>';
			vHtml += '				<li class="skip-attach-event button_clear_label"><a class="dropdown-item custom-lbl justify-content-center st-btn-material-outline" href="#">';
			vHtml += '					<span class="drop-item-lbl">' + sateraitoAI.MyLang.getMsg('AI_BUILDER_CLEAR_LABEL') + '</span>';
			vHtml += '				  </a></li>';
			vHtml += '				<li class="skip-attach-event button_create_new_label"><a class="dropdown-item custom-lbl justify-content-center st-btn-material-outline"  href="#">';
			vHtml += '					<span class="drop-item-lbl">' + sateraitoAI.MyLang.getMsg('AI_BUILDER_CREATE_LABEL') + '</span>';
			vHtml += '				  </a></li>';
			return vHtml;
		}

		let renderHtml = function () {
			let vHtml = '';
			vHtml += '<span class="mdi mdi-tag lbl-ico"></span>';
			vHtml += '<div class="dropdown_select_label form-group-label">';
			vHtml += '	<div class="custom-dropdown">';
			vHtml += '		<div class="dropdown">';
			vHtml += '			<button class="btn st-btn-material-outline dropdown-toggle" type="button" id="button_dropdown_select_label" data-bs-toggle="dropdown" aria-expanded="false">';
			vHtml += '				<span class="select_label_name">' + sateraitoAI.MyLang.getMsg('AI_BUILDER_SELECT_LABEL') + '</span>';
			vHtml += '			</button>';
			vHtml += '			<ul class="dropdown-menu" aria-labelledby="button_dropdown_select_label">';

			let labels = sateraitoAI.PromptLabel.getValue();
			labels.map(function (label) {
				label.value = label.label_name;
				vHtml += createNewRecordLabelHtml(label);
			});

			vHtml += createDefaultRecordHtml();
			vHtml += '			</ul>';
			vHtml += '		</div>';
			vHtml += '	</div>';
			vHtml += '</div>';
			element.html(vHtml);
		}

		self.setValue = function (value) {
			self.value = value;
			let label = sateraitoAI.PromptLabel.getById(value);
			if (!label) {
				label = {};
			}
			let label_name = label.label_name ? label.label_name : '';
			let bg_color = label.bg_color ? label.bg_color : '#2196F3';
			let text_color = label.text_color ? label.text_color : '#ffffff';

			reset();

			let button_dropdown_select_label = element.find('#button_dropdown_select_label');
			let select_label_name = button_dropdown_select_label.find('span.select_label_name');
			button_dropdown_select_label.attr('style', 'background-color: ' + bg_color + ' !important;color: ' + text_color + ' !important;');
			if (!value) {
				button_dropdown_select_label.attr('style', 'background-color: #f2f6fc !important; color: #595959 !important;');
				select_label_name.text(sateraitoAI.MyLang.getMsg('AI_BUILDER_SELECT_LABEL'));
			} else {
				select_label_name.text(label_name);
			}
		}

		self.getValue = function () {
			return self.value ? self.value: "";
		}

		let reset = function () {
			renderHtml();

			let $dropdownSelectLabel = $(element).find('.dropdown_select_label');
			// self.$btnDropdownSelectLabel = self.$dropdownSelectLabel.find('.button_dropdown_select_label');
			$dropdownSelectLabel.off('click');
			$dropdownSelectLabel.on('click', 'ul.dropdown-menu li a', function () {
				console.log(this);
				if ($(this).closest('.button_create_new_label').length) {
					sateraitoAI.showLabelManagePopup({
						onSubmit: function () {
							reset();
						}
					});
				} else {
					// select label
					let value = $(this).data('value');
					self.setValue(value);
				}
			});
		}
		self.setValue(settings.value);

		return this;

	};
})(jQuery);

