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

