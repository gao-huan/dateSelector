# dateSelector
#### 自制时间选择器一枚
#### 调用方法：
    dom.dateSelector({
      period: ['2018-06-08', '2028-06-09'], //必传
      showDate: '2020-02-14', //当前显示日期，非必传
      frozenDayTo: '01', //冻结日，只显示某日，非必传
      confirm: data=>{ //非必传
        //data: {date: '当前选择日期', dom: '选择器对应dom'}
      }
    });
#### 日期按yy-mm-dd格式传入，不做过多校验
#### 若传入frozenDayTo参数，period、showDate可只传yy-mm
