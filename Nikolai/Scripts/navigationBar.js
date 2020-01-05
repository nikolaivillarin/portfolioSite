/// <summary>
/// This script contains the functionality for the Navigation Bar
/// and the navigation dial. When a link is selected the nvbar_selected
/// event will be triggered.
/// </summary>


/*------------------------------------*\
    NV Navigation Bar
\*------------------------------------*/
//#region Constructor
function NVNavBar(navElmtID) {
    /// <summary>
    /// Constructor for making the Navigation Bar
    /// </summary>
    /// <param name="navElmtID" type="string">
    /// Element ID for Nav Bar
    /// </param>
    this.ID = navElmtID;
    this.Initialize();
}
//#endregion

//#region Properties
NVNavBar.prototype = {
    ID: ''
    // Nav Bar Element
    , $Element: {} 
    , NavItems: []
    , NavItemsAreClickable: false
    , SelectedNavItem: {}
    // Used when user hovers over link, but before link is actually selected
    , ChosenLinkIndex: 0
    , DialControl: {}
    // Specifies the placeholder for the dial. This is used internally
    , DialTarget: null
    , Disabled: false
    , NavState: 'default'
    , Theme: 'dark'
    // Animation delay for sliding Nav Bar in milliseconds
    , NavBarAnimationDelay: 600
};
//#endregion

//#region Methods
NVNavBar.prototype.Initialize = function () {
    if ($('#' + this.ID).length === 0) {
        return;
    }

    // Property Setters
    this.$Element = $('#' + this.ID);
    
    // Setup Functions
    this.SetupNavItems();
    this.SetupDial();

    // Global Event Handlers
    $(window).resize(
        $.proxy(this.WindowResize, this)
    );
};

NVNavBar.prototype.SetState = function (url, state) {
    /// <summary>
    /// Set's the navigation bar's state based on URL.
    /// The URL is used to located that data- attributes
    /// for the page specified by the URL. If the page cannot be found
    /// the Navbar will go into loading state
    /// </summary>
    /// <param name="url" type="string">
    /// The Url associated with the selected page
    /// </param>
    var pageID = this.GetPageIDByUrl(url);

    if (state) {
        this.SetDialState(pageID, state);
    } else {
        this.SetDialState(pageID);
    }

    this.SetNavItemsState(pageID);

    this.PositionDial(pageID);

    this.SetPageState(pageID);
};

NVNavBar.prototype.SetNavItemsState = function (pageID, state) {
    /// <summary>
    /// Set's the NavBar state by specifying which navigation items
    /// are active. Example: Back, Current, and Forward buttons.
    /// By default all buttons are active.
    /// Options: previousOnly, hidden, and default
    /// </summary>
    /// <param name="pageID" type="string">
    /// The ID of the page that will have the data-nv-nav-state attribute
    /// </param>
    /// <param name="state" type="string">
    /// [optional] the state to set the nav bar
    /// </param>
    var $page = $('#' + pageID);
    var navItemsState = $page.data('nv-nav-state') ? $page.data('nv-nav-state').toLowerCase() : 'default';

    if (state) {
        navItemsState = state;
    }

    switch (navItemsState) {
        case 'default':
            for (var a = 0; a < this.NavItems.length; a++) {
                this.NavItems[a].Show();
            }

            break;
        case 'hidden':
            for (var b = 0; b < this.NavItems.length; b++) {
                this.NavItems[b].Hide();
            }
            break;
        case 'previousonly':
            var selectedNavItemIndex = this.NavItems.indexOf(this.SelectedNavItem);

            for (var c = 0; c < this.NavItems.length; c++) {
                if (c !== selectedNavItemIndex) {
                    this.NavItems[c].Show();
                } else {
                    this.NavItems[c].Hide();
                }
            }

            if (selectedNavItemIndex < this.NavItems.length - 1) {
                this.NavItems[selectedNavItemIndex + 1].Hide();
            }

            break;
    }
};

NVNavBar.prototype.SetDialState = function (pageID, state) {
    /// <summary>
    /// Set's the NavBar Dial state depending on the data attributes set
    /// on the specified page
    /// </summary>
    /// <param name="pageID" type="string">
    /// The ID of the page that contains the data-nv-state attribute
    /// </param>
    /// <param name="state" type="string">
    /// [Optional] Specifies the state of the dial. This overrides what is
    /// specified on the page data attributes. Possible options are:
    /// default, loading, close, send
    /// </param>
    var $page = $('#' + pageID);
    var dialState = $page.data('nv-state') ? $page.data('nv-state').toLowerCase() : 'default';
    var isDialResponsive = $page.data('nv-dial-responsive') ? $page.data('nv-dial-responsive') : false;

    this.DialControl.IsResponsive(isDialResponsive);

    if (state) {
        dialState = state;
    }

    switch (dialState) {
        case 'default':
            this.Disabled = false;

            this.DialControl.DefaultState();

            break;
        case 'close':
            this.Disabled = true;

            this.DialControl.CloseState();

            break;
        case 'send':
            this.Disabled = false;

            this.DialControl.SendState();

            break;
        case 'loading':
            this.Disabled = true;

            this.DialControl.LoadingState();

            break;
        case 'initialload':
            this.Disabled = true;

            this.DialControl.InitialLoadingState();

            break;
        default:
            this.Disabled = false;

            this.DialControl.DefaultState();

            break;
    }
};

NVNavBar.prototype.SetPageState = function (pageID) {
    /// <summary>
    /// Set's the page state depending on what is specified on the
    /// data-nv-page-state attribute. By default the page will not be
    /// scrollable
    /// </summary>
    var $page = $('#' + pageID);
    var pageState = $page.data('nv-page-state') ? $page.data('nv-page-state').toLowerCase() : 'default';

    switch (pageState) {
        case 'default':
            $('body').css('overflow', 'hidden');
            $('[data-nv-page]').css({
                'overflow-y': 'hidden'
                , '-webkit-overflow-scrolling': 'unset'
            });
            break;
        case 'scrollable':
            $('body').css('overflow', 'hidden');
            $('[data-nv-page]').css({
                'overflow-y': 'auto'
                , '-webkit-overflow-scrolling': 'touch'
            });
            break;
    }
};

NVNavBar.prototype.SetTheme = function (theme) {
    /// <summary>
    /// Change the theme of the Nav Bar
    /// </summary>
    if (theme === 'light') {
        this.$Element.addClass('nav-bar--onDark');

        $('[data-js-hook="linkBtn"]', this.$Element)
            .addClass('nav__itemContainer--onDark');

        $('.icon--home', this.$Element)
            .addClass('icon--homeOnDark')
            .removeClass('icon--home');

        $('.icon--work', this.$Element)
            .addClass('icon--workOnDark')
            .removeClass('icon--work');

        $('.icon--about', this.$Element)
            .addClass('icon--aboutOnDark')
            .removeClass('icon--about');

        $('.icon--contact', this.$Element)
            .addClass('icon--contactOnDark')
            .removeClass('icon--contact');
    } else if (theme === 'dark_light') {
        this.$Element.addClass('nav-bar--onDark');

        $('[data-js-hook="linkBtn"]', this.$Element)
            .addClass('nav__itemContainer--onDark');

        $('.icon--home', this.$Element)
            .addClass('icon--homeOnDark')
            .removeClass('icon--home');

        $('.icon--work', this.$Element)
            .addClass('icon--workOnDark')
            .removeClass('icon--work');

        $('.icon--about', this.$Element)
            .addClass('icon--aboutOnDark')
            .removeClass('icon--about');

        $('.icon--contact', this.$Element)
            .addClass('icon--contactOnDark')
            .removeClass('icon--contact');
    } else {
        this.$Element.removeClass('nav-bar--onDark');

        $('[data-js-hook="linkBtn"]', this.$Element)
            .removeClass('nav__itemContainer--onDark');

        $('.icon--homeOnDark', this.$Element)
            .removeClass('icon--homeOnDark')
            .addClass('icon--home');

        $('.icon--workOnDark', this.$Element)
            .removeClass('icon--workOnDark')
            .addClass('icon--work');

        $('.icon--aboutOnDark', this.$Element)
            .removeClass('icon--aboutOnDark')
            .addClass('icon--about');

        $('.icon--contactOnDark', this.$Element)
            .removeClass('icon--contactOnDark')
            .addClass('icon--contact');
    }
};

NVNavBar.prototype.SetupDial = function () {
    /// <summary>
    /// Initializes the NV Dial control if it is available
    /// </summary>
    var $dial = $('[data-js-hook="nvDial"]');

    if ($dial.length === 1) {
        var selectedLinkPosition = this.SelectedNavItem.GetPosition();

        this.DialControl = new NVDial(selectedLinkPosition.x, selectedLinkPosition.y);

        this.DialControl.SubscribeToDragEvent(
            $.proxy(this.DialDragged, this)
        );

        this.DialControl.SubscribeToDropEvent(
            $.proxy(this.DialDropped, this)
        );
    }
};

NVNavBar.prototype.SetupNavItems = function () {
    /// <summary>
    /// Each link in the Nav gets rendered as NV Link. This function
    /// initializes each link object and set's up all the callbacks associated
    /// with the link.
    /// </summary>
    var $links = $('[data-js-hook="linkBtn"]', this.$Element);
    var links = [];
    var that = this;

    $links.each(function (index) {
        var navLink = new NVNavLink(index + 1, $(this), that.NavItemsAreClickable);

        navLink.OnClickCallback = $.proxy(that.LinkClicked, that);

        if (that.DialControl.length === 0) {
            navLink.OnMouseOverCallback = $.proxy(that.ShrinkSelectedLink, that);
            navLink.OnMouseOutCallback = $.proxy(that.ExpandSelectedLink, that);
        }

        links.push(navLink);
    });

    // Defaults to the first link for initial positioning
    links[0].Select();

    this.SelectedNavItem = links[0];

    this.NavItems = links;
};

NVNavBar.prototype.GetCenterPosition = function () {
    /// <summary>
    /// Retrieves the Nav Bar's center position. This is used
    /// as the default location for the dial control
    /// </summary>
    /// <returns type="object">
    /// Returns an object with x and y properties
    /// </returns>
    var position = {
        x: 0
        , y:0
    };

    position.y = this.$Element.offset().top + 16;
    position.x = $(window).width() / 2 - 44;

    return position;
};

NVNavBar.prototype.GetPageIDByUrl = function (url) {
    /// <summary>
    /// Get's the page ID based on the URL provided
    /// </summary>
    /// <returns type="string">
    /// Returns the page ID
    /// </returns>
    if (url === undefined || url === null) {
        throw new Error('Url must be specified in order to get the page ID');
    }

    var pageID = null;

    if (url === '/' || url === '/Home/Index') {
        pageID = 'home';
    } else {
        var regExp = /\w+/g;
        var urlMatch = [];
        var match = null;

        while ((match = regExp.exec(url)) !== null) {
            urlMatch.push(match[0]);
        }

        pageID = urlMatch[0] ? urlMatch[0].toLowerCase() : null;

        if (urlMatch[1]) {
            pageID += '-' + urlMatch[1].toLowerCase();
        }
    }

    return pageID;
};

NVNavBar.prototype.GetSelectedLinkByUrl = function (url) {
    /// <summary>
    /// Get's the selected link object based on URL
    /// </summary>
    /// <returns type="NVNavLink">
    /// Returns selected link. If no link matches the URL specified
    /// then this will return null
    /// </returns>
    var selectedLink = null;

    for (var i = 0; i < this.NavItems.length; i++) {
        var $linkElmt = $('a', this.NavItems[i].$Element);

        var urlRegEx = new RegExp(url, 'i');

        if (urlRegEx.test($linkElmt.attr('href')) === true) {
            selectedLink = this.NavItems[i];

            break;
        }
    }

    return selectedLink;
};

NVNavBar.prototype.SelectLinkByUrl = function (url) {
    /// <summary>
    /// Selects the link on the nav bar associated with the URL.
    /// If the url cannot be found this will only position the Dial control
    /// </summary>
    /// <param name="url" type="string">
    /// The URL specified on the link you want to select
    /// </param>
    var selectedLink = this.GetSelectedLinkByUrl(url);

    if (selectedLink !== null && selectedLink !== this.SelectedNavItem) {
        this.SelectedNavItem.Deselect();

        this.ShrinkSelectedLink();

        this.SelectedNavItem = selectedLink;

        this.ExpandSelectedLink();

        this.SelectedNavItem.Select();

        this.SlideNavBar(this.SelectedNavItem.ID);
    }

    this.SetState(url);
};

NVNavBar.prototype.PositionDial = function (pageID, easing) {
    /// <summary>
    /// Positions the dial depending on the settings specified. The dial will
    /// either be positioned on the selected link or on the target specified
    /// in the data-nv-dial-target attribute
    /// </summary>
    /// <param name="pageID" type="string">
    /// The ID of the page that contains the data-nv-state attribute
    /// </param>
    /// <param name="easing" type="string">
    /// [Optional] Specifies the jQuery easing function to use
    /// </param>
    var targetID = null;

    if (pageID) {
        targetID = $('#' + pageID).data('nv-dial-target')
            ? $('#' + pageID).data('nv-dial-target') : null;
    }

    if (targetID) {
        var $target = $('#' + targetID);
        
        // If the target is fixed the dial should move with the target
        if ($target.css('position') === 'fixed') {
            this.DialControl.$Element.css('position', 'fixed');
        } else {
            this.DialControl.$Element.css('position', 'relative');
        }
    }

    if (targetID) {
        var targetPosition = this.GetTargetPosition(targetID);

        this.DialControl.PositionDial(targetPosition.x, targetPosition.y);
    } else {
        this.DialControl.SetToDefaulPosition(easing);
    }
};

NVNavBar.prototype.GetTargetPosition = function (targetID) {
    /// <summary>
    /// Retrieves the target's X and Y coordinates. If the target
    /// is out of the viewport this will return a position within the
    /// viewport closest to the target
    /// </summary>
    /// <returns type="Object">
    /// Returns an object with x and y properties
    /// </returns>
    var viewportWidth = $(window).width();
    var viewportHeight = $(window).height();

    var $target = $('#' + targetID);

    var position = {
        x: $target.offset().left
        ,y: $target.offset().top
    };

    if (position.x < 0) {
        position.x = 0;
    } else if (position.x > viewportWidth) {
        position.x = viewportWidth - $target.outerWidth();
    }

    if (position.y < 0) {
        position.y = 0;
    } else if (position.y > viewportHeight) {
        position.y = viewportHeight - $target.outerHeight();
    }

    return position;
};

NVNavBar.prototype.CheckDialOnNextLink = function (selectedLinkIndex, x, y) {
    /// <summary>
    /// Checks to see if the Dial is within the range for the next link.
    /// If it is this will position the Dial on the next link
    /// </summary>
    /// <param name="selectedLinkIndex" type="int">
    /// Selected Link Index
    /// </param>
    /// <param name="x" type="int">
    /// The x position of the dial
    /// </param>
    /// <param name="y" type="int">
    /// The y position of the dial
    /// </param>
    /// <returns>
    /// Returns true if the dial is on the next link
    /// </returns>
    if (selectedLinkIndex >= this.NavItems.length - 1) {
        return false;
    }

    var nextLink = this.NavItems[selectedLinkIndex + 1];
    var nextLinkPos = nextLink.GetPosition();

    // Drop tolerance is dependent on current viewport
    // The page can have 3 links and we want half that size / 3 / 2
    var horizontalDropTolerance = this.$Element.parent().width() / 3 / 2;
    var verticalDropTolerance = 150;

    if ((nextLinkPos.x - horizontalDropTolerance) < x
        && (nextLinkPos.y - verticalDropTolerance) < y) {
        return true;
    } else {
        return false;
    }
};

NVNavBar.prototype.CheckDialOnPreviousLink = function (selectedLinkIndex, x, y) {
    /// <summary>
    /// Checks to see if the Dial is within the range for the previous link.
    /// If it is this will position the Dial on the next link
    /// </summary>
    /// <param name="selectedLinkIndex" type="int">
    /// Selected Link Index
    /// </param>
    /// <param name="x" type="int">
    /// The x position of the dial
    /// </param>
    /// <param name="y" type="int">
    /// The y position of the dial
    /// </param>
    /// <returns>
    /// Returns true if the dial is on the previous link
    /// </returns>
    if (selectedLinkIndex <= 0) {
        return false;
    }

    var previousLink = this.NavItems[selectedLinkIndex - 1];
    var previousLinkPos = previousLink.GetPosition();

    // Drop tolerance is dependent on current viewport
    // The page can have 3 links and we want half that size / 3 / 2
    var horizontalDropTolerance = this.$Element.parent().width() / 3 / 2;
    var verticalDropTolerance = 150;

    if ((previousLinkPos.x + horizontalDropTolerance) > x
        && (previousLinkPos.y - verticalDropTolerance) < y) {
        return true;
    } else {
        return false;
    }
};

NVNavBar.prototype.SlideNavBar = function (linkID) {
    /// <summary>
    /// Updates the Nav Bar to center the specified Link
    /// </summary>
    for (var i = 0; i < this.NavItems.length; i++) {
        this.$Element.removeClass('nav-bar--page' + this.NavItems[i].ID);
    }

    var selectedClass = 'nav-bar--page' + linkID;

    this.$Element.addClass(selectedClass);
};

NVNavBar.prototype.ShrinkSelectedLink = function () {
    this.SelectedNavItem.ShrinkLink();
};

NVNavBar.prototype.ExpandSelectedLink = function () {
    this.SelectedNavItem.ExpandLink();
};
//#endregion

//#region Event Handlers
NVNavBar.prototype.WindowResize = function () {
    /// <summary>
    /// Updates the positioning of the dial since the screen size has changed
    /// </summary>
    var pageID = this.GetPageIDByUrl(window.location.pathname);

    var newDefaults = this.GetCenterPosition();

    this.DialControl.DefaultX = newDefaults.x;
    this.DialControl.DefaultY = newDefaults.y;

    this.PositionDial(pageID);
};

NVNavBar.prototype.LinkClicked = function (selectedLink) {
    /// <summary>
    /// Event propagation when a child link is clicked
    /// </summary>
    if (this.Disabled === true) {
        return;
    }

    if (selectedLink.IsClickable === true) {
        this.SelectedNavItem.Deselect();

        this.SelectedNavItem = selectedLink;

        this.SlideNavBar(selectedLink.ID);
    } else if (selectedLink.ID > this.SelectedNavItem.ID) {
        this.DialControl.$Element.effect({
            effect: 'bounce'
            , direction: 'right'
            , distance: 40
            , times: 3
        });
    } else if (selectedLink.ID < this.SelectedNavItem.ID) {
        this.DialControl.$Element.effect({
            effect: 'bounce'
            , direction: 'left'
            , distance: 40
            , times: 3
        });
    }
};

NVNavBar.prototype.DialDropped = function () {
    if (this.Disabled === true) {
        return;
    }

    var that = this;

    var newSelectedLink = this.NavItems[this.ChosenLinkIndex];

    if (this.SelectedNavItem.ID !== newSelectedLink.ID) {
        this.SelectedNavItem.Deselect();

        this.SelectedNavItem = newSelectedLink;

        this.SelectedNavItem.Select();

        this.SelectedNavItem.TriggerLink();

        var selectedLinkPos = this.SelectedNavItem.GetPosition();

        this.DialControl.PositionDial(selectedLinkPos.x, selectedLinkPos.y);

        // Timeout just for effect, so that the bar sliding
        // has a short delay after dropping
        window.setTimeout(function () {
            that.SlideNavBar(that.SelectedNavItem.ID);

            that.SetState(newSelectedLink.Url);
        }, this.NavBarAnimationDelay);
    } else {
        var pageID = this.GetPageIDByUrl(newSelectedLink.Url);

        this.PositionDial(pageID, 'easeOutElastic');
    }
};

NVNavBar.prototype.DialDragged = function (x, y) {
    /// <summary>
    /// This function is called when the Dial is dragged.
    /// Handles the styling of the link controls
    /// </summary>
    /// <param name="x" type="int">
    /// The X position of the Dial
    /// </param>
    /// <param name="y" type="int">
    /// The Y position of the Dial
    /// </param>
    if (this.Disabled === true) {
        return;
    }

    var selectedLinkIndex = this.SelectedNavItem.ID - 1;

    if (this.CheckDialOnNextLink(selectedLinkIndex, x, y) === true) {
        this.SelectedNavItem.ShrinkLink();

        this.NavItems[selectedLinkIndex + 1].ExpandLink();

        this.ChosenLinkIndex = selectedLinkIndex + 1;
    } else if (this.CheckDialOnPreviousLink(selectedLinkIndex, x, y) === true) {
        this.SelectedNavItem.ShrinkLink();

        this.NavItems[selectedLinkIndex - 1].ExpandLink();

        this.ChosenLinkIndex = selectedLinkIndex - 1;
    } else {
        if (this.NavItems[selectedLinkIndex + 1]) {
            this.NavItems[selectedLinkIndex + 1].ShrinkLink();
        }

        if (this.NavItems[selectedLinkIndex - 1]) {
            this.NavItems[selectedLinkIndex - 1].ShrinkLink();
        }

        this.SelectedNavItem.ExpandLink();

        this.ChosenLinkIndex = selectedLinkIndex;
    }

    // Update Position of dial
    var newDialPosition = this.NavItems[this.ChosenLinkIndex].GetPosition();

    this.DialControl.AnchorX = newDialPosition.x;
    this.DialControl.AnchorY = newDialPosition.y;
};
//#endregion



/*------------------------------------*\
    NV Navigation Link Object
\*------------------------------------*/
//#region Constructors
function NVNavLink(id, $element, isClickable) {
    /// <summary>
    /// Constructor for creating a link element
    /// </summary>
    /// <param name="$element" type="object">
    /// jQuery object for the link element
    /// </param>
    /// <param name="isClickable" type="Boolean">
    /// [Optional] Specifies if the link object is Clickable.
    /// By default this is false, and in that case the only way
    /// to activate the link is by dropping the dial object on the link
    /// </param>
    this.ID = id;
    this.$Element = $element;
    this.IsClickable = isClickable ? isClickable : false;
    this.Url = $('a', this.$Element).attr('href');

    this.Initialize();
}
//#endregion

//#region Properties
NVNavLink.prototype = {
    ID: 0
    , $Element: {}
    , Url: null
    , IsSelected: false
    , IsClickable: false
    , IsHidden: false
    , OnClickCallback: function (selectedLink) {
        /// <summary>
        /// Event is triggered when link is clicked
        /// </summary>
        /// <param name="selectedLink" type="NVNavLink">
        /// The instance of the current selected link
        /// </param>
        selectedLink = {}; // For jsLint
    }
    , OnMouseOverCallback: function () {
        /// <summary>
        /// Event is triggered when mouse is over element
        /// </summary>
    }
    , OnMouseOutCallback: function () {
        /// <summary>
        /// Event is triggered when mouse moves out of element
        /// </summary>
    }
};
//#endregion

//#region Methods
NVNavLink.prototype.Initialize = function () {
    this.$Element.click(
        $.proxy(this.Click, this)
    ).hover(
        $.proxy(this.MouseOver, this)
        , $.proxy(this.MouseOut, this)
    );
};

NVNavLink.prototype.Deselect = function () {
    /// <summary>
    /// De-selects the current link
    /// </summary>
    this.$Element.removeClass('nav__itemContainer--selected');

    this.IsSelected = false;
};

NVNavLink.prototype.Select = function () {
    /// <summary>
    /// Selects the current link
    /// </summary>
    this.$Element.addClass('nav__itemContainer--selected');

    this.IsSelected = true;
};

NVNavLink.prototype.TriggerLink = function () {
    /// <summary>
    /// Clicks on the actual link control to cause a navigation event
    /// </summary>
    $('a', this.$Element).click();
};

NVNavLink.prototype.ExpandLink = function () {
    /// <summary>
    /// Changes the appearance of the link control to an expanded state,
    /// </summary>
    this.$Element.addClass('nav__itemContainer--expanded');
};

NVNavLink.prototype.ShrinkLink = function () {
    /// <summary>
    /// Changes the appearance of the link control to a small state
    /// </summary>
    this.$Element.removeClass('nav__itemContainer--expanded');
};

NVNavLink.prototype.Hide = function () {
    /// <summary>
    /// Hides the current link element
    /// </summary>
    this.IsHidden = true;

    this.$Element.stop().fadeOut(300);

    this.$Element.prev('li').stop().fadeOut(300);
    
    // Removes the last link's trailing line
    this.$Element.prev().prev('[data-js-hook="linkBtn"]')
        .addClass('nav__itemContainer--lastItem');
};

NVNavLink.prototype.Show = function () {
    /// <summary>
    /// Shows the current link element
    /// </summary>
    this.IsHidden = false;

    this.$Element.stop().fadeIn(300);

    this.$Element.prev('li').stop().fadeIn(300);

    // Adds back the last link's trailing line
    this.$Element.prev().prev('[data-js-hook="linkBtn"]')
        .removeClass('nav__itemContainer--lastItem');
};

NVNavLink.prototype.GetPosition = function () {
    /// <summary>
    /// Gets the position of the Link in relation to the
    /// main document
    /// </summary>
    /// <returns>
    /// Returns are rect object with x/y coordinates
    /// </returns>
    var position = {
        x: 0
        , y: 0
    };

    // Cannot use the circle element because it gets scaled, and this function
    // will be called before the scaling animation completes
    //var $circlePlaceholder = $('.nav-item__circle', this.$Element);
    var $circlePlaceholder = this.$Element;

    position.x = $circlePlaceholder.offset().left - 4;
    position.y = $circlePlaceholder.offset().top - 24;

    return position;
};
//#endregion

//#region Event Handlers
NVNavLink.prototype.MouseOver = function () {
    if (this.IsSelected === false) {
        this.OnMouseOverCallback();

        this.ExpandLink();
    }
};

NVNavLink.prototype.MouseOut = function () {
    if (this.IsSelected === false) {
        this.OnMouseOutCallback();

        this.ShrinkLink();
    }
};

NVNavLink.prototype.Click = function () {
    if (this.IsSelected === false && this.IsClickable === true) {
        this.OnClickCallback(this);

        this.Select();

        this.TriggerLink();
    } else if (this.IsClickable === false) {
        this.OnClickCallback(this);
    }
};
//#endregion



/*------------------------------------*\
    NV Dial
\*------------------------------------*/
//#region Constructors
function NVDial(posX, posY) {
    /// <summary>
    /// Default Constructor
    /// </summary>
    /// <param name="posX">
    /// Initial X position on the document
    /// </param>
    /// <param name="posY">
    /// Initial Y position on the document
    /// </param>
    this.$Element = $('[data-js-hook="nvDial"]');
    this.AnchorX = posX;
    this.AnchorY = posY;
    this.DefaultX = posX;
    this.DefaultY = posY;
    
    this.Initialize();
}
//#endregion

//#region Properties
NVDial.prototype = {
    $Element: {}
    // X position to where the dial will revert to
    , AnchorX: 0
    // Y position to where the dial will revert to
    , AnchorY: 0
    , DefaultX: 0
    , DefaultY: 0
    // Current X position
    , X: 0
    // Current Y position
    , Y: 0
    , onDropCallback: function () {
        /// <summary>
        /// This function is called when the Dial is dropped
        /// </summary>
    }
    , isClickable: false
    // Observers for the click event
    , onClickHandlers: []
    // Observers for when the dial is dragged. Functions subscribing
    // to this event will be passed the x, and y coordinates of the dial
    , onDragHandlers: []
    // Observers for when the dial is dropped
    , onDropHandlers: []
};
//#endregion

//#region Methods
NVDial.prototype.Initialize = function () {
    /// <summary>
    /// Command function initializes the control
    /// </summary>
    this.SetupDial();
    this.SetToDefaulPosition();

    this.$Element.click(
        $.proxy(this.Click, this)
    );
};

NVDial.prototype.SetupDial = function () {
    var that = this;

    this.$Element.draggable({
        stop: function () {
            that.PositionDial(that.AnchorX, that.AnchorY);
            
            that.onDropHandlers.forEach(function (item) {
                item.call(item);
            });
        }
        , drag: function (event, ui) {
            that.X = ui.helper.position().left;
            that.Y = ui.helper.position().top;

            $(this).stop().animate({
                top: that.Y
                , left: that.X
            }, 0, 'linear');

            that.onDragHandlers.forEach(function (item) {
                item.call(item, that.X, that.Y);
            });
        }
        , containment: 'body'
        , scroll: false
    });
};

NVDial.prototype.SetToDefaulPosition = function (easing) {
    /// <summary>
    /// Returns the dial to the default position
    /// </summary>
    /// <param name="easing" type="string">
    /// [Optional] Specifies the jQuery easing function to use
    /// </param>
    easing = easing ? easing : 'easeInBack';

    this.AnchorX = this.DefaultX;
    this.AnchorY = this.DefaultY;

    this.PositionDial(this.DefaultX, this.DefaultY, 500, easing);
};

NVDial.prototype.PositionDial = function (x, y, animDuration, easing) {
    /// <summary>
    /// Animates the dial to the position specified
    /// </summary>
    /// <param name="x" type="int">X axis position in pixels</param>
    /// <param name="y" type="int">Y axis position in pixels</param>
    /// <param name="animDuration" type="int">
    /// [Optional] Specifies the duration of the animation in milliseconds
    /// </param>
    /// <param name="easing" type="string">
    /// [Optional] Specifies the jQuery easing function to use
    /// </param>
    if (!animDuration) {
        animDuration = 1000;
    }

    if (!easing) {
        easing = 'easeOutElastic';
    }

    // This is the offset set on the Dial control and must match
    // what is specified on _dialControl.scss .nvDial__button
    var offsetX = 30;
    var offsetY = 30;

    this.$Element.stop().animate({
        left: x - offsetX - 2
       , top: y - offsetY - 2
    }, animDuration, easing);
};

NVDial.prototype.IsDialWithinElmt = function (elmt) {
    /// <summary>
    /// Checks to see if the dial is within the specified element
    /// </summary>
    /// <param name="elmt" type="object">
    /// Dom element to check
    /// <param>
    /// <returns type="boolean">
    /// Returns true if the dial is within the element. False otherwise
    /// </returns>
    var isWithin = false;

    if (elmt && $(elmt).length !== 0) {
        var elmtOffset = $(elmt).offset();
        var middleX = this.X + this.$Element.outerWidth() / 2;
        var middleY = this.Y + this.$Element.outerHeight() / 2;

        if (middleX >= elmtOffset.left && middleX <= (elmtOffset.left + $(elmt).outerWidth())
            && middleY >= elmtOffset.top && middleY <= (elmtOffset.top + $(elmt).outerHeight())) {
            isWithin = true;
        }
    }

    return isWithin;
};

NVDial.prototype.DefaultState = function () {
    /// <summary>
    /// Set's the dial to default state. If the dial was in a different state
    /// this will trigger a CSS transition when changing states
    /// </summary>
    this.$Element
        .addClass('nvDial--draggable')
        .removeClass('nvDial--loading')
        .removeClass('nvDial--initialLoading')
        .draggable('enable');

    this.isClickable = false;

    var $dialLight = $('[data-nv-dial="light"]', this.$Element);
    var $dialLogo = $('[data-nv-dial="logo"]', this.$Element);

    $dialLight.removeClass('nvDial__button-light--black');
    $dialLight.removeClass('nvDial__button-light--blue');

    if ($dialLogo.hasClass('logo--close') === true) {
        $dialLogo.addClass('logo--closeReverse').removeClass('logo--close');
    } else if ($dialLogo.hasClass('logo--send') === true) {
        $dialLogo.addClass('logo--sendReverse').removeClass('logo--send');
    }
};

NVDial.prototype.LoadingState = function () {
    /// <summary>
    /// Changes the dial to the loading state which is not draggable
    /// </summary>
    this.$Element
        .removeClass('nvDial--draggable')
        .addClass('nvDial--loading')
        .removeClass('nvDial--initialLoading')
        .draggable('disable');

    this.isClickable = false;

    var $dialLight = $('[data-nv-dial="light"]', this.$Element);
    var $dialLogo = $('[data-nv-dial="logo"]', this.$Element);

    $dialLight.removeClass('nvDial__button-light--black');
    $dialLight.removeClass('nvDial__button-light--blue');

    if ($dialLogo.hasClass('logo--close') === true) {
        $dialLogo.addClass('logo--closeReverse').removeClass('logo--close');
    } else if ($dialLogo.hasClass('logo--send') === true) {
        $dialLogo.addClass('logo--sendReverse').removeClass('logo--send');
    }
};

NVDial.prototype.InitialLoadingState = function () {
    /// <summary>
    /// Used for initial loading screen
    /// </summary>
    this.$Element
        .removeClass('nvDial--draggable')
        .removeClass('nvDial--loading')
        .addClass('nvDial--initialLoading')
        .draggable('disable');

    this.isClickable = false;

    var $dialLight = $('[data-nv-dial="light"]', this.$Element);
    var $dialLogo = $('[data-nv-dial="logo"]', this.$Element);

    $dialLight.removeClass('nvDial__button-light--black');
    $dialLight.removeClass('nvDial__button-light--blue');

    if ($dialLogo.hasClass('logo--close') === true) {
        $dialLogo.addClass('logo--closeReverse').removeClass('logo--close');
    } else if ($dialLogo.hasClass('logo--send') === true) {
        $dialLogo.addClass('logo--sendReverse').removeClass('logo--send');
    }
};

NVDial.prototype.CloseState = function () {
    /// <summary>
    /// Changes the dial to a close button which is not draggable
    /// </summary>
    this.$Element
        .removeClass('nvDial--draggable')
        .removeClass('nvDial--loading')
        .removeClass('nvDial--initialLoading')
        .draggable('disable');

    this.isClickable = true;

    var $dialLight = $('[data-nv-dial="light"]', this.$Element);
    var $dialLogo = $('[data-nv-dial="logo"]', this.$Element);
    
    $dialLight
        .removeClass('nvDial__button-light--blue')
        .addClass('nvDial__button-light--black');

    $dialLogo.removeClass('logo--closeReverse')
        .removeClass('logo--send')
        .removeClass('logo--sendReverse')
        .addClass('logo--close');
};

NVDial.prototype.SendState = function () {
    /// <summary>
    /// Changes the dial to a send button which is not draggable
    /// </summary>
    this.$Element
        .removeClass('nvDial--draggable')
        .removeClass('nvDial--loading')
        .removeClass('nvDial--initialLoading')
        .draggable('enable');

    this.isClickable = true;

    var $dialLight = $('[data-nv-dial="light"]', this.$Element);
    var $dialLogo = $('[data-nv-dial="logo"]', this.$Element);

    $dialLight
        .removeClass('nvDial__button-light--black')
        .addClass('nvDial__button-light--blue');

    $dialLogo.removeClass('logo--sendReverse')
        .removeClass('logo--closeReverse')
        .removeClass('logo--close')
        .addClass('logo--send');
};

NVDial.prototype.IsResponsive = function (isResponsive) {
    /// <summary>
    /// Specifies if the dial is responsive so that it will scale
    /// depending on the ViewPort size.
    /// TO DO: this should only be used when the dial is in closed state
    /// since the NavBar is not responsive
    /// </summary>
    /// <param name="isResponsive" type="boolean">
    /// True - makes the dial responsive
    /// </param>
    if (isResponsive && isResponsive === true) {
        this.$Element.addClass('nvDial--responsive');
    } else {
        this.$Element.removeClass('nvDial--responsive');
    }
};

NVDial.prototype.SubscribeToClickEvent = function (fn) {
    /// <summary>
    /// Subscribe to the event when the dial is clicked
    /// </summary>
    /// <param name="fn" type="function">
    /// Function with no arguments
    /// </param>
    this.onClickHandlers.push(fn);
};

NVDial.prototype.UnsubscribeToClickEvent = function (fn) {
    /// <summary>
    /// Unsubscribes to the click event
    /// </summary>
    /// <param name="fn" type="function">
    /// Function used when subscribing to the event
    /// </param>
    this.onClickHandlers = this.onClickHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};

NVDial.prototype.SubscribeToDragEvent = function (fn) {
    /// <param name="fn" type="function">
    /// Pass a function with two arguments: X and Y
    /// </param>
    this.onDragHandlers.push(fn);
};

NVDial.prototype.UnsubscribeToDragEvent = function (fn) {
    this.onDragHandlers = this.onDragHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};

NVDial.prototype.SubscribeToDropEvent = function (fn) {
    /// <summary>
    /// This function is called when the Dial is dropped
    /// </summary>
    /// <param name="fn" type="function">
    /// Pass a function that accepts no arguments
    /// </param>
    this.onDropHandlers.push(fn);
};

NVDial.prototype.UnsubscribeToDropEvent = function (fn) {
    this.onDropHandlers = this.onDropHandlers.filter(
        function (item) {
            if (item !== fn) {
                return item;
            }
        }
    );
};
//#endregion

//#region Event Handlers
NVDial.prototype.Click = function () {
    /// <summary>
    /// Event handler for when the dial is clicked on
    /// </summary>
    if (this.isClickable === true) {
        this.onClickHandlers.forEach(function (item) {
            item.call(item);
        });
    }
};
//#endregion