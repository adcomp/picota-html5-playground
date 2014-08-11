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
