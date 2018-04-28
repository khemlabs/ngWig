const TABKEY = 9;
const ENTERKEY = 13;

const isYoutubeVideo = url => {
	return (
		url.indexOf('https://youtu.be/') === 0 ||
		(url.indexOf('https://youtube.com/watch?v=') === 0 || options.indexOf('https://www.youtube.com/watch?v=') === 0)
	);
};

const getYoutubeID = url => {
	let id = url
		.replace('https://youtu.be/', '')
		.replace('https://youtube.com/watch?v=', '')
		.replace('https://www.youtube.com/watch?v=', '');
	if (id.indexOf('&') > 0) id = id.substring(0, id.indexOf('&'));
	return id;
};

angular.module('ngWig').component('ngWig', {
	bindings: {
		content: '=ngModel',
		options: '<?',
		onPaste: '&',
		buttons: '@',
		language: '@',
		beforeExecCommand: '&',
		afterExecCommand: '&',
		placeholder: '@?'
	},
	require: {
		ngModelController: 'ngModel'
	},
	templateUrl: 'ng-wig/views/ng-wig.html',
	controller: function(
		$rootScope,
		$scope,
		$element,
		$q,
		$attrs,
		$window,
		$document,
		$mdDialog,
		__env,
		fileService,
		ngWigToolbar
	) {
		this.translations = $rootScope.ngWigTranslations = {};

		this.addString = (ev, str) => {
			ev.preventDefault();
			if (!$scope.$ctrl.content) $scope.$ctrl.content = '';
			let $el = document.getElementById('nw-editor__src');
			const start = $el.selectionStart;
			const end = $el.selectionEnd;
			const first = $scope.$ctrl.content.substring(0, start);
			const last = $scope.$ctrl.content.substring(end);
			const selected = $scope.$ctrl.content.substring(start, end);
			if (str == '\t' && selected.indexOf('\n') >= 0) {
				str = `\t${selected.split('\n').join('\n\t')}`;
			}
			const content = `${first}${str}${last}`;
			$scope.$ctrl.content = content;
			setTimeout(() => {
				$el.focus();
				$el.selectionStart = $el.selectionEnd = start + 1;
			});
		};

		this.keyDown = ev => {
			if (ev.keyCode == ENTERKEY) return this.addString(ev, '\n');
			if (ev.keyCode == TABKEY) return this.addString(ev, '\t');
		};

		let $container = angular.element($element[0].querySelector('#ng-wig-editable'));

		this.spanish = this.language && this.language == 'spanish';

		//TODO: clean-up this attrs solution
		this.required = 'required' in $attrs;
		this.isSourceModeAllowed = 'sourceModeAllowed' in $attrs;
		this.editMode = false;

		$attrs.$observe('disabled', isDisabled => {
			this.disabled = isDisabled;
			$container.attr('contenteditable', !isDisabled);
		});
		this.isEditorActive = () => $container[0] === $document[0].activeElement;
		this.toggleEditMode = () => {
			this.editMode = !this.editMode;
			if ($window.getSelection().removeAllRanges) {
				$window.getSelection().removeAllRanges();
			}
		};

		this.execCommand = async (command, options) => {
			if (this.editMode) return false;

			if (
				command !== 'insertVideo' &&
				$document[0].queryCommandSupported &&
				!$document[0].queryCommandSupported(command)
			) {
				throw `The command "${command}" is not supported`;
			}

			// *************** INSERT IMAGE ***************

			if (command == 'insertImage') {
				// Function to add html
				const insertImage = () => {
					if ($container.length) $container[0].focus();
					this.beforeExecCommand({ command, options });
					$document[0].execCommand('insertHtml', false, `<img src="${options}"/>`);
					return this.afterExecCommand({ command, options });
				};
				// Ask if must upload image
				const upload = await this.askCommand({
					title: this.spanish ? 'Adjuntar imagen' : 'Upload image',
					text: this.spanish
						? '¿Desea subir una imagen o adjuntar un link de una imagen alojada en internet?'
						: 'Do you want to upload an image or attach an internet image?',
					ok: this.spanish ? 'Subir imagen' : 'Upload image',
					cancel: this.spanish ? 'Adjuntar link de imagen' : 'Attach image link'
				});
				// Must upload image
				if (upload) {
					const config = { path: 'files/image', type: 'image' };
					const token = await fileService.openDialog(null, $mdDialog, config);
					options = `${__env.apiDomain}files/image/${token}`;
					return insertImage();
				}
				// User wants to link a image
				const attached = await this.attachCommand(command, options, {
					title: this.spanish ? 'Adjuntar imagen' : 'Attach image',
					text: this.spanish ? 'Adjuntar una imagen de internet' : 'Attach an internet image',
					ok: this.spanish ? 'Adjuntar' : 'Attach',
					cancel: this.spanish ? 'Cancelar' : 'Cancel'
				});
				if (attached) return insertImage();
				return;
			}

			// *************** INSERT VIDEO ***************

			if (command == 'insertVideo') {
				// Function to add html
				const insertVideo = () => {
					this.beforeExecCommand({ command: command, options: options });
					options = `${__env.apiDomain}files/video/${token}`;
					$document[0].execCommand(
						'insertHtml',
						false,
						`<br><br><video controls style="width: 560px; height: 315px" src="${options}"></video><br><br>`
					);
					return this.afterExecCommand({ command: command, options: options });
				};
				// Ask must upload video
				const upload = await this.askCommand({
					title: this.spanish ? 'Adjuntar video' : 'Upload video',
					text: this.spanish
						? '¿Desea subir un video o adjuntar un link de un video alojada en internet (el mismo puede ser de youtube)?'
						: 'Do you want to upload a video or attach a internet video (it can be from youtube)?',
					ok: this.spanish ? 'Subir video' : 'Upload video',
					cancel: this.spanish ? 'Adjuntar link de video' : 'Attach video link'
				});
				// Must upload video
				if (upload) {
					const config = { path: 'files/video', type: 'video' };
					const token = await fileService.openDialog(null, $mdDialog, config);
					if ($container.length) $container[0].focus();
					return insertVideo();
				}
				// User wants to link a video
				const attached = await this.attachCommand(command, options, {
					title: this.spanish ? 'Adjuntar video' : 'Attach video',
					text: this.spanish
						? 'Adjuntar un link de un video (puede ser un link de youtube)'
						: 'Attach a video link (it can be a youtube link)',
					ok: this.spanish ? 'Adjuntar' : 'Attach',
					cancel: this.spanish ? 'Cancelar' : 'Cancel'
				});
				if (attached) {
					// Check if it is a youtube video
					console.log(options);
					// ===> It is a link to a video
					if (!isYoutubeVideo(options)) return insertVideo();
					// ===> IT IS A YOUTUBE VIDEO
					this.beforeExecCommand({ command: command, options: options });
					const id = getYoutubeID(options);
					console.log(`loading youtube video with id ${id}`);
					$document[0].execCommand(
						'insertHtml',
						false,
						`<br><br><iframe style="width: 560px; height: 315px" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="autoplay encrypted-media" allowfullscreen=""></iframe><br><br>`
					);
					return this.afterExecCommand({ command, options });
				}
				return;
			}

			// *************** CREATE LINK ***************

			if (command === 'createlink') {
				const uploaded = await this.attachCommand(command, options);
				return this._execCommand(command, options);
			}

			// *************** EXECUTE CUSTOM COMMAND ***************

			this._execCommand(command, options);
		};

		this.attachCommand = async (
			command,
			options,
			config = {
				title: this.spanish ? 'Adjuntar link' : 'Attach link',
				text: this.spanish ? 'Por favor ingrese la URL del link' : 'Please enter the link URL',
				ok: this.spanish ? 'Adjuntar' : 'Attach',
				cancel: this.spanish ? 'Cancelar' : 'Cancel'
			}
		) => {
			const confirm = $mdDialog
				.prompt()
				.title(config.title)
				.textContent(config.text)
				.ariaLabel(config.title)
				.initialValue('')
				.targetEvent(ev)
				.required(true)
				.ok(config.ok)
				.cancel(config.cancel);
			let options = null;
			try {
				options = await $mdDialog.show(confirm);
				return true;
			} catch (error) {
				return false;
			}
		};

		this.askCommand = async config => {
			const confirm = $mdDialog
				.confirm()
				.title(config.title)
				.textContent(config.text)
				.targetEvent(ev)
				.ok(config.ok)
				.cancel(config.cancel);
			try {
				const result = await $mdDialog.show(confirm);
				return true;
			} catch (error) {
				return false;
			}
		};

		this._execCommand = (command, options) => {
			this.beforeExecCommand({ command, options });

			// use insertHtml for `createlink` command to account for IE/Edge purposes, in case there is no selection
			const selection = $document[0].getSelection().toString();
			if (command === 'createlink' && selection === '') {
				$document[0].execCommand('insertHtml', false, `<a href="${options}">${options}</a>`);
			} else {
				$document[0].execCommand(command, false, options);
			}

			this.afterExecCommand({ command: command, options: options });

			// added temporarily to pass the tests. For some reason $container[0] is undefined during testing.
			if ($container.length) $container[0].focus();
		};

		this.translations = {};

		this.asd = 'test';

		this.$onInit = () => {
			this.toolbarButtons = ngWigToolbar.getToolbarButtons(this.buttons && string2array(this.buttons));

			this.translations = $rootScope.ngWigTranslations = ngWigToolbar.getTranslations();

			let placeholder = Boolean(this.placeholder);

			this.ngModelController.$render = () =>
				this.ngModelController.$viewValue
					? $container.html(this.ngModelController.$viewValue)
					: placeholder
						? $container.empty()
						: $container.html();

			$container.bind('blur keyup change focus click', () => {
				//view --> model
				if (placeholder && (!$container.html().length || $container.html() === '<br>')) $container.empty();
				this.ngModelController.$setViewValue($container.html());
				$scope.$applyAsync();
			});
		};

		$container.on('paste', event => {
			if (!$attrs.onPaste) {
				return;
			}

			let pasteContent;
			if (window.clipboardData && window.clipboardData.getData) {
				// IE
				pasteContent = window.clipboardData.getData('Text');
			} else {
				pasteContent = (event.originalEvent || event).clipboardData.getData('text/plain');
			}
			event.preventDefault();
			$q.when(this.onPaste({ $event: event, pasteContent })).then(pasteText => {
				pasteHtmlAtCaret(pasteText);
			});
		});
	}
});

//TODO: check the function
function string2array(keysString) {
	return keysString.split(',').map(Function.prototype.call, String.prototype.trim);
}

//TODO: put contenteditable helper into service
function pasteHtmlAtCaret(html) {
	let sel, range;
	if (window.getSelection) {
		sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0);
			range.deleteContents();

			// Range.createContextualFragment() would be useful here but is
			// non-standard and not supported in all browsers (IE9, for one)
			let el = document.createElement('div');
			el.innerHTML = html;
			let frag = document.createDocumentFragment(),
				node,
				lastNode;
			while ((node = el.firstChild)) {
				lastNode = frag.appendChild(node);
			}
			range.insertNode(frag);

			// Preserve the selection
			if (lastNode) {
				range = range.cloneRange();
				range.setStartAfter(lastNode);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	} else if (document.selection && document.selection.type != 'Control') {
		// IE < 9
		document.selection.createRange().pasteHTML(html);
	}
}
