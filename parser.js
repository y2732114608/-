function scheduleHtmlParser(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const result = [];

  // 辅助函数：截断字符串至50字节（汉字算2字节）
  const truncateString = (str) => {
    let bytes = 0;
    let truncated = '';
    for (const char of str) {
      const charBytes = char.charCodeAt(0) > 255 ? 2 : 1;
      if (bytes + charBytes > 50) break;
      bytes += charBytes;
      truncated += char;
    }
    return truncated;
  };

  // 遍历所有课程块
  $('.timetable_con').each(function () {
    const re = { weeks: [], sections: [] };
    const $course = $(this);

    // 课程名称
    re.name = truncateString($course.find('.title font').text().trim());

    // 上课地点
    $course.find('span[title="上课地点"]').each(function () {
      const text = $(this).next().text().trim();
      re.position = truncateString(text);
    });

    // 教师
    $course.find('span[title="教师"]').each(function () {
      const text = $(this).next().text().trim();
      re.teacher = truncateString(text);
    });

    // 解析周数和节次
    $course.find('span[title="节/周"]').each(function () {
      const rawText = $(this).next().text().trim();
      // 提取节次范围（如 "1-2节" → [1,2]）
      const sectionMatch = rawText.match(/\((\d+)-(\d+)节\)/);
      if (sectionMatch) {
        const start = parseInt(sectionMatch[1]);
        const end = parseInt(sectionMatch[2]);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= 12) re.sections.push(i); // 节次限制在1-12
        }
      }
      // 提取周数段（如 "2-17周,19周" → [2,3,...,17,19]）
      const weekParts = rawText.split(/\)|,/);
      weekParts.forEach(part => {
        const weekMatch = part.match(/(\d+)-(\d+)周|(\d+)周/);
        if (weekMatch) {
          let start, end;
          if (weekMatch[3]) { // 单周（如 "19周"）
            start = end = parseInt(weekMatch[3]);
          } else { // 范围周（如 "2-17周"）
            start = parseInt(weekMatch[1]);
            end = parseInt(weekMatch[2]);
          }
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= 30) re.weeks.push(i); // 周数限制在1-30
          }
        }
      });
    });

    // 星期（从父<td>的id中提取，如 "3-1" → 3）
    const parentTdId = $course.parent().attr('id');
    if (parentTdId) {
      const day = parseInt(parentTdId.split('-')[0]);
      re.day = day >= 1 && day <= 7 ? day : 1; // 默认1（星期一）
    }

    // 去重并排序
    re.weeks = [...new Set(re.weeks)].sort((a, b) => a - b);
    re.sections = [...new Set(re.sections)].sort((a, b) => a - b);

    result.push(re);
  });

  return result
}