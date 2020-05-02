//#region Constructors
function AboutPage() {
    this.Initialize();

    new window.PolyEffect(document.getElementById('msLogoSvg'));
}
//#endregion

//#region Properties
AboutPage.prototype = {
    pageElmts: [],
    $ContainerElmt: null,
    $NavDotsElmt: null,
    selectedPageIndex: 0,
    totalPages: 0,
    scroll: {
        isThrottled: false,
        throttleDuration: 1000
    },
    debug: {
        // Debugging for poly positioning
        polyContainerSelector: '.about-screen__img',
        enableDebugMode: false,
        nodeCount: 0,
        nodeScss: ''
    }
};
//#endregion

//#region Event Handlers
AboutPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'about') {
        this.EnablePageIndicator();
        this.UpdateStyling();
    } else {
        this.DisablePageIndicator();
    }
};

AboutPage.prototype.OnPageMouseWheel = function (evt) {
    var that = this;

    evt.preventDefault();

    if (this.scroll.isThrottled) {
        return false;
    } else {
        this.scroll.isThrottled = true;
    }

    window.setTimeout(function () {
        that.scroll.isThrottled = false;
    }, this.scroll.throttleDuration);

    //if (evt.originalEvent.wheelDelta > 0) {
    if (evt.wheelDelta > 0) {
        if (this.selectedPageIndex === 0) {
            return false;
        } else {
            this.UpSection();
        }
    } else {
        if (this.selectedPageIndex >= this.totalPages - 1) {
            return false;
        } else {
            this.DownSection();
        }
    }
};
//#endregion

//#region Methods
AboutPage.prototype.Initialize = function () {
    // Set Properties
    this.pageElmts = $('[data-nv-about-page]');
    this.$ContainerElmt = this.pageElmts.parent();
    this.totalPages = this.pageElmts.length;
    this.$NavDotsElmt = $('#pnlAboutPageIndicator');

    // Bind Scope
    this.OnPageMouseWheel = $.proxy(this.OnPageMouseWheel, this);

    // Initialize functionality
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    this.ToggleClipPathPositionHelper();
    this.SetupPositioning();
    this.RenderNavDots();
    this.SetupScrollEvents();
};

AboutPage.prototype.ToggleClipPathPositionHelper = function () {
    if (this.debug.enableDebugMode) {
        var that = this;

        $('body').on('click', function (e) {
            var mouseX = e.pageX;
            var mouseY = e.pageY;

            var shapesoffsetX = $(that.debug.polyContainerSelector).offset().left;
            var shapesoffsetY = $(that.debug.polyContainerSelector).offset().top;

            var polygonswidth = $(that.debug.polyContainerSelector).width();
            var polygonsheight = $(that.debug.polyContainerSelector).height();

            var shapesmouseX = mouseX - shapesoffsetX;
            var shapesmouseY = mouseY - shapesoffsetY;

            var mousepercentX = shapesmouseX / polygonswidth;
            var mousepercentY = shapesmouseY / polygonsheight;

            var finalmouseX = (mousepercentX) * 100;
            var finalmouseY = (mousepercentY) * 100;
            var normalisedX = parseFloat(finalmouseX).toFixed(3);
            var normalisedY = parseFloat(finalmouseY).toFixed(3);

            that.debug.nodeCount = that.debug.nodeCount + 1;

            if (that.debug.nodeCount < 3) {
                that.debug.nodeScss = that.debug.nodeScss + normalisedX + '% ' + normalisedY + '% ,';
            } else
                if (that.debug.nodeCount == 3) {
                    that.debug.nodeScss = that.debug.nodeScss + normalisedX + '% ' + normalisedY + '% );';
                    alert(that.debug.nodeScss);
                    that.debug.nodeScss = '-webkit-clip-path: polygon( ';
                    that.debug.nodeCount = 0;
                }
        });
    }
};

AboutPage.prototype.RenderNavDots = function () {
    for (var i = 0; i < this.totalPages; i++) {
        var $navDot = $('<span></span>', {
            "class": "about-PageIndicator"
        });

        if (i === 0) {
            $navDot.addClass('about-PageIndicator--selected');
        }

        this.$NavDotsElmt.append($navDot);
    }
};

AboutPage.prototype.SetupScrollEvents = function () {
    //$(window).on('mousewheel', this.OnPageMouseWheel);
    window.addEventListener("mousewheel", this.OnPageMouseWheel, { passive: false });
};

AboutPage.prototype.SetupPositioning = function () {
    this.pageElmts.css({
        display: 'none',
        position: 'absolute',
        width: '100%'
    }).eq(0).css({
        display: 'flex'
    });

    this.$ContainerElmt.css({
        height: '100%',
        position: 'relative'
    });
};

AboutPage.prototype.UpdateNavStyling = function () {
    var selectedTheme = this.pageElmts.eq(this.selectedPageIndex).data('nv-about-page');

    if (selectedTheme === 'darkTheme') {
        // Set Opposite to BG. I.E a dark bg get's a white nav
        window.MainNav.SetMenuBtnTheme('light');

        this.$NavDotsElmt.addClass('about-PageIndicatorContainer--light');
    } else {
        window.MainNav.SetMenuBtnTheme('dark');

        this.$NavDotsElmt.removeClass('about-PageIndicatorContainer--light');
    }
};

AboutPage.prototype.UpdatePageStyling = function () {
    var selectedTheme = this.pageElmts.eq(this.selectedPageIndex).data('nv-about-page');

    if (selectedTheme === 'darkTheme') {
        this.$ContainerElmt.addClass('about--darkTheme');
    } else {
        this.$ContainerElmt.removeClass('about--darkTheme');
    }
};

AboutPage.prototype.UpdateStyling = function () {
    /// <summary>
    /// Updates the styling based on what is set for
    /// data-nv-about-page attribute
    /// </summary>

    this.UpdateSelectedNavDot();
    this.UpdatePageStyling();
    this.UpdateNavStyling();
};

AboutPage.prototype.UpdateSelectedNavDot = function () {
    /// <summary>
    /// Changes the selected dot based on what is specified for the 
    /// selectedPageIndex property
    /// </summary>
    $('.about-PageIndicator', this.$NavDotsElmt)
        .removeClass('about-PageIndicator--selected')
        .eq(this.selectedPageIndex)
        .addClass('about-PageIndicator--selected');
};

AboutPage.prototype.EnablePageIndicator = function () {
    this.$NavDotsElmt.addClass('about-PageIndicatorContainer--active');
};

AboutPage.prototype.DisablePageIndicator = function () {
    this.$NavDotsElmt.removeClass('about-PageIndicatorContainer--active');
};

AboutPage.prototype.UpSection = function () {
    this.selectedPageIndex--;
    this.pageElmts
        .css({ display: 'none' })
        .eq(this.selectedPageIndex)
        .css({ display: 'flex' });
    this.UpdateStyling();
};

AboutPage.prototype.DownSection = function () {
    this.selectedPageIndex++;
    this.pageElmts
        .css({ display: 'none' })
        .eq(this.selectedPageIndex)
        .css({ display: 'flex' });
    this.UpdateStyling();
};
//#endregion

// Initializer
(function LoadAboutScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new AboutPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new AboutPage();
        });
    } else {
        window.setTimeout(LoadAboutScript, 50);
    }
})();