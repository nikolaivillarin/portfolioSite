//#region Constructor
function ContactPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>
    this.Initialize();
}
//#endregion

//#region Properties
ContactPage.prototype = {
    $AccordionItem1: null
    , $AccordionItem2: null
    , AccordionItem2_SendBtnPositionAdjust: -75
    , $AccordionItem2_SendBtn: null
    , AccordionAnimDuration: 600
    , AccordionEasing: 'easeOutCirc'
    // Used for window resized optimization
    , HasWindowResizedTicked: false
};
//#endregion

//#region Methods
ContactPage.prototype.Initialize = function () {
    // Properties
    this.$AccordionItem1 = $('#contact .contact__container .contact__text');

    this.$AccordionItem2 = $('#frmContact .contact__formFields');

    this.$AccordionItem2_SendBtn = $('#sendBtnPlaceholder');

    // Events
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    $('#frmContact input')
        .on('focusin', this.InputFocusIn)
        .on('focusout', this.InputFocusOut);

    $('#contactSummary').on('click', 
        $.proxy(this.ContactSummaryClicked, this)
    );

    $('#frmContact').on('click',
        $.proxy(this.ContactFormClicked, this)
    );

    $(window).resize(
        $.proxy(this.PageResized, this)
    );

    // Initializers
    this.InitializeAccordion();
};

ContactPage.prototype.OnPageChange = function () {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
};

ContactPage.prototype.PageResized = function () {
    var that = this;

    if (this.HasWindowResizedTicked === false) {
        window.requestAnimationFrame(function () {
            if ($(window).width() <= 600) {
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

ContactPage.prototype.InitializeAccordion = function () {
    /// <summary>
    /// If the screen is too small the form becomes collapse-able
    /// </summary>
    if ($(window).width() <= 600) {
        this.CompactState();
        this.EnableClickableHeaders();
    } else {
        this.ExpandedState();
        this.DisableClickableHeaders();
    }
};

ContactPage.prototype.EnableClickableHeaders = function () {
    $('#contactSummary h1').addClass('contact__header--clickable');
    $('#frmContact h1').addClass('contact__header--clickable');
};

ContactPage.prototype.DisableClickableHeaders = function () {
    $('#contactSummary h1').removeClass('contact__header--clickable');
    $('#frmContact h1').removeClass('contact__header--clickable');
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
};

ContactPage.prototype.CompactStateNoAnimation = function () {
    this.$AccordionItem1.height(
        this.GetAccordionItem1ContentHeight()
    );

    this.$AccordionItem2.height(0);

    this.$AccordionItem2_SendBtn.css('margin-top'
        , this.AccordionItem2_SendBtnPositionAdjust + 'px');
};

ContactPage.prototype.ExpandedState = function () {
    this.$AccordionItem1.height(
        this.GetAccordionItem1ContentHeight()
    );

    this.$AccordionItem2.height(
        this.GetAccordionItem2ContentHeight()
    );

    this.$AccordionItem2_SendBtn.css('margin-top', '0');

    window.setTimeout(function () {
        window.MainNav.NavBar.PositionDial('contact');
    }, 600);
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