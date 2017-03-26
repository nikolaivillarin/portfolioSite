using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace Nikolai.Models
{
    public class EmailTemplateEngine
    {
        #region Private Fields & Constants
        public const int CONTENT_WIDTH = 554;

        protected Dictionary<string, string> _htmlTemplateDictionary;
        protected Dictionary<string, string> _plainTemplateDictionary;
        protected List<HTMLTableData> _htmlTablesList;

        private int _subHeaderCount;
        private int _paragraphCount;
        private int _breakElemtCount;
        private int _btnCount;
        private string _htmlDefaultSignature;
        private string _plainDefaultSignature;
        #endregion

        #region Properties
        /// <summary>
        /// Set to true if you want to display the default signature
        /// which is: "Sincerely, The Lakeside Team"
        /// </summary>
        public bool DisplayDefaultSignature { get; set; }

        public Dictionary<string, string> HtmlTemplateDictionary
        {
            get
            {
                return _htmlTemplateDictionary;
            }
        }

        public string HtmlTemplate
        {
            get
            {
                string htmlTemplate = string.Join(" ", _htmlTemplateDictionary.Values);

                if (DisplayDefaultSignature == true)
                {
                    htmlTemplate += HTMLDefaultSignature;
                }

                return htmlTemplate;
            }
        }

        public Dictionary<string, string> PlainTemplateDictionary
        {
            get
            {
                return _plainTemplateDictionary;
            }
        }

        public string PlainTemplate
        {
            get
            {
                string plainTemplate = string.Join("\r", _plainTemplateDictionary.Values);

                if (DisplayDefaultSignature == true)
                {
                    plainTemplate += PlainDefaultSignature;
                }

                return plainTemplate;
            }
        }

        protected string HTMLMainHeader
        {
            get
            {
                string element = "<h1 style=\"margin: 0; color: #333333; font-size: 20px; margin-bottom: 10px; line-height: 28px !important;\">##content##</h1>";

                return element;
            }
        }

        protected string HTMLSubHeader
        {
            get
            {
                string element = "<h2 style=\"margin: 0; color: #333333; font-size: 16px; line-height: 28px !important;\">##content##</h2>";

                return element;
            }
        }

        protected string HTMLParagraph
        {
            get
            {
                string element = "<p style=\"margin: 0; color: #444444; font-size: 14px;\">##content##</p>";

                return element;
            }
        }

        protected string HTMLLabelAndValue
        {
            get
            {
                string element = "<b>##label##:</b> ##value##";

                return element;
            }
        }

        protected string HTMLTableNoStyle
        {
            get
            {
                string element = "<table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" bgcolor=\"#FFFFFF\""
                    + " style=\"font-family:Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;"
                    + "line-height:19px;color:#444444;border-collapse:collapse;background-color:#ffffff!important;\">"
                    + "<tbody>##content##</tbody></table>";

                return element;
            }
        }

        protected string HTMLTableDefault
        {
            get
            {
                string element = "<table cellspacing=\"0\" cellpadding=\"4\" border=\"0\" bgcolor=\"#FFFFFF\""
                    + " style=\"font-family:Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;"
                    + "line-height:19px;color:#444444;border-collapse:collapse;background-color:#ffffff!important;\">"
                    + "<tbody>##content##</tbody></table>";

                return element;
            }
        }

        protected string HTMLTableHeaderNoStyle
        {
            get
            {
                string element = "<th width=\"##width##\" valign=\"top\">##content##</th>";

                return element;
            }
        }

        protected string HTMLTableHeaderDefault
        {
            get
            {
                string element = "<th width=\"##width##\" valign=\"top\" style=\"border:1px solid #000000;"
                    + "text-align:left;background-color:#0b94cd;color:#FFFFFF;font-weight:normal;\">"
                    + "##content##</th>";

                return element;
            }
        }

        protected string HTMLTableColumnNoStyle
        {
            get
            {
                string element = "<td width=\"##width##\" valign=\"top\">##content##</td>";

                return element;
            }
        }

        protected string HTMLTableColumnDefault
        {
            get
            {
                string element = "<td width=\"##width##\" valign=\"top\" style=\"border:1px solid #666666; word-wrap:break-word\">"
                    + "##content##</td>";

                return element;
            }
        }

        protected string HTMLTableRowNoStyle
        {
            get
            {
                string element = "<tr>##content##</tr>";

                return element;
            }
        }

        protected string HTMLTableRowDefault
        {
            get
            {
                string element = "<tr style=\"border:1px solid #666666\">##content##</tr>";

                return element;
            }
        }

        protected string HTMLLink
        {
            get
            {
                string element = "<a href=\"##url##\" style=\"background-color: #0b94cd; color: #FFFFFF;"
                    + " cursor: pointer; font-size: 16px; border: 7px solid #0b94cd; text-decoration: none\">"
                    + "##text##</a>";

                return element;
            }
        }

        protected string HTMLDefaultSignature
        {
            get
            {
                if (string.IsNullOrEmpty(_htmlDefaultSignature))
                {
                    string signature = "<p style=\"margin: 0; color: #444444; font-size: 14px;\">";
                    signature += "Sincerely,<br /><b>The Lakeside Team</b></p>";

                    _htmlDefaultSignature = signature;
                }

                return _htmlDefaultSignature;
            }
            set
            {
                _htmlDefaultSignature = value;
            }
        }

        protected string PlainDefaultSignature
        {
            get
            {
                if (string.IsNullOrEmpty(_plainDefaultSignature))
                {
                    _plainDefaultSignature = "Sincerely,\rThe Lakeside Team";
                }
                return _plainDefaultSignature;
            }
            set
            {
                _plainDefaultSignature = value;
            }
        }
        #endregion

        #region Constructors
        public EmailTemplateEngine()
        {
            _htmlTemplateDictionary = new Dictionary<string, string>();
            _plainTemplateDictionary = new Dictionary<string, string>();
            _htmlTablesList = new List<HTMLTableData>();
        }
        #endregion

        #region Methods
        /// <summary>
        /// Adds a main header (h1 element) to the template.
        /// For proper semantics only one main header can be added
        /// per email template
        /// </summary>
        /// <param name="headerText">Header Text</param>
        public void AddMainHeader(string headerText)
        {
            if (string.IsNullOrEmpty(headerText) == true)
            {
                throw new ArgumentNullException("headerText");
            }

            if (_htmlTemplateDictionary.ContainsKey("h1") == true
                || _plainTemplateDictionary.ContainsKey("h1") == true)
            {
                throw new InvalidOperationException("A main header element has already been added, another main header element cannot be added");
            }

            headerText = HttpUtility.HtmlEncode(headerText);

            _htmlTemplateDictionary.Add("h1", HTMLMainHeader.Replace("##content##", headerText));
            _plainTemplateDictionary.Add("h1", headerText);
        }

        /// <summary>
        /// Edits the main header (h1 element).
        /// </summary>
        /// <param name="newHeaderText"></param>
        public void ReplaceMainHeader(string newHeaderText)
        {
            if (string.IsNullOrEmpty(newHeaderText) == true)
            {
                throw new ArgumentNullException("newHeaderText");
            }

            if (_htmlTemplateDictionary.ContainsKey("h1") == false
                || _plainTemplateDictionary.ContainsKey("h1") == false)
            {
                throw new InvalidOperationException("Cannot replace main header since non has been added");
            }

            _htmlTemplateDictionary["h1"] = HTMLMainHeader.Replace("##content##", newHeaderText);
            _plainTemplateDictionary["h1"] = newHeaderText;
        }

        /// <summary>
        /// Adds a sub header (h2 element) to the template
        /// </summary>
        /// <param name="headerText">Header Text</param>
        public void AddSubHeader(string headerText)
        {
            if (string.IsNullOrEmpty(headerText))
            {
                throw new ArgumentNullException("headerText");
            }

            if (_htmlTemplateDictionary.ContainsKey("h1") == false
                || _plainTemplateDictionary.ContainsKey("h1") == false)
            {
                throw new InvalidOperationException("For proper semantics a main header must be added before a sub header");
            }

            string key = "subHeader" + _subHeaderCount;
            _subHeaderCount++;

            headerText = HttpUtility.HtmlEncode(headerText);

            _htmlTemplateDictionary.Add(key, HTMLSubHeader.Replace("##content##", headerText));
            _plainTemplateDictionary.Add(key, headerText);
        }

        /// <summary>
        /// Adds a label and value to the email template. Each label and value pair are added
        /// on separate lines. Example: "label: value"
        /// The label in the example above will be bold.
        /// </summary>
        /// <param name="label"></param>
        /// <param name="value"></param>
        public void AddLabelAndValue(string label, string value)
        {
            AddLabelAndValue(label, value, false);
        }

        /// <summary>
        /// Adds a label and value to the email template. Example: "label: value"
        /// The label in the example above will be bold.
        /// </summary>
        /// <param name="label"></param>
        /// <param name="value"></param>
        /// <param name="keepOnSameLine">
        /// Boolean flag that specifies to keep the label and value pair on the same or separate lines
        /// </param>
        public void AddLabelAndValue(string label, string value, bool keepOnSameLine)
        {
            if (string.IsNullOrEmpty(label))
            {
                throw new ArgumentNullException("label");
            }

            string htmlSeparator = keepOnSameLine == true ? ", " : "<br />";
            string plainSeparator = keepOnSameLine == true ? ", " : "\r";

            string lastparagraphElmtKey = "p" + _paragraphCount;

            label = HttpUtility.HtmlEncode(label);
            value = HttpUtility.HtmlEncode(value);

            string htmlLabelAndValue = HTMLLabelAndValue.Replace("##label##", label);
            htmlLabelAndValue = htmlLabelAndValue.Replace("##value##", value);

            string plainLabelAndValue = string.Format("{0}: {1}", label, value);


            if (_paragraphCount != 0 && _htmlTemplateDictionary.Last().Key == lastparagraphElmtKey)
            {
                // Last item added was a paragraph element, add label and value in paragraph
                string htmlParagraph = _htmlTemplateDictionary[lastparagraphElmtKey];
                int indexOfClosingTag = htmlParagraph.IndexOf("</p>");

                htmlParagraph = htmlParagraph.Substring(0, indexOfClosingTag)
                    + htmlSeparator + htmlLabelAndValue
                    + htmlParagraph.Substring(indexOfClosingTag, htmlParagraph.Length - indexOfClosingTag);

                _htmlTemplateDictionary[lastparagraphElmtKey] = htmlParagraph;

                string plainParagraph = _plainTemplateDictionary[lastparagraphElmtKey];

                _plainTemplateDictionary[lastparagraphElmtKey] = plainParagraph + plainSeparator + plainLabelAndValue;
            }
            else
            {
                string paragraph = HTMLParagraph.Replace("##content##", htmlLabelAndValue);

                _paragraphCount++;

                _htmlTemplateDictionary.Add("p" + _paragraphCount, paragraph);
                _plainTemplateDictionary.Add("p" + _paragraphCount, plainLabelAndValue);
            }
        }

        /// <summary>
        /// Adds text to the email template. Example: "Some Text"
        /// </summary>
        /// <param name="text"></param>
        public void AddText(string text)
        {
            if (string.IsNullOrEmpty(text) == true)
            {
                throw new ArgumentNullException("text");
            }

            string lastParagraphElmtKey = "p" + _paragraphCount;

            text = HttpUtility.HtmlEncode(text);

            if (_paragraphCount != 0 && _htmlTemplateDictionary.Last().Key == lastParagraphElmtKey)
            {
                // Last item added was a paragraph element, add text to last paragraph
                string htmlParagraph = _htmlTemplateDictionary[lastParagraphElmtKey];
                int indexOfClosingTag = htmlParagraph.IndexOf("</p>");

                htmlParagraph = htmlParagraph.Substring(0, indexOfClosingTag)
                    + "<br />" + text
                    + htmlParagraph.Substring(indexOfClosingTag, htmlParagraph.Length - indexOfClosingTag);

                _htmlTemplateDictionary[lastParagraphElmtKey] = htmlParagraph;

                string plainParagraph = _plainTemplateDictionary[lastParagraphElmtKey];

                _plainTemplateDictionary[lastParagraphElmtKey] = plainParagraph + "\r" + text;
            }
            else
            {
                string paragraph = HTMLParagraph.Replace("##content##", text);

                _paragraphCount++;

                _htmlTemplateDictionary.Add("p" + _paragraphCount, paragraph);
                _plainTemplateDictionary.Add("p" + _paragraphCount, text);
            }
        }

        /// <summary>
        /// Replaces text entered previously. This will replace all any occurrence of the text
        /// specified within the paragraph element; or basically will only replace text that was added
        /// by calling add text.
        /// </summary>
        /// <param name="textToReplace"></param>
        /// <param name="newText"></param>
        public void ReplaceText(string textToReplace, string newText)
        {
            if (string.IsNullOrEmpty(textToReplace) == true)
            {
                throw new ArgumentNullException("text");
            }

            for (var i = 1; i <= _paragraphCount; i++)
            {
                string key = "p" + i;

                _htmlTemplateDictionary[key] = _htmlTemplateDictionary[key].Replace(textToReplace, newText);
                _plainTemplateDictionary[key] = _plainTemplateDictionary[key].Replace(textToReplace, newText);
            }
        }

        /// <summary>
        /// Adds a break between text. For example adds a space between paragraphs
        /// </summary>
        public void AddBreak()
        {
            _breakElemtCount++;

            _htmlTemplateDictionary.Add("br" + _breakElemtCount, "<br />");
            _plainTemplateDictionary.Add("br" + _breakElemtCount, "\r");
        }

        /// <summary>
        /// Adds a link button to the email
        /// </summary>
        /// <param name="url"></param>
        /// <param name="buttonText"></param>
        public void AddLinkButton(string url, string buttonText)
        {
            if (string.IsNullOrEmpty(url) == true)
            {
                throw new ArgumentNullException("url");
            }

            if (string.IsNullOrEmpty(buttonText) == true)
            {
                throw new ArgumentNullException("buttonText");
            }

            var urlRegEx = new Regex(@"((http|https|ftp)://([\w-\d]+\.)*[\w-\d]+){1}");

            if (urlRegEx.IsMatch(url) == false)
            {
                throw new InvalidOperationException("URL specified is not a valid absolute URL");
            }

            _btnCount++;

            string btnMarkup = HTMLLink.Replace("##url##", url).Replace("##text##", buttonText);
            string btnKey = "btn" + _btnCount;

            _htmlTemplateDictionary.Add(btnKey, btnMarkup);
            _plainTemplateDictionary.Add(btnKey, url);
        }

        /// <summary>
        /// Creates a table element
        /// </summary>
        /// <param name="tableName">Required: Used as the table identifier</param>
        /// <param name="columnWidths">Required: Column widths by percentage. EG: 50 for 50%</param>
        /// <param name="style">Specifies which style to use</param>
        public void AddTable(string tableName, int[] columnWidths, Style style)
        {
            if (string.IsNullOrEmpty(tableName) == true)
            {
                throw new ArgumentNullException("tableName");
            }

            if (columnWidths == null)
            {
                throw new ArgumentNullException("columnWidhts");
            }

            if (columnWidths.Sum() != 100)
            {
                throw new InvalidOperationException("The sum of the column widths must equal 100%");
            }

            if (_htmlTablesList.Where(x => x.TableID == tableName).Count() != 0)
            {
                throw new InvalidOperationException("Table with the specified name already exists");
            }

            string markup = string.Empty;

            switch (style)
            {
                case Style.NoStyle:
                    markup = HTMLTableNoStyle;
                    break;
                case Style.Default:
                    markup = HTMLTableDefault;
                    break;
                default:
                    throw new ArgumentOutOfRangeException("style");
            }

            var tableData = new HTMLTableData()
            {
                TableID = tableName,
                ColumnWidths = columnWidths,
                Markup = markup,
                TableStyle = style
            };

            _htmlTablesList.Add(tableData);
            _htmlTemplateDictionary.Add(tableName, markup);
            _plainTemplateDictionary.Add(tableName, string.Empty);
        }

        /// <summary>
        /// Adds the table header. The table header must be added right after creating
        /// a table.
        /// </summary>
        /// <param name="headers"></param>
        public void AddTableHeaderRow(string[] headers)
        {
            if (headers == null)
            {
                throw new ArgumentNullException("headers");
            }

            if (_htmlTablesList.Count() == 0)
            {
                throw new InvalidOperationException("A table must be added before adding a header row");
            }

            if (_htmlTemplateDictionary.Last().Key != _htmlTablesList.Last().TableID)
            {
                throw new InvalidOperationException("The header row must be added after creating a table."
                    + " This is enforced for code readability.");
            }

            HTMLTableData tableData = _htmlTablesList.Last();

            if (tableData.Markup.Contains("</td>") == true
                || tableData.Markup.Contains("</th>") == true)
            {
                throw new InvalidOperationException("Only one header can exists per table and a table header"
                    + " cannot be added after a table row.");
            }

            if (tableData.ColumnWidths.Count() != headers.Count())
            {
                throw new InvalidOperationException("Table columns count must match the amount of header columns being added");
            }

            string columnTemplate = string.Empty;
            string rowTemplate = string.Empty;

            switch (tableData.TableStyle)
            {
                case Style.Default:
                    columnTemplate = HTMLTableHeaderDefault;
                    rowTemplate = HTMLTableRowDefault;
                    break;
                case Style.NoStyle:
                    columnTemplate = HTMLTableHeaderNoStyle;
                    rowTemplate = HTMLTableRowNoStyle;
                    break;
            }

            AddRow(tableData.TableID, headers, columnTemplate, rowTemplate, tableData);
        }

        /// <summary>
        /// Adds a row to the HTML table
        /// </summary>
        /// <param name="rowData">The data to populate for each column</param>
        public void AddTableRow(string[] rowData)
        {
            if (_htmlTablesList.Count() == 0)
            {
                throw new InvalidOperationException("A table must be added before adding a row");
            }

            if (_htmlTemplateDictionary.Last().Key != _htmlTablesList.Last().TableID)
            {
                throw new InvalidOperationException("The last item added to the template is not a table."
                    + " Either add a new table or specify the table name which you want to add data to.");
            }

            AddTableRow(_htmlTablesList.Last().TableID, rowData);
        }

        /// <summary>
        /// Adds a row to the HTML table
        /// </summary>
        /// <param name="tableName">The table identifier to add the row to</param>
        /// <param name="rowData">The data to populate for each column</param>
        public void AddTableRow(string tableName, string[] rowData)
        {
            if (string.IsNullOrEmpty(tableName) == true)
            {
                throw new ArgumentNullException("tableName");
            }

            if (_htmlTablesList.Count() == 0)
            {
                throw new InvalidOperationException("A table must be added before adding a row");
            }

            if (rowData == null)
            {
                throw new ArgumentNullException("rowData");
            }

            HTMLTableData tableData = _htmlTablesList.Where(x => x.TableID == tableName).FirstOrDefault();

            if (tableData == null)
            {
                throw new InvalidOperationException("Table could not be found. "
                    + "Please ensure the table name has been spelled correctly");
            }

            if (tableData.ColumnWidths.Count() != rowData.Count())
            {
                throw new InvalidOperationException("Table columns count must match the amount of row data being added");
            }

            string columnTemplate = string.Empty;
            string rowTemplate = string.Empty;

            switch (tableData.TableStyle)
            {
                case Style.Default:
                    columnTemplate = HTMLTableColumnDefault;
                    rowTemplate = HTMLTableRowDefault;
                    break;
                case Style.NoStyle:
                    columnTemplate = HTMLTableColumnNoStyle;
                    rowTemplate = HTMLTableRowNoStyle;
                    break;
            }

            AddRow(tableName, rowData, columnTemplate, rowTemplate, tableData);
        }

        /// <summary>
        /// Adds a row to the HTML table
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="rowData"></param>
        /// <param name="columnTemplate"></param>
        /// <param name="rowTemplate"></param>
        /// <param name="tableData"></param>
        protected void AddRow(string tableName, string[] rowData, string columnTemplate, string rowTemplate, HTMLTableData tableData)
        {
            string htmlRowMarkup = string.Empty;
            string plainRowMarkup = string.Empty;

            for (var i = 0; i < rowData.Length; i++)
            {
                string data = HttpUtility.HtmlEncode(rowData[i]);
                int width = CONTENT_WIDTH * tableData.ColumnWidths[i] / 100;

                data = BreakAppartTextBasedOnPixels(data, width);

                htmlRowMarkup += columnTemplate.Replace("##content##", data)
                    .Replace("##width##", width.ToString());

                plainRowMarkup += string.Format("{0}\t", rowData[i]);
            }

            htmlRowMarkup = rowTemplate.Replace("##content##", htmlRowMarkup);

            if (tableData.Markup.Contains("##content##") == true)
            {
                tableData.Markup = tableData.Markup.Replace("##content##", htmlRowMarkup);
            }
            else
            {
                int indexOfClosingTag = tableData.Markup.IndexOf("</tbody></table>");

                tableData.Markup = tableData.Markup.Substring(0, indexOfClosingTag)
                    + htmlRowMarkup
                    + tableData.Markup.Substring(indexOfClosingTag, tableData.Markup.Length - indexOfClosingTag);
            }

            _htmlTemplateDictionary[tableName] = tableData.Markup;
            _plainTemplateDictionary[tableName] = string.Format("{0}{1}\r",
                _plainTemplateDictionary[tableName],
                plainRowMarkup);
        }

        /// <summary>
        /// Breaks apart continuous text so that it can wrap
        /// </summary>
        /// <param name="text"></param>
        /// <param name="pixelWidth">Min Pixel Width to fit a character is 17 pixels</param>
        /// <returns></returns>
        protected string BreakAppartTextBasedOnPixels(string text, int pixelWidth)
        {
            if (string.IsNullOrEmpty(text) == true)
            {
                return string.Empty;
            }

            if (pixelWidth < 17)
            {
                throw new ArgumentOutOfRangeException("pixelWidth",
                    string.Format("Specified pixel width of {0}px is too small to even fit one character", pixelWidth));
            }

            string result = string.Empty;
            int charactersPerLine = GetCharactersPerLineCount(pixelWidth);

            var spacedTextRegex = new Regex("[^\\s]{1," + charactersPerLine + "}\\s*");

            foreach (Match spacedText in spacedTextRegex.Matches(text))
            {
                if (spacedText.Value.Contains(" ") == true)
                {
                    // Already has spaces just append
                    result += spacedText.Value;
                }
                else
                {
                    result += spacedText.Value + " ";
                }
            }

            return result.Trim();
        }

        protected int GetCharactersPerLineCount(int pixelWidth)
        {
            Bitmap objBitmap = default(Bitmap);
            Graphics objGraphics = default(Graphics);

            objBitmap = new Bitmap(500, 200);
            objGraphics = Graphics.FromImage(objBitmap);

            SizeF stringSize = objGraphics.MeasureString("a", new Font("Arial", 7));

            int numberOfCharacters = Convert.ToInt32(Math.Floor(pixelWidth / stringSize.Width));

            objBitmap.Dispose();
            objGraphics.Dispose();

            return numberOfCharacters;
        }

        /// <summary>
        /// Resets any generated email templates
        /// </summary>
        public void ResetEmailTemplates()
        {
            _htmlTemplateDictionary = new Dictionary<string, string>();
            _plainTemplateDictionary = new Dictionary<string, string>();

            DisplayDefaultSignature = false;

            _subHeaderCount = 0;
            _paragraphCount = 0;
            _breakElemtCount = 0;
            _btnCount = 0;
        }
        #endregion

        #region Structs/Enums/Internal Classes
        public enum Style
        {
            NoStyle = 0,
            Default = 1
        }

        protected class HTMLTableData
        {
            public string TableID { get; set; }

            public int[] ColumnWidths { get; set; }

            public string Markup { get; set; }

            public Style TableStyle { get; set; }
        }
        #endregion
    }
}