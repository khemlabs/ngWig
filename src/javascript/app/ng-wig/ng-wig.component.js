const TABKEY = 9;
const ENTERKEY = 13;

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
	controller: function($scope, $element, $q, $attrs, $window, $document, $mdDialog, __env, fileService, ngWigToolbar) {
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

		this.execCommand = (command, options) => {
			if (this.editMode) return false;

			if (
				command !== 'insertVideo' &&
				$document[0].queryCommandSupported &&
				!$document[0].queryCommandSupported(command)
			) {
				throw `The command "${command}" is not supported`;
			}

			if (command == 'insertImage') {
				fileService.openDialogConfirm(
					null,
					$mdDialog,
					this.spanish ? 'Confirmar' : 'Confirm',
					this.spanish
						? '¿Desea utilizar el servicio de imágenes de Khemlabs?'
						: 'Do you want to use the Khemlabs image service?',
					'',
					this.spanish ? 'Si' : 'Yes',
					'No',
					confirmed => {
						if (confirmed) {
							fileService.openDialog(null, $mdDialog, { path: 'files/image', type: 'image' }, token => {
								if ($container.length) $container[0].focus();
								this.beforeExecCommand({ command, options });
								options = `${__env.apiDomain}files/image/${token}`;
								$document[0].execCommand('insertHtml', false, `<img src="${options}"/>`);
								this.afterExecCommand({ command, options });
							});
							return;
						}
						return this.fileCommand(command, options);
					}
				);
				return;
			}

			if (command == 'insertVideo') {
				fileService.openDialogConfirm(
					null,
					$mdDialog,
					this.spanish ? 'Confirmar' : 'Confirm',
					this.spanish
						? '¿Desea utilizar el servicio de videos de Khemlabs?'
						: 'Do you want to use the Khemlabs video service?',
					'',
					this.spanish ? 'Si' : 'Yes',
					'No',
					confirmed => {
						if (confirmed) {
							fileService.openDialog(null, $mdDialog, { path: 'files/video', type: 'video' }, token => {
								if ($container.length) $container[0].focus();
								this.beforeExecCommand({ command: command, options: options });
								options = `${__env.apiDomain}files/video/${token}`;
								$document[0].execCommand(
									'insertHtml',
									false,
									`<br><br><video style="width: 560px; height: 315px" src="${options}"></video><br><br>`
								);
								this.afterExecCommand({ command: command, options: options });
							});
							return;
						}
						options = $window.prompt(
							this.spanish
								? 'Por favor ingrese el ID del video de youtube'
								: 'Please enter the ID of the youtube video',
							''
						);
						if (!options) return;
						console.log(options);
						$document[0].execCommand(
							'insertHtml',
							false,
							`<br><br><iframe style="width: 560px; height: 315px" src="https://www.youtube.com/embed/${options}" frameborder="0" encrypted-media" allowfullscreen=""></iframe><br><br>`
						);
						this.afterExecCommand({ command, options });
					}
				);
				return;
			}

			if (command === 'createlink') return this.fileCommand(command, options);

			this._execCommand(command, options);
		};

		this.fileCommand = (command, options) => {
			options = $window.prompt(this.spanish ? 'Por favor ingrese la URL' : 'Please enter the URL', 'http://');
			if (!options) return;
			this._execCommand(command, options);
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

		this.$onInit = () => {
			this.toolbarButtons = ngWigToolbar.getToolbarButtons(this.buttons && string2array(this.buttons));

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
