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
    return (status.index*(2*Math.PI)/sites) + rotation()-Math.PI/2.0;
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
    // console.log(st);
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
