'use strict';

var bindings = {
	execCommand: '=',
	editMode: '=',
	disabled: '='
};

function nextNode(node) {
	if (node.hasChildNodes()) {
		return node.firstChild;
	} else {
		while (node && !node.nextSibling) {
			node = node.parentNode;
		}
		if (!node) {
			return null;
		}
		return node.nextSibling;
	}
}

function getRangeSelectedNodes(range) {
	var node = range.startContainer;
	var endNode = range.endContainer;

	// Special case for a range that is contained within a single node
	if (node == endNode) {
		return [node];
	}

	// Iterate nodes until we hit the end container
	var rangeNodes = [];
	while (node && node != endNode) {
		rangeNodes.push(node = nextNode(node));
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
		var sel = window.getSelection();
		if (!sel.isCollapsed) {
			return getRangeSelectedNodes(sel.getRangeAt(0));
		}
	}
	return [];
}

var template = function template(icon, title) {
	return '<button ng-click="$ctrl.align()" type="button" ng-disabled="$ctrl.editMode || $ctrl.disabled" class="nw-button" title="' + title + '"><i class="material-icons md-dark">' + icon + '</i></button>';
};

var align = function align(parent, _align) {
	parent.execCommand('formatblock', 'div');
	var nodes = getSelectedNodes();
	if (nodes.length == 1) {
		var listId = window.getSelection().focusNode.parentNode;
		angular.element(listId).attr('style', 'text-align: ' + _align);
		return;
	}
	nodes.forEach(function (node) {
		angular.element(node).attr('style', 'text-align:' + _align);
	});
};

angular.module('ngWig').config(['ngWigToolbarProvider', function (ngWigToolbarProvider) {
	ngWigToolbarProvider.addCustomButton('left', 'nw-left-button');
	ngWigToolbarProvider.addCustomButton('center', 'nw-center-button');
	ngWigToolbarProvider.addCustomButton('right', 'nw-right-button');
}]).component('nwLeftButton', {
	bindings: bindings,
	template: template('format_align_left', 'left'),
	controller: function controller() {
		var _this = this;
		this.align = function () {
			return align(_this, 'left');
		};
	}
}).component('nwCenterButton', {
	bindings: bindings,
	template: template('format_align_center', 'center'),
	controller: function controller() {
		var _this = this;
		this.align = function () {
			return align(_this, 'center');
		};
	}
}).component('nwRightButton', {
	bindings: bindings,
	template: template('format_align_right', 'right'),
	controller: function controller() {
		var _this = this;
		this.align = function () {
			return align(_this, 'right');
		};
	}
});
//# sourceMappingURL=formats.ngWig.js.map
//# sourceMappingURL=align.ngWig.js.map
//# sourceMappingURL=align.ngWig.js.map
//# sourceMappingURL=align.ngWig.js.map
//# sourceMappingURL=align.ngWig.js.map
