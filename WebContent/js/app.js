'use strict';

/* App Module */

var toolbox = angular.module('toolbox', [ 'ngCookies', 'ngRoute', 'ngAnimate',
		'gloria.locale', 'gloria', 'ui.bootstrap' ]);

function loadDependencies($q, $rootScope, dependencies) {
	var deferred = $q.defer();

	// Load the dependencies
	$script(dependencies, function() {
		// all dependencies have now been loaded by so
		// resolve the
		// promise
		$rootScope.$apply(function() {
			deferred.resolve();
		});
	});

	return deferred.promise;
}

toolbox.config([
		'$routeProvider',
		function($routeProvider) {

			$routeProvider.when(
					'/experiments/template',
					{
						templateUrl : 'partials/template.html',
						resolve : {
							deps : function($q, $rootScope) {
								return loadDependencies($q, $rootScope,
										[ 'js/experiment/main.js' ]);
							}
						}
					}).otherwise({
				redirectTo : '/experiments/template'
			});
		} ]);

toolbox.filter('utc', [ function() {
	return function(date) {
		if (angular.isNumber(date)) {
			date = new Date(date);
		}
		return new Date(date.getUTCFullYear(), date.getUTCMonth(), date
				.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date
				.getUTCSeconds());
	};
} ]);

toolbox.directive('jtooltip', function() {
	return {
		// Restrict it to be an attribute in this case
		restrict : 'A',
		// responsible for registering DOM listeners as well as updating the DOM
		link : function(scope, element, attrs) {
			$(element).popover(scope.$eval(attrs.jtooltip));
			$(element).popover('show');
		}
	};
});
