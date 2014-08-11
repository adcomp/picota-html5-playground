var ws, autoconnect = false;

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
