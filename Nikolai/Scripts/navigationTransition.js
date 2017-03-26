/*------------------------------------*\
    Summary:
    This control provides the transitional effect when moving from page to page.

    Use it by:
    2) Manually calling function TransitionToPage with the ID of the page to transition to
    page shrinks and the next page expands.
\*------------------------------------*/

//#region Constructors
function NavigationTransition(initialPageID, containerID) {
    /// <summary>
    /// Constructor
    /// </summary>
    /// <param name="initialPageID" type="string">
    /// Page ID of the initial page to show
    /// </param>
    /// <param name="containerID" type="string">
    /// [Optional] The ID of the element containing the buttons
    /// If this is not specified the body tag will be used
    /// </param>
    if (initialPageID === undefined || initialPageID === null) {
        throw new Error('Initial page must be specified');
    }

    this.ContainerID = containerID;

    this.Initialize(initialPageID);
}
//#endregion

//#region Properties
NavigationTransition.prototype = {
    ContainerID: ''
    , $Element: {} // Element containing the pages
    , $Pages: [] // Collection of pages wrapped in jQuery
    , SelectedPageID: '' // ID for page Selected
    , PreviousPageID: '' // ID for previous page selected
    , AnchorElmtID: '' // ID for the anchor element where the expand element will be positioned
    , PageChangingCallback: function () {
        /// <summary>
        /// Callback when page is about to change
        /// </summary>
    }
    , PageChangedCallback: function () {
        /// <summary>
        /// Callback when page is changed
        /// </summary>
    }
};
//#endregion

//#region Methods
NavigationTransition.prototype.Initialize = function (initialPageID) {
    /// <summary>
    /// Set's the pages initial state
    /// </summary>
    /// <param name="initialPageID" type="string">
    /// Page ID of the initial page to show
    /// </param>
    var that = this;

    if ($('#' + this.ContainerID).length === 0) {
        this.$Element = $('body');
    } else {
        this.$Element = $('#' + this.ContainerID);
    }

    $('[data-nv-page]', this.$Element).each(function () {
        var $page = $(this);

        $page.data('nv-default-zindex', $page.css('z-index'));

        that.$Pages.push($page);

        if ($page.attr('id') === initialPageID) {
            that.ShowPage($page.attr('id'));
        } else {
            that.HidePage($page.attr('id'));
        }
    });
};

NavigationTransition.prototype.ShowPage = function (pageId, $selectedPage) {
    /// <summary>
    /// Makes the specified page visible
    /// </summary>
    /// <param name="pageId" type="string">
    /// [Optional] The ID of the page to make visible. If the pageId
    /// is not specified the property SelectedPageID will be used
    /// </param>
    /// <param name="$selectedPage" type="object">
    /// [Optional] jQuery object containing the page to hide.
    /// </param>
    /// <returns type="object">
    /// Returns the page that was hidden wrapped as a jQuery object
    /// </returns>
    var that = this;
    var $page = null;

    if ($selectedPage && $selectedPage.length > 0) {
        $page = $selectedPage;
    } else if (pageId) {
        $page = $('#' + pageId);
    } else if (this.SelectedPageID !== '') {
        $page = $('#' + this.SelectedPageID);
    } 

    if ($page === undefined || $page === null) {
        return;
    }

    var defaultZIndex = $page.data('nv-default-zindex') ? $page.data('nv-default-zindex') : 1;

    $page.each(function () {
        var $wrapper = $(this);

        if ($wrapper.data('nv-page')) {
            $wrapper
                .css(that.VisibleStyles)
                .css('z-index', defaultZIndex);
        }
    });

    return $page;
};

NavigationTransition.prototype.HidePage = function (pageId, $selectedPage) {
    /// <summary>
    /// Hides the specified page
    /// </summary>
    /// <param name="pageId" type="string">
    /// [Optional] The ID of the page to hide. If the pageId
    /// is not specified the property SelectedPageID will be used
    /// </param>
    /// <param name="$selectedPage" type="object">
    /// [Optional] jQuery object containing the page to hide.
    /// </param>
    /// <returns type="object">
    /// Returns the page that was hidden wrapped as a jQuery object
    /// </returns>
    var that = this;
    var $page = null;

    if ($selectedPage && $selectedPage.length > 0) {
        $page = $selectedPage;
    } else if (pageId) {
        $page = $('#' + pageId);
    } else if (this.SelectedPageID !== '') {
        $page = $('#' + this.SelectedPageID);
    }

    if ($page === undefined || $page === null) {
        return;
    }

    $page.each(function () {
        var $wrapper = $(this);

        if ($wrapper.data('nv-page')) {
            $wrapper
                .css(that.HiddenStyles)
                .css('z-index', -1);
        }
    });

    return $page;
};

NavigationTransition.prototype.SelectPage = function (pageId) {
    /// <summary>
    /// Selects the page specified by hiding the previously selected page
    /// and making the specified page visible.
    /// </summary>
    this.HidePage();
    this.ShowPage(pageId);

    this.PreviousPageID = this.SelectedPageID;
    this.SelectedPageID = pageId;

    if (this.PageChangedCallback) {
        this.PageChangedCallback();
    }
};

NavigationTransition.prototype.TransitionToPage = function (pageID) {
    /// <summary>
    /// Transitions to the specified page
    /// </summary>
    /// <param name="pageID" type="string">
    /// The ID of the page to transition to
    /// </param>

    var that = this;
    var $expandElmt = $('#' + pageID);

    if ($expandElmt.length === 0) {
        throw new Error('Page with ID of" ' + pageID + ' cannot be found');
    }

    $expandElmt.scrollTop(0);

    var propertiesToAnimate = {
        'margin-top': '0'
        , 'margin-left': '0'
    };

    if (window.innerHeight > window.innerWidth) { // Portrait Mode
        propertiesToAnimate.height = '100%';
    } else { // Landscape or a Square
        propertiesToAnimate.width = '100%';
    }

    this.PositionExpandElmt(pageID);

    var defaultOverflow = $('body').css('overflow');

    $('body').css('overflow', 'hidden');

    $expandElmt
        .css({
            border: '1px solid #FFF'
        })
        .animate(propertiesToAnimate, {
            duration: 600
            , easing: 'easeInQuart'
            , start: function () {
                if (that.PageChangingCallback) {
                    that.PageChangingCallback();
                }
            }
            , complete: function () {
                that.SelectPage(pageID);

                $('body').css('overflow', defaultOverflow);
            }
            , progress: function () {
                // Animate to have the same proportions as the property
                // being animated
                if (propertiesToAnimate.height) {
                    $expandElmt.width($expandElmt.height());
                } else {
                    $expandElmt.height($expandElmt.width());
                }

                $('.expand-contianer__content', $expandElmt).css({
                    'margin-top': '-' + $expandElmt.css('margin-top')
                    , 'margin-left': '-' + $expandElmt.css('margin-left')
                });
            }
        });
};

NavigationTransition.prototype.PositionExpandElmt = function (expandElementID) {
    /// <summary>
    /// Positions the expand element on the anchor point
    /// </summary>
    /// <param name="expandElementID" type="string">
    /// ID of the container containing the next page to expand
    /// </param>
    var $expandElmt = $('#' + expandElementID);
    var $shrinkElmt = $('#' + this.SelectedPageID);

    // Prep the transition. Make the expand element above the shrink element
    $expandElmt.css('z-index', $expandElmt.data('nv-default-zindex'));
    $shrinkElmt.css('z-index', -1);

    var anchorPoints = this.GetAnchorPoints();
    var position = anchorPoints[this.GetAnchorPositionOnScreen()];

    $expandElmt.css({
        'margin-top': position.y
        , 'margin-left': position.x
    });

    $('.expand-contianer__content', $expandElmt).css({
        'margin-top': position.y * -1
        , 'margin-left': position.x * -1
    });
};

NavigationTransition.prototype.GetAnchorPositionOnScreen = function () {
    /// <summary>
    /// Returns the anchors position relative to the ViewPort. 
    /// </summary>
    /// <returns type="string">
    /// Returns a string which can be the following:
    /// TopLeft, Top, TopRight, MiddleLeft, Middle, MiddleRight,
    /// BottomLeft, Bottom, BottomRight
    /// </returns>
    var anchorX = this.GetAnchorPoints().Middle.x;
    var anchorY = this.GetAnchorPoints().Middle.y;

    var middleY = $(window).height() / 2;
    var middleX = $(window).width() / 2;

    var middleXTolerance = $(window).width() / 10;
    var middleYTolerance = $(window).height() / 10;

    if (anchorX > (middleX - middleXTolerance)
        && anchorX < (middleX + middleXTolerance)) {
        // Element is horizontally in the middle of screen
        if (anchorY > middleY) {
            return 'Bottom';
        } else if (anchorX < middleY) {
            return 'Top';
        } else {
            return 'Middle';
        }
    } else if (anchorY < (middleY + middleYTolerance)
        && anchorY > (middleY - middleYTolerance)) {
        // Element is vertically in the middle of screen
        if (anchorX < middleX) {
            return 'MiddleLeft';
        } else if (anchorX > middleX) {
            return 'MiddleRight';
        } else {
            return 'Middle';
        }
    } else if (anchorY < middleY && anchorX > middleX) {
        return 'TopRight';
    } else if (anchorY < middleY && anchorX < middleX) {
        return 'TopLeft';
    } else if (anchorY > middleY && anchorX > middleX) {
        return 'BottomRight';
    } else if (anchorY > middleY && anchorX < middleX) {
        return 'BottomLeft';
    } else {
        return 'Middle';
    }
};

NavigationTransition.prototype.GetAnchorPoints = function () {
    /// <summary>
    /// Returns the position of the anchor point. It is from this anchor the expand
    /// element will being expanding.
    /// </summary>
    /// <returns type="object">
    /// Returns an object containing the x and y positions of the anchors points.
    /// Anchor points: TopLeft, Top, TopRight, MiddleLeft, Middle, MiddleRight,
    /// BottomLeft, Bottom, BottomRight
    /// Returns an object with the x and y position of the anchor point
    /// </returns>
    var anchorPoints = {
        TopLeft: { x: 0, y: 0 }
        , Top: { x: 0, y: 0 }
        , TopRight: { x: 0, y: 0 }
        , MiddleLeft: { x: 0, y: 0 }
        , Middle: { x: 0, y: 0 }
        , MiddleRight: { x: 0, y: 0 }
        , BottomLeft: { x: 0, y: 0 }
        , Bottom: { x: 0, y: 0 }
        , BottomRight: { x: 0, y: 0 }
    };

    if (this.AnchorElmtID !== null && this.AnchorElmtID !== undefined && this.AnchorElmtID !== '') {
        var $anchorElmt = $('#' + this.AnchorElmtID);

        var anchorHeight = $anchorElmt.outerHeight();
        var anchorWidth = $anchorElmt.outerWidth();

        var anchorLeft = $anchorElmt.offset().left >= 0 ? $anchorElmt.offset().left : 0;
        var anchorTop = $anchorElmt.offset().top >= 0 ? $anchorElmt.offset().top : 0;

        anchorPoints.TopLeft = {
            x: anchorLeft
            , y: anchorTop
        };

        anchorPoints.Top = {
            x: anchorLeft + (anchorWidth / 2)
            , y: anchorTop
        };

        anchorPoints.TopRight = {
            x: anchorLeft + anchorWidth
            , y: anchorTop
        };

        anchorPoints.MiddleLeft = {
            x: anchorLeft
            , y: anchorTop + (anchorHeight / 2)
        };

        anchorPoints.Middle = {
            x: anchorLeft + (anchorWidth / 2)
            , y: anchorTop + (anchorHeight / 2)
        };

        anchorPoints.MiddleRight = {
            x: anchorLeft + anchorWidth
            , y: anchorTop + (anchorHeight / 2)
        };

        anchorPoints.BottomLeft = {
            x: anchorLeft
            , y: anchorTop + (anchorHeight / 2)
        };

        anchorPoints.Bottom = {
            x: anchorLeft + (anchorWidth / 2)
            , y: anchorTop + (anchorHeight / 2)
        };

        anchorPoints.BottomRight = {
            x: anchorLeft + anchorWidth
            , y: anchorTop + (anchorHeight / 2)
        };
    }

    return anchorPoints;
};
//#endregion

//#region Internal Objects
NavigationTransition.prototype.HiddenStyles = {
    'height': '0%'
    , 'width': '0%'
    , 'borderTopLeftRadius': '50%'
    , 'borderTopRightRadius': '50%'
    , 'borderBottomLeftRadius': '50%'
    , 'borderBottomRightRadius': '50%'
    , 'border': 'none'
};

NavigationTransition.prototype.VisibleStyles = {
    'height': '100%'
    , 'width': '100%'
    , 'borderTopLeftRadius': '0'
    , 'borderTopRightRadius': '0'
    , 'borderBottomLeftRadius': '0'
    , 'borderBottomRightRadius': '0'
    , 'border': 'none'
};
//#endregion