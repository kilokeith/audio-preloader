var audio_base_path = 'audio/mixdown/'
  , audio_tracks = [
	  'city_bells.mp3'
	, 'city_travis_beatbox.mp3'
	, 'city_eric_keybd_bridge_lo.mp3'
];



//my audio preload class
var Audio_Preloader = function(tracks, config){
	
	var defaults = {
		  audio_base_path: 'audio/'
		, debug: false
		, sync: false  //wether to load track synchronously(one at a time), or let the browser do it in parallel
		, oninit: function(){}
		, ontrackloaded: function(){}
		, oncomplete: function(){}
	};
	
	this.clips_loaded = 0;
	this.tracks = tracks;
	this.pointer = 0;
	this.config = jQuery.extend(defaults, config);
	
	//keep a scoped var to this
	var scoped = this;
	
	//loads an audio track
	this.load_audio = function(index){
		if( scoped.tracks[ index ] ){
			var audio = new Audio();
			//on load evnet
			audio.addEventListener('canplaythrough', function(){
				scoped.log('loaded audio', audio_base_path + scoped.tracks[ index ]);
				//run the track loaded callback
				scoped.config.ontrackloaded(audio);
				//
				scoped.clip_loaded();
			}, false);
			
			//on error event
			audio.addEventListener('error', function(e){
				scoped.log('error', e);
			}, false);

			
			audio.autoplay = false;
			audio.preload = false;
			//loading the src starts the load
			audio.src = audio_base_path + scoped.tracks[ index ];
			scoped.log('loading audio', audio_base_path + scoped.tracks[ index ]);
		}else{
			scoped.log( 'track not indexed' );
		}
	};
	
	//callback when a track is loaded, also checks to see if we loaded all the tracks
	this.clip_loaded = function(){
		scoped.clips_loaded += 1;
		scoped.log(scoped.clips_loaded, scoped.tracks.length);
		if( scoped.clips_loaded === scoped.tracks.length ){
			//run the init callback
			scoped.config.oncomplete();
		}else if( scoped.config.sync ){
			//if loading them synchronously
			scoped.pointer += 1;
			setTimeout(function(){ scoped.load_audio( scoped.pointer ); }, 100);
		}
	};
	
	this.log = function(){
		if(scoped.config.debug && console && console.log ) console.log( arguments );
	};
	
	//sets up the init states and how to load tracks
	this.init = function(){
		scoped.clips_loaded = 0;
		
		//run the init callback
		scoped.config.oninit();
		
		if( scoped.config.sync ){
			//load them one at a time
			scoped.load_audio( scoped.pointer );
		}else{
			//try to laod them all at once
			for( var x=0, l=audio_tracks.length; x<l; x++ ){
				scoped.load_audio( x );
			}
		}
		
	};
	
	//run the init
	scoped.init();
}




jQuery(document).ready(function($){
	var $loading = $('#loading');
	
	var preloader = new Audio_Preloader(audio_tracks, {
		  audio_base_path: audio_base_path
		, sync: true
		, debug: true
		, oninit: function(){
			console.log('oninit');
			spinner = $loading.spin(spinner_confg);
		}
		, ontrackloaded: function(audio){
			console.log(audio);
		}
		, oncomplete: function(){
			console.log('oncomplete');
			spinner.stop();
		}
	});
	
});