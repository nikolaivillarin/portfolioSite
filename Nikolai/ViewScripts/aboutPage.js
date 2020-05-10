//#region Constructors
function AboutPage() {
    this.Initialize();

    this.msLogo = new window.PolyEffect(document.getElementById('msLogoSvg'));
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
        this.SubscribeToPageSpecificEvents();
    } else {
        this.DisablePageIndicator();
        this.UnsubscribeToPageSpecificEvents();
    }
};

AboutPage.prototype.OnDialDropped = function () {
    if (window.MainNav.NavBar.DialControl.$Element.hasClass('nvDial--pulsing') === true) {
        window.MainNav.NavBar.DialControl.$Element.removeClass('nvDial--pulsing');

        // Animation Frames
        this.pageElmts.eq(this.selectedPageIndex).addClass('about-screen--animState2');

        window.setTimeout(() => {
            this.pageElmts.eq(this.selectedPageIndex).addClass('about-screen--animState3');

            window.setTimeout(() => {
                this.msLogo.StepToOriginalPosition(1000);

                this.pageElmts.eq(this.selectedPageIndex).addClass('about-screen--animState4');

                $(this.msLogo.svgElmt).addClass('about-screen__img-certification');

                window.setTimeout(() => {
                    this.pageElmts.eq(this.selectedPageIndex).addClass('about-screen--animState5');
                }, 4000);
            }, 500);
        }, 500);
    }
};

AboutPage.prototype.OnDialDragged = function () {
    let isInBounds = false;
    const targetElmt = document.querySelectorAll('[data-nv-drop-target]');

    if (window.MainNav.NavBar.DialControl.IsDialWithinElmt(targetElmt[0])) {
        isInBounds = true;
    }

    if (isInBounds) {
        if (window.MainNav.NavBar.DialControl.$Element.hasClass('nvDial--pulsing') === false) {

            window.MainNav.NavBar.DialControl.$Element.addClass('nvDial--pulsing');
        }
    } else {
        if (window.MainNav.NavBar.DialControl.$Element.hasClass('nvDial--pulsing') === true) {

            window.MainNav.NavBar.DialControl.$Element.removeClass('nvDial--pulsing');
        }
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

    // Event Handlers
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    // Initialize functionality
    this.ToggleClipPathPositionHelper();
    this.SetupPositioning();
    this.RenderNavDots();
};

AboutPage.prototype.SubscribeToPageSpecificEvents = function () {
    window.MainNav.NavBar.DialControl.SubscribeToDragEvent(
        $.proxy(this.OnDialDragged, this)
    );

    window.MainNav.NavBar.DialControl.SubscribeToDropEvent(
        $.proxy(this.OnDialDropped, this)
    );

    window.addEventListener("mousewheel", this.OnPageMouseWheel, { passive: false });
};

AboutPage.prototype.UnsubscribeToPageSpecificEvents = function () {
    window.MainNav.NavBar.DialControl.UnsubscribeToDragEvent(
        $.proxy(this.OnDialDragged, this)
    );

    window.MainNav.NavBar.DialControl.UnsubscribeToDropEvent(
        $.proxy(this.OnDialDropped, this)
    );

    window.removeEventListener("mousewheel", this.OnPageMouseWheel, { passive: false });
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