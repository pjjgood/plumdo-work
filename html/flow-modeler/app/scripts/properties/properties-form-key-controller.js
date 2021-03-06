/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

angular.module('flowableModeler').controller('FlowableFormKeyDisplayCtrl',
  ['$scope', '$modal', '$http', 'editorManager', function ($scope, $modal, $http, editorManager) {

    if ($scope.property && $scope.property.value) {
      $scope.form={'name':$scope.property.value};
    }

  }]);

angular.module('flowableModeler').controller('FlowableFormKeyCtrl',
  ['$scope', '$modal', '$http', function ($scope, $modal, $http) {

    // Config for the modal window
    var opts = {
      template: 'views/properties/form-key-popup.html',
      scope: $scope
    };

    // Open the dialog
    _internalCreateModal(opts, $modal, $scope);
  }]);

angular.module('flowableModeler').controller('FlowableFormKeyPopupCtrl',
  ['$rootScope', '$scope', '$http', '$location','$window', 'editorManager', function ($rootScope, $scope, $http, $location,$window, editorManager) {

    $scope.state = {'loadingForms': true, 'formError': false};

    $scope.popup = {'state': 'formReference'};

    $scope.foldersBreadCrumbs = [];

    // Close button handler
    $scope.close = function () {
      $scope.property.mode = 'read';
      $scope.$hide();
    };

    $scope.findProcessFormKey = function (selectedShape) {
      if (selectedShape.parent) {
        return $scope.findProcessFormKey(selectedShape.parent);
      }
      return selectedShape.properties._object["oryx-process_namespace"]
    }

    // Selecting/deselecting a subprocess
    $scope.selectForm = function (form, $event) {
      $event.stopPropagation();
      if ($scope.selectedForm && $scope.selectedForm.id && form.key == $scope.selectedForm.key) {
        $scope.selectedForm = null;
      } else {
        $scope.selectedForm = form;
      }
    };

    // Saving the selected value
    $scope.save = function () {
      if ($scope.selectedForm) {
        $scope.property.value = $scope.selectedForm.key;
      } else {
        $scope.property.value = null;
      }
      console.info($scope.property.value)
      $scope.updatePropertyInModel($scope.property);
      $scope.close();
    };

    // Open the selected value
    $scope.open = function () {
      if ($scope.selectedForm) {
        $window.open(FLOWABLE.CONFIG.formWatch + '?formDefinitionId='+$scope.processFormKey+'&formLayoutKey='+$scope.selectedForm.key+'&token='+editorManager.getToken());
      }
    };

    $scope.cancel = function () {
      $scope.close();
    };

    $scope.loadForms = function () {
      $scope.processFormKey = $scope.findProcessFormKey($scope.selectedShape);
      if ($scope.processFormKey == null) {
        $scope.state.loadingForms = false;
        return;
      }

      $http({
        method: 'GET',
        headers: {
          'Token': editorManager.getToken()
        },
        url: FLOWABLE.CONFIG.formContextRoot + '/form-definitions/' + $scope.processFormKey + '/metadata'
      }).success(
        function (response) {
          $scope.state.loadingForms = false;
          $scope.state.formError = false;
          $scope.forms = response.layouts;
          $scope.convertForm();
        })
        .error(
          function () {
            $scope.state.loadingForms = false;
            $scope.state.formError = true;
          });
    };

    $scope.convertForm = function () {
      if ($scope.property && $scope.property.value) {
        angular.forEach($scope.forms, function (item) {
          if (item.key == $scope.property.value) {
            $scope.selectedForm = item;
          }
        })
      }
    };


    $scope.loadForms();
  }]);