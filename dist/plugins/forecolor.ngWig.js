'use strict';

angular.module('ngWig').config(['ngWigToolbarProvider', function (ngWigToolbarProvider) {
	ngWigToolbarProvider.addCustomButton('forecolor', 'nw-forecolor-button');
}]).component('nwForecolorButton', {
	bindings: {
		execCommand: '=',
		editMode: '=',
		disabled: '='
	},
	template: '<button colorpicker type="button" ng-model="fontcolor" ng-disabled="$ctrl.editMode || $ctrl.disabled" colorpicker-position="right" class="nw-button font-color" title="{{$ctrl.title}}"></button>',
	controller: ['$rootScope', '$scope', function controller($rootScope, $scope) {
		var _this = this;

		console.log($rootScope.ngWigTranslations);
		this.title = $rootScope.ngWigTranslations.forecolor || 'Font Color';
		$scope.$on('colorpicker-selected', function ($event, color) {
			_this.execCommand('foreColor', color.value);
		});
	}]
});
//# sourceMappingURL=forecolor.ngWig.js.map
