angular
	.module('ngWig')
	.config([
		'ngWigToolbarProvider',
		function(ngWigToolbarProvider) {
			ngWigToolbarProvider.addCustomButton('forecolor', 'nw-forecolor-button');
		}
	])
	.component('nwForecolorButton', {
		bindings: {
			execCommand: '=',
			editMode: '=',
			disabled: '='
		},
		template:
			'<button colorpicker type="button" ng-model="fontcolor" ng-disabled="$ctrl.editMode || $ctrl.disabled" colorpicker-position="right" class="nw-button font-color" title="{{$ctrl.title}}"></button>',
		controller: function($rootScope, $scope) {
			console.log($rootScope.ngWigTranslations);
			this.title = $rootScope.ngWigTranslations.forecolor || 'Font Color';
			$scope.$on('colorpicker-selected', ($event, color) => {
				this.execCommand('foreColor', color.value);
			});
		}
	});
