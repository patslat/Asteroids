var Asteroids = (function () {

	var width = $(window).width();
	var height = $(window).height();

	function MovingObject(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	}

	MovingObject.prototype.update = function(velocity) {
		var newX = (this.x + velocity.x);
		var newY = (this.y + velocity.y);
		(newX < 0) ? newX += width : newX %= width;
		(newY < 0) ? newY += height : newY %= height;

		this.x = newX;
		this.y = newY;
	}

	MovingObject.prototype.draw = function(ctx) {
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		ctx.beginPath();

		ctx.arc(
			this.x,
			this.y,
			this.radius,
			0,
			2 * Math.PI,
			false
		);

		ctx.closePath();
		ctx.stroke();
	}

	MovingObject.prototype.offScreen = function(xLim, yLim) {
		return (
			(this.x + this.radius > xLim) ||
			(this.y + this.radius > yLim) ||
			(this.x - this.radius < 0) ||
			(this.y - this.radius < 0)
		);
	}

	function Asteroid(x, y) {
		MovingObject.apply(this, arguments);
	}

	Asteroid.MAX_RADIUS = 25;
	Asteroid.randomAsteroid = function(maxX, maxY) {
		return new Asteroid(
			maxX * Math.random(),
			maxY * Math.random(),
			Asteroid.MAX_RADIUS * Math.random()
		);
	}

	Asteroid.prototype = new MovingObject();




	function Ship(x, y) {
		MovingObject.apply(this, arguments);
		this.velocity = {
			x: 0,
			y: 0
		}
	}

	Ship.prototype = new MovingObject();

	Ship.prototype.draw = function(ctx) {
		ctx.fillStyle = "rgb(255, 0, 0)";
		ctx.beginPath();
		ctx.arc(
			this.x,
			this.y,
			this.radius,
			0,
			2 * Math.PI,
			false
		);
		ctx.closePath();
		ctx.fill();
	}

	Ship.prototype.power = function(dx, dy) {
		this.velocity.x = (this.velocity.x + dx) % 20;
		this.velocity.y = (this.velocity.y + dy) % 20;
	}

	MovingObject.prototype.isHit = function(asteroids) {
		for (var i = 0; i < asteroids.length; i++) {
			var dist = Math.sqrt(
										Math.pow((this.x - asteroids[i].x), 2) +
										Math.pow((this.y - asteroids[i].y), 2)
			);

			console.log(dist);
			console.log(this.radius + asteroids[i].radius)

			if (dist < (this.radius + asteroids[i].radius)) return true;
		}

		return false;
	}

	Ship.prototype.fireBullet = function() {
		return new Bullet(this.x, this.y, this.velocity);
	}


	function Bullet(startX, startY, velocity) {
		MovingObject.call(this, startX, startY, 1)
		this.velocity = {
			x: (velocity.x * 2) || 25,
			y: (velocity.y * 2) || 25
		}
	}


	Bullet.prototype = new MovingObject();

	Bullet.prototype.update = function(velocity) {
		var newX = (this.x + velocity.x);
		var newY = (this.y + velocity.y);

		this.x = newX;
		this.y = newY;
	}

	function Game(ctx) {
		this.ctx = ctx;

		this.xDim = ctx.canvas.width;
		this.yDim = ctx.canvas.height;

		this.gameOver = false;

		this.asteroids = [];
		for (var i = 0; i < 10; ++i) {
			this.asteroids.push(Asteroid.randomAsteroid(
				width, height
			));
		}

		this.bullets = [];

		this.ship = new Ship((this.xDim / 2), (this.yDim / 2), 10);
	}

	Game.prototype.draw = function() {
		// this.ctx.clearRect(0, 0, this.xDim, this.yDim);

		var bg = new Image();
		bg.src = "dat_background.jpg";

		var that = this;
		bg.onload = function() {
			that.ctx.drawImage(bg, 0, 0);
		}

		for (var i = 0; i < this.asteroids.length; ++i) {
			this.asteroids[i].draw(this.ctx);
		}

		for (var i = 0; i < this.bullets.length; ++i) {
			this.bullets[i].draw(this.ctx);
		}

		this.ship.draw(this.ctx);
	}

	Game.prototype.update = function() {
		for (var i = 0; i < this.asteroids.length; ++i) {
			this.asteroids[i].update({ x: 2, y: 2 });
			if (this.asteroids[i].isHit(this.bullets)) {
				this.asteroids.splice(i, 1);
			}
		}

		for (var i = 0; i < this.bullets.length; ++i) {
			this.bullets[i].update(this.bullets[i].velocity);
			if (this.bullets[i].offScreen(this.xDim, this.yDim)) {
				this.bullets.splice(i, 1);
			}
		}

		if (this.ship.velocity.x > 0) this.ship.velocity.x -= .5;
		if (this.ship.velocity.y > 0) this.ship.velocity.y -= .5;
		if (this.ship.velocity.x < 0) this.ship.velocity.x += .5;
		if (this.ship.velocity.y < 0) this.ship.velocity.y += .5;

		this.ship.update(this.ship.velocity);
		if (this.ship.isHit(this.asteroids)) {
			this.gameOver = true;
		}
	}

	Game.prototype.loop = function() {
		var that = this;
		if (key.isPressed("up")) that.ship.power(0, -5);
		if (key.isPressed("down")) that.ship.power(0, 5);
		if (key.isPressed("left")) that.ship.power(-5, 0);
		if (key.isPressed("right")) that.ship.power(5, 0);
		if (key.isPressed("space")) {
			var bullet = that.ship.fireBullet();
			bullet.draw(that.ctx);
			that.bullets.push(bullet);
		}

		this.update();
		this.draw();
	}

	Game.prototype.start = function() {
		var that = this;
		this.timer = window.setInterval(function() {
			that.loop();
			if (that.gameOver) {
				alert('GAME OVER');
				clearInterval(that.timer);
			}
		}, 1000/32);
	}

	return {
		Asteroid: Asteroid,
		Game: Game,
	}
})();