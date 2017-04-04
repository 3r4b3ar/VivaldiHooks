//Bookmarks button before AddressBar
//Кнопка с выпадающими закладками перед строкой адреса

(function() {

    vivaldi.jdhooks.hookClass('UrlBar', function(reactClass) {

        var React = vivaldi.jdhooks.require('react_React');
        var ReactDOM = vivaldi.jdhooks.require('react_ReactDOM');


        bookmarksOnClick = function(e) {

            var clone = vivaldi.jdhooks.require('_clone');
            var treeSort = vivaldi.jdhooks.require('_treeSort');

            var bookmarkSorting = vivaldi.jdhooks.require('_VivaldiSettings').getSync('BOOKMARKS_PANEL_BOOKMARKSSORT');

            var defaultComparator = treeSort.getDefaultComparator(bookmarkSorting.sortOrder, bookmarkSorting.sortField);

            var comparator = function(first, second) {
                var isFolder = function(treeItem) {
                    return !!treeItem && (treeItem.children && treeItem.children.length > 0 || void 0 === treeItem.url)
                };
                if (first.trash) return 1;
                if (second.trash) return -1;
                if (isFolder(first) && !isFolder(second)) return -1;
                if (isFolder(second) && !isFolder(first)) return 1;
                return defaultComparator(first, second);
            };

            var store = vivaldi.jdhooks.require('_BookmarkStore');
            var data = clone(store.getTopNodes ? store.getTopNodes() : store.getBookmarksData());

            if (bookmarkSorting.sortOrder != treeSort.NO_SORTING)
                treeSort.treeSort(data, comparator);
            this.refs.hiddenBookmarksBar.state.renderedArray = data.filter(function(o) {
                return !o.trash
            });
            vivaldi.jdhooks.require('_ShowMenu')(
                this.refs.hiddenBookmarksBar.getExtenderButtonItems ? this.refs.hiddenBookmarksBar.getExtenderButtonItems() : this.refs.hiddenBookmarksBar.getExtenderMenuItems(), //todo: remove getExtenderButtonItems() later
                null, "bottom", this.refs.bookmarksButton)(e);
        }


        vivaldi.jdhooks.hookMember(reactClass, 'render', null, function(hookData) {

            var findRef = function(ref) {
                for (var i = 0; i < hookData.retValue.props.children.length; i++) {
                    if (hookData.retValue.props.children[i])
                        if (hookData.retValue.props.children[i].ref === ref)
                            return i;
                }
                return false;
            };

            var itm = findRef("addressfield");
            if (itm !== false) {

                hookData.retValue.props.children.splice(itm, 0,
                    React.createElement(
                        "div", {
                            className: 'button-toolbar bookmarksbutton',
                            onClick: bookmarksOnClick.bind(this),
                            ref: "bookmarksButton"
                        }

                        , React.createElement('div', {
                                style: {
                                    width: 0,
                                    zIndex: -1
                                }
                            },
                            React.createElement(vivaldi.jdhooks.require('BookmarksBar'), {
                                ref: "hiddenBookmarksBar",
                            })
                        )

                        , React.createElement('div', {
                            className: 'button-toolbar',
                            dangerouslySetInnerHTML: {
                                __html: vivaldi.jdhooks.require('_svg_panel_bookmarks')
                            }
                        })
                    )

                );
            }

            return hookData.retValue;
        });
    });

})();