function WorkPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>
    this.Initialize();
}

WorkPage.prototype = {
    IsSelected: false
    // Specifies if the slider is animating
    , IsAnimating: false
    // Slider Container
    , $WorkSlider: null
    , $selectedItem: null
};

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
    this.$WorkSlider.stop().css('margin-top', '0');

    this.IsAnimating = false;

    $('#work').trigger('scroll');
};

WorkPage.prototype.NextPage = function () {
    var that = this;
    var numPages = this.GetNumPages();

    if (numPages > 1 && this.IsAnimating === false) {
        var currentPageNum = this.GetCurrentPageNum();

        this.IsAnimating = true;

        if (currentPageNum === numPages) {
            this.$WorkSlider.animate({
                'margin-top': '0'
            }, 1500, 'easeOutCubic', function () {
                that.IsAnimating = false;

                $('#work').trigger('scroll');
            });
        } else {
            var itemHeight = $('#workSlider > section').outerHeight();

            this.$WorkSlider.animate({
                'margin-top': '+=' + (itemHeight * -1)
            }, 1500, 'easeOutCubic', function () {
                that.IsAnimating = false;

                $('#work').trigger('scroll');
            });
        }
    }
};

WorkPage.prototype.GetNumPages = function () {
    /// <summary>
    /// Returns the number of work pages available
    /// </summary>
    var areaOfWindow = $(window).outerHeight() * $(window).outerWidth();

    var $workItem = $('> section', this.$WorkSlider);
    var areaOfWorkItem = $workItem.first().height() * $workItem.first().width();

    console.log('Area of window: ' + areaOfWindow);
    console.log('Area of item: ' + areaOfWorkItem);

    var maxItemsPerPage = Math.floor(areaOfWindow / areaOfWorkItem);

    if (maxItemsPerPage === 0) {
        maxItemsPerPage = 1;
    }

    var numPages = Math.ceil($workItem.length / maxItemsPerPage);

    return numPages;
};

WorkPage.prototype.GetCurrentPageNum = function () {
    var topMargin = parseInt(this.$WorkSlider.css('margin-top')) * -1;
    var itemHeight = $('#workSlider > section').outerHeight();
    var currentPageNum = Math.floor(topMargin / itemHeight) + 1;

    return currentPageNum;
};

WorkPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'work') {
        this.IsSelected = true;
    } else {
        this.IsSelected = false;
    }
};

// Initializer
(function LoadWorkScript() {
    if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new WorkPage();
        });
    } else {
        window.setTimeout(LoadWorkScript, 50);
    }
})();