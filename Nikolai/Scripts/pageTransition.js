//#region Constructors
function PageTransition(initialPageID) {
    /// <summary>
    /// Default Constructor
    /// </summary>
    /// <param name="initialPageID" type="string">
    /// The ID of the initial page to show
    /// </param>
    this.Initialize(initialPageID);
}
//#endregion

//#region Properties
PageTransition.prototype = {
    CurrentPageClass: 'expand-container--selected'
    , PageChangingHandlers: []
    , PageChangedHandlers: []
    , $previousPage: null
    , $currentPage: null
    , $nextPage: null
    , EndCurrPage: false
    , EndNextPage: false
    , AnimEndEventNames : {
		'WebkitAnimation' : 'webkitAnimationEnd',
		'OAnimation' : 'oAnimationEnd',
		'msAnimation' : 'MSAnimationEnd',
		'animation' : 'animationend'
    }
    , GetAnimEndEventName: function () {
        /// <summary>
        /// Returns animation event prefixed by browser
        /// </summary>
        return this.AnimEndEventNames[window.Modernizr.prefixed('animation')];
    }
    // Last In Animation Class applied to the page
    , LastInAnimClass: ''
    // Last Out Animation Class applied to the page
    , LastOutAnimClass: ''
};
//#endregion

//#region Methods
PageTransition.prototype.Initialize = function (initialPageID) {
    if (initialPageID === undefined) {
        throw new Error('Initial Page ID must be specified');
    }

    this.$currentPage = $('#' + initialPageID);

    if (this.$currentPage.length === 0) {
        throw new Error('Page with ID: ' + initialPageID + ' does not exists');
    }

    this.$currentPage.addClass(this.CurrentPageClass);
};

PageTransition.prototype.ResetPage = function ($outpage, $inpage) {
    $outpage
        .removeClass(this.LastOutAnimClass)
        .removeClass(this.CurrentPageClass);

    $inpage
        .removeClass(this.LastInAnimClass)
        .addClass(this.CurrentPageClass);
};

PageTransition.prototype.GetTransitionType = function () {
    /// <summary>
    /// Uses properties $currentPage and $nextPage to determine
    /// if the transition type is either next, previous, or default
    /// </summary>
    var that = this;
    var $navBarLinks = $('#pnlNavBar li a');

    var $currentLinkElmt = $navBarLinks.filter(function () {
        var href = that.$currentPage.attr('id').toLowerCase();

        return $(this).attr('href').toLowerCase().indexOf(href) > -1;
    });

    var $nextLinkElmt = $navBarLinks.filter(function () {
        var href = that.$nextPage.attr('id').toLowerCase();

        return $(this).attr('href').toLowerCase().indexOf(href) > -1;
    });

    var indexOfCurrentPage = $currentLinkElmt.length !== 0 ?
        $navBarLinks.index($currentLinkElmt.get(0)) : -1;
    var indexOfNextPage = $nextLinkElmt.length !== 0 ?
        $navBarLinks.index($nextLinkElmt.get(0)) : -1;

    if (indexOfCurrentPage === -1 || indexOfNextPage === -1) {
        return 'default';
    } else if (indexOfCurrentPage > indexOfNextPage) {
        return 'previous';
    } else if (indexOfCurrentPage < indexOfNextPage) {
        return 'next';
    } else {
        return 'default';
    }
};

PageTransition.prototype.GetTransitionClasses = function () {
    /// <summary>
    /// Returns the In/Out class names depending on the transition type
    /// </summary>
    /// <returns type="Object">
    /// Returns an object with two properties InClass and OutClass
    /// </returns>
    var transitionClasses = {
        InClass: 'expand-moveFromBottom'
        , OutClass: 'expand-container-ontop expand-moveToTop'
    };

    switch (this.GetTransitionType()) {
        case 'next':
            transitionClasses.InClass = 'expand-container-ontop expand-moveFromRight';
            transitionClasses.OutClass = 'expand-scaleDown';
            break;
        case 'previous':
            transitionClasses.InClass = 'expand-container-ontop expand-moveFromLeft';
            transitionClasses.OutClass = 'expand-scaleDown';
            break;
    }

    this.LastInAnimClass = transitionClasses.InClass;
    this.LastOutAnimClass = transitionClasses.OutClass;

    return transitionClasses;
};

PageTransition.prototype.TransitionToPage = function (pageID) {
    /// <summary>
    /// Transitions to the specified page
    /// </summary>
    /// <param name="pageID" type="string">
    /// (Required) The ID of the page to transition to
    /// </param>
    if (pageID === undefined) {
        throw new Error('Page ID must be specified');
    }

    this.$nextPage = $('#' + pageID);

    if (this.$nextPage.length === 0) {
        throw new Error('Page with ID: ' + pageID + ' does not exists');
    }

    var that = this;

    this.PageChangingHandlers.forEach(function (item) {
        var currentPageID = that.$currentPage ? that.$currentPage.attr('id') : '';
        var previousPageID = that.$previousPage ? that.$previousPage.attr('id') : '';

        item.call(item, currentPageID, previousPageID);
    });

    var transitionClasses = this.GetTransitionClasses();

    this.$currentPage
        .addClass(transitionClasses.OutClass)
        .on(this.GetAnimEndEventName(), function () {
            that.$currentPage.off(that.GetAnimEndEventName());

            that.EndCurrPage = true;

            if (that.EndNextPage) {
                that.OnEndAnimation(that.$currentPage, that.$nextPage);
            }
        });

    this.$nextPage
        .scrollTop(0)
        .addClass(this.CurrentPageClass)
        .addClass(transitionClasses.InClass)
        .on(this.GetAnimEndEventName(), function () {
            that.$nextPage.off(that.GetAnimEndEventName());

            that.EndNextPage = true;

            if (that.EndCurrPage) {
                that.OnEndAnimation(that.$currentPage, that.$nextPage);
            }
        });
};

PageTransition.prototype.SubscribeToPageChangingEvent = function (fn) {
    /// <summary>
    /// Subscribe to page changing event
    /// </summary>
    /// <param name="fn" type="function">
    /// Function to be called when page is changing. This function should have
    /// two parameters: current page ID and previous page ID
    /// </param>
    this.PageChangingHandlers.push(fn);
};

PageTransition.prototype.UnsubscribeToPageChangingEvent = function (fn) {
    /// <summary>
    /// Unsubscribe to page changing event
    /// </summary>
    this.PageChangingHandlers = this.PageChangingHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};

PageTransition.prototype.SubscribeToPageChangedEvent = function (fn) {
    /// <summary>
    /// Subscribe to page changed event
    /// </summary>
    /// <param name="fn" type="function">
    /// Function to be called when page is changed. This function should have
    /// two parameters: current page ID and previous page ID
    /// </param>
    this.PageChangedHandlers.push(fn);
};

PageTransition.prototype.UnsubscribeToPageChangedEvent = function (fn) {
    /// <summary>
    /// Unsubscribe to page changed event
    /// </summary>
    this.PageChangedHandlers = this.PageChangedHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};
//#endregion 

//#region Event Handlers
PageTransition.prototype.OnEndAnimation = function ($outpage, $inpage) {
    var that = this;

    this.EndCurrPage = false;
    this.EndNextPage = false;
    
    this.$previousPage = this.$currentPage;
    this.$currentPage = $inpage;

    this.ResetPage($outpage, $inpage);

    //// Slight delay to give the browser some time to properly render
    window.setTimeout(function () {
        that.PageChangedHandlers.forEach(function (item) {
            item.call(item, that.$currentPage.attr('id'), that.$previousPage.attr('id'));
        });
    }, 100);
};
//#endregion