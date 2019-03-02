'use strict';

angular.module('YYWeb').controller('UserEditController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService', 'FileUploader', 'Config',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth, HospitalService, FileUploader, Config) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        let outpatientTypeOptions = [{id: '', text: '无'}, {id: 'expert', text: '专家门诊'}, {id: 'normal', text: '普通门诊'}];
        let roleOptions = [{id: 'admin', text: '管理员'}, {id: 'doctor', text: '医生'}, {id: 'pick_up', text: '取号人员'}, {id: 'financial', text: '财务专员'}];
        let terminalTypeOptions = [{id: 'manager', text: '管理端'},{id: 'doctor', text: '医生端'},{id: 'pick_up', text: '取号端'}];

        $scope.pageConfig = {
          navIndexes: [1, 0],
          departments: [],
          jobTitles: [],
          outpatient_types: outpatientTypeOptions,
          roles: roleOptions,
          clients: terminalTypeOptions,
          modulesDic: UserService.getAllPermission(),
          user: {}
        };

        var uploader=$scope.uploader=new FileUploader({
          queueLimit: 1,
          url: Config.uploadUrl,
          removeAfterUpload: true
        });/*实例化一个FileUploader对象*/
        uploader.autoUpload = true;
        uploader.filters.push({
          name: 'imageFilter',
          fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
          }
        });

        const ImageRootUrl = Config.imageUrl;

        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          console.log(response);
          console.log(status);
          console.log(headers);
          console.info('onSuccessItem');
          if(response.success){
            $scope.pageConfig.user.headUrl = ImageRootUrl+response.file_id;
            $scope.pageConfig.user.head_photo_key = response.file_id;
          }
        };
        uploader.onErrorItem = function(fileItem, response, status, headers){
          $scope.$emit(GlobalEvent.onShowAlert, '文件上传失败');
        };


        function toggleClientItem(client){
          client.selected = !client.selected;
          var currentSelectedIndex = $scope.pageConfig.user.selectedClientIds.indexOf(client.id);
          if(client.selected){
            if(currentSelectedIndex === -1){
              $scope.pageConfig.user.selectedClientIds.push(client.id);
            }
          }else{
            if(currentSelectedIndex >= 0){
              $scope.pageConfig.user.selectedClientIds.splice(currentSelectedIndex, 1);
            }
          }
        }
        $scope.toggleClient = toggleClientItem;

        $scope.toggleModule = function(moduleKey, moduleItem){
          if(moduleItem.require){
            return;
          }
          moduleItem.selected = !moduleItem.selected;
        };

        function saveOneUser(callback){
          let valid = UserService.userParamsByRole($scope.pageConfig.user.role.id, $scope.pageConfig.user);
          if(valid.err){
            return $scope.$emit(GlobalEvent.onShowAlert, valid.err.zh_message);
          }

          var hasModule = false;
          var permission = {};
          $scope.pageConfig.user.selectedClientIds.forEach(function(item) {
            if($scope.pageConfig.modulesDic[item]){
              var modules = $scope.pageConfig.modulesDic[item].filter(function(a){return a.selected;});
              if(modules.length > 0){
                hasModule = true;
                permission[item] = modules;
              }
            }
          });
          if(!hasModule){
            $scope.$emit(GlobalEvent.onShowAlert, '至少选择一个功能模块');
            return;
          }

          var params = JSON.parse(JSON.stringify($scope.pageConfig.user));

          params.role = params.role.id;
          params.outpatient_type = params.outpatientType && params.outpatientType.id;
          params.terminal_types = params.selectedClientIds;
          params.permission = permission;
          params.head_photo = $scope.pageConfig.user.head_photo_key;
          params.good_at = $scope.pageConfig.user.goodAt;

          $scope.$emit(GlobalEvent.onShowLoading, true);
          UserService.modifyUser({
            user_info: params,
            user_id: $scope.pageConfig.user._id,
            department_id: params.department.id,
            job_title_id: params.jobTitle.id
          }, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              $scope.$emit(GlobalEvent.onShowAlert, err);
              return;
            }
            $scope.$emit(GlobalEvent.onShowAlert, '保存成功！');
            console.log(err);
            console.log(data);

            return callback();
          });
        }

        $scope.saveUser = function(){
          saveOneUser(function(){
            $state.go('user_list');
          });
        };

        function loadDepartments(callback){
          HospitalService.getDepartments({}, function(err, data){
            if(err){
              console.log('加载科室失败',err);
              return callback(err);
            }

            if(data.departments){
              $scope.pageConfig.departments = data.departments.map(function(item){
                return {id: item._id, text: item.name};
              });
            }
            return callback();
          });
        }
        function loadJobTitles(callback){
          HospitalService.getJobTitles({}, function(err, data){
            if(err){
              console.log('加载职称失败',err);
              return callback(err);
            }

            if(data.job_titles){
              $scope.pageConfig.jobTitles = data.job_titles.map(function(item){
                return {id: item._id, text: item.name};
              });
            }
            return callback();
          });
        }

        function loadUser(userId, callback){
          UserService.getUserDetail({user_id: userId}, function(err, data){
            if(err){
              return callback(err);
            }

            let user = data.user;
            console.log(user);
            $scope.pageConfig.user = {
              _id: user._id,
              username: user.username,
              nickname: user.nickname,
              mobile_phone: user.mobile_phone ? parseInt(user.mobile_phone) : null,
              IDCard: user.IDCard,
              role: {id: user.role, text: UserService.translateUserRole(user.role)},
              outpatientType: {id: user.outpatient_type, text: UserService.translateOutpatientType(user.outpatient_type)},
              jobTitle: {id: user.job_title._id, text: user.job_title.name},
              department: {id: user.department._id, text: user.department.name},
              goodAt: user.good_at || '',
              brief: user.brief || '',
              headUrl: user.head_photo ? (ImageRootUrl + user.head_photo) : '',
              head_photo_key: user.head_photo,
              selectedClientIds: []
            };
            if(user.terminal_types && user.terminal_types.length > 0){
              $scope.pageConfig.clients.forEach(function(item){
                if(user.terminal_types.indexOf(item.id) >= 0){
                  item.selected = true;
                  $scope.pageConfig.user.selectedClientIds.push(item.id);

                  let permissionArray = user.permission[item.id].filter(function(permission){
                    return permission.selected;
                  }).map(function(selectedItem){
                    return selectedItem.text;
                  });
                  $scope.pageConfig.modulesDic[item.id].forEach(function(moduleItem){
                    if(permissionArray.indexOf(moduleItem.text) >= 0){
                      moduleItem.selected = true;
                    }else{
                      moduleItem.selected = false;
                    }
                  });
                }
              });
            }
            return callback();
          });
        }

        function init() {
          console.log('params.id:', $stateParams.id);

          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadDepartments(function(err){
            if(err){
              $scope.$emit(GlobalEvent.onShowLoading, false);
              return $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
            }

            loadJobTitles(function(err){
              if(err){
                $scope.$emit(GlobalEvent.onShowLoading, false);
                return $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
              }

              loadUser($stateParams.id, function(err){
                $scope.$emit(GlobalEvent.onShowLoading, false);
                if(err){
                  return $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
                }

                // toggleClientItem($scope.pageConfig.clients[0]);
              });
            });
          });



        }

        init();
      }]);
