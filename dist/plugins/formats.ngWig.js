'use strict';

angular.module('ngWig').config(['ngWigToolbarProvider', function (ngWigToolbarProvider) {
	ngWigToolbarProvider.addCustomButton('formats', 'nw-formats-button');
}]).component('nwFormatsButton', {
	bindings: {
		execCommand: '=',
		editMode: '=',
		disabled: '='
	},
	template: '<select class="nw-select" \n                           ng-model="$ctrl.format" \n                           ng-change="$ctrl.execCommand(\'formatblock\', $ctrl.format.value)" \n                           ng-options="format.name for format in $ctrl.formats" \n                           ng-disabled="$ctrl.editMode || $ctrl.disabled"></select>',
	controller: ['$rootScope', function controller($rootScope) {
		var trans = $rootScope.ngWigTranslations.formats || {};
		this.formats = [{ name: trans.text || 'Normal text', value: '<p>' }, { name: trans.h1 || 'Header 1', value: '<h1>' }, { name: trans.h2 || 'Header 2', value: '<h2>' }, { name: trans.h3 || 'Header 3', value: '<h3>' }];

		this.format = this.formats[0];
	}]
});
//# sourceMappingURL=formats.ngWig.js.map
