angular
	.module('ngWig')
	.config([
		'ngWigToolbarProvider',
		function(ngWigToolbarProvider) {
			ngWigToolbarProvider.addCustomButton('formats', 'nw-formats-button');
		}
	])
	.component('nwFormatsButton', {
		bindings: {
			execCommand: '=',
			editMode: '=',
			disabled: '='
		},
		template: `<select class="nw-select" 
                           ng-model="$ctrl.format" 
                           ng-change="$ctrl.execCommand(\'formatblock\', $ctrl.format.value)" 
                           ng-options="format.name for format in $ctrl.formats" 
                           ng-disabled="$ctrl.editMode || $ctrl.disabled"></select>`,
		controller: function($rootScope) {
			const trans = $rootScope.ngWigTranslations.formats || {};
			this.formats = [
				{ name: trans.text || 'Normal text', value: '<p>' },
				{ name: trans.h1 || 'Header 1', value: '<h1>' },
				{ name: trans.h2 || 'Header 2', value: '<h2>' },
				{ name: trans.h3 || 'Header 3', value: '<h3>' }
			];

			this.format = this.formats[0];
		}
	});
