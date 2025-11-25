/**
 * Lấy locale từ trình duyệt (nếu có), trả về theo định dạng "en_US", "de_DE", v.v.
 * Nếu không có, trả về mặc định là "en_US".
 */
function get_locale() {
    if (typeof navigator !== 'undefined' && navigator.language) {
      // Chuyển "en-US" thành "en_US"
      return navigator.language.replace('-', '_');
    }
    return 'en_US';
  }
  
  /**
   * Hàm escapeRegExp dùng để escape các ký tự đặc biệt trong chuỗi, phục vụ cho việc tạo RegExp.
   *
   * @param {string} string
   * @return {string}
   */
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }


/**
 * Hàm remove_accents chuyển đổi chuỗi có dấu sang chuỗi không dấu.
 * Nhận 2 tham số: text (chuỗi cần xử lý) và locale (để điều chỉnh bảng mapping).
 *
 * Logic:
 *   - Nếu chuỗi không chứa ký tự có dấu (>= U+0080) thì trả về ngay.
 *   - Nếu chuỗi chỉ chứa các ký tự trong dải ISO-8859-1 ([\x00-\xff]), 
 *     giả sử chuỗi không phải UTF-8 và xử lý theo khối mapping tương tự PHP.
 *   - Nếu chuỗi là UTF-8: 
 *       + Chuẩn hóa Unicode (NFC) nếu có.
 *       + Nếu không có ký tự có dấu thì trả về ngay.
 *       + Xây dựng bảng mapping (mergedMap demo 5 mục) và điều chỉnh theo locale.
 *       + Thay thế theo bảng mapping.
 *
 * @param {string} text - Chuỗi đầu vào cần xử lý.
 * @param {string} [locale=''] - Locale (nếu không truyền, lấy từ get_locale()).
 * @returns {string} - Chuỗi đã loại bỏ dấu.
 */
function remove_accents(text, locale = '') {
    // Nếu chuỗi không chứa ký tự có dấu (>= U+0080) thì trả về ngay
    if (!/[\u0080-\uFFFF]/.test(text)) {
      return text;
    }
  
    // Kiểm tra xem chuỗi chỉ chứa ký tự trong ISO-8859-1 (0 - 255)
    if (/^[\x00-\xff]*$/.test(text)) {
      // --- Xử lý theo giả sử ISO-8859-1 ---
      const isoCharsIn = "\x80\x83\x8a\x8e\x9a\x9e" +
        "\x9f\xa2\xa5\xb5\xc0\xc1\xc2" +
        "\xc3\xc4\xc5\xc7\xc8\xc9\xca" +
        "\xcb\xcc\xcd\xce\xcf\xd1\xd2" +
        "\xd3\xd4\xd5\xd6\xd8\xd9\xda" +
        "\xdb\xdc\xdd\xe0\xe1\xe2\xe3" +
        "\xe4\xe5\xe7\xe8\xe9\xea\xeb" +
        "\xec\xed\xee\xef\xf1\xf2\xf3" +
        "\xf4\xf5\xf6\xf8\xf9\xfa\xfb" +
        "\xfc\xfd\xff";
      const isoCharsOut = 'EfSZszYcYuAAAAAACEEEEIIIINOOOOOOUUUUYaaaaaaceeeeiiiinoooooouuuuyy';
      
      // Thực hiện thay thế từng ký tự (tương tự strtr)
      let result = '';
      for (let i = 0; i < text.length; i++) {
        let ch = text.charAt(i);
        let idx = isoCharsIn.indexOf(ch);
        result += (idx !== -1) ? isoCharsOut.charAt(idx) : ch;
      }
      
      // Xử lý các ký tự kép (double_chars)
      const isoDoubleCharsIn = ["\x8c", "\x9c", "\xc6", "\xd0", "\xde", "\xdf", "\xe6", "\xf0", "\xfe"];
      const isoDoubleCharsOut = ["OE", "oe", "AE", "DH", "TH", "ss", "ae", "dh", "th"];
      isoDoubleCharsIn.forEach((ch, index) => {
        const rep = isoDoubleCharsOut[index];
        const regex = new RegExp(escapeRegExp(ch), 'g');
        result = result.replace(regex, rep);
      });
      return result;
    }
    
    // Nếu chuỗi được cho là UTF-8:
    // Chuẩn hóa Unicode (NFC) nếu trình duyệt hỗ trợ.
    if (typeof text.normalize === 'function') {
      text = text.normalize('NFC');
    }
    
    // Nếu không chứa ký tự có dấu, trả về ngay.
    if (!/[\u0080-\uFFFF]/.test(text)) {
      return text;
    }
    
    // Nếu locale chưa có, lấy từ get_locale().
    if (!locale) {
      locale = get_locale();
    }
    
    // --- Demo bảng mapping mergedMap (chỉ 5 mục demo, bạn tự thay đổi sau) ---
    let mergedMap = {
        "ª" : "a",
        "º" : "o",
        "À" : "A",
        "Á" : "A",
        "Â" : "A",
        "Ã" : "A",
        "Ä" : "A",
        "Å" : "A",
        "Æ" : "AE",
        "Ç" : "C",
        "È" : "E",
        "É" : "E",
        "Ê" : "E",
        "Ë" : "E",
        "Ì" : "I",
        "Í" : "I",
        "Î" : "I",
        "Ï" : "I",
        "Ð" : "D",
        "Ñ" : "N",
        "Ò" : "O",
        "Ó" : "O",
        "Ô" : "O",
        "Õ" : "O",
        "Ö" : "O",
        "Ù" : "U",
        "Ú" : "U",
        "Û" : "U",
        "Ü" : "U",
        "Ý" : "Y",
        "Þ" : "TH",
        "ß" : "B",
        "à" : "a",
        "á" : "a",
        "â" : "a",
        "ã" : "a",
        "ä" : "a",
        "å" : "a",
        "æ" : "ae",
        "ç" : "c",
        "è" : "e",
        "é" : "e",
        "ê" : "e",
        "ë" : "e",
        "ì" : "i",
        "í" : "i",
        "î" : "i",
        "ï" : "i",
        "ð" : "d",
        "ñ" : "n",
        "ò" : "o",
        "ó" : "o",
        "ô" : "o",
        "õ" : "o",
        "ö" : "o",
        "ø" : "o",
        "ù" : "u",
        "ú" : "u",
        "û" : "u",
        "ü" : "u",
        "ý" : "y",
        "þ" : "th",
        "ÿ" : "y",
        "Ø" : "O",
        "Ā" : "A",
        "ā" : "a",
        "Ă" : "A",
        "ă" : "a",
        "Ą" : "A",
        "ą" : "a",
        "Ć" : "C",
        "ć" : "c",
        "Ĉ" : "C",
        "ĉ" : "c",
        "Ċ" : "C",
        "ċ" : "c",
        "Č" : "C",
        "č" : "c",
        "Ď" : "D",
        "ď" : "d",
        "Đ" : "D",
        "đ" : "d",
        "Ē" : "E",
        "ē" : "e",
        "Ĕ" : "E",
        "ĕ" : "e",
        "Ė" : "E",
        "ė" : "e",
        "Ę" : "E",
        "ę" : "e",
        "Ě" : "E",
        "ě" : "e",
        "Ĝ" : "G",
        "ĝ" : "g",
        "Ğ" : "G",
        "ğ" : "g",
        "Ġ" : "G",
        "ġ" : "g",
        "Ģ" : "G",
        "ģ" : "g",
        "Ĥ" : "H",
        "ĥ" : "h",
        "Ħ" : "H",
        "ħ" : "h",
        "Ĩ" : "I",
        "ĩ" : "i",
        "Ī" : "I",
        "ī" : "i",
        "Ĭ" : "I",
        "ĭ" : "i",
        "Į" : "I",
        "į" : "i",
        "İ" : "I",
        "ı" : "i",
        "Ĳ" : "IJ",
        "ĳ" : "ij",
        "Ĵ" : "J",
        "ĵ" : "j",
        "Ķ" : "K",
        "ķ" : "k",
        "ĸ" : "k",
        "Ĺ" : "L",
        "ĺ" : "l",
        "Ļ" : "L",
        "ļ" : "l",
        "Ľ" : "L",
        "ľ" : "l",
        "Ŀ" : "L",
        "ŀ" : "l",
        "Ł" : "l",
        "ł" : "l",
        "Ń" : "N",
        "ń" : "n",
        "Ņ" : "N",
        "ņ" : "n",
        "Ň" : "N",
        "ň" : "n",
        "ŉ" : "n",
        "Ŋ" : "N",
        "ŋ" : "n",
        "Ō" : "O",
        "ō" : "o",
        "Ŏ" : "O",
        "ŏ" : "o",
        "Ő" : "O",
        "ő" : "o",
        "Œ" : "OE",
        "œ" : "oe",
        "Ŕ" : "R",
        "ŕ" : "r",
        "Ŗ" : "R",
        "ŗ" : "r",
        "Ř" : "R",
        "ř" : "r",
        "Ś" : "S",
        "ś" : "s",
        "Ŝ" : "S",
        "ŝ" : "s",
        "Ş" : "S",
        "ş" : "s",
        "Š" : "S",
        "š" : "s",
        "Ţ" : "T",
        "ţ" : "t",
        "Ť" : "T",
        "ť" : "t",
        "Ŧ" : "T",
        "ŧ" : "t",
        "Ũ" : "U",
        "ũ" : "u",
        "Ū" : "U",
        "ū" : "u",
        "Ŭ" : "U",
        "ŭ" : "u",
        "Ů" : "U",
        "ů" : "u",
        "Ű" : "U",
        "ű" : "u",
        "Ų" : "U",
        "ų" : "u",
        "Ŵ" : "W",
        "ŵ" : "w",
        "Ŷ" : "Y",
        "ŷ" : "y",
        "Ÿ" : "Y",
        "Ź" : "Z",
        "ź" : "z",
        "Ż" : "Z",
        "ż" : "z",
        "Ž" : "Z",
        "ž" : "z",
        "ſ" : "s",
        "Ə" : "E",
        "ǝ" : "e",
        "Ș" : "S",
        "ș" : "s",
        "Ț" : "T",
        "ț" : "t",
        "€" : "E",
        "£" : "",
        "Ơ" : "O",
        "ơ" : "o",
        "Ư" : "U",
        "ư" : "u",
        "Ầ" : "A",
        "ầ" : "a",
        "Ằ" : "A",
        "ằ" : "a",
        "Ề" : "E",
        "ề" : "e",
        "Ồ" : "O",
        "ồ" : "o",
        "Ờ" : "O",
        "ờ" : "o",
        "Ừ" : "U",
        "ừ" : "u",
        "Ỳ" : "Y",
        "ỳ" : "y",
        "Ả" : "A",
        "ả" : "a",
        "Ẩ" : "A",
        "ẩ" : "a",
        "Ẳ" : "A",
        "ẳ" : "a",
        "Ẻ" : "E",
        "ẻ" : "e",
        "Ể" : "E",
        "ể" : "e",
        "Ỉ" : "I",
        "ỉ" : "i",
        "Ỏ" : "O",
        "ỏ" : "o",
        "Ổ" : "O",
        "ổ" : "o",
        "Ở" : "O",
        "ở" : "o",
        "Ủ" : "U",
        "ủ" : "u",
        "Ử" : "U",
        "ử" : "u",
        "Ỷ" : "Y",
        "ỷ" : "y",
        "Ẫ" : "A",
        "ẫ" : "a",
        "Ẵ" : "A",
        "ẵ" : "a",
        "Ẽ" : "E",
        "ẽ" : "e",
        "Ễ" : "E",
        "ễ" : "e",
        "Ỗ" : "O",
        "ỗ" : "o",
        "Ỡ" : "O",
        "ỡ" : "o",
        "Ữ" : "U",
        "ữ" : "u",
        "Ỹ" : "Y",
        "ỹ" : "y",
        "Ấ" : "A",
        "ấ" : "a",
        "Ắ" : "A",
        "ắ" : "a",
        "Ế" : "E",
        "ế" : "e",
        "Ố" : "O",
        "ố" : "o",
        "Ớ" : "O",
        "ớ" : "o",
        "Ứ" : "U",
        "ứ" : "u",
        "Ạ" : "A",
        "ạ" : "a",
        "Ậ" : "A",
        "ậ" : "a",
        "Ặ" : "A",
        "ặ" : "a",
        "Ẹ" : "E",
        "ẹ" : "e",
        "Ệ" : "E",
        "ệ" : "e",
        "Ị" : "I",
        "ị" : "i",
        "Ọ" : "O",
        "ọ" : "o",
        "Ộ" : "O",
        "ộ" : "o",
        "Ợ" : "O",
        "ợ" : "o",
        "Ụ" : "U",
        "ụ" : "u",
        "Ự" : "U",
        "ự" : "u",
        "Ỵ" : "Y",
        "ỵ" : "y",
        "ɑ" : "a",
        "Ǖ" : "U",
        "ǖ" : "u",
        "Ǘ" : "U",
        "ǘ" : "u",
        "Ǎ" : "A",
        "ǎ" : "a",
        "Ǐ" : "I",
        "ǐ" : "i",
        "Ǒ" : "O",
        "ǒ" : "o",
        "Ǔ" : "U",
        "ǔ" : "u",
        "Ǚ" : "U",
        "ǚ" : "u",
        "Ǜ" : "U",
        "ǜ" : "u",
        "©" : "(c)",
        "Α" : "A",
        "Β" : "B",
        "Γ" : "G",
        "Δ" : "D",
        "Ε" : "E",
        "Ζ" : "Z",
        "Η" : "H",
        "Θ" : "8",
        "Ι" : "I",
        "Κ" : "K",
        "Λ" : "L",
        "Μ" : "M",
        "Ν" : "N",
        "Ξ" : "3",
        "Ο" : "O",
        "Π" : "P",
        "Ρ" : "P",
        "Σ" : "S",
        "Τ" : "T",
        "Υ" : "Y",
        "Φ" : "F",
        "Χ" : "X",
        "Ψ" : "Y",
        "Ω" : "W",
        "Ά" : "A",
        "Έ" : "E",
        "Ί" : "I",
        "Ό" : "O",
        "Ύ" : "Y",
        "Ή" : "H",
        "Ώ" : "W",
        "Ϊ" : "I",
        "Ϋ" : "Y",
        "α" : "a",
        "β" : "b",
        "γ" : "g",
        "δ" : "d",
        "ε" : "e",
        "ζ" : "z",
        "η" : "h",
        "θ" : "8",
        "ι" : "i",
        "κ" : "k",
        "λ" : "l",
        "μ" : "m",
        "ν" : "n",
        "ξ" : "3",
        "ο" : "o",
        "π" : "p",
        "ρ" : "r",
        "σ" : "s",
        "τ" : "t",
        "υ" : "y",
        "φ" : "f",
        "χ" : "x",
        "ψ" : "Y",
        "ω" : "w",
        "ά" : "a",
        "έ" : "e",
        "ί" : "i",
        "ό" : "o",
        "ύ" : "y",
        "ή" : "h",
        "ώ" : "w",
        "ς" : "c",
        "ϊ" : "i",
        "ΰ" : "y",
        "ϋ" : "y",
        "ΐ" : "i",
        "А" : "A",
        "Б" : "B",
        "В" : "V",
        "Г" : "R",
        "Д" : "A",
        "Е" : "E",
        "Ё" : "Е",
        "Ж" : "X",
        "З" : "3",
        "И" : "I",
        "Й" : "И",
        "К" : "K",
        "Л" : "N",
        "М" : "M",
        "Н" : "H",
        "О" : "O",
        "П" : "P",
        "Р" : "P",
        "С" : "C",
        "Т" : "T",
        "У" : "y",
        "Ф" : "F",
        "Х" : "X",
        "Ц" : "U",
        "Ч" : "Ch",
        "Ш" : "W",
        "Щ" : "W",
        "Ъ" : "",
        "Ы" : "bl",
        "Ь" : "b",
        "Э" : "e",
        "Ю" : "o",
        "Я" : "R",
        "а" : "a",
        "б" : "b",
        "в" : "b",
        "г" : "r",
        "д" : "A",
        "е" : "e",
        "ё" : "е",
        "ж" : "x",
        "з" : "3",
        "и" : "n",
        "й" : "и",
        "к" : "k",
        "л" : "n",
        "м" : "m",
        "н" : "h",
        "о" : "o",
        "п" : "n",
        "р" : "p",
        "с" : "c",
        "т" : "t",
        "у" : "y",
        "ф" : "o",
        "х" : "x",
        "ц" : "u",
        "ч" : "y",
        "ш" : "w",
        "щ" : "w",
        "ъ" : "b",
        "ы" : "u",
        "ь" : "b",
        "э" : "e",
        "ю" : "o",
        "я" : "r",
        "Є" : "e",
        "І" : "I",
        "Ї" : "i",
        "Ґ" : "R",
        "є" : "e",
        "і" : "i",
        "ї" : "i",
        "ґ" : "r",
        "Ȃ" : "A",
        "Ḉ" : "C",
        "Ḗ" : "E",
        "Ḕ" : "E",
        "Ḝ" : "E",
        "Ȇ" : "E",
        "Ḯ" : "I",
        "Ȋ" : "I",
        "Ṍ" : "O",
        "Ṓ" : "O",
        "Ȏ" : "O",
        "ȃ" : "a",
        "ḉ" : "c",
        "ḗ" : "e",
        "ḕ" : "e",
        "ḝ" : "e",
        "ȇ" : "e",
        "ḯ" : "i",
        "ȋ" : "i",
        "ṍ" : "o",
        "ṓ" : "o",
        "ȏ" : "o",
        "C̆" : "C",
        "c̆" : "c",
        "Ǵ" : "G",
        "ǵ" : "g",
        "Ḫ" : "H",
        "ḫ" : "h",
        "Ḱ" : "K",
        "ḱ" : "k",
        "K̆" : "K",
        "k̆" : "k",
        "Ḿ" : "M",
        "ḿ" : "m",
        "M̆" : "M",
        "m̆" : "m",
        "N̆" : "N",
        "n̆" : "n",
        "P̆" : "P",
        "p̆" : "p",
        "R̆" : "R",
        "r̆" : "r",
        "Ȓ" : "R",
        "ȓ" : "r",
        "T̆" : "T",
        "t̆" : "t",
        "Ȗ" : "U",
        "ȗ" : "u",
        "V̆" : "V",
        "v̆" : "v",
        "Ẃ" : "W",
        "ẃ" : "w",
        "X̆" : "X",
        "x̆" : "x",
        "Y̆" : "Y",
        "y̆" : "y",
        "ƒ" : "f",
        "Ṹ" : "U",
        "ṹ" : "u",
        "Ǻ" : "A",
        "ǻ" : "a",
        "Ǽ" : "AE",
        "ǽ" : "ae",
        "Ǿ" : "O",
        "ǿ" : "o",
        "Ṕ" : "P",
        "ṕ" : "p",
        "Ṥ" : "S",
        "ṥ" : "s",
        "X́" : "X",
        "x́" : "x",
        "Ѓ" : "Г",
        "ѓ" : "г",
        "Ќ" : "К",
        "ќ" : "к",
        "A̋" : "A",
        "a̋" : "a",
        "E̋" : "E",
        "e̋" : "e",
        "I̋" : "I",
        "i̋" : "i",
        "Ǹ" : "N",
        "ǹ" : "n",
        "Ṑ" : "O",
        "ṑ" : "o",
        "Ẁ" : "W",
        "ẁ" : "w",
        "Ȁ" : "A",
        "ȁ" : "a",
        "Ȅ" : "E",
        "ȅ" : "e",
        "Ȉ" : "I",
        "ȉ" : "i",
        "Ȍ" : "O",
        "ȍ" : "o",
        "Ȑ" : "R",
        "ȑ" : "r",
        "Ȕ" : "U",
        "ȕ" : "u",
        "B̌" : "B",
        "b̌" : "b",
        "Č̣" : "C",
        "č̣" : "c",
        "Ê̌" : "E",
        "ê̌" : "e",
        "F̌" : "F",
        "f̌" : "f",
        "Ǧ" : "G",
        "ǧ" : "g",
        "Ȟ" : "H",
        "ȟ" : "h",
        "J̌" : "J",
        "ǰ" : "j",
        "Ǩ" : "K",
        "ǩ" : "k",
        "M̌" : "M",
        "m̌" : "m",
        "P̌" : "P",
        "p̌" : "p",
        "Q̌" : "Q",
        "q̌" : "q",
        "Ř̩" : "R",
        "ř̩" : "r",
        "Ṧ" : "S",
        "ṧ" : "s",
        "V̌" : "V",
        "v̌" : "v",
        "W̌" : "W",
        "w̌" : "w",
        "X̌" : "X",
        "x̌" : "x",
        "Y̌" : "Y",
        "y̌" : "y",
        "A̧" : "A",
        "a̧" : "a",
        "B̧" : "B",
        "b̧" : "b",
        "Ḑ" : "D",
        "ḑ" : "d",
        "Ȩ" : "E",
        "ȩ" : "e",
        "Ɛ̧" : "E",
        "ɛ̧" : "e",
        "Ḩ" : "H",
        "ḩ" : "h",
        "I̧" : "I",
        "i̧" : "i",
        "Ɨ̧" : "I",
        "ɨ̧" : "i",
        "M̧" : "M",
        "m̧" : "m",
        "O̧" : "O",
        "o̧" : "o",
        "Q̧" : "Q",
        "q̧" : "q",
        "U̧" : "U",
        "u̧" : "u",
        "X̧" : "X",
        "x̧" : "x",
        "Z̧" : "Z",
        "z̧" : "z"
    };
    
    // Điều chỉnh mergedMap dựa trên locale (theo logic PHP)
    locale = locale.toLowerCase();
    if (locale.startsWith('de')) { // tiếng Đức
      mergedMap["Ä"] = "Ae";
      mergedMap["ä"] = "ae";
      mergedMap["Ö"] = "Oe";
      mergedMap["ö"] = "oe";
      mergedMap["ß"] = "ss";
    } else if (locale === 'da_dk') { // tiếng Đan Mạch
      mergedMap["Æ"] = "Ae";
      mergedMap["æ"] = "ae";
      mergedMap["Ø"] = "Oe";
      mergedMap["ø"] = "oe";
      mergedMap["Å"] = "Aa";
      mergedMap["å"] = "aa";
    } else if (locale === 'ca') {
      mergedMap["l·l"] = "ll";
    } else if (locale === 'sr_rs' || locale === 'bs_ba') {
      mergedMap["Đ"] = "DJ";
      mergedMap["đ"] = "dj";
    }
    
    // Tạo RegExp từ các key của mergedMap
    const keys = Object.keys(mergedMap).map(escapeRegExp).join('|');
    const regex = new RegExp(keys, 'g');
    
    // Thay thế các ký tự theo bảng mapping
    return text.replace(regex, function(match) {
      return mergedMap[match];
    });
  }


/**
 * Hàm url_slug chuyển chuỗi đầu vào thành slug thân thiện với URL.
 * Dựa theo hàm PHP url_slug: 
 *   - Loại bỏ dấu qua remove_accents
 *   - Thực hiện thay thế tùy chỉnh theo options.replacements
 *   - Nếu transliterate=true, có thể thực hiện chuyển đổi thêm (nếu có bảng charMap riêng)
 *   - Thay thế các ký tự không phải chữ số, chữ cái thành delimiter
 *   - Loại bỏ các delimiter lặp lại và cắt các ký tự thừa
 *   - Chuyển về chữ thường nếu được chỉ định.
 *
 * @param {string} str - Chuỗi đầu vào.
 * @param {Object} [options] - Các tùy chọn cấu hình:
 *   - delimiter: ký tự phân cách (mặc định là '-')
 *   - limit: giới hạn độ dài của slug (mặc định là không giới hạn)
 *   - lowercase: chuyển slug về chữ thường (mặc định là true)
 *   - replacements: object chứa các thay thế tùy chỉnh (ví dụ: { 'ß': 'ss' })
 *   - transliterate: nếu true, sẽ dùng bảng charMap trong options.charMap để thay thế thêm (mặc định false)
 *   - charMap: bảng mapping ký tự dùng cho transliterate (nếu cần)
 *   - locale: locale để chuyển đổi (nếu không truyền, sử dụng get_locale())
 * @returns {string} - Slug được tạo ra.
 */
function url_slug(str, options) {
    // Loại bỏ dấu khỏi chuỗi
    options = options || {};
    str = remove_accents(str, options.locale || '');
    
    // Thiết lập các tùy chọn mặc định
    const defaults = {
      delimiter: '-',
      limit: null,
      lowercase: true,
      replacements: {},
      transliterate: false,
      charMap: {}  // bảng mapping bổ sung nếu transliterate = true (bạn có thể truyền vào)
    };
    
    options = Object.assign({}, defaults, options);
    
    // Thực hiện thay thế tùy chỉnh theo options.replacements
    for (let key in options.replacements) {
      if (options.replacements.hasOwnProperty(key)) {
        let repRegex = new RegExp(key, 'g');
        str = str.replace(repRegex, options.replacements[key]);
      }
    }
    
    // Nếu transliterate = true và có bảng charMap, thực hiện thay thế theo bảng đó
    if (options.transliterate && Object.keys(options.charMap).length > 0) {
      const keys = Object.keys(options.charMap).map(escapeRegExp).join('|');
      const translitRegex = new RegExp(keys, 'g');
      str = str.replace(translitRegex, function(match) {
        return options.charMap[match];
      });
    }
    
    // Thay thế các ký tự không phải chữ cái (Unicode letter) hoặc số bằng delimiter
    // Sử dụng Unicode property escapes (ES2018+)
    str = str.replace(/[^\p{L}\p{N}]+/gu, options.delimiter);
    
    // Loại bỏ các delimiter lặp lại
    const delimEscaped = escapeRegExp(options.delimiter);
    const dupDelimRegex = new RegExp('(' + delimEscaped + '){2,}', 'g');
    str = str.replace(dupDelimRegex, options.delimiter);
    
    // Cắt chuỗi nếu có giới hạn độ dài (limit)
    if (options.limit && str.length > options.limit) {
      str = str.substring(0, options.limit);
    }
    
    // Loại bỏ delimiter ở đầu và cuối chuỗi
    const trimRegex = new RegExp('^' + delimEscaped + '+|' + delimEscaped + '+$', 'g');
    str = str.replace(trimRegex, '');
    
    // Chuyển chuỗi về chữ thường nếu chỉ định
    if (options.lowercase) {
      str = str.toLowerCase();
    }
    
    return str;
  }

/* Use this function for create keyword search */
function keyword_slug(str, options=[]){
    str = url_slug(str, options);
    return str.replaceAll('-', ' ');
}
