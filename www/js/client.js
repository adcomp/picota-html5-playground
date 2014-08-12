var ws, autoconnect = false;

window.onload = function() {
  canvas.init();
  $('#connect').click(function() { connect(); });
  if (autoconnect) {
    connect();
  } else {
    $("#connect-box").slideDown();
  }
}

function connect() {
  host = $("#host").val();
  ws = new WebSocket("ws://" + host + ":8888/client");
  ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);

    for (var key in data) {

      if (key == 'eval') {
        // don't be evil ..
        eval(data[key]);

      } else if (key == 'mode') {
        selectMode(data[key])

      } else if (key == 'html') {
        updateFrame(data[key])

      } else if (key == 'canvas') {
        fct = data[key][0];
        val = data[key][1];
        canvas[fct](val);

      } else {
        // what to do ?
      }

    }
  };

  ws.onclose = function(evt) {
    console.log("WebSocket close ..");
    $('.main-header').show();
    $('#connect-box').show();
    $('#status').removeClass('connected');
    $('#status').addClass('not-connected');
    $('#status').text("can't establish a connection to the server");
  };

  ws.onopen = function(evt) {
    console.log("WebSocket open ..")
    $('.main-header').hide();
    $('#connect-box').hide();
  };
}

function updateFrame(data) {
  var previewFrame = document.getElementById('mainframe');
  var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
  preview.open();
  preview.write(data);
  preview.close();
}

function selectMode(name) {
  if (name == 'editor') {
    $('#canvas').hide();
    $('#mainframe').show();
  } else if (name == 'canvas') {
    $('#mainframe').hide();
    $('#canvas').show();
  }
}
