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
class Objective {
  constructor(details) {
    this.claimed_at   = details.claimed_at;
    this.guild	      = details.guild;
    this.id	      = details.id;
    this.coord	      = details.coord;
    this.index	      = details.index;
    this.label_coord  = details.label_coord;
    this.last_flipped = details.last_flipped;
    this.map_id	      = details.map_id;
    this.name	      = details.name;
    this.obj_id	      = details.obj_id;
    this.owner	      = details.owner;
    this.sector_id    = details.sector_id;
    this.type	      = details.type;
  }
  ri() {
    var now	  = Date.now();
    var duration  = 300*1000;
    return (this.last_flipped+duration - now);
  }
  update() {
  }
}

function Castle(myc,count,desc) {
  var size          = 27;
  var canvas        = myc;
  var status        = desc;

  var captured_at   = 0;
  this.id           = function() { return status.id }
  var objective	    = new Objective(desc);
  //console.log(objective);

  function draw(stroke,fill) {
    var ctx         = canvas.context;
    var ri          = objective.ri();
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.arc(canvas.cx,canvas.cy,size,0,Math.PI*2,false);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();

    switch (true) {
      case ri > 180:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-24,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 120:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-18,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 60:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-12,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 30:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-7,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 0:
	ctx.lineWidth=2;
	ctx.beginPath();
	ctx.arc(canvas.cx,canvas.cy,size-1,0,Math.PI*2,false);
	ctx.stroke();
	ctx.lineWidth=1;
    }
  }
  function righteous_indignation() {
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }
  this.report = function() { console.log(status.id+": "+status.type+"/"+status.name); }
  this.update = function(st,logger) {
    logger.log({'desc': st, 'prev': status, 'curr': st});
    //this.captured_at = st.last_flipped / 1000;
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
  }
}
function Keep(myc,count,desc) {
  var size          = 55;
  var canvas        = myc;
  var width         = (count==2) ? Math.PI/4.0 : Math.PI/6.0;
  var sites         = count * 1.0;
  var status        = desc;
  var updated	    = 0;

  var captured_at   = 0;

  this.id	    = function() { return status.id; }

  if (status.map_type != "Center") {
    sites = sites - 1;
  }

  function rotation() {
    if (status.map_type == "Center") {
      return -Math.PI/2.0;
    }
    return 0;
  }

  function angle() {
    return (status.index*(2*Math.PI)/sites) + rotation();
  }
  function angle1() {
    return angle() - width/2.0;
  }
  function angle2() {
    return angle() + width/2.0;
  }
  function draw(stroke,fill) {
    var ctx         = canvas.context;
    var ri          = righteous_indignation();
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.moveTo(canvas.cx,canvas.cy);
    ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
    ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
    ctx.lineTo(canvas.cx,canvas.cy);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();
    switch (true) {
      case ri > 180:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      case ri > 120:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      case ri > 60:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      case ri > 30:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      case ri > 0:
	ctx.beginPath();
	ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
	ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
	ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.fill();
	ctx.stroke();
    }
  }
  function righteous_indignation() {
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }
  this.report = function() { console.log(status.id+": "+status.type+"/"+status.name); }
  this.update = function(st,logger) {
    logger.log({'desc': st, 'prev': status, 'curr': st});
    this.captured_at = st.last_flipped / 1000;
    if (st.claimed_by != null && st.claimed_at != null && st.claimed_at > updated) {
      if (st.guild) {
        logger.log({'guild': st.guild, 'message':st.type.toLowerCase() + ' ' + st.name});
      }
    }
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
    updated = Date.now();
  }
}
function Tower(myc,count,desc) {
  var size          = 65;
  var canvas        = myc;
  var width         = Math.PI/10.0;
  var sites         = count * 1.0;
  var status        = desc;
  var updated	    = 0;

  var captured_at   = 0;
  this.id           = desc.id;

  this.id     = function() { return status.id; };

  function rotation() {
    if (status.map_type == "Center") {
      return -Math.PI/6.0;
    }
    return 0;
  }

  function angle() {
    return (status.index*(2*Math.PI)/sites) - Math.PI/4.0 + rotation();
  }
  function angle1() {
    return angle() - width/2.0;
  }
  function angle2() {
    return angle() + width/2.0;
  }
  function draw(stroke,fill) {
    var ctx         = canvas.context;
    var ri          = righteous_indignation();
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.moveTo(canvas.cx,canvas.cy);
    ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
    ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
    ctx.lineTo(canvas.cx,canvas.cy);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();
    switch (true) {
      case ri > 180:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      case ri > 120:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      case ri > 60:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      case ri > 30:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      case ri > 0:
	ctx.beginPath();
	ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
	ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
	ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.fill();
	ctx.stroke();
    }
  }
  function righteous_indignation() {
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }
  this.report = function() { console.log(status.id+": "+status.type+"/"+status.name); }
  this.update = function(st,logger) {
    logger.log({'desc': st, 'prev': status, 'curr': st});
    captured_at = (st.last_flipped / 1000);
    if (st.claimed_by != null && st.claimed_at != null && st.claimed_at > updated) {
      if (st.guild) {
        logger.log({'guild': st.guild, 'message':st.type.toLowerCase() + ' ' + st.name});
      }
    }
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
    updated = Date.now();
  };
}
function Camp(myc,count,desc) {
  var size          = 90;
  var canvas        = myc;
  var width         = Math.PI/18.0;
  var sites	    = count * 1.0;

  var status        = desc;
  var captured_at   = 0;
  var updated	    = 0;

  function report() { console.log(status.id+": "+status.type+"("+count+")/"+status.name+"["+status.index+"] "+angle()); }
  this.report = function() { report(); };
  this.id     = function() { return status.id; };
  function rotation() {
    if (status.type == "Center") {
      return Math.PI/6.0;
    }
    return 0;
  }
  function angle() {
    return (status.index*(2*Math.PI)/count) + rotation()-Math.PI/2.0;
  }
  function angle1() {
    return angle()-(width/2.0);
  }
  function angle2() {
    return  angle()+(width/2.0);
  }
  function draw(stroke,fill) {
    var ctx         = canvas.context;
    var ri          = righteous_indignation();
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.moveTo(canvas.cx,canvas.cy);
    ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
    ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
    ctx.lineTo(canvas.cx,canvas.cy);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();
    switch(true) {
      case ri > 180:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      case ri > 120:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      case ri > 60:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      case ri > 30:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      case ri > 0:
	ctx.beginPath();
	ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
	ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
	ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.fill();
	ctx.stroke();
    }
  }
  function righteous_indignation() {
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }
  this.update = function(st,logger) {
    logger.log({'desc': st, 'prev': status, 'curr': st});
    captured_at = st.last_flipped / 1000;
    if (st.claimed_by != null && st.claimed_at != null && st.claimed_at > updated) {
      if (st.guild) {
        logger.log({'guild': st.guild, 'message':st.type.toLowerCase() + ' ' + st.name});
      }
    }
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
    updated = Date.now();
  }
}
function Ruins(myc,count,desc) {
  var size          = 33;
  var stepsize      = Math.PI*2.0/count;
  var width         = stepsize*.90;
  var spacer        = (stepsize-width)/2.0;
  var angle	    = Math.PI*2/4.0 - ((Math.PI*2.0)/(count*10.0));
  var canvas        = myc;
  var status        = desc;

  this.captured_at  = null;
  this.id	    = function() { return status.id; };
  this.report	    = function() { report(); };

  function report() { console.log(status.id+": "+status.type+"("+count+")/"+status.name+"["+status.index+"] "+angle1()+"#"+angle2()); }

  function angle1() {
    return (stepsize*desc.index) - angle + spacer;
  }
  function angle2() {
    return (stepsize*desc.index+1) - angle - spacer;
  }

  function draw(stroke,fill) {
    var ctx = canvas.context;
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.moveTo(canvas.cx,canvas.cy);
    ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
    ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
    ctx.lineTo(canvas.cx, canvas.cy);
    ctx.fill();
    ctx.stroke();
  }
  this.update = function(st) {
    if (status && (status.owner != st.owner)) {
      this.captured_at = Date.now();
    }
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.black(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.black(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.black(),myc.colors.blue());
    } else {
      draw(myc.colors.black(),myc.colors.white());
    }
  }
}
function WvWGuilds() {
  var url         = 'https://api.guildwars2.com/v2/guild/';
  var xmlhttp     = new XMLHttpRequest();
  var registrar   = {};
  var requests    = [];
  var fetch_delay = 260; // ms

  // Instantiate Guild List, via HTML5 LocalStorage, if available
  load();

  var guild_interval = window.setInterval(function() {
    guild = requests.shift();
    while (guild && registrar.hasOwnProperty(guild.guid)) {
      guild = requests.shift();
    }
    if (guild) {
      fetch(guild.guid,guild.method);
    }
  },fetch_delay);

  function save() {
    localStorage.setItem('guild_registrar',JSON.stringify(registrar));
  }
  function load() {
    if (localStorage.getItem('guild_registrar')) {
      registrar = JSON.parse(localStorage.getItem('guild_registrar'));
    }
  }
  function store(guid,guild) {
    registrar[guid] = guild;
    save();
  }

  function fetch(guid,method) {
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var guild = JSON.parse(xmlhttp.responseText);
        store(guid,guild);
        method(guild);
        // console.log('fetched guild');
        // console.log(guild);
      } else {
        requests.push({'guid': guid, 'method': method });
      }
    }

    xmlhttp.open("GET", url + guid, true);
    xmlhttp.send();
  }
  this.find = function(guid,method) {
    if (registrar.hasOwnProperty(guid)) {
      method(registrar[guid]);
    } else {
      requests.push({'guid': guid, 'method': method });
    }
  };
  this.stop = function() {
    window.clearInterval(guild_interval);
  }
}
class WvWMap {
  constructor(which) {
    this.name	    = which;
    this.objectives = null;
    this.status	    = null;
    this.info	    = null;
    this.graph	    = which.replace("Center","CenterHome");
    this.canvas	    = new MyCanvas(this.graph,false);
    this.logger	    = new WvWLogger(this.graph.replace('Home','Log'),this.canvas.colors);
    this.infoURL    = 'https://api.guildwars2.com/v2/maps/';
  }
  updateStatus(newStatus,newMap=false,info) {
    var canvas      = this.canvas;
    this.status     = newStatus;

    console.log(newStatus);
    if (newMap) {
      // console.log(this.name+ " new Map detected");
      this.logger.reset();
      this.objectives = new Map([['Camp', []],['Tower', []],['Keep', []],['Castle', []],['Ruins', []]]);
      var objectives  = this.objectives;
      Promise.all([ newStatus['features']['Camp'], newStatus['features']['Tower'], newStatus['features']['Keep'], newStatus['features']['Castle'], newStatus['features']['Ruins'] ]).then(values => {
        newStatus['objectives'].forEach(function(e,i,l) {
          if (e.type === "Camp") {
            objectives.get('Camp').push( new Camp(canvas,values[0].length,e) );
          } else if (e.type === "Tower") {
            objectives.get('Tower').push( new Tower(canvas,values[1].length,e) );
          } else if (e.type === "Keep" && ! (e.id.endsWith('-113') || e.id.endsWith('-37'))) {
            objectives.get('Keep').push( new Keep(canvas,values[2].length,e) );
          } else if (e.type === "Castle" || (e.type === "Keep" && (e.id.endsWith('-113') || e.id.endsWith('-37')))) {
            objectives.get('Castle').push( new Castle(canvas,values[3].length,e) );
          } else if (e.type === "Ruins") {
            objectives.get('Ruins').push( new Ruins(canvas,values[4].length,e) );
          }
        });
      });
    }
    this.draw();
  }
  draw() {
    this.canvas.drawBackground(this.name);
    var objectives  = this.objectives;
    var status      = this.status;
    var logger      = this.logger;
    Promise.all([ status['features']['Camp'], status['features']['Tower'], status['features']['Keep'], status['features']['Ruins'], status['features']['Castle'] ]).then(values => {
      ['Camp','Tower','Keep','Ruins','Castle'].forEach(function(type) {
        objectives.get(type).forEach(function(objective) {
          var tgt = status.objectives.find(function(obj) { return obj.id == objective.id() });
          objective.update(tgt,logger);
        });
      },this);
    });
  }
}
class WorldStatus {
  constructor(statusDiv) {
    this.statdiv	  = $("#"+statusDiv);
    this.world_id	  = null;
    this.match_id	  = null;
    this.status		  = null;
    this.interval_id	  = null;
    this.last_update	  = 0;
    this.scores		  = new Map([['red',0],['blue',0],['green',0]]);
    this.maps		  = new Map();
    this.team		  = null;
    this.start_time	  = Date.now();
    this.end_time	  = 0;
    this.mapInfo	  = null;
    this.mapObjectives	  = new MapObjectives();

    ['Center','RedHome','BlueHome','GreenHome'].forEach(function(m,i,l) {
      this.maps[m] = new WvWMap(m);
    },this);
  }

  get endTime() {
    return this.end_time;
  }
  get finished() {
    return Date.now() > this.endTime;
  }
  get worldId() {
    if (this.running) {
      return this.world_id;
    }
    return null;
  }
  get running() {
    return this.last_update == 0 || ((this.match_id != null) && !this.finished);
  }
  get lastUpdate() {
    return this.last_update;
  }
  get status_url() {
    if (this.world_id != null) {
      return "https://api.guildwars2.com/v2/wvw/matches?world=" + this.world_id;
    }
    return null;
  }
  set worlds(info) {
    if (info) {
      this.team = info;
    }
  }
  get worlds() {
    return this.team;
  }

  interval(id) {
    this.interval_id = id;
  }
  worldId(id) {
    this.world_id = id;
  }
  matchCompleted() {
    this.statdiv.html("Match completed, status updates halted.  Reload to monitor current match");
    clearInterval(this.interval_id);
    this.interval_id = null;
    guilds.stop();
  }
  lookupGuilds(newStatus) {
    newStatus.maps.forEach(function(element,i,l) {
      element.objectives.forEach(function(objective,j,m) {
	if (objective.claimed_by != null) {
          guilds.find(objective.claimed_by);
	}
      },this);
    },this);
  }
  updateWorld(newStatus) {
    //this.lookupGuilds(newStatus);
    var now = new Date();
    var newMap = false;
    this.statdiv.html("Last updated: " + moment(now).format('YYYY/MM/DD HH:mm:ss Z'));
    if (newStatus.start_time >= this.end_time) {
      this.match_id = newStatus.id;
      newMap = true;

      ["red","green","blue"].forEach(function(color) {
	displayTeam(color,newStatus.teams.get(color),newStatus.scores.get(color),newStatus.kills.get(color),newStatus.deaths.get(color));
      });
    }
    this.end_time = newStatus.end_time;
    this.status	  = newStatus;
    newStatus.maps.forEach(function(map,index,rawMaps) {
      this.maps[map.type].updateStatus(map,newMap);
    },this);
    this.scores = status.scores;
    this.last_update = now;
  }
}

var ws	    = new WorldStatus('MatchStatus');
var guilds  = new WvWGuilds();

function displayTeam(color,team,score,kills,deaths) {
  var content = "<div class='captain'>"+team[0].name+"</div>";
  content += "<div class='members'> w/ "+team.slice(1).map(function(e){ return e.name; }).join(' &amp; ')+"</div>";
  content += "<div class='stats'>";
  content += "<div class='score'> s: "+score.toLocaleString()+" </div>";
  content += "<div class='kills'> k: "+kills.toLocaleString()+" </div>";
  content += "<div class='deaths'> d: "+deaths.toLocaleString()+" </div>";
  $("#"+color+".team").html(content);
}
function sanitizeObjective(objective,o) {
  ['id','owner','type','claimed_at','claimed_by','last_flipped'].forEach(function(key) {
    switch (key) {
      case 'id':
	var parts = objective[key].split('-');
	objective['map_id'] = parts[0];
	objective['obj_id'] = parts[1];
	break;
      case 'claimed_at':
      case 'last_flipped':
	objective[key] = Date.parse(objective[key]);
	break;
      case 'claimed_by':
	if (objective[key] != null) {
	  guilds.find(objective[key],function(g) { objective['guild'] = g; });
	}
	break;
      case 'type':
      case 'owner':
	break;
    }
  });

  o.id(objective['id']).then(function(details) {
    ['coord','index','label_coord','name','sector_id','chat_link','marker'].forEach(function(key) {
      objective[key] = details[key];
    });
  });
  return objective;
}
function sanitizeMap(map,o) {
  var newMap  = new Map();
  var teams   = ['red','green','blue'];
  ['id','bonuses','deaths','kills','objectives','scores','type'].forEach(function(key) {
    switch(key) {
      case 'id':
      case 'type':
      case 'bonuses':
	newMap[key] = map[key];
	break;
      case 'deaths':
      case 'kills':
      case 'scores':
	newMap[key] = new Map();
	teams.forEach(function(color) { newMap[key][color] = map[key][color]; });
	break;
      case 'objectives':
	newMap[key] = new Array();
	map[key].forEach(function(objective) { newMap[key].push(sanitizeObjective(objective,o)) });
	break;
    }
  });
  newMap['features'] = new Map();
  newMap['features']['Ruins']	= o.type(newMap['id'],'Ruins');
  newMap['features']['Camp']	= o.type(newMap['id'],'Camp');
  newMap['features']['Tower']	= o.type(newMap['id'],'Tower');
  newMap['features']['Keep']	= o.type(newMap['id'],'Keep');
  newMap['features']['Castle']  = o.type(newMap['id'],'Castle');
  return newMap;
}
function mapWorld(id) {
  return ws.worlds.find(function(elem) { return elem.id === id })
}
function sanitizeTeam(color, primaryId, all_worlds) {
  var team	  = new Array();

  team.push(mapWorld(primaryId));
  var otherIds  = all_worlds.filter(function(elem) { return elem != primaryId; });
  otherIds.forEach(function(elem) { team.push(mapWorld(elem)); });

  return team;
}
function sanitizeData(data,mapObjectives) {
  var sanitized	  = {};
  var teams	  = ['red','green','blue'];
  ['id','start_time','end_time','scores','worlds','all_worlds','kills','deaths','maps'].forEach(function(key) {
    switch (key) {
      case 'id':
	sanitized[key] = data[key];
	break
      case 'start_time':
      case 'end_time':
	sanitized[key] = Date.parse(data[key]);
	break;
      case 'all_worlds':
      case 'worlds':
//	sanitized[key] = new Map();
//	teams.forEach(function(color) {
//	  sanitized[key].set(color, data[key][color].map(function(elem) {
//	    return mapWorld(elem);
//	  }))
//	});
//	break;
//	sanitized[key] = new Map();
//	teams.forEach(function(color) { sanitized[key].set(color, mapWorld(data[key][color])); });
	break;
      case 'scores':
      case 'kills':
      case 'deaths':
	sanitized[key] = new Map();
	teams.forEach(function(color) { sanitized[key].set(color, data[key][color]); });
//	var current = new Map();
//	teams.forEach(function(color) { current.set(color, data[key][color]); });
//	headers.set(key,current);
	break;
      case 'maps':
	sanitized[key] = new Array();
	data[key].forEach(function(map,i) {
	  sanitized[key][i] = sanitizeMap(map,mapObjectives);
	  // console.log(i, map,mapObjectives,sanitized[key][i]);
	});
//	var current = new Array();
//	data[key].forEach(function(map,i) { current.push(sanitizeMap(map)); });
//	sanitized.set(key,current);
	break;
      default:
	console.log('Unexpected match key: \''+key+'\'');
    }
  });
  var worlds = new Map();
  teams.forEach(function(color) {
    worlds.set(color,sanitizeTeam(color,data['worlds'][color],data['all_worlds'][color]));
  });
  //console.log(worlds);
  sanitized['teams'] = worlds;
  //headers.set('worlds',worlds);
  //sanitized.set('headers',headers);

  return sanitized;
}

function updateStatus() {
  if (ws.running) {
    $.get(ws.status_url,function(data) {
      // console.log(data);
      var sanitized = sanitizeData(data,ws.mapObjectives);
      // console.log(sanitized);
      ws.updateWorld(sanitized);
    });
  } else if (ws.finished) {
    ws.matchCompleted();
  }
}

/*
class World {
  constructor(select,go) {
    this._select  = $(select);
    this._go	  = $(go);
  }
}
*/

$.when(
  $.getJSON( "world_names_en.json", function(data) {
    $('#world').find('option').remove();
    var world_select = '';
    $.each(data,function(key,value) {
      world_select += '<option value="' + value.id + '">' + value.name + '</option>'
    })
    $('select#world').append(world_select);
    ws.worlds = data;
    var found = data.find(function(elem) { return elem.name === 'Crystal Desert' })
    ws.worldId(found.id);
  }),
  $.getJSON( "maps.json", function(data) {
    ws.information = data;
  })
).then(function() {
  updateStatus();
  ws.interval(window.setInterval(updateStatus,20000));
});

