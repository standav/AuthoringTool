function MainController($scope, $rootScope, $http, $gloriaLocale) {

	$rootScope.titleLoaded = false;
	
	$gloriaLocale.loadResource('lang', 'title', function() {
		$rootScope.titleLoaded = true;
	});
	
	$scope.init = function(then) {
		var url = 'conf/env.json';

		return $http({
			method : "GET",
			url : url,
			cache : false
		}).success(function(data) {
			$scope.options = data;

			if (then != undefined) {
				then();
			}
		}).error(function() {
			alert("Options resource problem!");
		});
	};

	$scope.init(function() {
		if ($scope.options['navbar']) {
			$scope.navbarHtml = "base/html/navbar.html";
		}
	});
}