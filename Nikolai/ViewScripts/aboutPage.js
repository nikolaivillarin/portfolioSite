//#region Constructors
function AboutPage() {
    this.Initialize();
}
//#endregion

//#region Properties
AboutPage.prototype = {
    // Pages Structure
    //pages: [{
    //    $elmt: null,
    //    pageGraphic: null
    //}],
    pages: [],
    $ContainerElmt: null,
    $NavDotsElmt: null,
    selectedPageIndex: 0,
    previousPageIndex: 0,
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
    },
    AnimEndEventNames: {
        'WebkitAnimation': 'webkitAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd',
        'animation': 'animationend'
    },
    GetAnimEndEventName: function () {
        /// <summary>
        /// Returns animation event prefixed by browser
        /// </summary>
        return this.AnimEndEventNames[window.Modernizr.prefixed('animation')];
    },
    MicroInteraction: null
};
//#endregion

//#region Event Handlers
AboutPage.prototype.OnPageChange = function (pageId, previousPageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'about') {
        this.EnablePageIndicator();
        this.UpdateStyling();
        this.SubscribeToPageSpecificEvents();

        let transitionDirection = 'down';

        if (previousPageId === 'work') {
            transitionDirection = 'left';
        } else if (previousPageId === 'contact') {
            transitionDirection = 'right';
        }
        
        this.MicroInteraction.TriggerAnimation(
            transitionDirection,
            this.pages[this.selectedPageIndex].$elmt
        );

        this.ToggleProfilePicAnimation(true);
    } else {
        this.DisablePageIndicator();
        this.UnsubscribeToPageSpecificEvents();
        this.MicroInteraction.ResetAnimation();
        this.ToggleProfilePicAnimation(false);
    }
};

AboutPage.prototype.OnDialDropped = function () {
    if (window.MainNav.NavBar.DialControl.$Element.hasClass('nvDial--pulsing') === true) {
        window.MainNav.NavBar.DialControl.$Element.removeClass('nvDial--pulsing');

        const $page = this.pages[this.selectedPageIndex].$elmt;
        const pageGraphic = this.pages[this.selectedPageIndex].pageGraphic;

        // Animation Frames
        if (pageGraphic) {
            pageGraphic.StartShakeAnimation();
            $page.addClass('about-screen--animState2');

            window.setTimeout(() => {
                $page.addClass('about-screen--animState3');

                window.setTimeout(() => {
                    pageGraphic.TransitionToOriginalPosition(600);

                    $page.addClass('about-screen--animState4');

                    $(pageGraphic.svgElmt).addClass('about-screen__img-certification');

                    window.setTimeout(() => {
                        $page.attr('data-nv-about-expanded', true);
                        this.TogglePageDescription();
                    }, 2000);
                }, 500);
            }, 500);
        }
    }
};

AboutPage.prototype.TogglePageDescription = function (direction = 'up') {
    const $currentPage = this.pages[this.selectedPageIndex].$elmt;

    if ($currentPage.attr('data-nv-about-expanded') === 'true') {
        const $elmtsToAnimate = $('[data-nv-animate-auto-play="false"]', $currentPage.get());
        const $elmtsToReset = $('#about [data-nv-animate-auto-play="false"]').not($elmtsToAnimate);

        $elmtsToAnimate.each((i, elmt) => {
            this.MicroInteraction.StartAnimation(elmt, direction);
        });

        if ($elmtsToReset.length !== 0) {
            this.MicroInteraction.ResetAnimation(null, $elmtsToReset);
        }
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

AboutPage.prototype.OnTargetClick = function () {
    window.MainNav.NavBar.DialControl.$Element.effect({
        effect: 'bounce'
        , direction: 'up'
        , distance: 40
        , times: 3
    });
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

    if (evt.deltaY < 0) {
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
    this.InitializePages();

    this.pageGraphics = $('[data-nv-about-page-svg]');
    this.$ContainerElmt = this.pages[0].$elmt.parent();
    this.totalPages = this.pages.length;
    this.$NavDotsElmt = $('#pnlAboutPageIndicator');
    this.MicroInteraction = new window.MicroInteraction('about');

    // Bind Scope
    this.OnPageMouseWheel = $.proxy(this.OnPageMouseWheel, this);

    // Event Handlers
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    // Initialize functionality
    this.ToggleClipPathPositionHelper();
    this.RenderNavDots();
};

AboutPage.prototype.InitializePages = function () {
    $('[data-nv-about-page]').each((index, elmt) => {
        const $pageElmt = $(elmt);

        const $svgElmt = $('[data-nv-about-page-svg]', elmt);
        
        this.pages.push({
            $elmt: $pageElmt,
            pageGraphic: $svgElmt.length === 1 ?
                new window.PolyEffect($svgElmt.get(0)) :
                null
        });

        // Page Transitions
        $pageElmt.on(this.GetAnimEndEventName(), $.proxy((evt) => {
            if (evt.target.hasAttribute('data-nv-about-page')) {
                $pageElmt
                    .removeClass('expand-container-ontop')
                    .removeClass('expand-moveToTop')
                    .removeClass('expand-moveFromBottom')
                    .removeClass('expand-moveToBottom')
                    .removeClass('expand-moveFromTop');

                this.pages[this.previousPageIndex].$elmt
                    .removeClass('about-screen--selected');
            }
        }, this));
    });
};

AboutPage.prototype.ToggleProfilePicAnimation = function (toggle) {
    if (toggle === true) {
        $('[data-nv-profile-pic-anim]')
            .addClass('about-profile-pic--motionAnim');
    } else if (toggle === false) {
        $('[data-nv-profile-pic-anim]')
            .removeClass('about-profile-pic--motionAnim');
    } else if (this.selectedPageIndex === 0) {
        $('[data-nv-profile-pic-anim]')
            .addClass('about-profile-pic--motionAnim');
    } else {
        $('[data-nv-profile-pic-anim]')
            .removeClass('about-profile-pic--motionAnim');
    }
};

AboutPage.prototype.SubscribeToPageSpecificEvents = function () {
    window.MainNav.NavBar.DialControl.SubscribeToDragEvent(
        $.proxy(this.OnDialDragged, this)
    );

    window.MainNav.NavBar.DialControl.SubscribeToDropEvent(
        $.proxy(this.OnDialDropped, this)
    );

    window.addEventListener("wheel", this.OnPageMouseWheel, { passive: false });

    $('[data-nv-drop-target]').on('click', this.OnTargetClick);
};

AboutPage.prototype.UnsubscribeToPageSpecificEvents = function () {
    window.MainNav.NavBar.DialControl.UnsubscribeToDragEvent(
        $.proxy(this.OnDialDragged, this)
    );

    window.MainNav.NavBar.DialControl.UnsubscribeToDropEvent(
        $.proxy(this.OnDialDropped, this)
    );

    window.removeEventListener("wheel", this.OnPageMouseWheel, { passive: false });

    $('[data-nv-drop-target]').off('click', this.OnTargetClick);
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
    $('[data-nv-about-page]').each((index, elmt) => {
        const tooltipText = $(elmt).attr('data-nv-about-page-tooltip');

        let $navTooltip = $('<span></span>', {
            "class": "about-PageIndicator-tooltip",
            "text": tooltipText
        });

        let $navDot = $('<span></span>', {
            "class": "about-PageIndicator"
        });

        $navDot.append($navTooltip);

        if (index === 0) {
            $navDot.addClass('about-PageIndicator--selected');
        }

        this.$NavDotsElmt.append($navDot);
    });
};

AboutPage.prototype.UpdateNavStyling = function () {
    var selectedTheme = this.pages[this.selectedPageIndex].$elmt.data('nv-about-page');

    if (selectedTheme === 'darkTheme') {
        // Set Opposite to BG. I.E a dark bg get's a white nav
        window.MainNav.SetMenuBtnTheme('light');

        this.$NavDotsElmt.addClass('about-PageIndicatorContainer--light');
    } else {
        window.MainNav.SetMenuBtnTheme('dark');

        this.$NavDotsElmt.removeClass('about-PageIndicatorContainer--light');
    }
};

AboutPage.prototype.UpdateStyling = function () {
    /// <summary>
    /// Updates the styling based on what is set for
    /// data-nv-about-page attribute
    /// </summary>
    this.UpdateSelectedNavDot();
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
    this.previousPageIndex = this.selectedPageIndex;
    this.selectedPageIndex--;

    const previousPage = this.pages[this.previousPageIndex];
    const selectedPage = this.pages[this.selectedPageIndex];

    previousPage.$elmt
        .addClass('expand-container-ontop expand-moveToBottom');

    selectedPage.$elmt
        .addClass('expand-moveFromTop about-screen--selected');

    this.UpdateStyling();

    this.MicroInteraction.TriggerAnimation(
        'up',
        selectedPage.$elmt
    );

    this.ToggleProfilePicAnimation();

    this.TogglePageDescription('up');

    if (previousPage.pageGraphic) {
        previousPage.pageGraphic.PauseFloatAnimation();
    }

    if (selectedPage.pageGraphic) {
        selectedPage.pageGraphic.TransitionBottomToTop();

        if (selectedPage.pageGraphic.IsScattered) {
            selectedPage.pageGraphic.StartFloatAnimation();
        }

        window.setTimeout(() => {
            selectedPage.pageGraphic.ShimmerTopToBottom();
        }, 2000);
    }
};

AboutPage.prototype.DownSection = function () {
    this.previousPageIndex = this.selectedPageIndex;
    this.selectedPageIndex++;

    const previousPage = this.pages[this.previousPageIndex];
    const selectedPage = this.pages[this.selectedPageIndex];

    previousPage.$elmt
        .addClass('expand-container-ontop expand-moveToTop');

    selectedPage.$elmt
        .addClass('expand-moveFromBottom about-screen--selected');

    this.UpdateStyling();

    this.MicroInteraction.TriggerAnimation(
        'down',
        selectedPage.$elmt
    );

    this.ToggleProfilePicAnimation();

    this.TogglePageDescription('down');

    if (previousPage.pageGraphic) {
        previousPage.pageGraphic.PauseFloatAnimation();
    }

    if (selectedPage.pageGraphic) {
        selectedPage.pageGraphic.TransitionTopToBottom();

        if (selectedPage.pageGraphic.IsScattered) {
            selectedPage.pageGraphic.StartFloatAnimation();
        }

        window.setTimeout(() => {
            selectedPage.pageGraphic.ShimmerTopToBottom();
        }, 2000);
    }
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