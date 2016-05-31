function MyCanvas(id,grid) {
  this.canvas         = document.getElementById(       id);
  this.canvaswidth    = this.canvas.getAttribute( 'width');
  this.canvasheight   = this.canvas.getAttribute('height');
  this.width          = this.canvaswidth;
  this.height         = this.canvasheight;
  this.colors         = new Colors();

  if (this.width  % 2 == 0) this.width  -= 1;
  if (this.height % 2 == 0) this.height -= 1;

  this.cx       = this.width  / 2.0;
  this.cy       = this.height / 2.0;
  if (this.canvas.getContext) {
    this.context  = this.canvas.getContext(      '2d');
  } else {
    return null;
  }

  this.worlds = function(worlds) {
    var textStart = 5
    var textLeft  = 5;
    this.context.font = "10px Serif";
    worlds.forEach(function(world) {
      this.context.fillText(world)
      textStart = textStart + 12;
    }, this);
  }
  this.worldGradient = function(world,gradient) {
    var whiteStop = 0.2;
    var colorStop = 0.8;
    switch (world) {
      case "RedHome":
	color = this.colors.transred();
	break;
      case "GreenHome":
	color = this.colors.transgreen();
	break;
      case "BlueHome":
	color = this.colors.transblue();
	break;
      case "Center":
      default:
	color = this.colors.eb();
	whiteStop = 0.35;
	colorStop = 0.6;
    }

    gradient.addColorStop(whiteStop, "white");
    gradient.addColorStop(colorStop, color);
  };

  this.drawBackground = function(world) {
    this.canvas.width = this.canvas.width;
    gradient = this.context.createRadialGradient(this.cx,this.cy,1,this.cx,this.cy,140);

    this.worldGradient(world,gradient);

    this.context.fillStyle = gradient;
    this.context.fillRect(0,0,this.canvaswidth,this.canvasheight);

    if (grid) {
      this.context.strokeStyle = "#000";
      this.context.beginPath();
      this.context.moveTo(0,this.cy);
      this.context.lineTo(this.canvaswidth,this.cy);
      this.context.moveTo(this.cx,0);
      this.context.lineTo(this.cx,this.canvasheight);
      this.context.stroke();
    }
  };
  function Colors() {
    var red     = "#df0101"; var transred   = "rgba( 223,   1,   1, 0.5 )";
    var green   = "#088a08"; var transgreen = "rgba(   8, 138,   8, 0.5 )";
    var blue    = "#2e64fe"; var transblue  = "rgba(  46, 100, 254, 0.5 )";
    var white   = "#fafafa"; var transwhite = "rgba( 250, 250, 250, 0.7 )";
    var black   = "#333333"; var transblack = "rgba(  30,  30,  30, .9 )";
    var eb      = "#cccccc";
    var yellow  = "#eeee05";

    this.red          = function() { return        red; };
    this.green        = function() { return      green; };
    this.blue         = function() { return       blue; };
    this.white        = function() { return      white; };
    this.black        = function() { return      black; };
    this.yellow       = function() { return     yellow; };
    this.eb           = function() { return         eb; };

    this.transred     = function() { return   transred; };
    this.transgreen   = function() { return transgreen; };
    this.transblue    = function() { return  transblue; };
    this.transwhite   = function() { return transwhite; };
    this.transblack   = function() { return transblack; };
  }
}
