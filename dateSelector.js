/**
 * @method dom.dateSelector(param)
 * @param {
 *   period:{array} //必传，显示日期段，顺时逆时皆可，例：['2018-02-14', '2020-10-09']
 *   showDate：{string} //非必传，当前显示日期，若不传或所传日期不在period日期段内，默认显示period的第一个日期，例：'2019-02-14'
 *   frozenDayTo：{string} //非必传，冻结日期，只显示某一日, 使用场景以月为单位的日期选择，例：'04'
 *   confirm: {function} //非必传, 回传参数{JSON}：{date: '当前选择日期', dom: '当前选择器对应元素'}
 * }
 * @desc 1.日期严格按照yy-mm-dd格式传入，不做过多校验
 *       2.若传入frozenDayTo参数，period、showDate可只传yy-mm
 */
(function(global, factory){
	EventTarget.prototype.dateSelector = factory();
})(typeof HTMLDivElement !== 'undeined' ? window : this, function(){

	let Dater = function(option){
		initial.bridge.push(Object.assign(option, {
			dom: this
		}));
		return new Dater.fn.init(this, option);
	}

	Dater.fn = Dater.prototype = Object.create(null);

	let init = Dater.fn.init = function(ele, option){
		if(!option['period']){
			console.log('请传入period参数，格式[yy-mm-dd, yy-mm-dd]');
			return;
		}
		this.ele = ele;
		this.startTime = (option['period'][0]);
		this.endTime = option['period'][1];
		this.showTime = option.showDate && option.showDate > this.startTime && option.showDate < this.endTime ? option.showDate : this.startTime;
		this.frozenDayTo = option.frozenDayTo || null;
		this.callback = option['confirm'] || null;

		if(!this.checkDate(this.startTime) || !this.checkDate(this.endTime) || !this.checkDate(this.showTime)){
			console.log('日期或格式错误，请以yy-mm-dd格式输入有效日期');
			return;
		}

		//固定日期的场景
		if(this.frozenDayTo){
			this.startTime = this.initFrozenDay(this.startTime);
			this.endTime = this.initFrozenDay(this.endTime);
			this.showTime = this.initFrozenDay(this.showTime);
		}

		this.height = 32;
		this.date = trim(option.showData) || this.startTime;

		//监听日期变化以渲染月、日选项
		this.handler();

		//点击加载选择器
		this.ele.addEventListener('click', (e)=>{
			closeSelector();
			this.render();
		});

		//地址改变移除选择器，vue-router、hash路由场景
		window.addEventListener('popstate', ()=>{
			closeSelector();
		});
	}

	init.prototype = Dater.fn;

	Dater.fn.initFrozenDay = function(time){
		let st = time.split('-');
		st[2] = this.frozenDayTo;
		return st.join('-');
	}

	Dater.fn.checkDate = function(date){
		if(!date)return;
		return new Date(date).toJSON().substr(0,10) === date;
	}

	Dater.fn.render = function(){
		let btnEle = document.createElement('div');
		btnEle.id = 'dater-btn';

		let cancelEle = document.createElement('a');
		cancelEle.text = '取消';
		this.clickEventListener(cancelEle);

		let okEle = document.createElement('a');
		okEle.text = '确认';

		this.clickEventListener(okEle, ()=>{
			this.ele.tagName === 'INPUT' ? this.ele.value = this.date : this.ele.innerHTML = this.date;
			this.callback&&this.callback({
				date: this.date,
				dom: this.ele
			});
		});

		btnEle.appendChild(cancelEle);
		btnEle.appendChild(okEle);

		let contentEle = document.createElement('div');
		contentEle.id = 'dater-main';
		[1,2,3].map((v)=>{
			let touchEle = document.createElement('div');
			touchEle.className = 'dater-touch';
			touchEle.innerHTML = '<ul class="dater-item"></ul>';
			this.addMoveListener(touchEle);
			contentEle.appendChild(touchEle);
		});

		let daterEle = document.createElement('div');
		daterEle.id = 'dater';

		daterEle.appendChild(btnEle);
		daterEle.appendChild(contentEle);

		let wrapEle = document.createElement('div');
		wrapEle.id = 'dater-wrap';
		wrapEle.appendChild(daterEle);

		document.body.appendChild(wrapEle);

//		this.addMoveListener(touchEle);
		this.item(this.date, this.startTime);

		this.initPosition();
	}

	Dater.fn.item = function(newv, oldv){
		let _self = this;
		let itemEle = document.querySelectorAll('.dater-item');
		let sArr = this.startTime.split('-');
		let eArr = this.endTime.split('-');
		let nArr = newv.split('-');
		let oArr = oldv.split('-');
		let sy = sArr[0], sm = sArr[1], sd = sArr[2];
		let ey = eArr[0], em = eArr[1], ed = eArr[2];
		let ny = nArr[0], nm = nArr[1], nd = nArr[2];
		let oy = oArr[0], om = oArr[1], od = oArr[2];
		let isReverse = false;
		let mtpl, dtpl;
		let days;

		if(ny !== oy && (ny === sy || ny === ey || oy === sy)){
			resetPositon(itemEle[1]);
			resetPositon(itemEle[2]);
		}
//		if(nm !== om){
//			resetPositon(itemEle[2]);
//		}
		let snM = 1;
		let lenM = 11;
		let snD = 1;
		let lenD = new Date(ny,nm,0).getDate()-1;
		if(ny === sy){
			snM = sm;
			lenM = 12-sm;

			if(nm === sm){
				snD = sd;
				lenD = new Date(sy,sm,0).getDate()-sd;
			}
		}else if(ny === ey){
			snM = 1;
			lenM = em-1;

			if(nm === em){
				snD = 1;
				lenD = ed-1;
			}
		}
		if(this.frozenDayTo){
			snD = nd;
			lenD = 0;
		}

		mtpl = getTpl(snM, lenM, '月');
		dtpl = getTpl(snD, lenD, '日');

		itemEle[0].innerHTML = getTpl(sy, ey-sy, '年').tpl;
		itemEle[1].innerHTML = mtpl.tpl;
		itemEle[2].innerHTML = dtpl.tpl;

		//日期切换刷新列表
		let DY = this.GetTranslateY(itemEle[2]);
		if(DY <= dtpl.maxY){
			itemEle[2].style.transform = `translate(0, ${dtpl.maxY}px)`;
		}

		function getTpl(sn, len, unit){
			let tpl = '';
			sn = parseInt(sn);
			for(let i=0;i<=Math.abs(len);i++){
				let curSN = len > 0 ? sn+i : sn-i;
				tpl+=`<li>${unit !== '年'&&curSN<10 ? '0' : ''}${curSN}${unit}</li>`;
			}
			return {tpl: tpl, maxY: _self.height*2 - len*_self.height};
		}

		function resetPositon(ele){
			ele.style.transform = `translate(0, ${_self.height*2}px)`;
		}
	}

	Dater.fn.clickEventListener = function(eventEle, callback){
		eventEle.addEventListener('click', ()=>{
			callback&&callback();
			closeSelector();
		});
	}

	Dater.fn.GetNowDate = function(){
		let tEle = document.querySelectorAll('.dater-item');
		let len = tEle.length;
		let stArr = this.startTime.split('-');
		let etArr = this.endTime.split('-');
		let ntArr = this.date.split('-');
		let tYArr = [];
		let baseDateArr = (this.date===this.startTime ? this.startTime : `${stArr[0]}-01-01`).split('-');
		let isReverse = etArr[0]-stArr[0] < 0 ? true : false;

		if(this.frozenDayTo)len = len-1;
		for(let i=0; i<len; i++){
			let v = tEle[i];
			let index = Math.floor(Math.abs((this.GetTranslateY(v)-this.height*2)/this.height));
			let val = isReverse&&i===0 ? parseInt(baseDateArr[i]) - index : parseInt(baseDateArr[i]) + index;
			tYArr[i] = (val < 10 ? '0' : '') + val;
			if(tYArr[i].length === 4){
				if(tYArr[i] === stArr[i]){
					baseDateArr = stArr;
				}else{
					baseDateArr = [tYArr[i], '01', '01']
				}
			}
		}
		if(this.frozenDayTo)tYArr[2] = this.frozenDayTo;
		return tYArr.join('-');
	}

	function closeSelector(){
		let daterEle = document.getElementById('dater-wrap');
		daterEle&&(document.getElementById('dater-wrap').outerHTML = '');
	}

	Dater.fn.addMoveListener = function(touchEle){
		let _self = this;
		let transformEle = touchEle.children[0];
		let len;
		let maxY;
		let minY;
		let startY, nowY, endY;
		let direction;
		let movedY;
		let translateY, nowTranslateY;
		let startTime, endTime, takeTimes;
		let stopInertiaMove;
	    touchEle.addEventListener('touchstart',(e) => {
	    	e.preventDefault();
	    	len = transformEle.childElementCount;
	    	maxY = this.height*(len-3);
	    	minY = this.height*2;

	    	//停止上一次惯性运动
			stopInertiaMove = true;

			startY = e.touches[0].pageY;
			startTime = new Date().getTime();
			translateY = this.GetTranslateY(transformEle);

	    });
	    touchEle.addEventListener('touchmove', (e) => {
	    	//停止上一次惯性运动
	    	stopInertiaMove = true;

			nowY = e.touches[0].pageY;

			direction = this.GetSlideDirection(startY, nowY);
			movedY = nowY - startY;
			nowTranslateY = translateY+movedY;
			transformEle.style.transition = 'none';
			transformEle.style.transform = `translate(0, ${nowTranslateY}px)`;
	    });
	    touchEle.addEventListener('touchend', (e) => {
	    	//可进行惯性运动
	    	stopInertiaMove = false;
	    	endY = e.changedTouches[0].pageY;
			endTime = new Date().getTime();
			let v = (endY - startY)/(endTime - startTime);

			if(nowTranslateY > 0 && nowTranslateY > minY){
				transformEle.style.transition = `transform .4s`;
				transformEle.style.transform = `translate(0, ${minY}px)`;
			}else if(nowTranslateY < 0 && -nowTranslateY > maxY){
				transformEle.style.transition = `transform .4s`;
				transformEle.style.transform = `translate(0, ${-maxY}px)`;
			}else{
				this.inertia(v, nowTranslateY, endTime, minY, maxY, transformEle, stopInertiaMove);
			}
		});

		touchEle.addEventListener('webkitTransitionEnd', () => {
			this.updataNowDate.call(this);
		});
	}

	Dater.fn.updataNowDate = function(){
		this.date = this.GetNowDate();
	}

	Dater.fn.initPosition = function(){
		if(!this.date)return;
		let stArr = this.startTime.split('-');
		let ntArr = this.date.split('-');
		let doEle = document.querySelectorAll('.dater-item');
		let baseNum;
		ntArr.forEach((v,i)=>{
			if(stArr[0]===ntArr[0] || v.length === 4){
				baseNum = parseInt(stArr[i]);
			}else{
				baseNum = 1;
			}
			if(i===2&&this.frozenDayTo)return;
			let translateY = this.height*2-Math.abs(parseInt(v) - baseNum)*this.height;
			doEle[i].style.transform = `translate(0, ${translateY}px)`;
		});
	}

	Dater.fn.handler = function(){
		let _self = this;
		let oldDate = this.date;
		Object.defineProperty(this, 'date',{
			set: function(newV){
				oldDate = _self.date || _self.startTime;
				if(oldDate === newV)return;
				let nArr = newV.split('-');
				let days = new Date(nArr[0], nArr[1], 0).getDate();
				if(this.frozenDayTo > days)newV = `${nArr[0]}-${nArr[1]}-${days}`;
				this.newVal = newV;
				this.item(newV, oldDate);
			},
			get: function(){
				return this.newVal || _self.showTime;
			}
		});
	}

	Dater.fn.inertia = function(v, ty, endTime, minY, maxY, transformEle, stopInertiaMove, callback){
		let _self = this;
		let nowTime, nowV;
		let t,dir;
		let deceleration;
		let moveY;
		let nty;
		//加速度方向（与运动方向相反）
		dir = v > 0 ? -1 : 1;
		deceleration = dir*0.001;
		function inertiaMove(){
			if(stopInertiaMove)return;
			nowTime = new Date().getTime();
			t = nowTime - endTime;
			//速度根据时间变化
			nowV = v + t*deceleration;
			//t时间段内移动距离
        	moveY = (v + nowV) / 2 * t;
        	nty = ty + moveY;
			//加速度方向与速度相同时结束惯性（速度反向）
			if(dir*nowV > 0){
				if(nty > 0 && nty > minY){
					nty = minY;
				}else if(nty < 0 && -nty > maxY){
					nty = -maxY;
				}else{
					let arr = (nty/_self.height).toFixed(2).split('.');
					if(arr[1] >= 50){
						let mut = arr[0];
						let isNegative = mut.substr(0,1);
						mut = Math.abs(mut);
						let ty = _self.height*(mut+1);
						nty = isNegative === '-' ? -ty : ty;
					}else{
						nty = _self.height*parseInt(arr[0]);
					}
				}
				transformEle.style.transition = `transform .4s`;
				transformEle.style.transform = `translate(0, ${nty}px)`;
				callback&&callback();
				return;
			}
			if(nty > 0 && nty > (minY + _self.height*2)){
				transformEle.style.transition = `transform .4s`;
				transformEle.style.transform = `translate(0, ${minY}px)`;
				callback&&callback();
				return;
			}else if(nty < 0 && -nty > (maxY+_self.height*2)){
				transformEle.style.transition = `transform .4s`;
				transformEle.style.transform = `translate(0, ${-maxY}px)`;
				callback&&callback();
				return;
			}
			transformEle.style.transform = `translate(0, ${nty}px)`;
			setTimeout(()=>{
				inertiaMove();
			},10);
		}
		inertiaMove();
	}

	Dater.fn.GetTranslateY = function(ele){
		let matrix = ele.ownerDocument.defaultView.getComputedStyle(ele).transform;
//		获取到的transform的matrix
        return matrix === 'none' ? 0 : parseInt(/(?:\()(.*)(?:\))/.exec(matrix)[1].split(',').reverse()[0])
	}

	Dater.fn.GetSlideDirection = function(startY, nowY){
        return nowY - startY > 0 ? 3 : (nowY - startY < 0 ? 2 : 1);
	}

	function trim(str){
		return str == null ? '' : (' '+str).replace(/\s+/g, '');
	}


	let initial = Object.create(null);

	initial.init = function(){
		this.cssStyle();
		this.bridge = [];
		this.closeScene();
	};

	initial.closeScene = function(){
		//点击其他区域，移除选择器
		document.addEventListener('click', (e)=>{
			let target = e.target;
			let instance;
			if(this.bridge.length === 0)return;
			this.bridge.some(v=>{
				if(v.dom === target){
					instance = v;
					return true;
				}else{
					return false;
				}
			});
			if(!instance)closeSelector();
		});
	}

	initial.cssStyle = function(){
		let styles = `* {margin:0; padding:0}
					p {-webkit-margin-before:0;-webkit-margin-after:0}
					li {list-style-type:none}
					#dater {position:fixed;bottom:0;left:0;right:0;z-index:1000;background:#fff;box-shadow:0 7px 12px rgba(9,9,9,.5)}
					#dater-btn {display:flex;justify-content:space-between;border-bottom:solid 1px #f5f5f5}
					#dater-btn a {display:block;width:100px;line-height:40px;font-size:16px;text-align:center}
					.dater-title, #dater-main {display:flex;justify-content:space-around;width:300px;margin:0 auto}
					#dater-main > div {position:relative;height:160px;overflow:hidden}
					#dater-main > div::before, #dater-main > div::after {content:'';position:absolute;left:0;z-index:2;width:100%;height:64px}
					#dater-main > div::before {top:0;background:linear-gradient(#fff,hsla(0,0%,100%,.85) 45%,hsla(0,0%,100%,.6) 75%,rgba(255,255,255,.5));background:-webkit-gradient(linear,left top,left bottom,from(#fff),color-stop(.45,hsla(0,0%,100%,.85)),color-stop(.75,hsla(0,0%,100%,.6)),to(hsla(0,0%,100%,.5)))}
					#dater-main > div::after {bottom:0;background:linear-gradient(hsla(0,0%,100%,.5),hsla(0,0%,100%,.6) 25%,hsla(0,0%,100%,.85) 65%,#fff);background:-webkit-gradient(linear,left top,left bottom,from(hsla(0,0%,100%,.5)),color-stop(.25,hsla(0,0%,100%,.6)),color-stop(.65,hsla(0,0%,100%,.85)),to(#fff))}
					#dater-main .dater-item {width:100px;text-align:center;transition:transform 0.4s;transform:translate(0, 64px)}
					#dater-main .dater-item li {line-height:32px;font-size:18px}`
		let styleEle = document.createElement('style');
		styleEle.innerHTML = styles;
		document.head.appendChild(styleEle);
	}

	initial.init();

	return Dater;
});
