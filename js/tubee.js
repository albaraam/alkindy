// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "tubee",
			defaults = {
				videoId: 'M7lc1UVf-VE',
				bgColor: "#fff",
				ratio: 16/9,
				display: "fit", // fit or cover
		        mute: true,
		        repeat: true,
		        overlay: "none", // none or any color;
		        playButtonClass: 'tubee-play',
		        pauseBtnClass: 'tubee-pause',
		        muteBtnClass: 'tubee-mute',
		        startAt: 0
			};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		Plugin.prototype = {
				init: function () {
						// Place initialization logic here
						// You already have access to the DOM element and
						// the options via the instance, e.g. this.element
						// and this.settings
						// you can add more functions like the one below and
						// call them like so: this.yourOtherFunction(this.element, this.settings).
						var $node = $(this.element),
							$settings = this.settings,
							$tubeeHolder = jQuery('<div/>', {id: 'tubee_holder'}),
							$tubeeWrapper = jQuery('<div/>', {id: 'tubee_wrapper'}),
							$tubeeOverlay = jQuery('<div/>', {id: 'tubee_overlay'});

						if ($settings.display == "fit") {
							$settings.width = $node.width();
							$settings.height = $node.height();;
							$settings.top = 0;
						}else if($settings.display == "cover"){
							$settings.width = $node.width();
							$settings.height = Math.ceil($node.width() / $settings.ratio);
							$settings.top = "-"+($settings.height - $node.height())/2+"px";
						}

						$node.css({
							"background":$settings.bgColor,
							"position": "relative",
							"overflow": "hidden"
						});

						// Get all direct children in wrapper
						$node.children("> *").css({	
							"position": "relative",
							"z-index" : "1000"
						});

						$tubeeWrapper.css({
							"position"	: "absolute",
							"top"		: "0",
							"left"		: "0",
							"width"		: "100%",
							"height"	: "100%",
							"overflow"	: "hidden"
						});

						$tubeeHolder.css({
							"position" 	: "absolute",
							"top"		: $settings.top,
							"left"		: 0,
							"z-index"	: 0
						});

						if ($settings.overlay != "none") {
							$tubeeOverlay.css({
								"position"	: "absolute",
								"width"		: "100%",
								"height"	: "100%",
								"top"		: "0",
								"left"		: "0",
								"background": $settings.overlay,
								"opacity"	: ".8",
								"z-index"	: "1"
							});
							$tubeeWrapper.append($tubeeOverlay);
						}

						$tubeeWrapper.append($tubeeHolder);
						$node.append($tubeeWrapper);

						this.initYouTubeIframeAPI($node, $settings);
				},
				// Load the YouTube IFRAME API Script Asynchronously.
				initYouTubeIframeAPI: function ($node, $settings) {
					// Creates an <iframe> (and YouTube player) after the API code downloads.
					window.onYouTubeIframeAPIReady = function () {
						this.player = new YT.Player("tubee_holder", {
							width: $node.width(),//'640',
							height: $settings.height,//$node.height(),//'390',
							videoId: $settings.videoId,
							playerVars: {
				                controls: 0,
				                showinfo: 0,
				                modestbranding: 1,
				                wmode: 'transparent'
              				},
							events: {
								'onReady': Plugin.onPlayerReady,
								'onStateChange': Plugin.onPlayerStateChange
							}
		        		});
					};

					// The video player is ready
					Plugin.onPlayerReady = function(e) {
				        //this.resize();
				        //console.log("onPlayerReady");
				        if ($settings.mute) e.target.mute();
				        e.target.seekTo($settings.startAt);
				        e.target.playVideo();
					};
					// The video player's state changes
					Plugin.onPlayerStateChange = function(state) {
					    //console.log("onPlayerStateChange");
				        if (state.data === 0 && $settings.repeat) { // video ended and repeat option is set true
				            this.player.seekTo($settings.start); // restart
				        }
				    };

				    // Create Script Element
					var youtubeTAG = document.createElement('script');
						youtubeTAG.type = "text/javascript";
						youtubeTAG.src = "//www.youtube.com/iframe_api";

					// Append YouTube IFRAME API Script Before Any Script TAG
					var firstScriptTag = document.getElementsByTagName('script')[0];
						firstScriptTag.parentNode.insertBefore(youtubeTAG, firstScriptTag);

				}
		};

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
			this.each(function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
				}
			});
			// chain jQuery functions
			return this;
		};

})( jQuery, window, document );