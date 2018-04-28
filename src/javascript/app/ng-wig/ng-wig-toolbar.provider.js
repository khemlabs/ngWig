angular.module('ngWig').provider('ngWigToolbar', function() {
	this.translations = {
		unorderedlist: 'Unordered List',
		orderedlist: 'Ordered List',
		bold: 'Bold',
		italic: 'Italic',
		link: 'Link'
	};

	const buttonLibrary = {
		unorderedlist: {
			name: 'unorderedlist',
			command: 'insertunorderedlist',
			styleClass: 'list-ul'
		},
		orderedlist: {
			name: 'orderedlist',
			command: 'insertorderedlist',
			styleClass: 'list-ol'
		},
		bold: {
			name: 'bold',
			command: 'bold',
			styleClass: 'bold'
		},
		italic: {
			name: 'italic',
			command: 'italic',
			styleClass: 'italic'
		},
		link: {
			name: 'link',
			command: 'createlink',
			styleClass: 'link'
		}
	};

	let defaultButtonsList = ['unorderedlist', 'orderedlist', 'bold', 'italic', 'link'];

	const isButtonActive = function() {
		return !!this.command && document.queryCommandState(this.command);
	};

	this.setTranslations = translations => {
		if (typeof translations != 'object') {
			throw '[setStranslations] Argument "translations" should be an object';
		}
		const keys = Object.keys(translations);
		keys.forEach(t => (this.translations[t] = translations[t]));
	};

	this.setButtons = buttons => {
		if (!angular.isArray(buttons)) {
			throw 'Argument "buttons" should be an array';
		}
		defaultButtonsList = buttons;
	};

	this.addStandardButton = (name, title, command, styleClass) => {
		if (!name || !title || !command) {
			throw 'Arguments "name", "title" and "command" are required';
		}
		styleClass = styleClass || '';
		this.translations[name] = title;
		buttonLibrary[name] = { name, command, styleClass };
		defaultButtonsList.push(name);
	};

	this.addCustomButton = (name, pluginName) => {
		if (!name || !pluginName) {
			throw 'Arguments "name" and "pluginName" are required';
		}
		buttonLibrary[name] = { pluginName, isComplex: true };
		defaultButtonsList.push(name);
	};

	this.$get = function() {
		return {
			getTranslations: () => this.translations,
			getToolbarButtons: list => {
				let toolbarButtons = [];
				(list || defaultButtonsList).forEach(buttonKey => {
					if (!buttonLibrary[buttonKey]) {
						throw 'There is no "' + buttonKey + '" in your library. Possible variants: ' + Object.keys(buttonLibrary);
					}
					let button = angular.copy(buttonLibrary[buttonKey]);
					button.isActive = isButtonActive;
					toolbarButtons.push(button);
				});
				return toolbarButtons;
			}
		};
	};
});
