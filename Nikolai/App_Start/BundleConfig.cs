using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace Nikolai
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/Styles").Include(
                "~/Content/Atoms/reset.css",
                "~/Content/Pages/Styles.css",
                "~/Content/Pages/Loading.css",
                "~/Content/Pages/Home.css",
                "~/Content/Pages/About.css",
                "~/Content/Pages/Contact.css",
                "~/Content/Pages/Work.css",
                "~/Content/Pages/Work-Multiplex.css",
                "~/Content/Pages/Work-Boxgrove.css",
                "~/Content/Pages/Work-RateQuote.css",
                "~/Content/Pages/Work-HR.css"
            ));

            bundles.Add(new ScriptBundle("~/Content/libraries").Include(
                "~/Scripts/modernizr-{version}.js",
                "~/Scripts/jquery-{version}.js",
                "~/Scripts/jquery-ui-{version}.js",
                "~/Scripts/jquery.ui.touch-punch.js",
                "~/Scripts/jquery.scrollTo.js",
                "~/Scripts/jquery.validate.js",
                "~/Scripts/jquery.validate.unobtrusive.js",
                "~/Scripts/jquery.validate.unobtrusive.extension.js",
                "~/Scripts/imagesloaded.pkgd.js",
                "~/Scripts/fastclick.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/scripts").Include(
                "~/Scripts/canvasUtilities.js"
                , "~/Scripts/clientErrorLogger.js"
                , "~/Scripts/navigationBar.js"
                , "~/Scripts/pageTransition.js"
                , "~/Scripts/navigation.js"
                , "~/Scripts/floatingBall.js"
                , "~/Scripts/scrollAnimations.js"
                , "~/ViewScripts/loader.js" 
            ));

            bundles.Add(new ScriptBundle("~/Content/homePage").Include(
                "~/ViewScripts/homePage.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/contactPage").Include(
                "~/ViewScripts/contactPage.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/aboutPage").Include(
                "~/ViewScripts/aboutPage.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/menuPage").Include(
                "~/ViewScripts/menuPage.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/workPage").Include(
                "~/ViewScripts/workPage.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/workBoxgrove").Include(
                "~/ViewScripts/workBoxgrove.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/workHR").Include(
                "~/ViewScripts/workHR.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/workMultiplex").Include(
                "~/ViewScripts/workMultiplex.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/workRateQuote").Include(
                "~/ViewScripts/workRateQuote.js"
            ));
        }
    }
}