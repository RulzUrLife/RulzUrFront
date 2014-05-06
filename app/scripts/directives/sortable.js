/*global angular*/
'use strict';

angular
  .module('sortable', [])
  .constant('sortableConfig', {
    placeholderClass: 'placeholder',
    helperClass: 'helper',
    sensitivity: 20
  })
  .controller('sortableCtrl', ['$scope', '$timeout', 'sortableConfig',
    function ($scope, $timeout, sortableConfig) {
      var elts = this.elts = $scope.elts = [];
      this.vertical = angular.isDefined($scope.vertical) ?
        this.vertical : true;
      this.placeholderClass = sortableConfig.placeholderClass;
      this.helperClass = sortableConfig.helperClass;
      this.sensitivity = sortableConfig.sensitivity;

      this.move = function (index, forward) {
        $scope.$apply(function () {
          var moved;
          if (forward) {
            moved = elts.splice(index, 2);
            moved[0].index = index + 1;
            moved[1].index = index;

            elts.splice(index, 0, moved[0]);
            elts.splice(index, 0, moved[1]);

            //wait end of apply and DOM update, before refreshing
            $timeout(function () {
              moved[1].refresh();
            });
          } else {
            moved = elts.splice(index - 1, 2);
            moved[0].index = index;
            moved[1].index = index - 1;

            elts.splice(index, 0, moved[0]);
            elts.splice(index, 0, moved[1]);

            //wait end of apply and DOM update, before refreshing
            $timeout(function () {
              moved[0].refresh();
            });
          }
        });
      };
    }
  ])
  .directive('sortable', function () {
    return {
      restrict: 'A',
      transclude: true,
      scope: {
        vertical: '=?'
      },
      controller: 'sortableCtrl',
      link: function (scope, element) {
        element.css({position: 'relative'});
      },
      templateUrl: 'template/sortable/sortable.html'
    };
  })
  .directive('sortableElt', function () {
    return {
      require: '^sortable',
      restrict: 'A',
      scope: {},
      transclude: 'element',
      link: function (scope, element, attrs, sortableCtrl, transclude) {
        scope.index = sortableCtrl.elts.push(scope) - 1;
        scope.transclude = transclude;
      }
    };
  })
  .directive('sortableEltTransclude', ['$document', function ($document) {
    return {
      require: '^sortable',
      restrict: 'A',
      scope: {
        sortableEltTransclude: '='
      },
      link: function (scope, element, attrs, sortableCtrl) {
        var
          vertical = sortableCtrl.vertical,
          sortableEltTransclude = scope.sortableEltTransclude || {},
          offsetPos = vertical ? 'offsetTop' : 'offsetLeft',
          offsetSize = vertical ? 'offsetHeight' : 'offsetWidth',
          elementSize, pos, clonedElt, startPos, maxPos, delta = 0;

        sortableEltTransclude.transclude(function (clone) {
          element.append(clone);
          sortableEltTransclude.size = elementSize = element.prop(offsetSize);

          sortableEltTransclude.refresh = function () {
            sortableEltTransclude.pos = pos = element.prop(offsetPos);
          };
          sortableEltTransclude.refresh();
        });

        function processNextPos(nextElt) {
          var s;
          return nextElt.pos - elementSize +
            ((s = nextElt.size - elementSize) > 0 ? s: 0) +
            sortableCtrl.sensitivity;
        }

        function processPreviousPos(previousElt) {
          var s;
          return previousElt.pos + previousElt.size -
            ((s = previousElt.size - elementSize) > 0 ? s: 0) -
            sortableCtrl.sensitivity;
        }

        element.on('mousedown', function (event) {
          // Prevent default dragging of selected content
          var css = {
            position: 'absolute',
            width: element.prop('offsetWidth') + 'px'
          };

          event.preventDefault();

          css[vertical ? 'top': 'left'] = pos + 'px';
          startPos = (vertical ? event.clientY : event.clientX);
          maxPos = element.parent().prop(offsetSize) - elementSize;

          clonedElt = element.clone();
          clonedElt.addClass(sortableCtrl.helperClass);
          clonedElt.css(css);

          element.parent().append(clonedElt);
          element.css({visibility: 'hidden'});
          element.addClass(sortableCtrl.placeholderClass);

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
          var p = (vertical ? event.clientY : event.clientX) - startPos,
            newPos = p + pos,
            nextElt = sortableCtrl.elts[sortableEltTransclude.index + 1],
            previousElt = sortableCtrl.elts[sortableEltTransclude.index - 1];
          delta = p - delta;

          if (newPos < 0) {
            newPos = 0;
          }
          if (newPos > maxPos) {
            newPos = maxPos;
          }

          if (!!nextElt && delta > 0 && newPos > processNextPos(nextElt)) {
            sortableCtrl.move(sortableEltTransclude.index, true);
          }

          if (!!previousElt) {
            console.log(processPreviousPos(previousElt), delta);
          }

          if (!!previousElt && delta < 0 &&
            newPos < processPreviousPos(previousElt)) {
            sortableCtrl.move(sortableEltTransclude.index, false);
          }

          delta = p;
          clonedElt.css((
            vertical ?
            {top: newPos + 'px'} :
            {left: newPos + 'px'}
            ));
        }

        function mouseup() {
          sortableEltTransclude.refresh();
          clonedElt.remove();
          element.css({visibility: 'initial'});
          element.removeClass(sortableCtrl.placeholderClass);
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
      }
    };
  }])
  .run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/sortable/sortable.html', [
      '<ul>',
      '<li data-ng-repeat="elt in elts" data-sortable-elt-transclude="elt">',
      '</li>',
      '</ul>',
      '<div data-ng-transclude></div>'
    ].join(''));
  }]);