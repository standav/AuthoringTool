function MainController($scope, $rootScope, $http, $sce, $window, $location,
		$gloriaLocale) {

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

	$scope.gotoHub = function() {
		if ($scope.hubref != undefined) {

			if ($scope.hubref.app != undefined) {
				$window.location.hash = '';
				$window.location.pathname = $scope.hubref.app;
			}

			if ($scope.hubref.url != undefined) {
				$window.location.href = $scope.hubref.url;
			}

			if ($scope.hubref.path != undefined) {
				$location.path($scope.hubref.path);
			}
		}
	};

	$scope.init(function() {
		if ($scope.options['navbar']) {
			$scope.navbarHtml = "base/html/navbar.html";
		}

		if ($scope.options['hubref'] != undefined) {
			$scope.hubref = $scope.options['hubref'];			
		}
		
		if ($scope.options['headerHtml'] != undefined) {
			$scope.headerHtml = $scope.options['headerHtml'];
			$sce.trustAs($sce.HTML, $scope.headerHtml);
		}
		
		if ($scope.options['footerHtml'] != undefined) {
			$scope.footerHtml = $scope.options['footerHtml'];
			$sce.trustAs($sce.HTML, $scope.footerHtml);
		}		
	});
}