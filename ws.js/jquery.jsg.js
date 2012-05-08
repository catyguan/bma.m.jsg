(function($) {
    $.log = function(msg) {
        if(window.console) {
            window.console.log(msg);
        }
    }
})(jQuery);

// dataset
(function($) {
    $.fn.dataset = function(name, value) {
        if (value !== undefined) {    	    
            return this.attr('data-'+name, value);
        }
        return this.attr('data-'+name);		
	};
	$.fn.removeDataset = function(name) {
        return this.removeAttr('data-'+name);
    };
    $.fn.datasetObject = function(prop) {
		var v = this.attr('data-'+prop);
		if(!v) {
		    return null;
		}
		var r = {};
		var slist = v.split(';');
		for(var i=0;i<slist.length;i++) {
		    var nv = slist[i].trim();
		    var np = nv.split(':',2);
		    if(np.length==1) {
		        r[nv] = true;
		    } else {
		        r[np[0]] = np[1].trim();
		    }
	    }	
	    return r;
	};
})(jQuery);

// timers
(function($) {
    $.fn.extend({
	    everyTime: function(interval, label, fn, times, belay) {
		    return this.each(function() {
			    $.timer.add(this, interval, label, fn, times, belay);
		    });
	    },
	    oneTime: function(interval, label, fn) {
		    return this.each(function() {
			    $.timer.add(this, interval, label, fn, 1);
		    });
	    },
	    stopTime: function(label, fn) {
		    return this.each(function() {
			    $.timer.remove(this, label, fn);
		    });
	    }
    });

    $.extend({
	    timer: {
    		guid: 1,
    		global: {},
    		timeParse: function(value) {
    			if (value == undefined || value == null)
    				return null;
   				return value;
    		},
    		add: function(element, interval, label, fn, times, belay) {
    			var counter = 0;
    			
    			if ($.isFunction(label)) {
    				if (!times) 
    					times = fn;
    				fn = label;
    				label = interval;
    			}
    			
    			interval = $.timer.timeParse(interval);
    
    			if (typeof interval != 'number' || isNaN(interval) || interval <= 0)
    				return;
    
    			if (times && times.constructor != Number) {
    				belay = !!times;
    				times = 0;
    			}
    			
    			times = times || 0;
    			belay = belay || false;
    			
    			if (!element.$timers) {
    				element.$timers = {};    				
    			}
    			
    			if (!element.$timers[label])
    				element.$timers[label] = {};
    			
    			fn.$timerID = fn.$timerID || this.guid++;
    			
    			var handler = function() {
    				if (belay && this.inProgress) 
    					return;
    				this.inProgress = true;
    				if ((++counter > times && times !== 0) || fn.call(element, counter) === false)
    					$.timer.remove(element, label, fn);
    				this.inProgress = false;
    			};
    			
    			handler.$timerID = fn.$timerID;
    			
    			if (!element.$timers[label][fn.$timerID]) 
    				element.$timers[label][fn.$timerID] = window.setInterval(handler,interval);
    			
    			if ( !this.global[label] )
    				this.global[label] = [];
    			this.global[label].push( element );
            },
    		remove: function(element, label, fn) {
    			var timers = element.$timers, ret=null;
    			
    			if ( timers ) {
    				
    				if (!label) {
    					for ( label in timers )
    						this.remove(element, label, fn);
    				} else if ( timers[label] ) {
    					if ( fn ) {
    						if ( fn.$timerID ) {
    							window.clearInterval(timers[label][fn.$timerID]);
    							delete timers[label][fn.$timerID];
    						}
    					} else {
    						for ( var fn in timers[label] ) {
    							window.clearInterval(timers[label][fn]);
    							delete timers[label][fn];
    						}
    					}
    					
    					for ( ret in timers[label] ) break;
    					if ( !ret ) {
    						ret = null;
    						delete timers[label];
    					}
    				}
    				
    				for ( ret in timers ) break;
    				if ( !ret ) 
    					element.$timers = null;
    			}
    		}
	    }
    });

    if ($.browser.msie)
	    $(window).one("unload", function() {
		    var global = $.timer.global;
		    for ( var label in global ) {
			    var els = global[label], i = els.length;
			    while ( --i )
				    $.timer.remove(els[i], label);
		    }
	    });
})(jQuery);

// bglive
(function( $, undefined ) {

    $.fn.livebg = function(opt) {	
		var el = this;
		if(!$.isPlainObject(opt)) {
		    el.stopTime('livebg');
		    return;
		}
		
		var o = opt;
		el.css('width',o['width']+'px');
		el.css('height',o['height']+'px');
		el.css('background-image','url('+o['img']+')');		
		
		var speed = o['speed']?o['speed']:100;
		var step = o['step']?o['step']:1;
		el.everyTime(100,'livebg',function() {
    		var mw = parseInt(o['bgwidth'])-parseInt(o['width']);
    		var pos = el.dataset('livebg_pos');
    		pos=pos?parseInt(pos):0;
    		var dir = el.dataset('livebg_dir');    		
    		dir=dir?dir:'0';
    		if(dir=='0') {
    			pos-=step;
    			if(pos<=-mw) {
    				el.dataset('livebg_dir','1');
    				pos=-mw;
    			}
    		} else {
    			pos+=step;
    			if(pos>=0) {
    			    el.dataset('livebg_dir','0');
    				pos=0;
    			}
    		}
    		el.css('background-position',pos+'px 0px');
    		el.dataset('livebg_pos',pos);
	    });
	};

})( jQuery );
