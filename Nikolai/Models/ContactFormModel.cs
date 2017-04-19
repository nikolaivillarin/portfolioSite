using System.ComponentModel.DataAnnotations;

namespace Nikolai.Models
{
    public class ContactFormModel
    {
        [Required]
        [Display(Name="Your Name")]
        public string Name { get; set; }

        [Required]
        [Display(Name = "Your Email Address")]
        [DataType(DataType.EmailAddress)]
        [RegularExpression(@"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}")]
        public string Email { get; set; }

        [Required]
        [Display(Name = "Your Message to Me")]
        public string Message { get; set; }
    }
}