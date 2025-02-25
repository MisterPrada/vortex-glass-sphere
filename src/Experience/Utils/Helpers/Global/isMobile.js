export const isMobile = {
	Android: function() {
	  return navigator.userAgent.match( /Android/i );
	},
	BlackBerry: function() {
	  return navigator.userAgent.match( /BlackBerry/i );
	},
	iOS: function() {
	  return navigator.userAgent.match( /iPhone|iPad|iPod/i ) || ( navigator.userAgent.includes( "Mac" ) && "ontouchend" in document );
	},
	Opera: function() {
	  return navigator.userAgent.match( /Opera Mini/i );
	},
	Windows: function() {
	  return navigator.userAgent.match( /IEMobile/i ) || navigator.userAgent.match( /WPDesktop/i );
	},
	any: function() {
	  return ( isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows() );
	}
};
  