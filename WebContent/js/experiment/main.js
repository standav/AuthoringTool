'use strict';

function TemplateCtrl(GloriaAPI, $scope, $timeout, $gloriaLocale, $routeParams) {

	$gloriaLocale.loadResource('template');

	$scope.requestRid = $routeParams.rid;
	$scope.reservationEnd = false;
	$scope.notAuthorized = false;
	$scope.serverDown = false;
	$scope.infoUpdated = false;
	$scope.wrongReservation = false;
	$scope.reservationActive = false;
	$scope.reservationObsolete = false;

	/*
	 * GloriaAPI.getActiveReservations(function(data) {
	 * data.forEach(function(element) { if ($scope.rid == undefined &&
	 * element.experiment == "SOLAR") {
	 * 
	 * if (element.status == "READY") { $scope.rid = element.reservationId;
	 * $scope.reservationActive = true; $scope.infoUpdated = true; } else if
	 * (element.status == "SCHEDULED") { $scope.preRid = element.reservationId;
	 * $scope.resTimer = $timeout($scope.onReservation, 1000); } } }); if
	 * ($scope.rid == undefined) { $scope.rid = -1; $scope.reservationActive =
	 * false; } }, function(error) { $scope.rid = -1; $scope.reservationActive =
	 * false; $scope.infoUpdated = true; }, function() { $scope.notAuthorized =
	 * true; });
	 */
	$scope.onReservation = function() {
		GloriaAPI.getReservationInformation($scope.preRid, function(data) {

			if (data.status == 'READY') {
				$scope.rid = $scope.preRid;
				$scope.reservationActive = true;
				$scope.infoUpdated = true;
			} else if (data.status == "SCHEDULED") {
				$scope.resTimer = $timeout($scope.onReservation, 1000);
			} else if (data.status == "OBSOLETE") {
				$scope.rid = -1;
				$scope.reservationObsolete = true;
				$scope.reservationActive = false;				
				$scope.infoUpdated = true;				
			}

		}, function(error) {
			$scope.rid = -1;
			$scope.reservationObsolete = false;
			$scope.reservationActive = false;
			$scope.infoUpdated = true;
		}, function() {
			$scope.notAuthorized = true;
		});
	};

	$scope.onUnauth = function() {
		$scope.$emit('unauthorized');
	};

	$scope.onDown = function() {
		$scope.$emit('server down');
	};

	$scope.onTimeout = function() {
		$scope.reservationActive = false;
	};

	$scope.onDeviceProblem = function() {
		$scope.deviceProblem = true;
		$scope.reservationActive = false;
	};

	$scope.$watch('reservationEnd', function() {
		if ($scope.reservationEnd) {
			$scope.endTimer = $timeout($scope.onTimeout, 1500);
		}
	});

	$scope.$watch('notAuthorized', function() {
		if ($scope.notAuthorized) {
			$scope.unauthTimer = $timeout($scope.onUnauth, 1500);
		}
	});

	$scope.$watch('serverDown', function() {
		if ($scope.serverDown) {
			$scope.srvTimer = $timeout($scope.onDown, 1500);
		}
	});

	$scope.$on('$destroy', function() {
		$timeout.cancel($scope.endTimer);
		$timeout.cancel($scope.unauthTimer);
		$timeout.cancel($scope.srvTimer);
		$timeout.cancel($scope.resTimer);
	});

	if ($routeParams.rid != undefined) {
		$scope.preRid = parseInt($scope.requestRid);

		if (!isNaN($scope.preRid)) {
			$scope.onReservation();
		} else {
			$scope.wrongReservation = true;
		}
	} else {
		$scope.reservationActive = true;
	}
}