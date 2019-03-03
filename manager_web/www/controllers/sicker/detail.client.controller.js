'use strict';
angular.module('YYWeb').controller('SickerDetailController',
    ['$scope', '$stateParams', 'GlobalEvent', '$state', 'Auth', 'MemberService',
      function ($scope, $stateParams, GlobalEvent, $state, Auth, MemberService) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }


        function loadMember(callback){
          MemberService.getDetail({member_id: $scope.pageConfig.member_id}, function(err, data){
            if(err){
              $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
              return callback();
            }

            console.log(data.member);

            if(data.member){
              $scope.pageConfig.member = {
                open_id: data.member.open_id,
                nickname: data.member.nickname,
                IDCard: data.member.IDCard,
                cardType: MemberService.translateCardType(data.member.card_type),
                cardNumber: data.member.card_number || '--',
                mobile: data.member.mobile_phone || '--',
                wechatInfo: data.member.wechat_info || {}
              };
            }
            return callback();
          });
        }

        $scope.pageConfig = {
          navIndexes: [1, 5],
          member_id: '',
          member: {},
        };


        function init() {
          $scope.pageConfig.member_id = $stateParams.id;
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadMember(function(){
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
