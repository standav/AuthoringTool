toolbox.service('$gloriaNav', function($http) {

	var menus = [];
	var objMenus = [];
	var initDone = false;

	var afterSuccess = [];

	var gNav = {

		init : function() {
			var url = 'conf/navbar.json';
			return $http({
				method : "GET",
				url : url,
				cache : false
			}).success(function(data) {
				for ( var key in data) {

					var menu = data[key];
					menu.name = key;

					menus.push(menu);
				}

				objMenus = data;

				initDone = true;

				afterSuccess.forEach(function(then) {
					if (then != undefined) {
						then();
					}
				});

			}).error(function() {
				alert("Navbar resource problem!");
			});
		},
		getMenu : function(name) {
			return objMenus[name];
		},
		getMenusArray : function() {
			return menus;
		},
		after : function(then) {
			if (!initDone) {
				afterSuccess.push(then);
			} else {
				then();
			}
		}
	};

	return gNav;
});

toolbox.run(function($gloriaLocale, $gloriaNav, $rootScope) {
	
	$rootScope.navReady = false;
	
	$gloriaLocale.loadResource('lang', 'navbar', function() {
		$gloriaNav.after(function() {
			$rootScope.navReady = true;
		});
		$gloriaNav.init();
	});
});

function NavbarCtrl($scope, $http, $location, $window, $gloriaLocale,
		$gloriaNav) {

	$scope.navClass = function(menu) {
		var currentRoute = $location.path();

		var cl = '';

		if ($gloriaNav.getMenu(menu).href != undefined) {
			cl = $gloriaNav.getMenu(menu).href.path === currentRoute ? 'active'
					: '';
		} else {
			if ($gloriaNav.getMenu(menu).child != undefined) {
				cl += ' dropdown';

				$gloriaNav.getMenu(menu).child.forEach(function(child) {
					if (child.href != undefined) {
						cl += ' '
								+ (child.href.path === currentRoute ? 'active'
										: '');
					}
				});
			}
		}

		return cl;
	};

	$scope.linkClass = function(menu) {
		var cl = '';

		if ($gloriaNav.getMenu(menu).child != undefined) {
			cl = 'dropdown-toggle';
		}

		return cl;
	};

	$scope.childClass = function(type) {
		if (type == 'header') {
			return 'nav-header';
		} else if (type == 'divider') {
			return 'divider';
		}

		return '';
	};

	$scope.changePath = function(href) {
		if (href != undefined) {

			if (href.app != undefined) {
				$window.location.hash = '';
				$window.location.pathname = href.app;
			}

			if (href.url != undefined) {
				$window.location.href = href.url;
			}

			if (href.path != undefined) {
				$location.path(href.path);
			}
		}
	};

	$gloriaNav.after(function() {
		$scope.menus = $gloriaNav.getMenusArray();
	});
}