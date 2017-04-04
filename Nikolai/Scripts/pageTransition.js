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
    //OutClassAnimation: 'expand-container-ontop pt-page-rotateFall'
    //, InClassAnimation: 'pt-page-scaleUp'

    //OutClassAnimation: 'expand-container-ontop pt-page-moveToTopEasing'
    //, InClassAnimation: 'pt-page-moveFromBottom'

    //OutClassAnimation: 'expand-container-ontop pt-page-moveToTop'
    //, InClassAnimation: 'pt-page-moveFromBottom'

    OutClassAnimation: 'expand-container-ontop expand-moveToTop'
    , InClassAnimation: 'expand-moveFromBottom'

    , CurrentPageClass: 'expand-container--selected'
    , PageChangingHandlers: []
    , PageChangedHandlers: []
    , $previousPage: null
    , $currentPage: null
    , $nextPage: null
    , EndCurrPage: false
    , EndNextPage: false
    , AnimEndEventNames: [
        'webkitAnimationEnd',
        'oAnimationEnd',
        'MSAnimationEnd',
        'animationend'
    ]
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
        .removeClass(this.OutClassAnimation)
        .removeClass(this.CurrentPageClass);

    $inpage
        .removeClass(this.InClassAnimation)
        .addClass(this.CurrentPageClass);
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
        item.call(item, that.$currentPage.attr('id'), that.$nextPage.attr('id'));
    });

    this.$currentPage.addClass(this.OutClassAnimation)
        .on('animationend', function () {
            that.$currentPage.off('animationend');

            that.EndCurrPage = true;

            if (that.EndNextPage) {
                that.OnEndAnimation(that.$currentPage, that.$nextPage);
            }
        });

    this.$nextPage.addClass(this.CurrentPageClass)
        .addClass(this.InClassAnimation)
        .on('animationend', function () {
            that.$nextPage.off('animationend');

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
    /// two parameters: current page ID and next page ID
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
    /// two parameters: current page ID and next page ID
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

    // Slight delay to give the browser some time to properly render
    window.setTimeout(function () {
        that.PageChangedHandlers.forEach(function (item) {
            item.call(item, that.$currentPage.attr('id'), that.$nextPage.attr('id'));
        });
    }, 100);
};
//#endregion