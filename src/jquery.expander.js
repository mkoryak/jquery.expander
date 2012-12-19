/**
 * Author: Misha Koryak
 * Date: 12/18/2012
 * Licence: MIT
 * 
 */

$.fn.expander = function(map){
    var opts = $.extend({}, {
        getExpandContainer: function($expander){ //return the thing that will expand and collapse
            return $expander.next();
        },
        canExpand: function($expander, expandedState){ //lets you enable/disable toggle behavior
            return true;
        },
        initialExpand: function($expander, expandedState){
            return expandedState;
        },
        onExpand: function($expander, $expandContainer){ //called after the expander expands    
        }, 
        rememberState: false, //remember via a cookie if this expander was open or closed and show again in same state. 
        cookieName: null, //cookie name used to remember state. if not defined, the expand container's class is used.
        animate: true,
        arrowBlack: true, //set to false to make white
        accordionGroup: null //define this to be the same name for multile expanders, and they will act like an accordion (ie, only one a time can be expanded)
    }, map || {});
    var trigger = function(id){
        if(opts.accordionGroup != null){
            $(document).trigger('expander-accordion-'+ opts.accordionGroup, [id]);
        }
    };
    
    var cookie = function(name, value){
        var prefix = 'jq-expander-state-';
        if(name.length == 0){ //the class of the item didnt hash to anything useful. cant use cookie functionality
            return null;
        }
        name = prefix+name;
        if(arguments.length == 2){
            document.cookie = name + '=' + escape(value) + '; path=/';
        } else {
            var cookies = document.cookie.split(';');
            var i;
            name += '=';
            for (i = 0; i < cookies.length; i++) {
                var m = /^(\s*)\S/.exec(cookies[i]); //this is a really weird way to do this
                if (cookies[i].indexOf(name) == m[1].length) {
                    return unescape(cookies[i].substring(m[1].length + name.length));
                }
            }
            return null;
        }
    };
    
    $(this).each(function(){
        var $this = $(this);
        if($this.data('expander-bound')){
            return;
        }
        
        $this.data('expander-bound', true);
        var $expand = opts.getExpandContainer($this);
        if(!$expand){
            throw "jquery.expand: You must return a jquery obj from getExpandContainer()"
        }
        var cookieKey = opts.cookieName || ($expand.attr('class') || '').replace(/\s+/g, '.');
        var myId = $.expander.id;
        var expanded;
        var isCheckbox = false;
        if($this.is(':checkbox')){
            expanded = $this.is(":checked");
            isCheckbox = true;
        } else {
            expanded = $expand.is(":visible");
        }
        if(opts.rememberState){
            var state = cookie(cookieKey);
            if(state != null && (state == 'show' || state == 'hide')){
                expanded = state == 'show';
                if(isCheckbox){
                    $this.attr('checked', expanded);
                }
            }
        }
        
        expanded = opts.initialExpand($this, expanded);
        $expand[expanded ? 'show': 'hide']();
        
        var onExpandFn = function(){
            if(expanded){
                opts.onExpand($this, $expand);
            }
        };
        var toggle = function(){
            if ($this.hasClass('collapsed')) {
                $this.removeClass('collapsed').addClass('expanded');
                expanded = true;
                trigger(myId);
            } else if ($this.hasClass('expanded')) {
                $this.removeClass('expanded').addClass('collapsed');
                expanded = false;
            }
            if(opts.rememberState){
                cookie(cookieKey, expanded ? 'show': 'hide');
            }
            if(opts.animate){
                $expand.slideToggle(onExpandFn);
            } else {
                $expand[$expand.is(':visible') ? 'hide' : 'show']();
                onExpandFn();
            }
        };
    
        var maybeToggle = function(){
            if(opts.canExpand($this, expanded)){
                toggle();
            }
        };
        $this.data('expander', {
            toggle: toggle
        });
        
        $this.addClass('expander');
        if(!opts.arrowBlack){
            $this.addClass('white');
        }
        $this.data('expander-id-'+myId);
        $.expander.id ++;
        
        $this.addClass(expanded ? 'expanded' : 'collapsed');
        $this.click(maybeToggle);
        if(opts.accordionGroup != null){
            $(document).bind('expander-accordion-'+ opts.accordionGroup, function(e, id){
                if(expanded && myId != id){
                    maybeToggle();
                }
            });
        }
    });
    return this;
};
$.expander = {id: 0}; //no touch



