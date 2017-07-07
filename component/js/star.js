/**
  **author chenjuanhe
  **options
    **parentId：生成星星的父容器dom元素；
  	**size:星星的尺寸（48,36,24三个值），默认36；可在移动端用
  	**len:总的星星的个数；
  	**score:要点亮的星星的个数；
  	**isEdit:星星可不可编辑（如果只是展示设为false,打分设为true），默认false
  	**isContainHalf：星星是否支持半颗显示（例如1.5,2.5,3.5），默认false
  	**onSelect：如果可编辑，返回星星个数，可以保存起来发请求给后端

  	example:

  		html:<div id="starWapper"></div>
  		css:引入star-rating.css
  		script:
  			var star = new StarRating({
				parentId:document.getElementById('starWapper'),
				size:48,
				score:4.5,
				len:5,
				isEdit:true,
				isContainHalf:true,
				onSelect:function(val){
					console.log(val);
				}
			});
*/
;(function(w){

	var StarRating = function(options){
		this.parentId = options.parentId;
		this.size = options.size || 36;
		this.len = options.len || 5;
		this.score = options.score;
		this.isEdit = options.isEdit || false;
		this.isContainHalf = options.isContainHalf || false;
		this.onSelect = options.onSelect || null;
		this.lightLen = 0;

		if(this.parentId){
			_addClass(this.parentId,'star ' + 'star-' + this.size);
			this.parentId.className = 'star ' + 'star-' + this.size;
			this.init();
		}
	}

	var _getScore = function(){
		var result = [];
		if(this.isEdit){
			for(var i = 0; i < this.len; i++){
				result.push('off');
			}
		}
		else{
			var _score = (this.score * 2) / 2;
			var _intiger = Math.floor(this.score);
			var _hasDecimal = _score % 1 !== 0;
			var result = [];

			for(var i = 0; i < _intiger; i++){
				result.push('on');
			}
			if(_hasDecimal){
				result.push('half')
			}
			while(result.length < this.len){
				result.push('off');
			}	
			
		}
		return result;
	}

	function _addClass(ele,cls){
		if(_hasClass(ele,cls)) return;
		if(ele){
			var oriCls = ele.className.replace(/^\s+|\s+$/g,'');
			ele.className = oriCls ? (oriCls + ' ' + cls) : cls;
		}
	}

	function _removeClass(ele,cls){
		if(_hasClass(ele,cls)){
			var reg = new RegExp(cls,'gi');
			ele.className = ele.className.replace(reg,'');
		}
	}

	function _hasClass(ele,cls){
		if(ele){
			var reg = new RegExp(cls,'gi');
			return reg.test(ele.className);
		}
	}

	function addDomEvent(ele,eventType,handler){
		if(ele.addEventListener){
			ele.addEventListener(eventType,handler,false);
		}
		else if(ele.attachEvent){
			ele.attachEvent('on'+eventType,function(){
				handler.call(ele,arguments[0]);
			})
		}
	}

	function removeDomEvent(ele,eventType,handler){
		if(ele.removeEventListener){
			ele.removeEventListener(eventType,handler,false);
		}
		else if(ele.detachEvent){
			ele.detachEvent('on'+eventType,function(){
				handler.call(ele,arguments[0]);
			})
		}
	}

	//light on full star
	function _lightFullStar(index){
		var index = parseInt(index);
		var span = this.span;
		var num = this.len;
		for(var i = 0 ; i < num; i++){
			if(i < index){
				_removeClass(span[i],'off');
				_addClass(span[i],'on');
			}
			else{
				_removeClass(span[i],'on');
				_addClass(span[i],'off');
			}
		}
	}

	function _lightHalfStar(index){
		var span = this.span;
		var OnLen = parseInt(index);
		var _half = Math.floor(index)
		var offIndex = Math.round(index);
		for(var i = 0; i < OnLen;i++){
			_removeClass(span[i],'off');
			_removeClass(span[i],'half');
			_addClass(span[i],'on');
		}
		_addClass(span[_half],'half');
		_removeClass(span[_half],'off');
		_removeClass(span[_half],'on');
		for(var k = offIndex;k < this.len; k++){
			_removeClass(span[k],'on');
			_removeClass(span[k],'half');
			_addClass(span[k],'off');
		}
	}

	//light on containing half star

	var _initRating = function (){
		var spanFragment = document.createDocumentFragment();
		var _score = _getScore.call(this);
		for(var i = 0; i < this.len; i++){
			var span = document.createElement('span');
			span.className = 'star-item ' + _score[i];
			span.setAttribute('data-index','dataIndex-' + i); 
			span.setAttribute('data-action','span.data-action.star' + i);
			if(this.isEdit){
				span.style.cursor = 'pointer';
			}
			else{
				span.style.cursor = 'not-allowed';
			}
			spanFragment.appendChild(span);
		}
		this.parentId.appendChild(spanFragment);
		this.span = this.parentId.getElementsByTagName('span');
	}

	var _event = function(){
		if(this.isEdit){
			var len = this.span.length;
			var self = this;
			
			addDomEvent(this.parentId,'click',function(e){
				var e = window.e || e;
				var target = e.target || e.srcElement;
				if(target.nodeName.toUpperCase() === 'SPAN'){
					var index = parseInt(target.getAttribute('data-index').split('-')[1]);
					if(self.isContainHalf){
						var eLeft = e.pageX;
						var spanLeft = target.offsetLeft;
						var sub = eLeft - spanLeft;
						if(sub >= (target.offsetWidth / 2)){
							self.lightLen = parseInt(index) + 1;
						}
						else{
							self.lightLen = parseInt(index) + 0.5;
						}
					}
					else{
						self.lightLen = parseInt(index) + 1;
					}
					self.onSelect && self.onSelect(self.lightLen);
				}
			})

			addDomEvent(this.parentId,'mouseover',function(e){
				var e = window.e || e;
				var target = e.target || e.srcElement;
				if(target.nodeName.toUpperCase() === 'SPAN'){
					var index = parseInt(target.getAttribute('data-index').split('-')[1]);
					if(self.isContainHalf){
						var eLeft = e.pageX;
						var spanLeft = target.offsetLeft;
						var sub = eLeft - spanLeft;
						if(sub >= (target.offsetWidth / 2)){
							self.lightLen = parseInt(index) + 1;
						}
						else{
							self.lightLen = parseInt(index) + 0.5;
						}
						_lightHalfStar.call(self,self.lightLen);
					}
					else{
						_lightFullStar.call(self,parseInt(index) + 1);
					}			
				}	
			})

			addDomEvent(this.parentId,'mouseout',function(e){
				if(self.isContainHalf){
					_lightHalfStar.call(self,self.lightLen);
				}
				else{
					_lightFullStar.call(self,self.lightLen);
				}			
			})
		}
	}


	StarRating.prototype.init = function(){
		_initRating.call(this);
		_event.call(this);
	}

	StarRating.prototype.getStarLength = function(){
		if(this.isEdit){
			return this.lightLen;
		}
	}

	window.StarRating = StarRating;

})(window);