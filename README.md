#### 自制时间选择器一枚
#### 调用方法：
 
  @method dom.dateSelector(param)
  @param {
    period:{array} //必传，显示日期段，顺时逆时皆可，例：['2018-02-14', '2020-10-09']
    showDate：{string} //非必传，当前显示日期，若不传或所传日期不在period日期段内，默认显示period的第一个日期，例：'2019-02-14'
    frozenDayTo：{string} //非必传，冻结日期，只显示某一日, 使用场景以月为单位的日期选择，例：'04'
    confirm: {function} //非必传, 回传参数{JSON}：{date: '当前选择日期', dom: '当前选择器对应元素'}
  }
  @desc 1.日期严格按照yy-mm-dd格式传入，不做过多校验
        2.若传入frozenDayTo参数，period、showDate可只传yy-mm
 
#### 日期按yy-mm-dd格式传入，不做过多校验
#### 若传入frozenDayTo参数，period、showDate可只传yy-mm
