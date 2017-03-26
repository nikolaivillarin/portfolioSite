/// <summary>
/// Handles the navigational functionality for the site. Since this site is a single page
/// application. This script will override the default link functionality and navigate to the
/// specified page in the link without a reload.
/// </summary>

/// <notes>
/// Clicking a link
/// - Triggers NavigateTo
/// - Then HistoryChanged
/// - Then TransitionToPage
/// Page Loading
/// - Triggers HistoryChanged
/// - Then TransitionToPage
/// Back/Forward Buttons
/// - Triggers HistoryChanged
/// - Then TransitionToPage
/// </notes>


//#region History API Modifications
(function (history) {
    /// <summary>
    /// Fix for the history.onstate change event from not firing
    /// </summary>
    var pushState = history.pushState;

    history.pushState = function (state) {
        if (typeof history.onpushstate === 'function') {
            history.onpushstate({state: state});
        }

        return pushState.apply(history, arguments);
    };
})(window.history);
//#endregion

//#region Constructor
function MainNavigation() {
    /// <summary>
    /// Default Constructor
    /// </summary>
}
//#endregion

//#region Properties
MainNavigation.prototype = {
    $Element: $('#pnlMainNav')
    // Navigation Bar Object
    , NavBar: {} 
    // Page Transitions Helper
    , PageTransitions: {} 
    // Page Change Observers
    , OnPageChangeHandlers: [] 
    // Dial Click Handlers
    , OnDialClickHandlers: [] 
    // When an Async page is loaded
    , OnPageLoadedHandlers: []
    // When the navigation control is loaded
    , OnNavigationLoadedHandlers: []
    , TotalAsyncPages: 0
    , TotalLoadedAsyncPages: 0
};
//#endregion

//#region Methods
MainNavigation.prototype.Initialize = function () {
    /// <summary>
    /// Initializes dependencies and event handlers
    /// </summary>
    if (window.NVNavBar === null || window.NVNavBar === undefined) {
        throw new Error('NVNavBar script is missing');
    } else {
        this.NavBar = new window.NVNavBar('pnlNavBar');

        this.NavBar.DialControl.SubscribeToClickEvent(
            $.proxy(this.OnDialClick, this)
        );
    }

    if (window.NavigationTransition === null || window.NavigationTransition === undefined) {
        throw new Error('Navigation Transition script is missing');
    } else {
        this.PageTransitions = new window.NavigationTransition('loading');
        this.PageTransitions.PageChangedCallback = $.proxy(this.OnPageChanged, this);
        this.PageTransitions.SelectPage('loading');
        this.PageTransitions.AnchorElmtID = 'lnkHome';
    }

    // Add Url to History Stack
    this.HistoryChanged();

    this.SetupPageLinks();
    
    window.onpopstate = history.onpushstate = $.proxy(this.HistoryChanged, this);

    $(window).on('resize', this.TriggerScrollAnimation);

    $('[data-nv-page]')
        .on('scroll', this.TriggerScrollAnimation)
        .trigger('scroll');

    this.OnNavigationLoadedHandlers.forEach(function (item) {
        item.call(item);
    });
};

MainNavigation.prototype.SetupPageLinks = function () {
    /// <summary>
    /// Overrides the default link functionality
    /// </summary>
    $('body a').click(
        $.proxy(this.OnLinkClick, this)
    );
};

MainNavigation.prototype.GetCurrentRoute = function () {
    /// <summary>
    /// Get's the Controller and Action name from the URL
    /// </summary>
    /// <returns type="object">
    /// Returns an object containing two properties: Controller and Action
    /// </returns>
    var url = window.location.pathname;
  
    return this.GetRoute(url);
};

MainNavigation.prototype.GetRoute = function (url) {
    /// <summary>
    /// Get's the route information for the URL specified
    /// </summary>
    /// <param name="url" type="string">
    /// The Url to retrieve the route from
    /// </param>
    /// <returns type="object">
    /// Returns an object containing two properties: Controller and Action
    /// </returns>
    if (url === undefined || url === null) {
        throw new Error('Url must be specified in order to get route');
    }

    var route = {
        Url: url
        , Controller: null
        , Action: null
        , PageID: null // ID associated with the page section to be shown
    };

    if (url === '/' || url === '/Home/Index') {
        route.Controller = 'home';
        route.PageID = 'home';
    } else {
        var regExp = /\w+/g;
        var urlMatch = [];
        var match = null;

        while ((match = regExp.exec(url)) !== null) {
            urlMatch.push(match[0]);
        }

        route.Controller = urlMatch[0] ? urlMatch[0].toLowerCase() : null;
        route.Action = urlMatch[1] ? urlMatch[1].toLowerCase() : null;

        route.PageID = route.Controller;

        if (route.Action !== null) {
            route.PageID += '-' + route.Action;
        }
    }

    return route;
};

MainNavigation.prototype.SubscribeToOnNavigationLoaded = function (fn) {
    this.OnNavigationLoadedHandlers.push(fn);
};

MainNavigation.prototype.UnsubscribeToOnNavigationLoaded = function (fn) {
    this.OnNavigationLoadedHandlers = this.OnNavigationLoadedHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};

MainNavigation.prototype.SubscribeToOnPageLoaded = function (fn) {
    /// <summary>
    /// Subscribe to the OnPageLoaded for when asynchronous pages are loaded.
    /// If multiple asynchronous pages are requested this is called after all 
    /// asynchronous pages load
    /// </summary>
    /// <param name="fn" type="function">
    /// Function to be called when event is fired. This function should take no arguments
    /// </param>
    this.OnPageLoadedHandlers.push(fn);
};

MainNavigation.prototype.UnsubscribeToOnPageLoaded = function (fn) {
    /// <summary>
    /// Unsubscribe to the onPageLoaded event
    /// </summary>
    /// <param name="fn" type="function">
    /// Function that was used when calling the subscribe function
    /// </param>
    this.OnPageLoadedHandlers = this.OnPageLoadedHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};

MainNavigation.prototype.SubscribeToOnPageChange = function (fn) {
    /// <summary>
    /// Subscribe to the onPageChange event which is called when the page changes
    /// </summary>
    /// <param name="fn" type="function">
    /// Function to be called when event is fired. This function should have two parameters:
    /// selectedPageID - ID of the new page being displayed
    /// previousPageID - The ID of the previous page selected
    /// </param>
    this.OnPageChangeHandlers.push(fn);
};

MainNavigation.prototype.UnsubscribeToOnPageChange = function (fn) {
    /// <summary>
    /// Unsubscribe to the onPageChange event
    /// </summary>
    /// <param name="fn" type="function">
    /// Function that was used when calling the subscribe function
    /// </param>
    this.OnPageChangeHandlers = this.OnPageChangeHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};

MainNavigation.prototype.SubscribeToDialClick = function (fn) {
    /// <summary>
    /// Subscribe to the dial click event. This event will not be fired
    /// when the dial is in draggable state. 
    /// </summary>
    /// <param name="fn" type="function">
    /// Function to be called when event is fired. This function will have two parameters:
    /// selectedPageID - ID of the new page being displayed
    /// previousPageID - The ID of the previous page selected
    /// </param>
    this.OnDialClickHandlers.push(fn);
};

MainNavigation.prototype.UnsubscribeToDialCick = function (fn) {
    /// <summary>
    /// Unsubscribe to the dialClick event
    /// </summary>
    /// <param name="fn" type="function">
    /// Function that was used when calling the subscribe function
    /// </param>
    this.OnDialClickHandlers = this.OnDialClickHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};

MainNavigation.prototype.SetMenuBtnTheme = function () {
    /// <summary>
    /// Set's the navigation theme specified on the selected page
    /// </summary>
    var $page = $('#' + this.PageTransitions.SelectedPageID);
    var selectedTheme = $page.data('nv-theme') ? $page.data('nv-theme') : 'dark';

    var $btnHamburger = $('#btnHamburger');

    this.NavBar.SetTheme(selectedTheme);

    switch (selectedTheme) {
        case 'dark':
            $('span:even', $btnHamburger)
                .removeClass('button-hamburger__lineOnDark')
                .addClass('button-hamburger__line');

            this.$Element.removeClass('nav__itemContainer--onDark');
            break;
        case 'light':
            $('span:even', $btnHamburger)
                .addClass('button-hamburger__lineOnDark')
                .removeClass('button-hamburger__line');

            this.$Element.addClass('nav__itemContainer--onDark');
            break;
        default:
            $('span:even', $btnHamburger)
               .removeClass('button-hamburger__lineOnDark')
               .addClass('button-hamburger__line');

            this.$Element.removeClass('nav__itemContainer--onDark');
            break;
    }
};

MainNavigation.prototype.SetMenuBtnState = function () {
    /// <summary>
    /// Set's the Menu buttons state depending on what is set on data-nv-nav-state
    /// </summary>
    var $page = $('#' + this.PageTransitions.SelectedPageID);
    var state = $page.data('nv-nav-state') ? $page.data('nv-nav-state').toLowerCase() : 'default';

    var $btnHamburger = $('#btnHamburger');

    switch (state) {
        case 'default':
            $btnHamburger.show();
            break;
        case 'hidden':
            $btnHamburger.hide();
            break;
    }
};

MainNavigation.prototype.NavigateTo = function (url, targetID) {
    /// <summary>
    /// Uses history.api to navigate to the specified page
    /// </summary>
    /// <param name="url" type="string">
    /// The URL for the new page
    /// </param>
    /// <param name="targetID" type="string">
    /// [Optional] The ID of the element that caused the event. This is used to specify
    /// the origin of the transition. If not specified defaults to the Dial Control.
    /// </param>
    if (targetID === undefined) {
        targetID = this.NavBar.DialControl.$Element.attr('id');
    }

    var route = this.GetRoute(url);
    var pageTitle = 'Nikolai Villarin | ';

    if (route.Action !== null) {
        pageTitle += route.Action;
    } else {
        pageTitle += route.Controller;
    }

    route.TargetID = targetID;

    window.history.pushState(route, pageTitle, url);
};

MainNavigation.prototype.LoadPage = function (pageUrl) {
    /// <summary>
    /// Retrieves the page asynchronously
    /// </summary>
    /// <param name="pageUrl" type="string">
    /// The url of the page to load
    /// </param>
    $('#mainLoadingOverlay').addClass('loading-overlay--active');

    this.NavBar.SetState('loading');

    $.get(pageUrl + 'Partial',
        $.proxy(this.PageLoaded, this, pageUrl)
    ).fail(
        $.proxy(this.AsyncPageError, this, pageUrl)
    );
};

MainNavigation.prototype.EagerlyLoadPages = function () {
    /// <summary>
    /// Eagerly loads the pages specified in the data-nv-eagerlyload attribute
    /// </summary>
    var urlRegEx = /[\w\\]+/g;
    var pageUrls = $('[data-nv-eagerlyload]').data('nv-eagerlyload');
    var urls = [];
    var match = null;

    if (pageUrls !== undefined) {
        while ((match = urlRegEx.exec(pageUrls)) !== null) {
            urls.push(match[0]);
        }
    }

    this.TotalAsyncPages = urls.length;
    this.TotalLoadedAsyncPages = 0;

    if (urls.length === 0) {
        this.AsyncPageLoaded();
    } else {
        for (var i = 0; i < urls.length; i++) {
            $.get(urls[i],
                $.proxy(this.RenderAsyncPage, this)
            ).fail(
                $.proxy(this.AsyncPageError, this)
            );
        }
    }
};
//#endregion

//#region Event Handlers
MainNavigation.prototype.OnDialClick = function () {
    /// <summary>
    /// Event is triggered when dial is clicked. This is a wrapper to the 
    /// NVDial click event, this function attaches two additional parameters
    /// to the subscribed function
    /// </summary>
    var that = this;

    this.OnDialClickHandlers.forEach(function (item) {
        item.call(item, that.PageTransitions.SelectedPageID, that.PageTransitions.PreviousPageID);
    });
};

MainNavigation.prototype.OnPageChanged = function () {
    /// <summary>
    /// Event is triggered when page is changed. Subscribe to this event
    /// using the SubscribeToOnPageChange method
    /// </summary>
    var that = this;

    // For scroll animation
    $('[data-nv-page]').trigger('scroll');

    this.SetMenuBtnTheme();

    this.SetMenuBtnState();

    this.OnPageChangeHandlers.forEach(function (item) {
        item.call(item, that.PageTransitions.SelectedPageID, that.PageTransitions.PreviousPageID);
    });
};

MainNavigation.prototype.HistoryChanged = function (evt) {
    /// <summary>
    /// Triggered for history events IE: PushState, Back, and Forward
    /// Transitions to the next page
    /// </summary>
    evt = evt ? evt : {};

    var route = null;

    if (evt.state !== undefined && evt.state !== null) {
        // Triggered by Pushstate or when a Link is clicked
        route = evt.state;

        this.PageTransitions.AnchorElmtID = route.TargetID;
    } else {
        // Triggered by Back/Forward buttons and page loading
        route = this.GetCurrentRoute();
    }

    this.NavBar.SelectLinkByUrl(route.Url);
    this.PageTransitions.TransitionToPage(route.PageID);
};

MainNavigation.prototype.OnLinkClick = function (evt) {
    /// <summary>
    /// Captures link click event and changes behavior for single
    /// page application
    /// </summary>
    var $link = $(evt.currentTarget);

    if ($link.data('nv-ignore') === true) {
        return;
    }

    evt.preventDefault();

    var url = $link.attr('href');

    var route = this.GetRoute(url);

    if ($('#' + route.PageID).length !== 0) {
        if ($link.data('nv-target') === false) {
            // If specified on the link not to target default to dial
            this.NavigateTo(url);
        } else {
            this.NavigateTo(url, $link.attr('id'));
        }
    } else {
        this.LoadPage(url);
    }
};

MainNavigation.prototype.RenderAsyncPage = function (markup) {
    $('#pnlPages').append(markup);

    this.TotalLoadedAsyncPages++;

    this.AsyncPageLoaded();
};

MainNavigation.prototype.AsyncPageError = function (url, err) {
    var errorMsg = 'Cannot retrieve page. Error ' + err.status + ' ' + err.statusText;

    if (url) {
        errorMsg += ' Page URL: ' + url;
    }

    throw new Error(errorMsg);
};

MainNavigation.prototype.AsyncPageLoaded = function () {
    /// <summary>
    /// Notifies event listeners that Async page has loaded
    /// </summary>
    if (this.TotalAsyncPages === this.TotalLoadedAsyncPages) {
        this.OnPageLoadedHandlers.forEach(function (item) {
            item.call();
        });
    }
};

MainNavigation.prototype.PageLoaded = function (url, markup) {
    /// <summary>
    /// Renders page once loaded
    /// </summary>
    /// <param name="url" type="string">
    /// The url of the page to load
    /// </param>
    /// <param name="markup" type="string">
    /// The page markup to render
    /// </param>
    var $markup = $('<div />', { html: markup }).contents();

    $markup = this.PageTransitions.HidePage(null, $markup);

    $('#pnlPages').append($markup);

    $markup
        .on('scroll', this.TriggerScrollAnimation)
        .trigger('scroll');

    $('#mainLoadingOverlay').removeClass('loading-overlay--active');

    this.AsyncPageLoaded();

    this.NavigateTo(url);
};

MainNavigation.prototype.TriggerScrollAnimation = function () {
    /// <summary>
    /// Determines if elements with the data property data-nv-animate
    /// are in view. If they are an in-view class is added to the element
    /// which is used to trigger CSS animations
    /// </summary>
    var windowHeight = $(window).outerHeight();
    var windowTopPosition = $(window).scrollTop();
    var windowBottomPosition = windowTopPosition + windowHeight - 10;

    $('[data-nv-animate]').each(function () {
        var elmtHeight = $(this).outerHeight();
        var elmtTopPosition = $(this).offset().top;
        var elmtBottomPosition = elmtTopPosition + elmtHeight;

        // Page transitions shrink's containing elements to make the not visible
        var elmtIsVisible = $(this).closest('[data-nv-page]').height() > 0;

        if (elmtBottomPosition >= windowTopPosition
            && elmtTopPosition <= windowBottomPosition
            && elmtIsVisible === true) {
            $(this).addClass('in-view');
        } else {
            $(this).removeClass('in-view');
        }
    });
};
//#endregion