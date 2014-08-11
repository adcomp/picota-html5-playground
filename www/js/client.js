var ws, autoconnect = false;

var canvas = {
  width: 2000,
  height: 2000,
  ctx: null,
  penDown: false,

  init: function() {
    this.ctx = document.getElementById('canvasframe').getContext("2d");
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = "round";
    this.setColor('black');
    this.lineWidth(1);
  },

  clear: function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  },

  paint: function(pos) {
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, this.thickness, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  },

  moveTo: function(pos) {
    this.ctx.moveTo(pos.x, pos.y);
  },

  setColor: function(color) {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
  },

  lineWidth: function(width) {
    this.thickness = width;
    this.ctx.lineWidth = width * 2;
  }
}

window.onload = function() {
  canvas.init();
  $('#connect').click(function() { connect(); });
  if (autoconnect) { connect(); }
}

function connect() {
  host = $("#host").val();
  ws = new WebSocket("ws://" + host + ":8888/client");
  ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);

    for (var key in data) {

      if (key == 'eval') {
        eval(data[key]);

      } else if (key == 'mode') {
        if (data[key] == 'editor') {
          $('#canvasframe').hide();
          $('#mainframe').show();
        } else if (data[key] == 'canvas') {
          $('#mainframe').hide();
          $('#canvasframe').show();
        }

      } else if (key == 'html') {
        updateFrame(data[key])

      } else if (key == 'canvas') {
        cmd = data[key][0];
        obj = data[key][1];
        //~ console.log(cmd, obj);
        canvas[cmd](obj);

      } else {
        // what to do ?
      }

    }
  };

  ws.onclose = function(evt) {
    console.log("WebSocket close ..");
    $('#connect-box').slideDown();
    $('#connect-box').addClass('connect-error');
    $('#status').text("can't establish a connection to the server");
  };

  ws.onopen = function(evt) {
    console.log("WebSocket open ..")
    $('#status').text("");
    $('#connect-box').removeClass('connect-error');
    $('#connect-box').slideUp();
  };

  ws.onerror = function(evt) {
    console.log("WebSocket error ..")
  };
}

function updateFrame(data) {
  var previewFrame = document.getElementById('mainframe');
  var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
  preview.open();
  preview.write(data);
  preview.close();
}
