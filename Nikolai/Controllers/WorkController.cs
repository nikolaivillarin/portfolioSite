using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Nikolai.Controllers
{
    public class WorkController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult WorkPartial()
        {
            return PartialView("_work");
        }

        [HttpGet]
        public ActionResult Multiplex()
        {
            return View();
        }

        [HttpGet]
        public ActionResult MultiplexPartial()
        {
            return PartialView("_multiplex");
        }

        [HttpGet]
        public ActionResult Boxgrove()
        {
            return View();
        }

        [HttpGet]
        public ActionResult BoxgrovePartial()
        {
            return PartialView("_boxgrove");
        }

        [HttpGet]
        public ActionResult RateQuote()
        {
            return View();
        }

        [HttpGet]
        public ActionResult RateQuotePartial()
        {
            return PartialView("_rateQuote");
        }

        [HttpGet]
        public ActionResult HR()
        {
            return View();
        }

        [HttpGet]
        public ActionResult HRPartial()
        {
            return PartialView("_hr");
        }
    }
}