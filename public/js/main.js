/*
Theme Name: Asa
Description: Coming Soon
Author: Bluminethemes
Theme URI: http://bluminethemes.com/preview/themeforest/html/asa/
Author URI: http://themeforest.net/user/Bluminethemes
Version: 1.2.2
*/

(function($) {
	"use strict";

	/* ------------------------------------------------------------------------ */
	/*	BOOTSTRAP FIX FOR WINPHONE 8 AND IE10
	/* ------------------------------------------------------------------------ */
	if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
		var msViewportStyle = document.createElement("style")
		msViewportStyle.appendChild(
			document.createTextNode(
				"@-ms-viewport{width:auto!important}"
			)
		)
		document.getElementsByTagName("head")[0].appendChild(msViewportStyle)
	}

	function detectIE() {
		if ($.browser.msie && $.browser.version == 9) {
			return true;
		}
		if ($.browser.msie && $.browser.version == 8) {
			return true;
		}
		return false;
	}

	function getWindowWidth() {
		return Math.max( $(window).width(), window.innerWidth);
	}

	function getWindowHeight() {
		return Math.max( $(window).height(), window.innerHeight);
	}
	
	function getInternetExplorerVersion() {
		var rv = -1;
		if (navigator.appName == 'Microsoft Internet Explorer')
		{
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null)
			rv = parseFloat( RegExp.$1 );
		}
		else if (navigator.appName == 'Netscape')
		{
			var ua = navigator.userAgent;
			var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null)
			rv = parseFloat( RegExp.$1 );
		}
		return rv;
	}


	// BEGIN WINDOW.LOAD FUNCTION
	$(window).load(function() {
	
		/* ------------------------------------------------------------------------ */
		/*	MS IE
		/* ------------------------------------------------------------------------ */
		if(	getInternetExplorerVersion() == 11 ) {
			$('body').addClass('ie-11');
		} else if( getInternetExplorerVersion() == 10 ) {
			$('body').addClass('ie-10');
		};

		/* ------------------------------------------------------------------------ */
		/*	PRELOADER
		/* ------------------------------------------------------------------------ */
		var preloaderDelay = 350,
			preloaderFadeOutTime = 800;

		function hidePreloader() {
			var loadingAnimation = $('#loading-animation'),
				preloader = $('#preloader');

			loadingAnimation.fadeOut();
			preloader.delay(preloaderDelay).fadeOut(preloaderFadeOutTime);
		}

		hidePreloader();

	});

	//BEGIN DOCUMENT.READY FUNCTION
	jQuery(document).ready(function($) {

		$.browser.chrome = $.browser.webkit && !!window.chrome;
		$.browser.safari = $.browser.webkit && !window.chrome;
		var isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());

		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			$('body').addClass('mobile');
		}
		
		if ($.browser.chrome) {
			$('body').addClass('chrome');
		}
		
		if ($.browser.safari) {
			$('body').addClass('safari');
		}
		
		if (isWindowsPhone) {
			$('body').addClass('windowsphone');
		}

		
		/* ------------------------------------------------------------------------ */
		/*	NICE SCROLL
		/* ------------------------------------------------------------------------ */	
		$("html").niceScroll({
			cursorcolor: '#fff',
			cursoropacitymin: '0',
			cursoropacitymax: '1',
			cursorwidth: '3px',
			zindex: 10000,
			horizrailenabled: false,
			enablekeyboard: false,
		});
		
		
		/* ------------------------------------------------------------------------ */
		/*	ANIMATED ELEMENTS
		/* ------------------------------------------------------------------------ */	
		if( !$('body').hasClass('mobile') ) {
		
			if( detectIE() ) {
				$('.animated').css({
					'display':'block',
					'visibility': 'visible'
				});
			} else {
				/* Starting Animation on Load */
				$(window).load(function() {
					$('.onstart').each( function() {
						var elem = $(this);
						if ( !elem.hasClass('visible') ) {
							var animationDelay = elem.data('animation-delay');
							var animation = elem.data('animation');
							if ( animationDelay ) {
								setTimeout(function(){
									elem.addClass( animation + " visible" );
								}, animationDelay);
							} else {
								elem.addClass( animation + " visible" );
							}
						}
					});
				});
			}
		}
		
		
		/* ------------------------------------------------------------------------ */
		/*	PAGE HEIGHT
		/* ------------------------------------------------------------------------ */	
		function setSectionHeight() {
			var navigationHeight = $(".site-nav").height();
			var section = $('section');
			var windowHeight = getWindowHeight();
				
			if ( section.hasClass('fullscreen') ) {
				$('section.fullscreen').css( 'min-height', windowHeight - 0 );
				$('.section-container').css( 'min-height', windowHeight - 300 );
			}
		}
		
		setSectionHeight();

		$(window).on('resize', function () { 
			setSectionHeight();    
		});

		
		/* ------------------------------------------------------------------------ */
		/*	BACKGROUNDS
		/* ------------------------------------------------------------------------ */	
		function initPageBackground() {
			if( $('body').hasClass('slideshow-background') ) { // SLIDESHOW BACKGROUND
			
				$("body").backstretch([
					"demo/background/image-13.jpg",
					"demo/background/image-5.jpg",
					"demo/background/image-11.jpg",
				], {duration: 3000, fade: 1200});
			
			} else if($('body').hasClass('image-background')) { // IMAGE BACKGROUND
			
				$("body").backstretch([
					"demo/background/image-13.jpg"
				]);
				
			} else if($('body').hasClass('star-background')) { // SPACE BACKGROUND
			
				$("body").backstretch([
					//"https://unsplash.imgix.net/uploads/14116941824817ba1f28e/78c8dff1?q=75&fm=jpg&s=eed337dca5e9e4ca8b8d23513e6b9bf6"
					"demo/background/image-13.jpg"
				]);
				
			} else if($('body').hasClass('parallax-background')) { // PARALLAX BACKGROUND
			
				$.parallaxify({
					positionProperty: 'transform',
					responsive: true,
					motionType: 'natural',
					mouseMotionType: 'performance',
					motionAngleX: 70,
					motionAngleY: 70,
					alphaFilter: 0.5,
					adjustBasePosition: true,
					alphaPosition: 0.025,
				});
				
			} else if($('body').hasClass('youtube-background')) { // YOUTUBE VIDEO BACKGROUND
				if($('body').hasClass('mobile')) {
					
					// Default background on mobile devices
					$("body").backstretch([
						"demo/video/video.jpg"
					]);
					
				} else {
					$(".player").each(function() {
						$(".player").mb_YTPlayer();
					});
				}
			} else if($('body').hasClass('youtube-list-background')) { // YOUTUBE LIST VIDEOS BACKGROUND
				if($('body').hasClass('mobile')) {
					
					// Default background on mobile devices
					$("body").backstretch([
						"demo/video/video.jpg"
					]);
					
				} else {
				
					var videos = [
						{videoURL: "0pXYp72dwl0",containment:'body',autoPlay:true, mute:true, startAt:0,opacity:1, loop:false, ratio:"4/3", addRaster:true},
						{videoURL: "9d8wWcJLnFI",containment:'body',autoPlay:true, mute:true, startAt:0,opacity:1, loop:false, ratio:"4/3", addRaster:false},
						{videoURL: "nam90gorcPs",containment:'body',autoPlay:true, mute:true, startAt:0,opacity:1, loop:false, ratio:"4/3", addRaster:true}
					];
					
					$(".player").YTPlaylist(videos, true);
					
				}
			} else if($('body').hasClass('mobile')) { // MOBILE BACKGROUND - Image background instead of video on mobile devices
				if($('body').hasClass('video-background')) {
					
					// Default background on mobile devices
					$("body").backstretch([
						"demo/video/video.jpg"
					]);
					
				}	
			}
		}
		
		initPageBackground();

		$('.particles').particleground({
			minSpeedX: 0.1,
			maxSpeedX: 0.7,
			minSpeedY: 0.1,
			maxSpeedY: 0.7,
			density: 8000,
			dotColor: '#ffffff',
			lineColor: '#ffffff',
			curvedLines: false,
			particleRadius: 5,
			proximity: 100,
			parallax: false,
			parallaxMultiplier: 5,
		});
		
		
		/* ------------------------------------------------------------------------ */
		/*	IOS
		/* ------------------------------------------------------------------------ */
		function iosdetect() {
			var deviceAgent = navigator.userAgent.toLowerCase();
			var $iOS = deviceAgent.match(/(iphone|ipod|ipad)/);
		 
			if ($iOS) {
				var divs = $('#home');
				var vid = $('#video_background');
				var h = window.innerHeight;
				var divh = $("#home").height();
				divs.css({ "position": "relative", "top": (h-divh)/2, "margin-top": "0" });
				vid.css({ "display": "none"});
				$(window).resize(function() {
					var divs = $('#home');
					var h = window.innerHeight;
					var divh = $("#home").height();
					divs.css({ "position": "relative", "top": (h-divh)/2, "margin-top": "0" });
				});
		 
				// use fancy CSS3 for hardware acceleration
			}
		}
		
		iosdetect();
		
		
		/* ------------------------------------------------------------------------ */
		/*	SLIDER
		/* ------------------------------------------------------------------------ */
		$('.slide-item').first().addClass('active');

		var slide_timeout,
			slide_in_timeout,
			slide_out_timeout;
		
		$('.site-nav a').on( 'click', function() {
			
			clearTimeout(slide_timeout);
			
			var elem = $(this);
			var goToSlide = elem.data('slide');
				
			if( !elem.hasClass('active') ){

				$('.slide-item.active').each( function() {
				
					var elem = $(this);
					var slideID = elem.data('slide-id');

					if( $('.slide-item[data-slide-id='+ slideID +']') ) {
						
						$('.slide-item.active .animated').each( function() {
							var elem = $(this);
							var animation = elem.data('animation');
							var outAnimation = elem.data('animation-out');

							if( !$('body').hasClass('mobile') ) {
								if( detectIE() ) {
									$('.animated').css({
										'display':'block',
										'visibility': 'visible'
									});
								} else {
								
									clearTimeout(slide_out_timeout);
									
									elem.removeClass( animation );
									elem.addClass( outAnimation );

									var elem = $(this);
									var outAnimation = elem.data('animation-out');
									var animationOutDelay = elem.data('animation-out-delay');

									if ( animationOutDelay ) {
										slide_out_timeout = setTimeout(function(){ 
											elem.addClass( outAnimation + " visible" );
										}, animationOutDelay);
									} else {
										elem.addClass( outAnimation + " visible" );
									}
								};
							};
							
						});

					}
				});
				
				$('.site-nav a').removeClass('active');
				elem.addClass('active');

				slide_timeout = setTimeout(function(){
					if ($('.slide-item[data-slide-id='+ goToSlide +']')) {
						$('.slide-item').removeClass('active');
						$('.slide-item[data-slide-id='+ goToSlide +']').addClass('active');
						
						if( !$('body').hasClass('mobile') ) {
							if( detectIE() ) {
								$('.animated').css({
									'display':'block',
									'visibility': 'visible'
								});
							} else {
								if($('.slide-item[data-slide-id='+ goToSlide +']').hasClass('active')) {
									
									clearTimeout(slide_in_timeout);
									
									$('.slide-item .animated').each( function() {
										var elem = $(this);
										var animation = elem.data('animation');
										var outAnimation = elem.data('animation-out');
										elem.removeClass( outAnimation );
										elem.removeClass( animation + " visible" );
									});
									$('.active').find('.animated').each( function() {
										
										var elem = $(this);
										var animation = elem.data('animation');
										var outAnimation = elem.data('animation-out');
										
										if ( !elem.hasClass('visible') ) {
											var animationDelay = elem.data('animation-delay');
											if ( animationDelay ) {
												slide_in_timeout = setTimeout(function(){
													elem.addClass( animation + " visible" );
												}, animationDelay);
											} else {
												elem.addClass( animation + " visible" );
											}
										}
									});
								}
							}
						}
						
					}
				}, 1000);
			}
			
		});
		
		
		/* ------------------------------------------------------------------------ */
		/*	KEYBOARD SUPPORT
		/* ------------------------------------------------------------------------ */
		$(document).keydown(function(e) {
			if(e.keyCode == 37 || e.keyCode == 40) { // left
				
				var currentSlide = $('.site-nav a.active').data('slide');
				var prevSlide = currentSlide -1;
				var allSlides = $('.site-nav a').length;
				
				if(prevSlide == 0) {
					$('.site-nav a[data-slide='+ allSlides +']').trigger( "click" );
				} else {
					$('.site-nav a[data-slide='+ prevSlide +']').trigger( "click" );
				}
				
			}
			else if(e.keyCode == 39 || e.keyCode == 38) { // right
				
				var currentSlide = $('.site-nav a.active').data('slide');
				var nextSlide = currentSlide +1;
				var allSlides = $('.site-nav a').length;
				var maxSlides = allSlides +1;

				if(nextSlide == maxSlides) {
					$('.site-nav a[data-slide="1"]').trigger( "click" );
				} else {
					$('.site-nav a[data-slide='+ nextSlide +']').trigger( "click" );
				}
				
			}
		});
		
		
		/* ------------------------------------------------------------------------ */
		/*	GO TO CURRENT SLIDE
		/* ------------------------------------------------------------------------ */
		$('a.go-slide').on( 'click', function() {
		
			var elem = $(this);
			var goToSlide = elem.data('slide');

			$('.site-nav a[data-slide='+ goToSlide +']').trigger( "click" );
			
		});
	  
		
		/* ------------------------------------------------------------------------ */
		/*	RESPONSIVE VIDEO - FITVIDS
		/* ------------------------------------------------------------------------ */
		$(".video-container").fitVids();
		
		
		/* ------------------------------------------------------------------------ */
		/*	FLEXSLIDER
		/* ------------------------------------------------------------------------ */
		$('.flexslider').flexslider({
			animation: "fade",
			animationLoop: true,
			slideshowSpeed: 7000,
			animationSpeed: 600,
			
			controlNav: false,
			directionNav: false,
			
			keyboard: false,
			
			start: function(slider){
				$('body').removeClass('loading');
			}
		});
		
		
		/* ------------------------------------------------------------------------ */
		/*	COUNTDOWN
		/* ------------------------------------------------------------------------ */
		$('#clock').countdown('2016/10/1 12:00:00').on('update.countdown', function(event) {
			var $this = $(this).html(event.strftime(''
				+ '<div class="counter-container"><div class="counter-box first"><div class="number">%-D</div><span>Day%!d</span></div>'
				+ '<div class="counter-box"><div class="number">%H</div><span>Hours</span></div>'
				+ '<div class="counter-box"><div class="number">%M</div><span>Minutes</span></div>'
				+ '<div class="counter-box last"><div class="number">%S</div><span>Seconds</span></div></div>'
			));
		});
		
		
		/* ------------------------------------------------------------------------ */
		/*	MAILCHIMP
		/* ------------------------------------------------------------------------ */
		$('.mailchimp').ajaxChimp({
			callback: mailchimpCallback,
			url: "//bluminethemes.us9.list-manage.com/subscribe/post?u=dae5eaf00c5b131b0e3561c00&amp;id=9809da9e33" //Replace this with your own mailchimp post URL. Don't remove the "". Just paste the url inside "".  
		});

		function mailchimpCallback(resp) {
			 if (resp.result === 'success') {
				$('.success-message').html(resp.msg).fadeIn(1000);
				$('.error-message').fadeOut(500);
				
			} else if(resp.result === 'error') {
				$('.error-message').html(resp.msg).fadeIn(1000);
			}  
		}
					
		$('#email').focus(function(){
			$('.error-message').fadeOut();
			$('.success-message').fadeOut();
		});
		
		$('#email').keydown(function(){
			$('.error-message').fadeOut();
			$('.success-message').fadeOut();
		});

		$("#email").on( 'click', function() {
			$("#email").val('');
		});
		
		
		/* ------------------------------------------------------------------------ */
		/*	PLACEHOLDER
		/* ------------------------------------------------------------------------ */
		$('input, textarea').placeholder();
		
		
		/* ------------------------------------------------------------------------ */
		/*	CONTACT FORM
		/* ------------------------------------------------------------------------ */
		function initContactForm() {

			var scrollElement = $('html,body'),
				contactForm = $('.contact-form'),
				form_msg_timeout;

			contactForm.on( 'submit', function(e) {


				e.preventDefault();
				var requiredFields = $(this).find('.required'),
					formData = contactForm.serialize(),
					formAction = $(this).attr('action'),
					formSubmitMessage = $('.response-message'),
					Message = $(".containerBocadillo");
					var data = JSON.stringify(formData);
					console.log(data);

				requiredFields.each(function() {

					if( $(this).val() == "" ) {

						$(this).addClass('input-error');

					} else {

						$(this).removeClass('input-error');
					}

				});

				function validateEmail(email) { 
					var exp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return exp.test(email);
				}

				var emailField = $('.contact-form-email');

				if( !validateEmail(emailField.val()) ) {

					emailField.addClass("input-error");

				}

				if ($(".contact-form :input").hasClass("input-error")) {
					return false;
				} else {
				
					clearTimeout(form_msg_timeout);

					 $.ajax({
			                url: '/CrearContacto', // url where to submit the request
			                type : "POST", // type of action POST || GET
			                dataType : 'json', // data type
			                data : formData, // post data || get data
			                success : function(result) {
			                    // you can see the result from the console
			                    // tab of the developer tools
			                    console.log(result);
			                    if(result.status){
			                    	$("#Contenedor").fadeIn( "1000");
			                    	Message.text("A la brevedad nos pondremos en contacto contigo");
			                    }
			                    

								requiredFields.val("");
								
									form_msg_timeout = setTimeout(function() {
										Message.slideUp();
										$("#Contenedor").fadeOut("1000");
									}, 5000);
					 			
			                },
			                error: function(xhr, resp, text) {
			                    console.log(xhr, resp, text);
			                }
			         });

					/*
					$.post(formAction, formData, function(data) {
						formSubmitMessage.text(data);

						requiredFields.val("");

						form_msg_timeout = setTimeout(function() {
							formSubmitMessage.slideUp();
						}, 5000);
					});
					*/
				}

				return false;

			});

		}
		initContactForm();
	
		// Checking for CSS 3D transformation support
  $.support.css3d = supportsCSS3D();
  
  var formContainer = $('#formContainer');
  var boxo = $("#BoxoContainer");
  var inprix = $("#inprixContainer");
  
  // Listening for clicks on the ribbon links
  $('.flipLink').click(function(e){
  	
  	if(this.id === "flipToRecover" || this.id === "flipToLogin"){
  		// Flipping the forms
    	formContainer.toggleClass('flipped');
  	}else if(this.id === "flipToInprix" || this.id === "flipToRecoverInprix"){
  		inprix.toggleClass('flipped');
  	}else if(this.id === "flipToBoxo" || this.id === "flipToRecoverBoxo"){
  		boxo.toggleClass('flipped');
  	} 
    
    
    // If there is no CSS3 3D support, simply
    // hide the login form (exposing the recover one)
    if(!$.support.css3d){
      $('#Cocheros').toggle();
    }
    e.preventDefault();
  });
  /*
  formContainer.find('form').submit(function(e){
    // Preventing form submissions. If you implement
    // a backend, you might want to remove this code
    e.preventDefault();
  });
  */
  
  // A helper function that checks for the 
  // support of the 3D CSS3 transformations.
  function supportsCSS3D() {
    var props = [
      'perspectiveProperty', 'WebkitPerspective', 'MozPerspective'
    ], testDom = document.createElement('a');
      
    for(var i=0; i<props.length; i++){
      if(props[i] in testDom.style){
        return true;
      }
    }
    
    return false;
  }

$("#SaberMasCocheros").click(function(e){
	window.open("http://red-cocheros.tk/");
})




	});
	//END DOCUMENT.READY FUNCTION




})(jQuery);