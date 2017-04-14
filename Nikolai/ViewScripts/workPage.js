//#region Constructors
function WorkPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>
    this.Initialize();
}
//#endregion

//#region Properties
WorkPage.prototype = {
    IsSelected: false
    // Specifies if the slider is animating
    , IsAnimating: false
    // Slider Container
    , $WorkSlider: null
    , $selectedItem: null
    // Used for scroll optimization
    , HasScrollTicked: false
};
//#endregion

//#region Methods
WorkPage.prototype.Initialize = function () {
    this.$WorkSlider = $('#workSlider');

    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.NavBar.DialControl.SubscribeToDragEvent(
        $.proxy(this.OnDialDragged, this)
    );

    window.MainNav.NavBar.DialControl.SubscribeToDropEvent(
        $.proxy(this.OnDialDropped, this)
    );

    $('#work [data-nv-bgimage]').click(this.ItemClick);

    // Global Event Handlers
    $(window).resize(
        $.proxy(this.WindowResize, this)
    );

    $('#work').on('scroll',
        $.proxy(this.PageScrolled, this)
    );

    // Initializers
    this.ShowViewMoreInstructions();
};

WorkPage.prototype.ItemClick = function (evt) {
    /// <summary>
    /// Makes the entire element clickable
    /// </summary>
    var $elmt = $(evt.target);

    if ($elmt.attr('href') === undefined) {
        $('a', $elmt.parent()).click();
    }
};

WorkPage.prototype.OnDialDropped = function () {
    /// <summary>
    /// Event handler for when the dial control is dropped.
    /// If the dial is positioned vertically the next page will be triggered
    /// </summary>
    if (window.MainNav.NavBar.DialControl.$Element.hasClass('nvDial--pulsing') === true) {
        window.MainNav.NavBar.DialControl.$Element.removeClass('nvDial--pulsing');

        $('.work', this.$WorkSlider).removeClass('button-container-viewMore--active');

        $('a', this.$selectedItem).click();
    }
};

WorkPage.prototype.OnDialDragged = function () {
    /// <summary>
    /// Event handler for when the dial control is dragged.
    /// If the dial is dragged vertically it triggers the next page
    /// </summary>
    if (this.IsSelected === true) {
        var that = this;
        var $workItems = $('.work', this.$WorkSlider);
        var isInBounds = false;

        this.$selectedItem = null;

        $workItems.each(function () {
            var targetElmt = $('.work__dropTarget', this).get(0);

            if (targetElmt && window.MainNav.NavBar.DialControl.IsDialWithinElmt(targetElmt)) {
                that.$selectedItem = $(this);

                $(this).addClass('button-container-viewMore--active');

                isInBounds = true;
            } else {
                $(this).removeClass('button-container-viewMore--active');
            }
        });

        if (isInBounds === true) {
            if (window.MainNav.NavBar.DialControl.$Element.hasClass('nvDial--pulsing') === false) {

                window.MainNav.NavBar.DialControl.$Element.addClass('nvDial--pulsing');
            }
        } else {
            if (window.MainNav.NavBar.DialControl.$Element.hasClass('nvDial--pulsing') === true) {

                window.MainNav.NavBar.DialControl.$Element.removeClass('nvDial--pulsing');
            }
        }
    }
};

WorkPage.prototype.WindowResize = function () {
    /// <summary>
    /// When window is resized the position for the work tiles are off.
    /// Reposition work items
    /// </summary>
    this.IsAnimating = false;

    this.RenderPageIndicator();

    $('#work').scrollTop(0).trigger('scroll');
};

WorkPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    var that = this;

    if (pageId && pageId === 'work') {
        this.IsSelected = true;

        this.EnablePageIndicator();

        window.setTimeout(function () {
            that.HideViewMoreInstructions();
        }, 1000);
    } else {
        this.IsSelected = false;

        this.DisablePageIndicator();

        this.ShowViewMoreInstructions();
    }
};

WorkPage.prototype.ShowViewMoreInstructions = function () {
    /// <summary>
    /// Triggers the animation that instructs the user how to view more
    /// </summary>
    var totalElmtsPerPage = this.GetNumberOfItemsPerPage();

    var $workItems = $('.button-container-viewMore', this.$WorkSlider);

    for (var i = 0; i < totalElmtsPerPage; i++) {
        $workItems.eq(i).addClass('button-container-viewMore--onBoarding');
    }
};

WorkPage.prototype.HideViewMoreInstructions = function () {
    var that = this;

    (function RemoveInstruction() {
        var $activeWorkItem = $('.button-container-viewMore--onBoarding', that.$WorkSlider);

        $activeWorkItem.first().removeClass('button-container-viewMore--onBoarding');

        if ($activeWorkItem.length > 1) {
            window.setTimeout(RemoveInstruction, 200);
        }
    }());
};

WorkPage.prototype.EnablePageIndicator = function () {
    $('#pnlWorkPageIndicator').addClass('work-PageIndicatorContainer--active');

    this.RenderPageIndicator();
};

WorkPage.prototype.DisablePageIndicator = function () {
    $('#pnlWorkPageIndicator').removeClass('work-PageIndicatorContainer--active');
};

WorkPage.prototype.RenderPageIndicator = function () {
    /// <summary>
    /// Renders the page indicators depending on how many pages
    /// there are
    /// </summary>
    if ($('#pnlWorkPageIndicator').hasClass('work-PageIndicatorContainer--active') === false) {
        return;
    }

    var totalPages = this.GetNumberOfPages();

    var $pnlIndicator = $('#pnlWorkPageIndicator');

    $pnlIndicator.empty();

    for (var i = 0; i < totalPages; i++) {
        var indicatorClass = 'work-PageIndicator';

        if (i === 0) {
            indicatorClass = 'work-PageIndicator work-PageIndicator--selected';
        }

        var $indicator = $('<span></span>', {
            'class': indicatorClass
            , 'title': 'Page ' + (i + 1)
            , 'data-nv-pagenum': i
            , 'click': this.PageIndicatorClicked
        });

        $pnlIndicator.append($indicator);
    }
};

WorkPage.prototype.GetNumberOfItemsPerPage = function () {
    return Math.round(this.$WorkSlider.outerWidth() / $('#work [data-nv-bgimage]').outerWidth());
};

WorkPage.prototype.GetNumberOfPages = function () {
    return Math.round(this.$WorkSlider.outerHeight() / $('#work [data-nv-bgimage]').outerHeight());
};

WorkPage.prototype.PageIndicatorClicked = function (evt) {
    var $indicator = $(evt.target);

    var pageNum = $indicator.data('nv-pagenum');

    var scrollPX = $('#work [data-nv-bgimage]').outerHeight() * pageNum;

    $('#work').scrollTo(scrollPX, {
        duration: 500
        , easing: 'swing'
    });

    $('#pnlWorkPageIndicator > span').removeClass('work-PageIndicator--selected');

    $indicator.addClass('work-PageIndicator--selected');
};

WorkPage.prototype.UpdatePageIndicator = function () {
    /// <summary>
    /// Updates which page indicator should be selected
    /// </summary>
    var scrollPosition = $('#work').scrollTop();
    var windowHeight = $('#work [data-nv-bgimage]').outerHeight();

    var selectedPage = Math.round(scrollPosition / windowHeight);

    var $indicators = $('#pnlWorkPageIndicator > span');

    var $selectPage = $indicators.eq(selectedPage);

    if ($selectPage.length !== 0) {
        $indicators.removeClass('work-PageIndicator--selected');

        $selectPage.addClass('work-PageIndicator--selected');
    }

};

WorkPage.prototype.PageScrolled = function () {
    var that = this;

    var $pnlWorkPageIndicator = $('#pnlWorkPageIndicator');

    if ($pnlWorkPageIndicator.hasClass('work-PageIndicatorContainer--active') === true) {
        if (this.HasScrollTicked === false) {
            window.requestAnimationFrame(function () {
                that.UpdatePageIndicator();

                that.HasScrollTicked = false;
            });
        }

        this.HasScrollTicked = true;
    }
};
//#endregion

//#region Initializer
(function LoadWorkScript() {
    if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new WorkPage();
        });
    } else {
        window.setTimeout(LoadWorkScript, 50);
    }
})();
//#endregion