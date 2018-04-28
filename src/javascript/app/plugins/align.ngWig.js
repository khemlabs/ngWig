'use strict';

const bindings = {
	execCommand: '=',
	editMode: '=',
	disabled: '='
};

function nextNode(node) {
	if (node.hasChildNodes()) return node.firstChild;
	while (node && !node.nextSibling) {
		node = node.parentNode;
	}
	if (!node) return null;
	return node.nextSibling;
}

function getRangeSelectedNodes(range) {
	let node = range.startContainer;
	let endNode = range.endContainer;

	// Special case for a range that is contained within a single node
	if (node == endNode) return [node];

	// Iterate nodes until we hit the end container
	let rangeNodes = [];
	while (node && node != endNode) {
		rangeNodes.push((node = nextNode(node)));
	}

	// Add partially selected nodes at the start of the range
	node = range.startContainer;
	while (node && node != range.commonAncestorContainer) {
		rangeNodes.unshift(node);
		node = node.parentNode;
	}

	return rangeNodes;
}

function getSelectedNodes() {
	if (window.getSelection) {
		const sel = window.getSelection();
		if (!sel.isCollapsed) {
			return getRangeSelectedNodes(sel.getRangeAt(0));
		}
	}
	return [];
}

const template = function template(icon) {
	return `<button ng-click="$ctrl.align()" type="button" ng-disabled="$ctrl.editMode || $ctrl.disabled" class="nw-button" title="{{$ctrl.title}}"><i class="material-icons md-dark">${icon}</i></button>`;
};

const align = function align(parent, _align) {
	parent.execCommand('formatblock', 'div');
	const nodes = getSelectedNodes();
	if (nodes.length == 1) {
		const listId = window.getSelection().focusNode.parentNode;
		angular.element(listId).attr('style', 'text-align: ' + _align);
		return;
	}
	nodes.forEach(node => angular.element(node).attr('style', 'text-align:' + _align));
};

angular
	.module('ngWig')
	.config([
		'ngWigToolbarProvider',
		function(ngWigToolbarProvider) {
			ngWigToolbarProvider.addCustomButton('left', 'nw-left-button');
			ngWigToolbarProvider.addCustomButton('center', 'nw-center-button');
			ngWigToolbarProvider.addCustomButton('right', 'nw-right-button');
		}
	])
	.component('nwLeftButton', {
		bindings: bindings,
		template: template('format_align_left'),
		controller: function controller($rootScope) {
			const trans = $rootScope.ngWigTranslations.align || {};
			this.title = trans.left || 'left';
			this.align = () => align(this);
		}
	})
	.component('nwCenterButton', {
		bindings: bindings,
		template: template('format_align_center', 'center'),
		controller: function controller($rootScope) {
			const trans = $rootScope.ngWigTranslations.align || {};
			this.title = trans.center || 'center';
			this.align = () => align(this);
		}
	})
	.component('nwRightButton', {
		bindings: bindings,
		template: template('format_align_right', 'right'),
		controller: function controller($rootScope) {
			const trans = $rootScope.ngWigTranslations.align || {};
			this.title = trans.right || 'right';
			this.align = () => align(this);
		}
	});
