using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Nikolai.Controllers
{
    public class StylesController : Controller
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
    }
}