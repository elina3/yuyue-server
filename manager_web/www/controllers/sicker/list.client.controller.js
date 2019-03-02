'use strict';
angular.module('YYWeb').controller('SickerListController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth', 'MemberService',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth, MemberService) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }


      function loadMembers(callback){
        MemberService.getList({
          search_key: $scope.pageConfig.searchKey,
          current_page: $scope.pageConfig.currentPage,
          limit: $scope.pageConfig.limit
        }, function(err, data){
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
          }

          console.log(data.members);
          if(data.members && data.members.length > 0){
            $scope.pageConfig.memberList = data.members.map(function(item){
              return {
                id: item._id,
                open_id: item.open_id,
                nickname: item.nickname || '--',
                IDCard: item.IDCard || '--',
                cardType: MemberService.translateCardType(item.card_type) || '--',
                cardNumber: item.card_number,
              };
            });
          }

          $scope.pageConfig.pagination.totalCount = data.total_count;
          $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);

        });
        return callback();
      }

      $scope.pageConfig = {
        navIndexes: [1, 5],
        memberList: [],
        searchKey: '',
        pagination: {
          currentPage: 1,
          limit: 2,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            loadMembers(function(){
              $scope.$emit(GlobalEvent.onShowLoading, false);
            });
          }
        }
      };

      $scope.search = function(){
        $scope.pageConfig.currentPage = 1;
        $scope.pageConfig.totalCount = 0;
        $scope.pageConfig.memberList = [];
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadMembers(function(){
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      };


      function init() {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadMembers(function(){
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      }

      init();
    }]);
