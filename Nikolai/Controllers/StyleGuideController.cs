using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Nikolai.Controllers
{
    public class StyleGuideController : Controller
    {
        // GET: Styles
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult DialControl()
        {
            return View();
        }

        public ActionResult NavigationControl()
        {
            return View();
        }

        public ActionResult Content()
        {
            return View();
        }

        public ActionResult PageTransition()
        {
            return View();
        }

        public ActionResult ResponsiveImage()
        {
            return View();
        }

        public ActionResult InternalScroll()
        { 
            return View(); 
        }
    }
}