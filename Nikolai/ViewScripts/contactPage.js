//#region Constructor
function ContactPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>
    this.$Element = $('#contact');

    this.Initialize();
}
//#endregion

//#region Properties
ContactPage.prototype = {
    $Element: null
    , $form: null
    , $AccordionItem1: null
    , $AccordionItem2: null
    , AccordionItem2_SendBtnPositionAdjust: -75
    , $AccordionItem2_SendBtn: null
    , AccordionAnimDuration: 600
    , AccordionEasing: 'easeOutCirc'
    , ScreenThreshold: 600
    // Used for window resized optimization
    , HasWindowResizedTicked: false
    , TransitionEndEventNames: {
        'WebkitTransition': 'webkitTransitionEnd',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    }
    , GetTransitionEndEventName: function () {
        /// <summary>
        /// Returns animation event prefixed by browser
        /// </summary>
        return this.TransitionEndEventNames[window.Modernizr.prefixed('transition')];
    }
    , MicroInteraction: null
};
//#endregion

//#region Methods
ContactPage.prototype.Initialize = function () {
    // Properties
    this.$form = $('#frmContact');

    this.$AccordionItem1 = $('#contact .contact__container .contact__text');

    this.$AccordionItem2 = $('.contact__formFields', this.$form);

    this.$AccordionItem2_SendBtn = $('#sendBtnPlaceholder');

    this.MicroInteraction = new window.MicroInteraction('contact');

    // Events
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.SubscribeToOnPageChanging(
        $.proxy(this.OnPageChanging, this)
    );

    window.MainNav.SubscribeToDialClick(
        $.proxy(this.SendMessage, this)
    );

    $('input', this.$form)
        .on('focusin', this.InputFocusIn)
        .on('focusout', this.InputFocusOut);

    $('#contactSummary').on('click', 
        $.proxy(this.ContactSummaryClicked, this)
    );

    this.$form.on('click',
        $.proxy(this.ContactFormClicked, this)
    ).on('keydown', 
        $.proxy(this.FormKeyDown, this)
    );

    $(window).resize(
        $.proxy(this.PageResized, this)
    );

    // Initializers
    this.InitializeAccordion();

    $.validator.unobtrusive.parseDynamicContent('#frmContact');
};

ContactPage.prototype.OnPageChange = function (pageId, previousPageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'contact') {
        this.ClearForm();

        this.PositionDial();
    } else if (previousPageId && previousPageId === 'contact') {
        // Leaving page event
        this.MicroInteraction.ResetAnimation();

        if ($(window).width() <= this.ScreenThreshold) {
            this.CompactStateNoAnimation();
            this.EnableClickableHeaders();
        } else {
            this.ExpandedState();
            this.DisableClickableHeaders();
        }
    }

    if (pageId && pageId === 'contact' &&
        previousPageId && previousPageId === 'loading') {
        // Coming from loading screen so OnPageChanging event handler would have
        // not been called since this was still initializing. So call it now to 
        // trigger animations.

        this.OnPageChanging(pageId);
    }
};

ContactPage.prototype.OnPageChanging = function (pageId, previousPageId) {
    if (pageId && pageId === 'contact') {
        let transitionDirection = 'up';

        if (previousPageId === 'about') {
            transitionDirection = 'left';
        }

        this.MicroInteraction.TriggerAnimation(
            transitionDirection,
            this.$Element
        );
    }
};

ContactPage.prototype.PositionDial = function () {
    /// <summary>
    /// Position's dial depending on the screen size
    /// </summary>
    var currentPage = window.MainNav.GetCurrentRoute();

    if (currentPage.PageID === 'contact') {
        if ($(window).width() > this.ScreenThreshold) {
            $('#contact').data('nv-dial-target', 'sendBtnPlaceholder');

            window.MainNav.NavBar.PositionDial('contact');

            window.MainNav.NavBar.SetDialState('contact', 'send');

            window.MainNav.NavBar.SetNavItemsState('contact', 'previousonly');
        } else {
            $('#contact').removeData('nv-dial-target');

            window.MainNav.NavBar.PositionDial('contact');

            window.MainNav.NavBar.SetDialState('contact', 'default');

            window.MainNav.NavBar.SetNavItemsState('contact', 'default');
        }
    }
};

ContactPage.prototype.PageResized = function () {
    var that = this;

    if (this.HasWindowResizedTicked === false) {
        window.requestAnimationFrame(function () {
            if ($(window).width() <= that.ScreenThreshold) {
                that.CompactStateNoAnimation();
                that.EnableClickableHeaders();
            } else {
                that.ExpandedState();
                that.DisableClickableHeaders();
            }

            that.HasWindowResizedTicked = false;
        });
    }

    this.HasWindowResizedTicked = true;
};

ContactPage.prototype.FormKeyDown = function (evt) {
    if (evt.keyCode === 13) {
        this.SendMessage();
    }
};

ContactPage.prototype.SendMessage = function () {
    var that = this;

    if (this.$form.valid() === true) {
        $.post('/Contact/Message', {
            Name: $('#Name').val()
            , Email: $('#Email').val()
            , Message: $('#Message').val()
        }).done(this.SendSuccess).fail(this.SendFailed);

        this.$form.addClass('contact__form--sending');

        $('.contact__form-content', this.$form)
            .on(this.GetTransitionEndEventName(), function () {
                $('.contact__form-content', that.$form).off(that.GetTransitionEndEventName());

                that.MessageSent();
            });

        $('#contact .contact__container').addClass('contact__container--sending');
    }
};

ContactPage.prototype.MessageSent = function () {
    if ($('#contact').data('nv-dial-target') !== undefined) {
        $('#contact').removeData('nv-dial-target');

        window.MainNav.NavBar.PositionDial('contact');

        window.MainNav.NavBar.SetNavItemsState('contact', 'default');
    }

    window.MainNav.NavBar.SetDialState('contact', 'default');
};

ContactPage.prototype.ClearForm = function () {
    $('#Name').val('').trigger('focusout');
    $('#Email').val('').trigger('focusout');
    $('#Message').val('').trigger('focusout');

    this.$form.removeClass('contact__form--sending');

    $('.input-validation-error', this.$form).removeClass('input-validation-error');
};

ContactPage.prototype.SendSuccess = function () {
    // To Do
};

ContactPage.prototype.SendFailed = function () {
    // To Do
};

ContactPage.prototype.InitializeAccordion = function () {
    /// <summary>
    /// If the screen is too small the form becomes collapse-able
    /// </summary>
    if ($(window).width() <= this.ScreenThreshold) {
        this.CompactState();
        this.EnableClickableHeaders();
    } else {
        this.ExpandedState();
        this.DisableClickableHeaders();
    }
};

ContactPage.prototype.EnableClickableHeaders = function () {
    $('#contactSummary h1').addClass('contact__header--clickable');
    $('h1', this.$form).addClass('contact__header--clickable');
};

ContactPage.prototype.DisableClickableHeaders = function () {
    $('#contactSummary h1').removeClass('contact__header--clickable');
    $('h1', this.$form).removeClass('contact__header--clickable');
};

ContactPage.prototype.GetAccordionItem1ContentHeight = function () {
    var contentHeight = 0;

    this.$AccordionItem1.children().each(function () {
        contentHeight += $(this).outerHeight();
    });

    return Math.round(contentHeight);
};

ContactPage.prototype.GetAccordionItem2ContentHeight = function () {
    var contentHeight = 0;

    this.$AccordionItem2.children().children().each(function () {
        contentHeight += $(this).outerHeight();
    });

    if (contentHeight > 200) {
        return 200; // Max Height
    } else {
        return Math.round(contentHeight);
    }
};

ContactPage.prototype.ContactSummaryClicked = function () {
    if (this.$AccordionItem1.height() === 0) {
        var that = this;

        this.ClearForm();

        var accordionItem1_contentHeight = this.GetAccordionItem1ContentHeight();
        var accordionItem2_contentHeight = this.GetAccordionItem2ContentHeight();

        this.$AccordionItem1.animate({
            height: accordionItem1_contentHeight
        }, {
            duration: this.AccordionAnimDuration
            , easing: this.AccordionEasing
            , progress: function () {
                var percentageOfExpand = that.$AccordionItem1.outerHeight()
                    / accordionItem1_contentHeight;

                var newHeight = accordionItem2_contentHeight
                    - (percentageOfExpand * accordionItem2_contentHeight);

                that.$AccordionItem2.height(newHeight);

                var sendBtnMargin = percentageOfExpand * that.AccordionItem2_SendBtnPositionAdjust;

                that.$AccordionItem2_SendBtn.css('margin-top', sendBtnMargin + 'px');
            }
            , complete: function () {
                window.MainNav.NavBar.SetDialState('contact', 'default');
            }
        });
    }
};

ContactPage.prototype.ContactFormClicked = function () {
    if (this.$AccordionItem2.height() === 0) {
        var that = this;

        var accordionItem1_contentHeight = this.GetAccordionItem1ContentHeight();
        var accordionItem2_contentHeight = this.GetAccordionItem2ContentHeight();

        this.$AccordionItem2.animate({
            height: accordionItem2_contentHeight
        }, {
            duration: this.AccordionAnimDuration
            , easing: this.AccordionEasing
            , progress: function () {
                var percentageOfExpand = that.$AccordionItem2.outerHeight()
                    / accordionItem2_contentHeight;

                var newHeight = accordionItem1_contentHeight
                    - (percentageOfExpand * accordionItem1_contentHeight);

                that.$AccordionItem1.height(newHeight);

                var sendBtnMargin = that.AccordionItem2_SendBtnPositionAdjust
                    - (percentageOfExpand * that.AccordionItem2_SendBtnPositionAdjust);

                that.$AccordionItem2_SendBtn.css('margin-top', sendBtnMargin + 'px');
            }
            , complete: function () {
                window.MainNav.NavBar.SetDialState('contact', 'send');
            }
        });
    }
};

ContactPage.prototype.CompactState = function () {
    this.$AccordionItem1.height(
        this.GetAccordionItem1ContentHeight()
    );
    
    this.$AccordionItem2.animate({
        height: 0
    }, 300);

    this.$AccordionItem2_SendBtn.css('margin-top'
        , this.AccordionItem2_SendBtnPositionAdjust + 'px');

    this.PositionDial();
};

ContactPage.prototype.CompactStateNoAnimation = function () {
    this.$AccordionItem1.height(
        this.GetAccordionItem1ContentHeight()
    );

    this.$AccordionItem2.height(0);

    this.$AccordionItem2_SendBtn.css('margin-top'
        , this.AccordionItem2_SendBtnPositionAdjust + 'px');

    this.PositionDial();
};

ContactPage.prototype.ExpandedState = function () {
    this.$AccordionItem1.height(
        this.GetAccordionItem1ContentHeight()
    );

    this.$AccordionItem2.height(
        this.GetAccordionItem2ContentHeight()
    );

    this.$AccordionItem2_SendBtn.css('margin-top', '0');

    this.PositionDial();
};

ContactPage.prototype.ShowSummary = function () {
    $('#contact .contact__container')
        .removeClass('contact__container--form')
        .addClass('contact__container--summary');
};

ContactPage.prototype.ShowContactForm = function () {
    $('#contact .contact__container')
        .addClass('contact__container--form')
        .removeClass('contact__container--summary');
};

ContactPage.prototype.ShowBothForms = function () {
    $('#contact .contact__container')
        .removeClass('contact__container--form')
        .removeClass('contact__container--summary');
};

ContactPage.prototype.InputFocusIn = function (evt) {
    /// <summary>
    /// Moves the placeholder out of the way
    /// </summary>
    var $container = $(evt.target).parent();
    var $label = $('label', $container);

    $label.addClass('contact__label--focus');
};

ContactPage.prototype.InputFocusOut = function (evt) {
    /// <summary>
    /// Moves the placeholder out of the way
    /// </summary>
    if ($(evt.target).val() === '') {
        var $container = $(evt.target).parent();
        var $label = $('label', $container);

        $label.removeClass('contact__label--focus');
    }
};
//#endregion

//#region Initializer
(function LoadContactScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new ContactPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new ContactPage();
        });
    } else {
        window.setTimeout(LoadContactScript, 50);
    }
})();
//#endregion