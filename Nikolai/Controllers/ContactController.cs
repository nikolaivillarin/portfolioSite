using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Nikolai.Controllers
{
    public class ContactController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult ContactPartial()
        {
            return PartialView("_contact");
        }
    }
}