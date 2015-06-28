var userInfoModule = angular.module('UserInfoModule', []);

userInfoModule.controller('UserInfoCtrl', ['$scope', function ($scope) {
    $scope.userInfo = {
        email: "raimonfuns@163.com",
        password: "632330",
        autoLogin: true
    };
    $scope.getFromData = function () {
        console.log($scope.userInfo);
    }
    $scope.setFromData = function () {
        $scope.userInfo = {
            email: "raimon@163.com",
            password: "123123",
            autoLogin: false
        }
    }
    $scope.resetForm = function () {
        $scope.userInfo = {
            email: "raimonfuns@163.com",
            password: "632330",
            autoLogin: true
        };
    }
}]);